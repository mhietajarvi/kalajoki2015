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

xyzToRgb = function(xyz, rgb) {
    rgb[0] =  3.240479*xyz[0] - 1.537150*xyz[1] - 0.498535*xyz[2];
    rgb[1] = -0.969256*xyz[0] + 1.875991*xyz[1] + 0.041556*xyz[2];
    rgb[2] =  0.055648*xyz[0] - 0.204043*xyz[1] + 1.057311*xyz[2];
}

rgbComponentToByte = function(value) {
// #define TO_BYTE(v) (uint8_t(Clamp(255.f * powf((v), 1.f/2.2f), 0.f, 255.f)))

    return Math.min(Math.max(255.0 * Math.pow(value, 1/2.2), 0), 255);
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
    },

    // generate image
    writeImage: function(imageData) {

        var x0 = 0;
        var x1 = Math.min(this.xPixelCount, imageData.width);
        var y0 = 0;
        var y1 = Math.min(this.yPixelCount, imageData.height);

        var d = imageData.data;
        //for (var i = 0; i < d.length; i += 4) {
        //    d[i] = (Math.sin(2 * Math.PI * i / n) + 1) * 128;
        //    d[i + 1] = (Math.cos(0.7 * Math.PI * i / n) + 1) * 128;
        //    d[i + 2] = (Math.sin(0.4 * Math.PI * i / n) + 1) * 128;
        //    d[i + 3] = 255;
        //}

        // Convert image to RGB and compute final pixel values
        var rgb = new Array(3);
        var offset = 0;
        for (var y = y0; y < y1; ++y) {
            for (var x = x0; x < x1; ++x) {

                var pixel = this.pixels[(x - this.xPixelStart) + (y - this.yPixelStart)*this.xPixelCount];
                xyzToRgb(pixel.Lxyz, rgb);

                if (pixel.weightSum != 0) {
                    var invWt = 1 / pixel.weightSum;
                    rgb[0] = Math.max(0, rgb[0] * invWt);
                    rgb[1] = Math.max(0, rgb[1] * invWt);
                    rgb[2] = Math.max(0, rgb[2] * invWt);
                }

                var p = (y*imageData.width + x)*4;
                d[p] = rgbComponentToByte(rgb[0]);
                d[p + 1] = rgbComponentToByte(rgb[1]);
                d[p + 2] = rgbComponentToByte(rgb[2]);
                d[p + 3] = 255;
            }
        }
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

// TODO: write pixels to canvas and verify that adding samples works

var a = { v1 : "f"};

console.log(a.v1);
console.log(a.v2);

var testfun = function(p1, p2) {

    console.log(p1);
    var ttt = "asfa";
    console.log(p2);
    p2 = ttt;
    console.log(p2);
}

testfun("p1val", "p2val");
testfun("p1val");

//var D = 1;
//for (y = -D; y <= D; y++) {
//    for (x = -D; x <= D; x++) {
//        console.log(f.evaluate(x,y));
//    }
//}

