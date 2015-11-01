/**
 * Created by Matti on 23.9.2015.
 */

//PerspectiveCamera(const AnimatedTransform &cam2world,
//const float screenWindow[4], float sopen, float sclose,
//    float lensr, float focald, float fov, Film *film);

function perspectiveTransform(fov, near, far) {

    var persp = mat4.create();
    mat4.perspectiveFromFieldOfView(persp,
        {
            upDegrees : fov/2,
            downDegrees : fov/2,
            leftDegrees : fov/2,
            rightDegrees : fov/2
        },
        near, far);
    return new Transform(persp);
}

function PerspectiveCamera(cameraToWorld, shutterOpen, shutterClose, lensRadius, focalDistance,
                           film) {

    var frame = film.xResolution/film.yResolution;
    var screen = frame > 1 ? [ -frame, frame, -1, 1 ] : [ -1, 1, -1 / frame, 1 / frame ];

    this.cameraToWorld = cameraToWorld;
    this.cameraToScreen = perspectiveTransform(90, 0.01, 1000);

    this.shutterOpen = shutterOpen;
    this.shutterClose = shutterClose;
    this.lensRadius = lensRadius;
    this.focalDistance = focalDistance;
    this.film = film;

    var m = mat4.create();
    //mat4.identity(m);
    mat4.scale(m, m, vec3.fromValues(
        film.xResolution,
        film.yResolution,
        1));
    mat4.scale(m, m, vec3.fromValues(
        1 / (screen[1] - screen[0]),
        1 / (screen[2] - screen[3]),
        1));
    mat4.translate(m, m, vec3.fromValues(
        -screen[0],
        -screen[3],
        0));

    this.screenToRaster = new Transform(m);

    this.rasterToScreen = this.screenToRaster.inverse(); // mat4.create();
    //mat4.invert(this.rasterToScreen, this.screenToRaster);

    this.rasterToCamera = new Transform();

    this.cameraToScreen.inverse().trTr(this.rasterToScreen, this.rasterToCamera);

    //this.rasterToCamera = mat4.create();
    //mat4.invert(this.rasterToCamera, this.cameraToScreen);
    //mat4.mul(this.rasterToCamera, this.rasterToCamera, this.rasterToScreen);

    //
    this.vec3tmp = vec3.create();
    //this.ray_tmp = new Ray();
    //this.origin = vec3.fromValues(0,0,0);
    //this.cameraToWorld.tr
    //vec3.transformMat4(this.origin, this.origin, this.cameraToWorld);
}

PerspectiveCamera.prototype = {

    // return rayWeight (scalar)
    generateRay : function(sample, ray) {
        ray.mint = 0;
        ray.maxt = Math.POSITIVE_INFINITY;
        ray.time = sample.time;
        ray.depth = 0;
        return this.generateRayOd(sample, ray.o, ray.d)
    },

    // return rayWeight (scalar)
    generateRayOd: function (sample, origin, direction) {

        // Generate raster and camera samples
        vec3.set(this.vec3tmp, sample.imageX, sample.imageY, 0);
        this.rasterToCamera.trPoint(this.vec3tmp, this.vec3tmp);
        vec3.normalize(direction, this.vec3tmp);
        vec3.set(origin, 0, 0, 0);


        //vec3.transformMat4(direction, this.vec3tmp, this.rasterToCamera);
        //vec3.normalize(direction, direction);

        // Modify ray for depth of field
        //if (this.lensRadius > 0) {
        //    // Compute point on plane of focus
        //    var ft = this.focalDistance / direction[2];
        //    vec3.scale(this.vec3tmp, direction, ft);
        //
        //    // Sample point on lens
        //    concentricSampleDisk([sample.lensU, sample.lensV], origin);
        //    vec2.scale(origin, origin, lensRadius);
        //    origin[2] = 0;
        //
        //    // Update ray for effect of lens
        //    vec3.subtract(direction, this.vec3tmp, origin);
        //    vec3.normalize(direction, direction);
        //    vec3.transformMat4(origin, origin, this.cameraToWorld);
        //} else {
        //    // just use pretransformed origin
        //    vec3.copy(origin, this.origin);
        //}
        //vec3.transformMat4(direction, direction, this.cameraToWorld);

        this.cameraToWorld.trPoint(origin, origin);
        this.cameraToWorld.trVector(direction, direction);
        return 1;
    },
    generateRayDiff : function (sample, ray) {

        var wt = this.generateRay(sample, ray);

        // Find ray after shifting one pixel in the x direction
        sample.imageX++;
        var wtx = this.generateRayOd(sample, ray.rxo, ray.rxd);
        sample.imageX--;

        // Find ray after shifting one pixel in the y direction
        sample.imageY++;
        var wty = this.generateRayOd(sample, ray.ryo, ray.ryd);
        sample.imageY--;

        if (wtx == 0 || wty == 0) {
            return 0;
        }
        return wt;
    }
}

