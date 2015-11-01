/**
 * Created by Matti on 23.9.2015.
 */

function Scene(aggregate, lights, volume_region) {

    this.aggregate = aggregate;
    this.lights = lights;
    // TODO: volume region not supported
    this.volume_region = volume_region;

    this.bound = this.aggregate.worldBound();

    //if (this.volume_region) {
    //    this.bound = union(this.bound, this.volume_region.worldBound());
    //}
}

Scene.prototype = {

    worldBound: function() {
        return this.bound;
    },

    // return true and fill in intersection if intersection found
    intersect: function(ray, isect) {

        return this.aggregate.intersect(ray, isect);
        //_aggregate
        // bool hit = aggregate->Intersect(ray, isect);
        // return hit;
   },

    intersectP: function(ray) {
        return this.aggregate.intersectP(ray);
    }

}