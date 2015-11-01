/**
 * Created by Matti on 31.10.2015.
 */

// just hardcoded diffuse mattematerial initially

function Material(reflectance) {

    this.reflectance = reflectance;
}

Material.prototype = {

    getBSDF: function (dgGeom, dgShading) {

        var bsdf = new BSDF(dgShading, dgGeom.nn);
        bsdf.add(new LambertianBRDF(this.reflectance));
        return bsdf;
    },
}

//TODO: lambertian BxDF (some shortcuts may be needed)
//TODO: finally get to work on integrator
//TODO: whatever i have forgotten...