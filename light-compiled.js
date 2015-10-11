/**
 * Created by Matti on 23.9.2015.
 */
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Light = (function () {
    function Light() {
        _classCallCheck(this, Light);
    }

    _createClass(Light, [{
        key: "intersect",

        // return true and fill in intersection if intersection found
        value: function intersect(ray, intersection) {}
    }]);

    return Light;
})();

//# sourceMappingURL=light-compiled.js.map