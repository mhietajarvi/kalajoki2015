/**
 * Created by Matti on 23.9.2015.
 */

function Light() {


}

Light.prototype = {
    // return true and fill in intersection if intersection found
    intersect : function(ray, intersection) {

    },
    le : function(ray) {
        return vec3.create();
    }
}


// PointLight(const Transform &light2world, const Spectrum &intensity);
// params: Transform, vec3
function PointLight(light2world, intensity) {

    Light.call(this, light2world);

    this.lightPos = vec3.create();
    light2world.trPoint(this.lightPos, this.lightPos);
    this.intensity = intensity;
}

PointLight.prototype = Object.create(Light.prototype);

// return { radiance (vec3), wi (vec3), pdf (scalar)
// TODO: missing LightSample and VisibilityTester related stuff
PointLight.prototype.sample_L = function(p) {
    //Spectrum Sample_L(const Point &p, float pEpsilon, const LightSample &ls,
    //    float time, Vector *wi, float *pdf, VisibilityTester *vis) const;

    var wi = vec3.create();
    vec3.sub(wi, this.lightPos, p);
    vec3.normalize(wi, wi);
    var pdf = 1;

    // TODO: visibility update
    // visibility->SetSegment(p, pEpsilon, lightPos, 0., time);

    var radiance = vec3.create();
    vec3.scale(radiance, this.intensity, 1/vec3.distSquared(this.lightPos, p));
    // Intensity / DistanceSquared(lightPos, p);

    return { radiance : radiance, wi : wi, pdf : pdf };
}
