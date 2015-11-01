/**
 * Created by Matti on 30.10.2015.
 */

var
    BSDF_REFLECTION = 1 << 0,
    BSDF_TRANSMISSION = 1 << 1,
    BSDF_DIFFUSE = 1 << 2,
    BSDF_GLOSSY = 1 << 3,
    BSDF_SPECULAR = 1 << 4,
    BSDF_ALL_TYPES = BSDF_DIFFUSE | BSDF_GLOSSY | BSDF_SPECULAR,
    BSDF_ALL_REFLECTION = BSDF_REFLECTION | BSDF_ALL_TYPES,
    BSDF_ALL_TRANSMISSION = BSDF_TRANSMISSION | BSDF_ALL_TYPES,
    BSDF_ALL = BSDF_ALL_REFLECTION | BSDF_ALL_TRANSMISSION;


function BxDF(type) {
    this.type = type;
}

BxDF.prototype = {
    matchesFlags: function (flags) {
        return (this.type & flags) == this.type;
    },
    f: function (wo, wi) {
    },
    // return Spectrum (and pdf?)
    sample_f: function (wo, wi, u1, u2, pdf) {
    },
    // return Spectrum
    rho: function (wo, nSamples, samples) {
    },
    // return Spectrum
    rho: function (nSamples, samples1, samples2) {
    },
    // return scalar (float)
    pdf: function (wi, wo) {
    }
}

BxDF.INV_PI = 1 / Math.PI;

function LambertianBRDF(reflectance) {
    this.type = BSDF_REFLECTION | BSDF_DIFFUSE;
    this.reflectance = reflectance;
    this.scaledReflectance = vec3.create();
    vec3.scale(this.scaledReflectance, this.reflectance, BxDF.INV_PI);
}

LambertianBRDF.prototype = Object.create(BxDF.prototype);

LambertianBRDF.prototype.f = function (wo, wi) {
    return this.scaledReflectance; // this.reflectance * BxDF.INV_PI;
};

// dgs = shading geometry, ngeom = real normal (?? always same for us?))
function BSDF(dgs, ngeom, eta) {

    this.dgShading = dgs;
    this.eta = eta || 1;

    this.ng = ngeom;
    this.nn = this.dgShading.nn;

    this.sn = vec3.create();
    vec3.normalize(this.sn, this.dgShading.dpdu);
    this.tn = vec3.create();
    vec3.cross(this.tn, this.nn, this.sn);

    this.bxdfs = [];
}

BSDF.prototype = {
    add: function (bxdf) {
        this.bxdfs.push(bxdf);
    },
    numComponents: function () {
        return this.bxdfs.length;
    },
    numComponentsOfType: function (flags) {
    },
    worldToLocal: function (v) {
        return vec3.fromValues(
            vec3.dot(v, this.sn),
            vec3.dot(v, this.tn),
            vec3.dot(v, this.nn));
    },
    localToWorld: function (v) {
        return vec3.fromValues(
            this.sn[0] * v[0] + this.tn[0] * v[1] + this.nn[0] * v[2],
            this.sn[1] * v[0] + this.tn[1] * v[1] + this.nn[1] * v[2],
            this.sn[2] * v[0] + this.tn[2] * v[1] + this.nn[2] * v[2]);
    },
    f: function (woW, wiW, flags) {
        flags = flags || BSDF_ALL;
        var wi = this.worldToLocal(wiW);
        var wo = this.worldToLocal(woW);
        if (vec3.dot(wiW, this.ng) * vec3.dot(woW, this.ng) > 0) {
            // ignore BTDFs
            flags &= ~BSDF_TRANSMISSION;
        } else {
            // ignore BRDFs
            flags &= ~BSDF_REFLECTION;
        }
        var f = vec3.create();
        for (var i = 0; i < this.bxdfs.length; i++) {
            if (this.bxdfs[i].matchesFlags(flags)) {
                vec3.add(f, f, this.bxdfs[i].f(wo, wi));
            }
        }
        return f;
    }
}

//Spectrum f(const Vector &woW, const Vector &wiW, BxDFType flags = BSDF_ALL) const;
//Spectrum rho(RNG &rng, BxDFType flags = BSDF_ALL,    int sqrtSamples = 6) const;
//Spectrum rho(const Vector &wo, RNG &rng, BxDFType flags = BSDF_ALL,    int sqrtSamples = 6) const;
//Spectrum Sample_f(const Vector &wo, Vector *wi, const BSDFSample &bsdfSample,  float *pdf, BxDFType flags = BSDF_ALL,    BxDFType *sampledType = NULL) const;
//float Pdf(const Vector &wo, const Vector &wi, BxDFType flags = BSDF_ALL) const;
