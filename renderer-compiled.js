/**
 * Created by Matti on 23.9.2015.
 */
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Camera = function Camera(film) {
    _classCallCheck(this, Camera);

    this.film = film;
};

var SamplerRenderer = (function () {
    function SamplerRenderer(sampler, camera, surface_integrator, volume_integrator) {
        _classCallCheck(this, SamplerRenderer);

        this.sampler = sampler;
        this.camera = camera;
        this.surface_integrator = surface_integrator;
        this.volume_integrator = volume_integrator;
    }

    // return true and fill in intersection if intersection found

    _createClass(SamplerRenderer, [{
        key: "render",
        value: function render(scene) {
            surface_integrator.preprocess(scene, camera, this);
            volume_integrator.preprocess(scene, camera, this);
            var sample = new Sample(sampler, surface_integrator, volume_integrator, scene);

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
                var ray_weight = camera.generateRayDifferential(sample, ray);
                ray.scaleDifferentials(1.0 / Math.sqrt(sampler.samples_per_pixel));
                // - Evaluate radiance along camera ray
                if (ray_weight > 0) {
                    L = ray_weight * this.li(this.scene, ray, sample, rng, arena, intersection, T);
                } else {
                    L = [0, 0, 0];
                    T = [1, 1, 1];
                }
                // Report sample results to Sampler, add contributions to image
                // Free MemoryArena memory from computing image sample values
            }

            camera.generateRayDifferential(sample);
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
    }, {
        key: "li",
        value: function li(scene, ray, sample, rng, arena, isect_out, spectrum_out) {}

        // return Spectrum
    }, {
        key: "transmittance",
        value: function transmittance(scene, ray, sample, rng, arena) {}
    }]);

    return SamplerRenderer;
})();

//# sourceMappingURL=renderer-compiled.js.map