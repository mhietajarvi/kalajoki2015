/**
 * Created by mattihietajarvi on 27/10/2015.
 */


function Transform(m, mInv) {

    this.m = mat4.clone(m);
    if (mInv === undefined) {
        this.mInv = mat4.create();
        mat4.invert(this.mInv, m);
    } else {
        this.mInv = mat4.clone(mInv);
    }
}
var vec3_unitx = vec3.fromValues(1,0,0);
var vec3_unity = vec3.fromValues(0,1,0);
var vec3_unitz = vec3.fromValues(0,0,1);

var vec3_tmp = vec3.create();

Transform.prototype = {

    inverse: function () {
        return new Transform(this.mInv, this.m);
    },

    transpose: function () {
        var tr = new Transform(this.m, this.mInv);
        mat4.transpose(tr.m, tr.m);
        mat4.transpose(tr.mInv, tr.mInv);
        return tr;
    },

    // eq :function(other)

    hasScale: function () {
        this.trVector(vec3_unitx, vec3_tmp);
        var la2 = vec3_tmp.squaredLength();
        this.trVector(vec3_unity, vec3_tmp);
        var lb2 = vec3_tmp.squaredLength();
        this.trVector(vec3_unitz, vec3_tmp);
        var lc2 = vec3_tmp.squaredLength();
        return
        la2 < 0.999 || la2 > 1.001 ||
        lb2 < 0.999 || lb2 > 1.001 ||
        lc2 < 0.999 || lc2 > 1.001;
    },
    // all src,dst are just vec3 with different semantics
    trPoint: function (src, dst) {
        dst = dst !== undefined ? dst : vec3.create();
        vec3.transformMat4(dst, src, this.m);
        return dst;
    },
    trVector: function (src, dst) {
        dst = dst !== undefined ? dst : vec3.create();
        vec3.transformMat4_0(dst, src, this.m);
        return dst;
    },
    trNormal: function (src, dst) {
        dst = dst !== undefined ? dst : vec3.create();
        vec3.transformMat4_0t(dst, src, this.mInv);
        return dst;
    },


    trRay: function (src, dst) {
        if (dst !== undefined) {
            this.trPoint(src.o, dst.o);
            this.trVector(src.d, dst.d);
            if (dst !== src) {
                dst.mint = src.mint;
                dst.maxt = src.maxt;
                dst.time = src.time;
                dst.depth = src.depth;
            }
        } else {
            var o = vec3.create();
            var d = vec3.create();
            this.trPoint(src.o, o);
            this.trVector(src.d, d);
            dst = new Ray(o, d, src.mint, src.maxt, src.time, src.depth);
        }
        if (src.hasDifferentials()) {
            dst.rxo = this.trPoint(src.rxo, dst.rxo);
            dst.ryo = this.trPoint(src.ryo, dst.ryo);
            dst.rxd = this.trVector(src.rxd, dst.rxd);
            dst.ryd = this.trVector(src.ryd, dst.ryd);
        }
        return dst;
    },
    trBBox: function (src, dst) {

        var xmin = vec3.fromValues(
            this.m[0] * src.pMin[0],
            this.m[1] * src.pMin[0],
            this.m[2] * src.pMin[0]);
        var xmax = vec3.fromValues(
            this.m[0] * src.pMax[0],
            this.m[1] * src.pMax[0],
            this.m[2] * src.pMax[0]);
        vec3.sort(xmin, xmax);

        var ymin = vec3.fromValues(
            this.m[4] * src.pMin[1],
            this.m[5] * src.pMin[1],
            this.m[6] * src.pMin[1]);
        var ymax = vec3.fromValues(
            this.m[4] * src.pMax[1],
            this.m[5] * src.pMax[1],
            this.m[6] * src.pMax[1]);
        vec3.sort(ymin, ymax);

        var zmin = vec3.fromValues(
            this.m[8] * src.pMin[2],
            this.m[9] * src.pMin[2],
            this.m[10] * src.pMin[2]);
        var zmax = vec3.fromValues(
            this.m[8] * src.pMax[2],
            this.m[9] * src.pMax[2],
            this.m[10] * src.pMax[2]);
        vec3.sort(zmin, zmax);

        var tr = vec3.fromValues(
            this.m[12],
            this.m[13],
            this.m[14]);

        for (var i = 0; i < 3; i++) {
            xmin[i] += ymin[i] + zmin[i] + tr[i];
            xmax[i] += ymax[i] + zmax[i] + tr[i];
        }

        if (dst !== undefined) {
            dst.pMin = xmin;
            dst.pMax = xmax;
            return dst;
        } else {
            return new BBox(xmin, xmax);
        }
    },
    // transform (multiply transforms)
    trTr: function (src, dst) {

        if (dst !== undefined) {
            mat4.mul(dst.m, this.m, src.m);
            mat4.mul(dst.mInv, src.mInv, this.mInv);
            return dst;
        }
        var m = mat4.create();
        var mInv = mat4.create();
        mat4.mul(m, this.m, src.m);
        mat4.mul(mInv, src.mInv, this.mInv);
        return new Transform(m, mInv);
    },
    swapsHandedness : function () {
        return mat4.determinant3x3(m) < 0;
    }
}
