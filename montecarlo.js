/**
 * Created by Matti on 12.10.2015.
 */

// operates on first 2 indices: u[] -> d[]
concentricSampleDisk = function (u, d) {

    var r, theta;

    // Map uniform random numbers to $[-1,1]^2$
    var sx = 2 * u[0] - 1;
    var sy = 2 * u[1] - 1;
    // Map square to $(r,\theta)$
    // Handle degeneracy at the origin
    if (sx === 0 && sy === 0) {
        d[0] = 0;
        d[1] = 0;
        return;
    }
    if (sx >= -sy) {
        if (sx > sy) {
            // Handle first region of disk
            r = sx;
            if (sy > 0) {
                theta = sy / r;
            } else {
                theta = 8 + sy / r;
            }
        } else {
            // Handle second region of disk
            r = sy;
            theta = 2 - sx / r;
        }
    } else {
        if (sx <= sy) {
            // Handle third region of disk
            r = -sx;
            theta = 4 - sy / r;
        } else {
            // Handle fourth region of disk
            r = -sy;
            theta = 6 + sx / r;
        }
    }
    theta *= Math.PI / 4;
    d[0] = r * cosf(theta);
    d[1] = r * sinf(theta);
}
