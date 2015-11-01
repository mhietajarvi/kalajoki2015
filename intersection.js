/**
 * Created by Matti on 30.10.2015.
 */


function Intersection() {
    this.dg = null; // new DiffGeom();
    this.primitive = null;
    this.shapeId = 0;
    this.primitiveId = 0;
    this.rayEpsilon = 0;
    // create already here? or at first use?
    this.worldToObject = null; // new Transform();
    this.objectToWorld = null; // new Transform();
    // Intersection Public Data
    //DifferentialGeometry dg;
    //const Primitive *primitive;
    //Transform WorldToObject, ObjectToWorld;
    //uint32_t shapeId, primitiveId;
    //float rayEpsilon;
}


Intersection.prototype = {

    //BSDF *getBSDF(const RayDifferential &ray, MemoryArena &arena) const;

    getBSDF :function(ray) {
        this.dg.computeDifferentials(ray);
        var bsdf = this.primitive.getBSDF(this.dg, this.objectToWorld);
        return bsdf;

    },
    // BSSRDF *GetBSSRDF(const RayDifferential &ray, MemoryArena &arena) const;

    getBSSRDF : function(ray, arena) {

    },
    // Spectrum Le(const Vector &wo) const;
    le : function(wo) {

    }

};
