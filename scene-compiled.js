/**
 * Created by Matti on 23.9.2015.
 */
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Scene = (function () {
    function Scene(aggregate, lights, volume_region) {
        _classCallCheck(this, Scene);

        this.aggregate = aggregate;
        this.lights = lights;
        this.volume_region = volume_region;

        this.bound = aggregate.worldBound();
        if (volumeRegion) {
            this.bound = union(bound, volumeRegion.worldBound());
        }
    }

    _createClass(Scene, [{
        key: "worldBound",
        value: function worldBound() {
            return this.bound;
        }

        // return true and fill in intersection if intersection found
    }, {
        key: "intersect",
        value: function intersect(ray, intersection) {

            return aggregate.intersect(ray, intersection);
            //_aggregate
            // bool hit = aggregate->Intersect(ray, isect);
            // return hit;
        }
    }, {
        key: "intersect",
        value: function intersect(ray) {
            return aggregate.intersect(ray);
        }

        //private var sdf;

    }]);

    return Scene;
})();

//# sourceMappingURL=scene-compiled.js.map