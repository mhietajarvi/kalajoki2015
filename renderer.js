/**
 * Created by Matti on 23.9.2015.
 */
"use strict";

function PerspectiveCamera(film) {

    this.vec3tmp = vec3.create();
    this.ray_tmp = new Ray();
    this.rasterToCamera = mat4.create();
    this.cameraToWorld = mat4.create();
    this.film = film;
}

PerspectiveCamera.prototype = {

    generateRay : function(sample, ray) {
        ray.mint = 0;
        ray.maxt = Math.POSITIVE_INFINITY;
        ray.time = sample.time;
        ray.depth = 0;
        return this.generateRayOd(sample, ray.o, ray.d)
    },

    generateRayOd:  function (sample, origin, direction) {

        // Generate raster and camera samples
        vec3.set(this.vec3tmp, sample.imageX, sample.imageY, 0);
        mat4.transformMat4(direction, this.vec3tmp, this.rasterToCamera);

        // Point Pras = new vec3(sample.imageX, sample.imageY, 0);
        // 4x4 matrix transform
        // RasterToCamera(Pras, &Pcamera);
        // *ray = Ray(Point(0,0,0), Normalize(Vector(Pcamera)), 0.f, INFINITY);
        vec3.normalize(direction, direction);
        vec3.set(origin, 0, 0, 0);
        // defaults:

        mat4.transformMat4(origin, origin, this.cameraToWorld);
        mat4.transformMat4(direction, direction, this.cameraToWorld);
        //ray.transform(this.cameraToWorld);
        return 1;

        //    // Modify ray for depth of field
        //    if (lensRadius > 0.) {
        //    // Sample point on lens
        //    float lensU, lensV;
        //    ConcentricSampleDisk(sample.lensU, sample.lensV, &lensU, &lensV);
        //    lensU *= lensRadius;
        //    lensV *= lensRadius;
        //
        //    // Compute point on plane of focus
        //    float ft = focalDistance / ray->d.z;
        //    Point Pfocus = (*ray)(ft);
        //
        //    // Update ray for effect of lens
        //    ray->o = Point(lensU, lensV, 0.f);
        //    ray->d = Normalize(Pfocus - ray->o);
        //}
    },
    generateRayDiff :
        function (sample, ray_diff) {

            var wt = this.generateRay(sample, ray);

            // Find ray after shifting one pixel in the $x$ direction
            sample.imageX++;
            var wtx = this.generateRayOd(sample, ray_diff.rx_o, ray_diff.rx_d);
            sample.imageX--;

            // Find ray after shifting one pixel in the $y$ direction
            sample.imageY++;
            var wty = this.generateRayOd(sample, ray_diff.ry_o, ray_diff.ry_d);
            sample.imageY--;

            if (wtx == 0 || wty == 0)
                return 0;

            ray_diff.hasDifferentials = true;
            return wt;
        }
}

function SamplerRenderer(sampler, camera, surface_integrator, volume_integrator) {

    this.sampler = sampler;
    this.camera = camera;
    this.surface_integrator = surface_integrator;
    this.volume_integrator = volume_integrator;
}

SamplerRenderer.prototype = {
    // return true and fill in intersection if intersection found
    render: function(scene) {
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


    },

    // return Spectrum
    li: function(scene, ray, sample, rng, arena, isect_out, spectrum_out) {

    },

    // return Spectrum
    transmittance: function(scene, ray, sample, rng, arena) {

    }

}