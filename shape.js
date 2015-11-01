/**
 * Created by Matti on 27.10.2015.
 */

//var fs = require("fs");
//
//function read(f) {
//    return fs.readFileSync(f).toString();
//}
//function include(f) {
//    eval.apply(global, [read(f)]);
//}
//
//include("gl-matrix/common.js");
//include("gl-matrix/vec3.js");
//include("gl-matrix/mat4.js");
//include("geometry.js");
//include("diffgeom.js");
//include("transform.js");


Shape.nextshapeId = 0;
Shape.tmp_vec3 = vec3.create();
Shape.tmp_ray = new Ray();

function Shape(o2w, w2o, ro) {

    this.objectToWorld = o2w ? o2w : mat4.identity();
    this.worldToObject = w2o ? w2o : o2w.inverse();
    //if (o2w === undefined) {
    //    this.objectToWorld = mat4.identity();
    //    this.worldToObject = mat4.identity();
    //} else {
    //    this.objectToWorld = mat4.clone(o2w);
    //    if (w2o === undefined) {
    //        this.worldToObject = this.objectToWorld.inverse();
    //    } else {
    //        this.worldToObject = mat4.clone(w2o);
    //    }
    //}
    this.reverseOrientation = !!ro;
    this.transformSwapsHandedness = this.objectToWorld.swapsHandedness();
    this.shapeId = Shape.nextshapeId++;
}

Shape.prototype = {

    //tmp_vec3: vec3.create(),
    //tmp_ray: new Ray(),

    // BBox
    worldBound: function () {
        return this.objectToWorld.trBBox(this.objectBound());
    },
    // should not be needed for my port
    //canIntersect : function() {
    //    return true;
    //},
    //refine :function(refined) {
    //    //Severe("Unimplemented Shape::Refine() method called");
    //},
    // return { (float) tHit, (float) rayEpsilon, (DiffGeom) dg }
    // (dg describes geometry at hit location)
    // undefined if there is no intersection
    intersect: function (ray) {
        // Severe("Unimplemented Shape::Intersect() method called");
    },
    // return { (vec3) pt, (float) phi }
    // (return value is subclass specific, external callers should
    // just check return value truthiness)
    intersectP: function (ray) {
        //Severe("Unimplemented Shape::IntersectP() method called");
    },
    area: function () {
        //Severe("Unimplemented Shape::Area() method called");
        return 0;
    },
    // pt = point, wi = vector
    pdf: function (pt, wi) {
        // Intersect sample ray with area light geometry

        var dgLight = new DiffGeom();
        var ray = new Ray(pt, wi, 1e-3);
        ray.depth = -1; // temporary hack to ignore alpha mask

        // float thit, rayEpsilon;
        //TODO: how dg should be handled? let caller create empty or return new?
        var isect = this.intersect(ray, dgLight);
        if (!isect) {
            // no hit
            return 0;
        }
        // DistanceSquared(pt, ray(thit))
        // Convert light sample weight to solid angle measure
        vec3.negate(tmp_vec3, wi);
        var pdf = vec3.distSquared(pt, ray.pointAt(isect.tHit)) /
            (Math.abs(vec3.dot(dgLight.nn, tmp_vec3)) * this.area());

        return isFinite(pdf) ? pdf : 0;
    }

    // TODO: sampling methods only if/when they are needed

    //sample:function(float u1, float u2, Normal *Ns) {
    //    // Severe("Unimplemented Shape::Sample() method called");
    //    return Point();
    //},
    //virtual float Pdf(const Point &Pshape) const {
    //    return 1.f / Area();
    //}
    //virtual Point Sample(const Point &P, float u1, float u2,
    //Normal *Ns) const {
    //    return Sample(u1, u2, Ns);
    //}
    //virtual float Pdf(const Point &p, const Vector &wi) const;

}

function clamp(val, low, high) {
    if (val < low) {
        return low;
    }
    if (val > high) {
        return high;
    }
    return val;
}

function radians(deg) {
    return (Math.PI / 180) * deg;
}

// return [t0, t1]
function quadratic(A, B, C) {
    // Find quadratic discriminant
    var d2 = B * B - 4 * A * C;
    if (d2 < 0) {
        return;
    }
    var d = Math.sqrt(d2);
    // Compute quadratic _t_ values
    var q = B < 0 ? -0.5 * (B - d) : -0.5 * (B + d);
    var t0 = q / A;
    var t1 = C / q;
    return t1 < t0 ? [t1, t0] : [t0, t1];
}
function Sphere(o2w, w2o, ro, rad, z0, z1, pm) {

    Shape.call(this, o2w, w2o, ro);
    this.radius = rad;
    this.zmin = clamp(Math.min(z0, z1), -this.radius, this.radius);
    this.zmax = clamp(Math.max(z0, z1), -this.radius, this.radius);
    this.thetaMin = Math.acos(clamp(this.zmin / this.radius, -1, 1));
    this.thetaMax = Math.acos(clamp(this.zmax / this.radius, -1, 1));
    this.phiMax = radians(clamp(pm, 0, 360));
    this.bbox = new BBox(
        vec3.fromValues(-this.radius, -this.radius, this.zmin),
        vec3.fromValues(this.radius, this.radius, this.zmax)
    );
}

// override "abstract" "methods"
Sphere.prototype = Object.create(Shape.prototype);

