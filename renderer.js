/**
 * Created by Matti on 23.9.2015.
 */
"use strict";

class PerspectiveCamera {

    var Pras = vec3.create();
    var Pcamera = vec3.create();
    var RasterToCamera = mat4.create();

    constructor(film) {
        this.film = film;
    }

    generateRay(sample, ray) {
        // Generate raster and camera samples

        vec3.set(Pras, sample.imageX, sample.imageY, 0);
        mat4.transformMat4(ray.d, Pras, RasterToCamera);
        // Point Pras = new vec3(sample.imageX, sample.imageY, 0);
        // 4x4 matrix transform
        // RasterToCamera(Pras, &Pcamera);
        vec3.normalize(ray.d, ray.d);
        vec3.set(ray.o, 0, 0, 0);
        // defaults:
        ray.mint = 0;ad
        ray.maxt = Math.POSITIVE_INFINITY;
        ray.time = 0;
        ray.depth = 0;

        // *ray = Ray(Point(0,0,0), Normalize(Vector(Pcamera)), 0.f, INFINITY);

            // Modify ray for depth of field
            if (lensRadius > 0.) {
            // Sample point on lens
            float lensU, lensV;
            ConcentricSampleDisk(sample.lensU, sample.lensV, &lensU, &lensV);
            lensU *= lensRadius;
            lensV *= lensRadius;

            // Compute point on plane of focus
            float ft = focalDistance / ray->d.z;
            Point Pfocus = (*ray)(ft);

            // Update ray for effect of lens
            ray->o = Point(lensU, lensV, 0.f);
            ray->d = Normalize(Pfocus - ray->o);
        }
        ray->time = sample.time;
        CameraToWorld(*ray, ray);
        return 1.f;
}

    GenerateRayDifferential(sample, ray_diff) {

    float wt = GenerateRay(sample, rd);
    // Find ray after shifting one pixel in the $x$ direction
    CameraSample sshift = sample;
++(sshift.imageX);
    Ray rx;
    float wtx = GenerateRay(sshift, &rx);
    rd->rxOrigin = rx.o;
    rd->rxDirection = rx.d;

    // Find ray after shifting one pixel in the $y$ direction
--(sshift.imageX);
++(sshift.imageY);
    Ray ry;
    float wty = GenerateRay(sshift, &ry);
    rd->ryOrigin = ry.o;
    rd->ryDirection = ry.d;
    if (wtx == 0.f || wty == 0.f) return 0.f;
    rd->hasDifferentials = true;
        return wt;
}

}

class SamplerRenderer {

    constructor(sampler, camera, surface_integrator, volume_integrator) {
        this.sampler = sampler;
        this.camera = camera;
        this.surface_integrator = surface_integrator;
        this.volume_integrator = volume_integrator;
    }

    // return true and fill in intersection if intersection found
    render(scene) {
        surface_integrator.preprocess(scene, camera, this);
        volume_integrator.preprocess(scene, camera, this);
        var sample = new Sample(sampler, surface_integrator,
            volume_integrator, scene);

        // launch tasks (later)

        // for now just run single task here


        // Get sub-Sampler for SamplerRendererTask
        // Declare local variables used for rendering loop

        // Allocate space for samples and intersections
        //int maxSamples = sampler->MaximumSampleCount();
        //Sample *samples = origSample->Duplicate(maxSamples);
        //RayDifferential *rays = new RayDifferential[maxSamples];
        var L; //= new Spectrum();
        var T; //= new Spectrum();
        var intersection = new Intersection();
        //Intersection *isects = new Intersection[maxSamples]
        //

        // simplify for now by doing thing one sample at a time

        var sample;

        while (sample = this.sampler.getNextSample(rng)) {
            // Generate camera ray and compute radiance along ray
            // - Find camera ray for sample[i]
            var ray_weight = camera.generateRayDifferential(sample, ray_diff);
            ray.scaleDifferentials(1.0 / Math.sqrt(sampler.samples_per_pixel));
            // - Evaluate radiance along camera ray
            if (ray_weight > 0) {
                L = ray_weight * this.li(this.scene, ray_diff, sample, rng, arena, intersection, T);
            } else {
                L = [0,0,0];
                T = [1,1,1];
            }
            // Report sample results to Sampler, add contributions to image
            // Free MemoryArena memory from computing image sample values
        }


        camera.generateRayDifferential(sample)
        // Get samples from Sampler and update image
        //int sampleCount;
        //while ((sampleCount = sampler->GetMoreSamples(samples, rng)) > 0) {
        //Generate camera rays and compute radiance along rays
        //Report sample results to Sampler, add contributions to image
        //Free MemoryArena memory from computing image sample values
        //}

        // Clean up after SamplerRendererTask is done with its image region


    }

    // return Spectrum
    li(scene, ray, sample, rng, arena, isect_out, spectrum_out) {

    }

    // return Spectrum
    transmittance(scene, ray, sample, rng, arena) {

    }

}