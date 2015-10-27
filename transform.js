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

    // transform:
    //  vector, normal, another transform
    //
    inverse : function() {
        return new Transform(this.mInv, this.m);
    },

    transpose : function() {
        var tr = new Transform(this.m, this.mInv);
        mat4.transpose(tr.m, tr.m);
        mat4.transpose(tr.mInv, tr.mInv);
        return tr;
    },

    // eq :function(other)

    hasScale : function() {
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
    trPoint(src, dst) {
        dst = dst !== undefined ? dst : vec3.create();
        vec3.transformMat4(dst, src, this.m);
        return dst;
    },
    trVector(src, dst) {
        dst = dst !== undefined ? dst : vec3.create();
        vec3.transformMat4_0(dst, src, this.m);
        return dst;
    },
    trNormal(src, dst) {
        dst = dst !== undefined ? dst : vec3.create();
        vec3.transformMat4_0t(dst, src, this.mInv);
        return dst;
    },


inline Ray operator()(const Ray &r) const;
inline void operator()(const Ray &r, Ray *rt) const;
inline RayDifferential operator()(const RayDifferential &r) const;
inline void operator()(const RayDifferential &r, RayDifferential *rt) const;
BBox operator()(const BBox &b) const;
Transform operator*(const Transform &t2) const;
bool SwapsHandedness() const;}