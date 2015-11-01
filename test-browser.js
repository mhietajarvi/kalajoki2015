
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

function testCamera() {

    var filter = new GaussianFilter(2, 2, 2);
    var film = new Film(4, 4, filter, [0,1, 0,1]);

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

    for (var i = 0; i < 10; i++) {
        sampler.getNextSample(sample);

        var ray = new Ray();
        camera.generateRay(sample, ray);

        console.log(sample);
        console.log(ray);
    }
}

function createFilm(xres, yres) {
    var filter = new GaussianFilter(3, 3, 0.001);
    var film = new Film(xres, yres, filter, [0,1, 0,1]);
    return film;
}

function renderScene(film, spherePos) {

    var m = mat4.create(); // identity();
    mat4.translate(m, m, spherePos);

    var sphere = new Sphere(new Transform(m), undefined, false, 1, -1, 1, 360);

        //false, 3.3, -2, 1, 270);
    var mat = new Material(vec3.fromValues(5,5,5));

    var prim = new GeometricPrimitive(sphere, mat);

    mat4.identity(m);
    mat4.translate(m, m, vec3.fromValues(2,2,0));
    var light1 = new PointLight(new Transform(m), vec3.fromValues(1.0,1.0,1.0));
    mat4.identity(m);
    mat4.translate(m, m, vec3.fromValues(-2,-2,-2));
    var light2 = new PointLight(new Transform(m), vec3.fromValues(2.0,0.5,0.3));
    mat4.identity(m);
    mat4.translate(m, m, vec3.fromValues(-2, 2,-2));
    var light3 = new PointLight(new Transform(m), vec3.fromValues(0.0,0.2,1.3));

    // no acceleration structures supported
    var scene = new Scene(prim, [light1, light2, light3]);

    var lookAt = mat4.create();
    mat4.lookAt(lookAt, vec3.fromValues(0,0,0), vec3.fromValues(0,0,-100), vec3.fromValues(0,1,0));
    mat4.scale(lookAt, lookAt, vec3.fromValues(-1,1,1));

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
}

function rndInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var updateRender = function (film, arg) {

    var startTime = Date.now();

    renderScene(film, vec3.fromValues(0,arg*0.2,-2));

    var endTime = Date.now();

    film.writeImage(imgd);
    film.reset();

    //ctx.drawImage(img, 10, 10);
    ctx.putImageData(imgd, 0, 0);


    return (endTime - startTime);
    //var imgData=ctx.getImageData(10,10,50,50);
    //ctx.putImageData(imgData,10,70);


    //console.log("gl = " + gl);
}



var canvas_2d = document.getElementById("canvas-2d");
var canvas_webgl = document.getElementById("canvas-webgl");
var gl = canvas_webgl.getContext("webgl");

var ctx = canvas_2d.getContext("2d");
var img = document.getElementById("scream");

var xres = 500;
var yres = 500;

var imgd = ctx.createImageData(xres, yres);

var film = createFilm(xres, yres);

updateRender(film, 0);


//ctx.fillStyle = "#FF0000";
//ctx.fillRect(0,0,150,75);
// gl = WebGLDebugUtils.makeDebugContext(gl);
// console.log(gl.canvas === canvas);


$(function() {
    var spinner = $( "#spinner" ).spinner();

    $( "#spinner" ).spinner({
        stop: function( event, ui ) {

            var time = updateRender(film, spinner.spinner("value"));

            $( "#renderTime").text("render time: "+time + " ms");
            //alert( event.type + " value:" + spinner.spinner("value") );
        }
    });

    $( "#disable" ).click(function() {
        if ( spinner.spinner( "option", "disabled" ) ) {
            spinner.spinner( "enable" );
        } else {
            spinner.spinner( "disable" );
        }
    });
    $( "#destroy" ).click(function() {
        if ( spinner.spinner( "instance" ) ) {
            spinner.spinner( "destroy" );
        } else {
            spinner.spinner();
        }
    });
    $( "#getvalue" ).click(function() {
        alert( spinner.spinner( "value" ) );
    });
    $( "#setvalue" ).click(function() {
        spinner.spinner( "value", 5 );
    });
    $( "button" ).button();
});


//testDiffGeom();
//testMaterial(testSphere());
//testMaterial();
//testCamera();