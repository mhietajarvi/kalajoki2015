/**
 * Created by Matti on 29.10.2015.
 */


function DiffGeom(p, dpdu, dpdv, dndu, dndv, u, v, shape) {

    this.p = p;
    this.dpdu = dpdu;
    this.dpdv = dpdv;
    this.dndu = dndu;
    this.dndv = dndv;
    this.u = u;
    this.v = v;
    this.shape = shape;

    //this.nn = Normal(Normalize(Cross(dpdu, dpdv)));
    this.nn = vec3.create();
    vec3.cross(this.nn, dpdu, dpdv);
    vec3.normalize(this.nn, this.nn);

    this.dudx = 0;
    this.dvdx = 0;
    this.dudy = 0;
    this.dvdy = 0;
}

DiffGeom.prototype = {
    computeDifferentials : function(ray) {

        if (ray.hasDifferentials()) {
            // Estimate screen space change in $\pt{}$ and $(u,v)$

            // Compute auxiliary intersection points with plane
            float d = -Dot(nn, Vector(p.x, p.y, p.z));
            Vector rxv(ray.rxOrigin.x, ray.rxOrigin.y, ray.rxOrigin.z);
            float tx = -(Dot(nn, rxv) + d) / Dot(nn, ray.rxDirection);
            if (isnan(tx)) goto fail;

            Point px = ray.rxOrigin + tx * ray.rxDirection;
            Vector ryv(ray.ryOrigin.x, ray.ryOrigin.y, ray.ryOrigin.z);
            float ty = -(Dot(nn, ryv) + d) / Dot(nn, ray.ryDirection);
            if (isnan(ty)) goto fail;

            Point py = ray.ryOrigin + ty * ray.ryDirection;
            dpdx = px - p;
            dpdy = py - p;

            // Compute $(u,v)$ offsets at auxiliary points

            // Initialize _A_, _Bx_, and _By_ matrices for offset computation
            float A[2][2], Bx[2], By[2];
            int axes[2];
            if (fabsf(nn.x) > fabsf(nn.y) && fabsf(nn.x) > fabsf(nn.z)) {
                axes[0] = 1; axes[1] = 2;
            }
            else if (fabsf(nn.y) > fabsf(nn.z)) {
                axes[0] = 0; axes[1] = 2;
            }
            else {
                axes[0] = 0; axes[1] = 1;
            }

            // Initialize matrices for chosen projection plane
            A[0][0] = dpdu[axes[0]];
            A[0][1] = dpdv[axes[0]];
            A[1][0] = dpdu[axes[1]];
            A[1][1] = dpdv[axes[1]];
            Bx[0] = px[axes[0]] - p[axes[0]];
            Bx[1] = px[axes[1]] - p[axes[1]];
            By[0] = py[axes[0]] - p[axes[0]];
            By[1] = py[axes[1]] - p[axes[1]];
            if (!SolveLinearSystem2x2(A, Bx, &dudx, &dvdx)) {
                dudx = 0.; dvdx = 0.;
            }
            if (!SolveLinearSystem2x2(A, By, &dudy, &dvdy)) {
                dudy = 0.; dvdy = 0.;
            }

        }
        else {
            fail:
                dudx = dvdx = 0.;
            dudy = dvdy = 0.;
            dpdx = dpdy = Vector(0,0,0);
        }

    }
}
