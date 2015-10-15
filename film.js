/**
 * Created by Matti on 13.10.2015.
 */

const FILTER_TABLE_SIZE = 16;

function Filter(xw, yw) {

    this.xWidth = xw;
    this.yWidth = yw;
    this.invXWidth = 1/xw;
    this.invYWidth = 1/yw;
}

Filter.prototype = {

    evaluate : function (x, y) {
        return 0;
    }
}

function GaussianFilter(xw, yw, a) {

    Filter.call(this, xw, yw);
    this.alpha = a;
    this.expX = Math.exp(-this.alpha * this.xWidth * this.xWidth);
    this.expY = Math.exp(-this.alpha * this.yWidth * this.yWidth);
}

GaussianFilter.prototype = {

    evaluate : function (x, y) {
        var gx = Math.max(0, Math.exp(-this.alpha * x * x) - this.expX);
        var gy = Math.max(0, Math.exp(-this.alpha * y * y) - this.expY);
        return gx * gy;
    }
}

function Pixel() {

    this.Lxyz = [0.0,0.0,0.0];
    this.weightSum = 0.0;

    //float splatXYZ[3];
};

// crop[0] = xstart, crop[1] = xend
// crop[2] = ystart, crop[3] = yend
function Film(xResolution, yResolution, filter, crop, filename) {

    this.xResolution = xResolution;
    this.yResolution = yResolution;
    this.filter = filter;
    this.crop = crop;
    this.filename = filename;

    // Compute film image extent
    this.xPixelStart = Math.ceil(this.xResolution * this.crop[0]);
    this.xPixelCount = Math.max(1, Math.ceil(this.xResolution * this.crop[1]) - this.xPixelStart);
    this.yPixelStart = Math.ceil(this.yResolution * this.crop[2]);
    this.yPixelCount = Math.max(1, Math.ceil(this.yResolution * this.crop[3]) - this.yPixelStart);

    // Allocate film image storage
    this.pixels = new Array(this.xPixelCount * this.yPixelCount);
    for (var i = 0; i < this.pixels.length; i++) {
        this.pixels[i] = new Pixel();
    }

    this.filterTable = new Array(FILTER_TABLE_SIZE);

    for (var y = 0; y < FILTER_TABLE_SIZE; ++y) {
        var fy = (y + 0.5) * filter.yWidth / FILTER_TABLE_SIZE;
        this.filterTable[y] = new Array(FILTER_TABLE_SIZE);
        for (var x = 0; x < FILTER_TABLE_SIZE; ++x) {
            var fx = (x + 0.5) * filter.xWidth / FILTER_TABLE_SIZE;
            this.filterTable[y][x] = filter.evaluate(fx, fy);
        }
    }
}

Film.prototype = {

    // add radiance spectrum for given sample

    addSample : function(sample, L) {

    // Compute sample's raster extent
        var dimageX = sample.imageX - 0.5;
        var dimageY = sample.imageY - 0.5;
        var x0 = Math.ceil(dimageX - this.filter.xWidth);
        var x1 = Math.floor(dimageX + this.filter.xWidth);
        var y0 = Math.ceil (dimageY - this.filter.yWidth);
        var y1 = Math.floor(dimageY + this.filter.yWidth);
        x0 = Math.max(x0, this.xPixelStart);
        x1 = Math.min(x1, this.xPixelStart + this.xPixelCount - 1);
        y0 = Math.max(y0, this.yPixelStart);
        y1 = Math.min(y1, this.yPixelStart + this.yPixelCount - 1);

        if ((x1-x0) < 0 || (y1-y0) < 0) {
            // PBRT_SAMPLE_OUTSIDE_IMAGE_EXTENT(const_cast<CameraSample *>(&sample));
            return;
        }

        // Loop over filter support and add sample to pixel arrays
        var xyz = L.toXYZ();

        var ifx = [];
        // Precompute $x$ and $y$ filter table offsets
        for (var x = x0; x <= x1; ++x) {
            var fx = Math.abs((x - dimageX) * this.filter.invXWidth * FILTER_TABLE_SIZE);
            ifx[x-x0] = Math.min(Math.floor(fx), FILTER_TABLE_SIZE - 1);
        }
        var ify = [];
        for (var y = y0; y <= y1; ++y) {
            var fy = Math.abs((y - dimageY) * this.filter.invYWidth * FILTER_TABLE_SIZE);
            ify[y-y0] = Math.min(Math.floor(fy), FILTER_TABLE_SIZE - 1);
        }

        for (var y = y0; y <= y1; ++y) {
            for (var x = x0; x <= x1; ++x) {
                // Evaluate filter value at $(x,y)$ pixel
                var w = this.filterTable[ify[y-y0]][ifx[x-x0]];
                // Update pixel values with filtered sample contribution
                var pixel = this.pixels[(x - this.xPixelStart) + (y - this.yPixelStart)*this.xPixelCount];
                pixel.Lxyz[0] += w * xyz[0];
                pixel.Lxyz[1] += w * xyz[1];
                pixel.Lxyz[2] += w * xyz[2];
                pixel.weightSum += w;
            }
        }
    },

    getSampleExtent: function() {
        var e = [];
        e[0] = Math.floor(this.xPixelStart + 0.5 - this.filter.xWidth);
        e[1] = Math.ceil(this.xPixelStart - 0.5 + this.xPixelCount + this.filter.xWidth);
        e[2] = Math.floor(this.yPixelStart + 0.5 - this.filter.yWidth);
        e[3] = Math.ceil(this.yPixelStart - 0.5 + this.yPixelCount + this.filter.yWidth);
        return e;
    },

    getPixelExtent: function() {
        var e = [];
        e[0] = this.xPixelStart;
        e[1] = this.xPixelStart + this.xPixelCount;
        e[2] = this.yPixelStart;
        e[3] = this.yPixelStart + this.yPixelCount;
        return e;
    }
}

// implement only RGB spectrum initially
function Spectrum() {
    this.rgb = new Array(3);
}

Spectrum.prototype = {

    toRGB :function() {
        return this.rgb;
    },
    toXYZ :function() {
        var xyz = new Array(3);
        xyz[0] = 0.412453*this.rgb[0] + 0.357580*this.rgb[1] + 0.180423*this.rgb[2];
        xyz[1] = 0.212671*this.rgb[0] + 0.715160*this.rgb[1] + 0.072169*this.rgb[2];
        xyz[2] = 0.019334*this.rgb[0] + 0.119193*this.rgb[1] + 0.950227*this.rgb[2];
        return xyz;
    }
//}
//static RGBSpectrum FromXYZ(const float xyz[3],
//    SpectrumType type = SPECTRUM_REFLECTANCE) {
//    RGBSpectrum r;
//    XYZToRGB(xyz, r.c);
//    return r;
//}
}

function Sample(x,y) {

    this.imageX = x;
    this.imageY = y;
    //this.lensU;
    //this.lensV;
    //this.time;
}


var filter = new GaussianFilter(2, 2, 2);

var film = new Film(100, 100, filter, [0,1, 0,1], "");

var s = new Sample(2,3);
var L = new Spectrum();
L.rgb = [1,0,0];

film.addSample(s,L);



//var D = 1;
//for (y = -D; y <= D; y++) {
//    for (x = -D; x <= D; x++) {
//        console.log(f.evaluate(x,y));
//    }
//}

