/**
 * Created by Matti on 15.10.2015.
 */

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