function SamplerRenderer(sampler, camera, surfaceIntegrator, volumeIntegrator) {

    this.sampler = sampler;
    this.camera = camera;
    this.surfaceIntegrator = surfaceIntegrator;
    this.volumeIntegrator = volumeIntegrator;
}

SamplerRenderer.prototype = {
    
    // return true and fill in intersection if intersection found
    
    render: function(scene) {
        
        // TODO: support preprocessing (simple integrators don't need it)
        //this.surfaceIntegrator.preprocess(scene, camera, this);
        //this.volumeIntegrator.preprocess(scene, camera, this);

        var sample = new Sample(0,0);
        //this.sampler, this.surfaceIntegrator,
        //    this.volumeIntegrator, this.scene);

        // launch tasks (later)
        // for now just run single task here
        // Get sub-Sampler for SamplerRendererTask
        // Declare local variables used for rendering loop

        // Allocate space for samples and intersections
        //int maxSamples = sampler->MaximumSampleCount();
        //Sample *samples = origSample->Duplicate(maxSamples);
        //RayDifferential *rays = new RayDifferential[maxSamples];
        var L = vec3.create(); //= new Spectrum();
        var T; //= new Spectrum();
        var isect = new Intersection();
        //Intersection *isects = new Intersection[maxSamples]
        //

        // simplify for now by doing thing one sample at a time
        var ray = new Ray();
        ray.initDifferentials();

        while (this.sampler.getNextSample(sample)) {
            // Generate camera ray and compute radiance along ray
            // - Find camera ray for sample[i]
            var rayWeight = this.camera.generateRayDiff(sample, ray);
            ray.scaleDifferentials(1.0 / Math.sqrt(this.sampler.samplesPerPixel));
            // - Evaluate radiance along camera ray
            vec3.scale(L, this.li(scene, ray, sample, isect, T), rayWeight);
            // Report sample results to Sampler, add contributions to image
            // Free MemoryArena memory from computing image sample values
            this.camera.film.addSample(sample, L);
        }

        //camera.generateRayDifferential(sample)
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
    li: function(scene, ray, sample, isect, spectrum_out) {

        var Li = vec3.create();
        if (scene.intersect(ray, isect)) {
            // scene, renderer, ray, isect, sample
            //console.log("("+sample.imageX+","+sample.imageY+") hit at "+isect.dg.p);
            Li = this.surfaceIntegrator.li(scene, this, ray, isect, sample);
        } else {
            //console.log("("+sample.imageX+","+sample.imageY+") miss");
            // Handle ray that doesn't intersect any geometry
            for (var i = 0; i < scene.lights.length; i++) {
                vec3.add(Li, Li, scene.lights[i].le(ray));
                // Li += scene - > lights[i] - > Le(ray);
            }
        }
        // TODO: volume integration not supported
        //Spectrum Lvi = volumeIntegrator->Li(scene, this, ray, sample, rng,
        //        T, arena);
        //return *T * Li + Lvi;
        return Li;
    },

    // return Spectrum
    transmittance: function(scene, ray, sample, rng, arena) {

    }

}

