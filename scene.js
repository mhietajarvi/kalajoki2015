/**
 * Created by Matti on 23.9.2015.
 */
"use strict";

class Scene {

    constructor(aggregate, lights, volume_region) {
        this.aggregate = aggregate;
        this.lights = lights;
        this.volume_region = volume_region;

        this.bound = aggregate.worldBound()
        if (volumeRegion) {
            this.bound = union(bound, volumeRegion.worldBound());
        }
    }

    worldBound() {
        return this.bound;
    }

    // return true and fill in intersection if intersection found
    intersect(ray, intersection) {

        return aggregate.intersect(ray, intersection);
        //_aggregate
        // bool hit = aggregate->Intersect(ray, isect);
        // return hit;
   }

    intersect(ray) {
        return aggregate.intersect(ray);
    }

    //private var sdf;

}