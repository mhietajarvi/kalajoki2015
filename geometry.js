/**
 * Created by Matti on 23.9.2015.
 */


function Ray(o, d, mint, maxt, time, depth) {
    this.o = o ? vec3.clone(o) : vec3.create();
    this.d = d ? vec3.clone(d) : vec3.create();
    this.mint = mint || 0;
    this.maxt = maxt || Math.POSITIVE_INFINITY;
    this.time = time || 0;
    this.depth = depth || 0;

    // having these optional values makes this RayDifferential
    //  Point rxo, ryo;
    //  Vector rxd, ryd;
}

Ray.prototype = {

    pointAt: function (t, out) {
        vec3.scaleAndAdd(out, this.o, this.d, t);
    },
    hasDifferentials : function() {
        return this.hasOwnProperty('rxo');
    },
    initDifferentials : function() {
        this.rxo = vec3.create();
        this.ryo = vec3.create();
        this.rxd = vec3.create();
        this.ryd = vec3.create();
    },
    scaleDifferentials:function(s) {
        vec3.sub(this.rxo, this.rxo, this.o);
        vec3.scaleAndAdd(this.rxo, this.o, this.rxo, s);
        vec3.sub(this.ryo, this.ryo, this.o);
        vec3.scaleAndAdd(this.ryo, this.o, this.ryo, s);
        vec3.sub(this.rxd, this.rxd, this.d);
        vec3.scaleAndAdd(this.rxd, this.d, this.rxd, s);
        vec3.sub(this.ryd, this.ryd, this.d);
        vec3.scaleAndAdd(this.ryd, this.d, this.ryd, s);
    }
}

function BBox(pt1, pt2) {
    this.pMin = vec3.fromValues(Math.min(pt1[0], pt2[0]), Math.min(pt1[1], pt2[1]), Math.min(pt1[2], pt2[2]));
    this.pMax = vec3.fromValues(Math.max(pt1[0], pt2[0]), Math.max(pt1[1], pt2[1]), Math.max(pt1[2], pt2[2]));
}


BBox.prototype = {

    tmp_vec3 : vec3.create(),

// adds given point/box to extent of this
    union: function (bbox_or_pt) {
        if (bbox_or_pt instanceof BBox) {
            vec3.min(this.pMin, this.pMin, bbox_or_pt.pMin);
            vec3.max(this.pMax, this.pMax, bbox_or_pt.pMax);
        } else {
            vec3.min(this.pMin, this.pMin, bbox_or_pt);
            vec3.max(this.pMax, this.pMax, bbox_or_pt);
        }
    },
    overlaps: function (bbox) {
        var ox = (this.pMax[0] >= bbox.pMin[0]) && (this.pMin[0] <= bbox.pMax[0]);
        var oy = (this.pMax[1] >= bbox.pMin[1]) && (this.pMin[1] <= bbox.pMax[1]);
        var oz = (this.pMax[2] >= bbox.pMin[2]) && (this.pMin[2] <= bbox.pMax[2]);
        return ox && oy && oz;
    },
    inside: function (pt) {
        return
        pt[0] >= this.pMin[0] && pt[0] <= this.pMax[0] &&
        pt[1] >= this.pMin[1] && pt[1] <= this.pMax[1] &&
        pt[2] >= this.pMin[2] && pt[2] <= this.pMax[2];
    },
    expand: function (delta) {
        this.pMin[0] -= delta;
        this.pMin[1] -= delta;
        this.pMin[2] -= delta;
        this.pMax[0] += delta;
        this.pMax[1] += delta;
        this.pMax[2] += delta;
    },
    surfaceArea: function () {
        var v = BBox.prototype.tmp_vec3;
        vec3.sub(v, this.pMax, this.pMin);
        return 2 * (
            v[0] * v[1] +
            v[0] * v[2] +
            v[1] * v[2]);
    },
    volume: function () {
        var v = BBox.prototype.tmp_vec3;
        vec3.sub(v, this.pMax, this.pMin);
        return v[0] * v[1] * v[2];
    },
    maximumExtent: function () {
        var v = BBox.prototype.tmp_vec3;
        vec3.sub(v, this.pMax, this.pMin);
        if (v[0] > v[1] && v[0] > v[2]) {
            return 0;
        } else if (v[1] > v[2]) {
            return 1;
        } else {
            return 2;
        }
    },
    lerp: function (tx, ty, tz) {
        return vec3.fromValues(
            (1 - tx) * this.pMin[0] + tx * this.pMax[0],
            (1 - ty) * this.pMin[1] + ty * this.pMax[1],
            (1 - tz) * this.pMin[2] + tz * this.pMax[2]
        );
    },
    offset: function (pt) {
        return vec3.fromValues(
            (pt[0] - this.pMin[0]) / (this.pMax[0] - this.pMin[0]),
            (pt[1] - this.pMin[1]) / (this.pMax[1] - this.pMin[1]),
            (pt[2] - this.pMin[2]) / (this.pMax[2] - this.pMin[2]));
    },
    boundingSphere: function () {
        var c = vec3.create();
        vec3.addAndScale(c, this.pMin, this.pMax, 0.5);
        return {center: c, radius: vec3.distance(c, this.pMax)};
    },
    // return undefined if no intersection, ray hit t0,t1 otherwise
    intersectP: function (ray) {
        var t0 = ray.mint;
        var t1 = ray.maxt;
        for (var i = 0; i < 3; ++i) {
            // Update interval for _i_th bounding box slab
            var invRayDir = 1 / ray.d[i];
            var tNear = (this.pMin[i] - ray.o[i]) * invRayDir;
            var tFar = (this.pMax[i] - ray.o[i]) * invRayDir;
            // Update parametric interval from slab intersection $t$s
            if (tNear > tFar) {
                var tmp = tNear;
                tNear = tFar;
                tFar = tmp;
            }
            t0 = tNear > t0 ? tNear : t0;
            t1 = tFar < t1 ? tFar : t1;
            if (t0 > t1) {
                return;
            }
        }
        return {t0: t0, t1: t1};
    }
};
