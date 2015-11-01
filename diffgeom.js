
function DiffGeom(p, dpdu, dpdv, dndu, dndv, u, v, shape) {

    // point
    this.p = p;
    // vectors
    this.dpdu = dpdu;
    this.dpdv = dpdv;
    // normals
    this.dndu = dndu;
    this.dndv = dndv;
    // scalars
    this.u = u;
    this.v = v;

    this.nn = vec3.create();
    vec3.cross(this.nn, dpdu, dpdv);
    vec3.normalize(this.nn, this.nn);

    this.dudx = 0;
    this.dvdx = 0;
    this.dudy = 0;
    this.dvdy = 0;
    this.dpdx = vec3.create();
    this.dpdy = vec3.create();

    this.shape = shape;

    if (shape && (!shape.reverseOrientation != !shape.transformSwapsHandedness)) {
        vec3.negate(this.nn, this.nn);
    }
}

function solveLinearSystem2x2(A, B) {
    var det = A[0][0]*A[1][1] - A[0][1]*A[1][0];
    if (Math.abs(det) < 1e-10) {
        return [0, 0];
    }
    var x0 = (A[1][1]*B[0] - A[0][1]*B[1]) / det;
    var x1 = (A[0][0]*B[1] - A[1][0]*B[0]) / det;
    if (isNaN(x0) || isNaN(x1)) {
        return [0, 0];
    }
    return [x0, x1];
}

DiffGeom.prototype = {

    resetDifferentials : function() {
        this.dudx = 0;
        this.dvdx = 0;
        this.dudy = 0;
        this.dvdy = 0;
        vec3.set(this.dpdx, 0, 0, 0);
        vec3.set(this.dpdy, 0, 0, 0);
    },

    computeDifferentials : function(ray) {

        if (!ray.hasDifferentials()) {
            this.resetDifferentials();
            return;
        }
        // Estimate screen space change in $\pt{}$ and $(u,v)$
        // Compute auxiliary intersection points with plane
        var d = -vec3.dot(this.nn, this.p);
        var tx = -(vec3.dot(this.nn, ray.rxo) + d) / vec3.dot(this.nn, ray.rxd);
        var ty = -(vec3.dot(this.nn, ray.ryo) + d) / vec3.dot(this.nn, ray.ryd);

        if (isNaN(tx) || isNaN(ty)) {
            this.resetDifferentials();
            return;
        }
        vec3.scaleAndAdd(this.dpdx, ray.rxo, ray.rxd, tx);
        vec3.scaleAndAdd(this.dpdy, ray.ryo, ray.ryd, ty);
        vec3.sub(this.dpdx, this.dpdx, this.p);
        vec3.sub(this.dpdy, this.dpdy, this.p);

        // Compute $(u,v)$ offsets at auxiliary points

        var axes = [];
        if (Math.abs(this.nn[0]) > Math.abs(this.nn[1]) &&
            Math.abs(this.nn[0]) > Math.abs(this.nn[2])) {
            axes[0] = 1; axes[1] = 2;
        }  else if (Math.abs(this.nn[1]) > Math.abs(this.nn[2])) {
            axes[0] = 0; axes[1] = 2;
        } else {
            axes[0] = 0; axes[1] = 1;
        }

        // Initialize matrices for chosen projection plane
        var A = [ [ this.dpdu[axes[0]], this.dpdv[axes[0]] ],
                  [ this.dpdu[axes[1]], this.dpdv[axes[1]] ] ];
        var Bx = [ this.dpdx[axes[0]], this.dpdx[axes[1]] ];
        var By = [ this.dpdy[axes[0]], this.dpdy[axes[1]] ];

        var sx = solveLinearSystem2x2(A, Bx);
        this.dudx = sx[0];
        this.dvdx = sx[1];
        var sy = solveLinearSystem2x2(A, By);
        this.dudy = sy[0];
        this.dvdy = sy[1];
    }
}
