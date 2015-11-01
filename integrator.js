/**
 * Created by Matti on 27.10.2015.
 */



// return spectrum (L)
//function specularReflect(ray, bsdf, rng, isect, renderer, scene, sample) {
//
//    // TODO: rayd is not fully defined
//    // TODO: bsdf class

//
//
//Spectrum SpecularReflect(const RayDifferential &ray, BSDF *bsdf,
//RNG &rng, const Intersection &isect, const Renderer *renderer,
//const Scene *scene, const Sample *sample, MemoryArena &arena) {
//    Vector wo = -ray.d, wi;
//    float pdf;
//    const Point &p = bsdf->dgShading.p;
//    const Normal &n = bsdf->dgShading.nn;
//    Spectrum f = bsdf->Sample_f(wo, &wi, BSDFSample(rng), &pdf,
//        BxDFType(BSDF_REFLECTION | BSDF_SPECULAR));
//    Spectrum L = 0.f;
//    if (pdf > 0.f && !f.IsBlack() && AbsDot(wi, n) != 0.f) {
//        // Compute ray differential _rd_ for specular reflection
//        RayDifferential rd(p, wi, ray, isect.rayEpsilon);
//        if (ray.hasDifferentials) {
//            rd.hasDifferentials = true;
//            rd.rxOrigin = p + isect.dg.dpdx;
//            rd.ryOrigin = p + isect.dg.dpdy;
//            // Compute differential reflected directions
//            Normal dndx = bsdf->dgShading.dndu * bsdf->dgShading.dudx +
//            bsdf->dgShading.dndv * bsdf->dgShading.dvdx;
//            Normal dndy = bsdf->dgShading.dndu * bsdf->dgShading.dudy +
//            bsdf->dgShading.dndv * bsdf->dgShading.dvdy;
//            Vector dwodx = -ray.rxDirection - wo, dwody = -ray.ryDirection - wo;
//            float dDNdx = Dot(dwodx, n) + Dot(wo, dndx);
//            float dDNdy = Dot(dwody, n) + Dot(wo, dndy);
//            rd.rxDirection = wi - dwodx + 2 * Vector(Dot(wo, n) * dndx +
//                    dDNdx * n);
//            rd.ryDirection = wi - dwody + 2 * Vector(Dot(wo, n) * dndy +
//                    dDNdy * n);
//        }
//        PBRT_STARTED_SPECULAR_REFLECTION_RAY(const_cast<RayDifferential *>(&rd));
//        Spectrum Li = renderer->Li(scene, rd, sample, rng, arena);
//        L = f * Li * AbsDot(wi, n) / pdf;
//        PBRT_FINISHED_SPECULAR_REFLECTION_RAY(const_cast<RayDifferential *>(&rd));
//    }
//    return L;
//}

function Integrator() {

}

Integrator.prototype = {

}

function SurfaceIntegrator() {

}

SurfaceIntegrator.prototype = Object.create(Integrator.prototype);

function WhittedIntegrator() {

}

WhittedIntegrator.prototype = Object.create(SurfaceIntegrator.prototype);

WhittedIntegrator.prototype.li = function(scene, renderer, ray, isect, sample) {

    var L = vec3.create();
    // Compute emitted and reflected light at ray intersection point
    // Evaluate BSDF at hit point

    // TODO: intersection?
    var bsdf = isect.getBSDF(ray);

    // Initialize common variables for Whitted integrator
    var p = bsdf.dgShading.p;
    var n = bsdf.dgShading.nn;
    var wo = vec3.create();
    vec3.negate(wo, ray.d);

    //Vector wo = -ray.d;

    // TODO: no area light sources supported yet
    // Compute emitted light if ray hit an area light source
    //L += isect.Le(wo);


    // TODO: light class base
    // TODO: light sample_L
    // TODO: visibility testing

    // Add contribution of each light source
    for (var i = 0; i < scene.lights.length; i++) {

        // { radiance : radiance, wi : wi, pdf : pdf }
        var light = scene.lights[i].sample_L(p);
        var f = bsdf.f(wo, light.wi);
        vec3.mul(f, f, light.radiance);
        vec3.scaleAndAdd(L, L, f, Math.abs(vec3.dot(light.wi, n)));

        //Spectrum Li = scene->lights[i]->Sample_L(p, isect.rayEpsilon,
        //    LightSample(rng), ray.time, &wi, &pdf, &visibility);
        //if (Li.IsBlack() || pdf == 0.f) continue;
        //Spectrum f = bsdf->f(wo, wi);
        //if (!f.IsBlack() && visibility.Unoccluded(scene))
        //    L += f * Li * AbsDot(wi, n)
        //
        // *   visibility.Transmittance(scene, renderer,
        //            sample, rng, arena) / pdf;
    }


    // TODO: no specular reflect/transmit support yet
    //if (ray.depth + 1 < maxDepth) {
    //    // Trace rays for specular reflection and refraction
    //    L += SpecularReflect(ray, bsdf, rng, isect, renderer, scene, sample,
    //        arena);
    //    L += SpecularTransmit(ray, bsdf, rng, isect, renderer, scene, sample,
    //        arena);
    //}
    return L;
}