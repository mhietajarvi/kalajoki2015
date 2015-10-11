/**
 * Created by Matti on 23.9.2015.
 */
"use strict";

function Ray(origin, direction, mint, maxt, time, depth) {
    this.o = origin;
    this.d = direction;
    this.mint = mint;
    this.maxt = maxt;
    this.time = time;
    this.depth = depth;
}
