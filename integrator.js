/**
 * Created by Matti on 27.10.2015.
 */


function Intersection() {

    // Intersection Public Methods
    Intersection() {
        primitive = NULL;
        shapeId = primitiveId = 0;
        rayEpsilon = 0.f;
    }
    BSDF *GetBSDF(const RayDifferential &ray, MemoryArena &arena) const;
    BSSRDF *GetBSSRDF(const RayDifferential &ray, MemoryArena &arena) const;
    Spectrum Le(const Vector &wo) const;

    // Intersection Public Data
    DifferentialGeometry dg;
    const Primitive *primitive;
    Transform WorldToObject, ObjectToWorld;
    uint32_t shapeId, primitiveId;
    float rayEpsilon;
};


// return spectrum (L)
function specularReflect(rayd, bsdf, rng, isect, renderer, scene, sample) {

    // TODO: rayd is not fully defined

    // TODO: bsdf class

}


Spectrum SpecularReflect(const RayDifferential &ray, BSDF *bsdf,
RNG &rng, const Intersection &isect, const Renderer *renderer,
const Scene *scene, const Sample *sample, MemoryArena &arena) {
    Vector wo = -ray.d, wi;
    float pdf;
    const Point &p = bsdf->dgShading.p;
    const Normal &n = bsdf->dgShading.nn;
    Spectrum f = bsdf->Sample_f(wo, &wi, BSDFSample(rng), &pdf,
        BxDFType(BSDF_REFLECTION | BSDF_SPECULAR));
    Spectrum L = 0.f;
    if (pdf > 0.f && !f.IsBlack() && AbsDot(wi, n) != 0.f) {
        // Compute ray differential _rd_ for specular reflection
        RayDifferential rd(p, wi, ray, isect.rayEpsilon);
        if (ray.hasDifferentials) {
            rd.hasDifferentials = true;
            rd.rxOrigin = p + isect.dg.dpdx;
            rd.ryOrigin = p + isect.dg.dpdy;
            // Compute differential reflected directions
            Normal dndx = bsdf->dgShading.dndu * bsdf->dgShading.dudx +
            bsdf->dgShading.dndv * bsdf->dgShading.dvdx;
            Normal dndy = bsdf->dgShading.dndu * bsdf->dgShading.dudy +
            bsdf->dgShading.dndv * bsdf->dgShading.dvdy;
            Vector dwodx = -ray.rxDirection - wo, dwody = -ray.ryDirection - wo;
            float dDNdx = Dot(dwodx, n) + Dot(wo, dndx);
            float dDNdy = Dot(dwody, n) + Dot(wo, dndy);
            rd.rxDirection = wi - dwodx + 2 * Vector(Dot(wo, n) * dndx +
                    dDNdx * n);
            rd.ryDirection = wi - dwody + 2 * Vector(Dot(wo, n) * dndy +
                    dDNdy * n);
        }
        PBRT_STARTED_SPECULAR_REFLECTION_RAY(const_cast<RayDifferential *>(&rd));
        Spectrum Li = renderer->Li(scene, rd, sample, rng, arena);
        L = f * Li * AbsDot(wi, n) / pdf;
        PBRT_FINISHED_SPECULAR_REFLECTION_RAY(const_cast<RayDifferential *>(&rd));
    }
    return L;
}




Spectrum WhittedIntegrator::Li(const Scene *scene,
const Renderer *renderer, const RayDifferential &ray,
const Intersection &isect, const Sample *sample, RNG &rng,
MemoryArena &arena) const {
    Spectrum L(0.);
// Compute emitted and reflected light at ray intersection point

// Evaluate BSDF at hit point
BSDF *bsdf = isect.GetBSDF(ray, arena);

// Initialize common variables for Whitted integrator
const Point &p = bsdf->dgShading.p;
const Normal &n = bsdf->dgShading.nn;
Vector wo = -ray.d;

// Compute emitted light if ray hit an area light source
L += isect.Le(wo);

// Add contribution of each light source
for (uint32_t i = 0; i < scene->lights.size(); ++i) {
    Vector wi;
    float pdf;
    VisibilityTester visibility;
    Spectrum Li = scene->lights[i]->Sample_L(p, isect.rayEpsilon,
        LightSample(rng), ray.time, &wi, &pdf, &visibility);
    if (Li.IsBlack() || pdf == 0.f) continue;
    Spectrum f = bsdf->f(wo, wi);
    if (!f.IsBlack() && visibility.Unoccluded(scene))
        L += f * Li * AbsDot(wi, n) *
            visibility.Transmittance(scene, renderer,
                sample, rng, arena) / pdf;
}
if (ray.depth + 1 < maxDepth) {
    // Trace rays for specular reflection and refraction
    L += SpecularReflect(ray, bsdf, rng, isect, renderer, scene, sample,
        arena);
    L += SpecularTransmit(ray, bsdf, rng, isect, renderer, scene, sample,
        arena);
}
return L;
}