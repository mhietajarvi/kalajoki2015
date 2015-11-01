/**
 * Created by Matti on 15.10.2015.
 */

function Sample(x,y) {

    this.imageX = x;
    this.imageY = y;
    //this.lensU;
    //this.lensV;
    //this.time;
}

function Sampler(xstart, xend, ystart, yend, spp, sopen, sclose) {

    this.xPixelStart = xstart;
    this.xPixelEnd = xend;
    this.yPixelStart = ystart;
    this.yPixelEnd = yend;
    this.samplesPerPixel = spp;
    this.shutterOpen = sopen;
    this.shutterClose = sclose;
}

Sampler.prototype = {

}

//function StratifiedSampler(xstart, xend, ystart, yend, xs, ys, jitter, sopen, sclose) {
//
//    Sampler.call(this, xstart, xend, ystart, yend, xs*ys, sclose);
//    this.jitterSamples = jitter;
//    this.xPixelSamples = xs;
//    this.yPixelSamples = ys;
//    this.xPos = this.xPixelStart;
//    this.yPos = this.yPixelStart;
//    //sampleBuf = new float[5 * xPixelSamples * yPixelSamples];
//}
//
//StratifiedSampler.prototype = Object.create(Sampler.prototype);
//
//StratifiedSampler.prototype.getNextSample = function(sample) {
//
//}

function SimpleSampler(xstart, xend, ystart, yend, sopen, sclose) {

    Sampler.call(this, xstart, xend, ystart, yend, 1, sopen, sclose);
    this.xPos = this.xPixelStart;
    this.yPos = this.yPixelStart;

    //this.totalSamples = (this.xPixelEnd - this.xPixelStart) * (this.yPixelEnd - this.yPixelStart);
    //sampleBuf = new float[5 * xPixelSamples * yPixelSamples];

}

SimpleSampler.prototype = Object.create(Sampler.prototype);

// return 1 if sample was generated, 0 if not
SimpleSampler.prototype.getNextSample = function(sample) {

    if (this.xPos >= this.xPixelEnd || this.yPos >= this.yPixelEnd) {
        return 0;
    }
    sample.imageX = this.xPos + 0.5;
    sample.imageY = this.yPos + 0.5;

    this.xPos++;
    if (this.xPos >= this.xPixelEnd) {
        this.xPos = this.xPixelStart;
        this.yPos++;
    }
    return 1;
}
