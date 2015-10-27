/**
 * Created by Matti on 23.9.2015.
 */
/**
 *
 */
"use strict";

console.log(glMatrix.ARRAY_TYPE);
console.log(glMatrix);
// generate bitmap data
// plot bitmap

//document.addEventListener('DOMContentLoaded',
var canvas_2d = document.getElementById("canvas-2d");
var canvas_webgl = document.getElementById("canvas-webgl");
var gl;

// var sss = new HTMLCollection();
// sss.

var v3 = vec3.create();
console.log(v3);
v3[0] = 1;
v3[1] = 1;
v3[2] = 1;
console.log(v3);
console.log(vec3.length(v3));


// TODO: better find that physically based rendering book
// with simple raytracer pseudocode

// javascript vector type
//

// cast ray
// result: hit point, hit normal
var cast = function (origin, direction) {

}

// scene: container for lights, shapes, materials

// primitive -> shape, material

// shape

// material

// light

// renderer

// camera model:
// - decides what primary rays to shoot
// -

//var scene = new Scene(aggregate, lights, volume_region);

//if (scene.intersect("ray", "intersection")) {
    //
//}
if (window.WebGLRenderingContext) {
    console.log("browser supports WebGL");
    // browser supports WebGL
} else {
    console.log("browser DOES NOT support WebGL");
}

gl = canvas_webgl.getContext("webgl");

//var gl = canvas.getContext("webgl");
console.log("gl = " + gl);
if (!gl) {
    // browser supports WebGL but initialization failed.
    console.log("getContext(\"webgl\") returned null");
}

var ctx = canvas_2d.getContext("2d");
// var gl = c.getContext("webgl");
var img = document.getElementById("scream");

var imgd = ctx.createImageData(400, 400);


function rndInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
var updateRender = function (arg) {
/*
    var aa = 1;
    //var ctx2 = new CanvasRenderingContext2D();

    //let evens = [2,4,6,8];
    //let odds = evens.map(v => v + 1);

    console.log("img = " + img);
    console.log("size = " + img.width + ", " + img.height);
    //ctx.drawImage(img,10,10);
    console.log("aa = " + aa);

    var n = imgd.width * imgd.height;
    var d = imgd.data;
    for (var i = 0; i < d.length; i += 4) {
        d[i] = (Math.sin(2 * Math.PI * i / n) + 1) * 128;
        d[i + 1] = (Math.cos(0.7 * Math.PI * i / n) + 1) * 128;
        d[i + 2] = (Math.sin(0.4 * Math.PI * i / n) + 1) * 128;
        d[i + 3] = 255;
    }
*/
    // subtask:
    // show some UI that is directly linked to some parameter (e.g. filter size)
    // and changes to UI component are immediately reflected
    // on render result

    var filter = new GaussianFilter(arg, arg, 0.01);
    var film = new Film(400, 400, filter, [0,1, 0,1], "");

    var s = new Sample(2,2);
    var L = new Spectrum();
    L.rgb = [0.5,0,0];

    for (var x = 0; x < 200; x++) {
        for (var y = 0; y < 200; y++) {
            s.imageX = rndInt(100,300);
            s.imageY = rndInt(100,300);
            L.rgb[0] = ((x >> 4) & 1) ^ ((y >> 4) & 1);
            L.rgb[2] = 1 ^ L.rgb[0];
            film.addSample(s, L);
        }
    }
    film.writeImage(imgd);


    //ctx.drawImage(img, 10, 10);
    ctx.putImageData(imgd, 0, 0);

    //var imgData=ctx.getImageData(10,10,50,50);
    //ctx.putImageData(imgData,10,70);


    //console.log("gl = " + gl);

};


//ctx.fillStyle = "#FF0000";
//ctx.fillRect(0,0,150,75);
// gl = WebGLDebugUtils.makeDebugContext(gl);
// console.log(gl.canvas === canvas);


$(function() {
    var spinner = $( "#spinner" ).spinner();

    $( "#spinner" ).spinner({
        stop: function( event, ui ) {

            updateRender(spinner.spinner("value"));
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


