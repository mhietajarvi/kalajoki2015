
//var vec3 = require("./gl-matrix/vec3.js");
//require("./gl-matrix/mat4.js");
//require("./geometry.js");
//require("./diffgeom.js");
//require("./transform.js");
//require("./shape.js");
//require("./reflection.js");
//require("./material.js");
////
//require("./sampler.js");
//require("./film.js");
//require("./renderer.js");

var fs = require("fs");

function read(f) {
    return fs.readFileSync(f).toString();
}
function include(f) {
    eval.apply(global, [read(f)]);
}

include("gl-matrix/common.js");
include("gl-matrix/vec3.js");
include("gl-matrix/mat4.js");
include("geometry.js");
include("diffgeom.js");
include("transform.js");
include("shape.js");
include("reflection.js");
include("material.js");

include("sampler.js");
include("film.js");
include("renderer.js");



function propsStr(obj) {

}

function printProps(obj) {

    //var text = "";
    //for (var prop in obj) {
    //    if (typeof obj[prop] == 'object') {
    //        text += prop + " : {\n";
    //        printProps(obj[prop]);
    //    } else if (typeof obj[prop] != 'function') {
    //        text += prop + " : " + obj[prop] + "\n";
    //    }
    //}
    //console.log(text);
    console.dir(obj);
}

function testDiffGeom() {

    // verify that results match those of c++ version

    var dg = new DiffGeom(
        vec3.fromValues(1, 1, 1),
        vec3.fromValues(0, 1, 0),
        vec3.fromValues(0, 1, 1),
        vec3.fromValues(1, 1, -1),
        vec3.fromValues(1, 3, -1),
        2, 2, undefined
    )
    var ray = new Ray(
        vec3.fromValues(0, 0, 0),
        vec3.fromValues(3, 4, 5),
        0,
        Math.POSITIVE_INFINITY,
        0, 0);

    ray.initDifferentials();

    vec3.add(ray.rxo, ray.o, vec3.fromValues(0.1, 0.1, 0.1));
    vec3.add(ray.rxd, ray.d, vec3.fromValues(0.12, 0.12, 0.12));
    vec3.add(ray.ryo, ray.o, vec3.fromValues(-0.1, 0.1, 0.01));
    vec3.add(ray.ryd, ray.d, vec3.fromValues(-0.12, 0.12, 0.02));

    dg.computeDifferentials(ray);

    printProps(dg);
    return dg;
}

// return dg
function testSphere() {

    var m = mat4.create(); // identity();
    mat4.translate(m, m, vec3.fromValues(0.7,0.7,0.17));
    var o2w = new Transform(m);

    var sp = new Sphere(o2w, undefined, false, 3.3, -2, 1, 270);

    // DifferentialGeometry dg;

    var ray = new Ray(vec3.fromValues(-10,0,0), vec3.fromValues(1,0.1,0.1), 0, 100);
    //float tHit;
    //float rayEpsilon;
    var isect = sp.intersect(ray); //, &tHit, &rayEpsilon, &dg);

    printProps(isect);
    return isect.dg;
}

function testMaterial(dg) {

    var mat = new Material(vec3.fromValues(1,1,1));
    var bsdf = mat.getBSDF(dg, dg);

    var woW = vec3.fromValues(-10,0,0)
    var wiW = vec3.fromValues(-7,2,2);

    vec3.subtract(woW, woW, dg.p);
    vec3.subtract(wiW, wiW, dg.p);

    // world vectors

    var spec = bsdf.f(woW, wiW);
    console.log("spec: "+spec);
}

function testScene() {

    var m = mat4.create(); // identity();
    mat4.translate(m, m, vec3.fromValues(0.7,0.7,0.17));

    var sphere = new Sphere(new Transform(m), undefined, false, 3.3, -2, 1, 270);

    var mat = new Material(vec3.fromValues(1,1,1));

    var prim = new GeometricPrimitive(sphere, mat);

    mat4.identity(m);
    mat4.translate(m, m, vec3.fromValues(0.7,0.7,0.17));

    var light = new PointLight(new Transform(m), vec3.fromValues(0.7,0.7,0.17));

    // no acceleration structures supported
    var scene = new Scene(prim, [light]);

    var filter = new GaussianFilter(2, 2, 2);
    var film = new Film(100, 100, filter, [0,1, 0,1]);

    var lookAt = mat4.create();
    mat4.lookAt(lookAt, vec3.fromValues(0,0,0), vec3.fromValues(0,0,-100), vec3.fromValues(0,1,0));

    var cameraToWorld = new Transform(lookAt);
    var shutterOpen = 0;
    var shutterClose = 1;
    var lensRadius = 1;
    var focalDistance = 10;

    var camera = new PerspectiveCamera(cameraToWorld,
        shutterOpen, shutterClose, lensRadius, focalDistance, film);

    var se = film.getSampleExtent();
    var sampler = new SimpleSampler(se[0], se[1], se[2], se[3],
        camera.shutterOpen, camera.shutterClose);


    var surfaceIntegrator = new WhittedIntegrator();
    var volumeIntegrator = null;

    var renderer = new SamplerRenderer(sampler, camera, surfaceIntegrator, volumeIntegrator);

    renderer.render(scene);

    film.writeImage();

}

function testCamera() {

    var filter = new GaussianFilter(2, 2, 2);
    var film = new Film(100, 100, filter, [0,1, 0,1]);

    var lookAt = mat4.create();
    mat4.lookAt(lookAt, vec3.fromValues(0,0,0), vec3.fromValues(0,0,-100), vec3.fromValues(0,1,0));

    var cameraToWorld = new Transform(lookAt);
    var shutterOpen = 0;
    var shutterClose = 1;
    var lensRadius = 0;
    var focalDistance = 1e30;

    var camera = new PerspectiveCamera(cameraToWorld,
        shutterOpen, shutterClose, lensRadius, focalDistance, film);

    var se = film.getSampleExtent();
    var sampler = new SimpleSampler(se[0], se[1], se[2], se[3],
        camera.shutterOpen, camera.shutterClose);


    var sample = new Sample();

    sampler.getNextSample(sample);

    var ray = new Ray();
    camera.generateRay(sample, ray);

    console.dir(sample);
    console.dir(ray);

}

//testDiffGeom();
//testMaterial(testSphere());
//testMaterial();

testCamera();