Sphere.prototype.objectBound = function () {
    return this.bbox;
};
Sphere.prototype.isClipped = function (z, phi) {
    return
    (this.zmin > -this.radius && z < this.zmin) ||
    (this.zmax < this.radius && z > this.zmax) ||
    phi > this.phiMax;
};
// return { (float) t, (vec3) pt, (float) phi }
// (in object coordinates)
Sphere.prototype.intersectP = function (r) {

    var ray = Shape.tmp_ray; // vec.create(); // Shape.tmp_ray;
    this.worldToObject.trRay(r, ray);

    // Compute quadratic sphere coefficients
    var A = vec3.squaredLength(ray.d);
    var B = 2 * vec3.dot(ray.d, ray.o)
    var C = vec3.squaredLength(ray.o) - this.radius * this.radius;

    // Compute intersection distance along ray
    var t = quadratic(A, B, C);
    if (!t || t[0] > ray.maxt || t[1] < ray.mint) {
        return;
    }
    var thit = t[0];
    if (t[0] < ray.mint) {
        thit = t[1];
        if (thit > ray.maxt) {
            return;
        }
    }

    var phit = Shape.tmp_vec3;
    var phi;
    for (; ;) {
        // Compute sphere hit position and phi
        ray.pointAt(thit, phit);
        if (phit[0] == 0 && phit[1] == 0) {
            phit[0] = 1e-5 * this.radius;
        }
        phi = Math.atan2(phit[1], phit[0]);
        if (phi < 0) {
            phi += 2 * Math.PI;
        }
        // Test sphere intersection against clipping parameters
        if (!this.isClipped(phit[2], phi)) {
            return {t: thit, pt: phit, phi: phi};
        }
        if (thit == t[1] || t[1] > ray.maxt) {
            // no more hit points to try
            return;
        }
        thit = t[1];
    }
};

// return { (float) tHit, (float) rayEpsilon, (DiffGeom) dg }
Sphere.prototype.intersect = function (r) {

    var hit = this.intersectP(r);
    if (!hit) {
        return;
    }
    // Find parametric representation of sphere hit
    var u = hit.phi / this.phiMax;
    var theta = Math.acos(clamp(hit.pt[2] / this.radius, -1, 1));
    var v = (theta - this.thetaMin) / (this.thetaMax - this.thetaMin);

    // Compute sphere dpdu and dpdv
    var zradius = Math.sqrt(hit.pt[0] * hit.pt[0] + hit.pt[1] * hit.pt[1]);
    var invzradius = 1 / zradius;
    var cosphi = hit.pt[0] * invzradius;
    var sinphi = hit.pt[1] * invzradius;

    var thetaDiff = this.thetaMax - this.thetaMin;

    var dpdu = vec3.fromValues(-this.phiMax * hit.pt[1], this.phiMax * hit.pt[0], 0);
    var dpdv = vec3.fromValues(hit.pt[2] * cosphi, hit.pt[2] * sinphi,
        -this.radius * Math.sin(theta));
    vec3.scale(dpdv, dpdv, thetaDiff);

    // Compute sphere dndu and dndv
    var d2Pduu = vec3.fromValues(hit.pt[0], hit.pt[1], 0);
    vec3.scale(d2Pduu, d2Pduu, -this.phiMax * this.phiMax);

    var d2Pduv = vec3.fromValues(-sinphi, cosphi, 0);
    vec3.scale(d2Pduv, d2Pduv, thetaDiff * hit.pt[2] * this.phiMax);

    var d2Pdvv = vec3.clone(hit.pt);
    vec3.scale(d2Pdvv, d2Pdvv, -thetaDiff * thetaDiff);

    // Compute coefficients for fundamental forms
    var E = vec3.dot(dpdu, dpdu);
    var F = vec3.dot(dpdu, dpdv);
    var G = vec3.dot(dpdv, dpdv);
    var N = vec3.create();
    vec3.cross(N, dpdu, dpdv);
    vec3.normalize(N, N);
    var e = vec3.dot(N, d2Pduu);
    var f = vec3.dot(N, d2Pduv);
    var g = vec3.dot(N, d2Pdvv);

    // Compute dndu and dndv from fundamental form coefficients
    var invEGF2 = 1 / (E * G - F * F);
    var dndu = d2Pduu; // re-use
    vec3.scale(dndu, dpdu, (f * F - e * G) * invEGF2);
    vec3.scaleAndAdd(dndu, dndu, dpdv, (e * F - f * E) * invEGF2);
    var dndv = d2Pduv; // re-use
    vec3.scale(dndv, dpdu, (g * F - f * G) * invEGF2);
    vec3.scaleAndAdd(dndv, dndv, dpdv, (f * F - g * E) * invEGF2);

    this.objectToWorld.trPoint(hit.pt, hit.pt);
    this.objectToWorld.trVector(dpdu, dpdu);
    this.objectToWorld.trVector(dpdv, dpdv);
    this.objectToWorld.trNormal(dndu, dndu);
    this.objectToWorld.trNormal(dndv, dndv);

    return {
        tHit: hit.t,
        rayEpsilon: 5e-4 * hit.t,
        dg: new DiffGeom(hit.pt, dpdu, dpdv, dndu, dndv, u, v, this)
    };
};

Sphere.prototype.area = function () {
    return this.phiMax * this.radius * (this.zmax - this.zmin);
};

//function testSphere() {
//
//    var m = mat4.create(); // identity();
//    mat4.translate(m, m, vec3.fromValues(0.7, 0.7, 0.17));
//    var o2w = new Transform(m);
//
//    var sp = new Sphere(o2w, undefined, false, 3.3, -2, 1, 270);
//
//    // DifferentialGeometry dg;
//
//    var proto = Sphere.prototype;
//
//    var ray = new Ray(vec3.fromValues(-10, 0, 0), vec3.fromValues(1, 0, 0), 0, 100);
//    //float tHit;
//    //float rayEpsilon;
//    var isect = sp.intersect(ray); //, &tHit, &rayEpsilon, &dg);
//
//    console.dir(isect);
//}
//
////testDiffGeom();
//testSphere();