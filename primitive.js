
GeometricPrimitive.nextPrimitiveId = 0;


function GeometricPrimitive(shape, material) {

    this.shape = shape;
    this.material = material;

    this.primitiveId = GeometricPrimitive.nextPrimitiveId++;
    // TODO: support for area lights
    //this.areaLight = ?
}

GeometricPrimitive.prototype = {

    // return true and fill in intersection if intersection found
    intersect: function(ray, isect) {

        // { (float) tHit, (float) rayEpsilon, (DiffGeom) dg }
        var hit = this.shape.intersect(ray);
        if (!hit) {
            return false;
        }
        isect.dg = hit.dg;
        isect.primitive = this;
        isect.worldToObject = this.shape.worldToObject;
        isect.objectToWorld = this.shape.objectToWorld;
        isect.shapeId = this.shape.shapeId;
        isect.primitiveId = this.primitiveId;
        isect.rayEpsilon = hit.rayEpsilon;
        ray.maxt = hit.tHit;
        return true;
    },
    //canIntersect :function(){
    //    return this.shape.canIntersect();
    //
    //},
    worldBound:function() {
        return this.shape.worldBound();
    },

    // virtual bool IntersectP(const Ray &r) const;

    getBSDF : function(dg, objectToWorld) {

        //shape->GetShadingGeometry(ObjectToWorld, dg, &dgs);
        // TODO: get shading geometry from shape
        var dgs = dg;
        return this.material.getBSDF(dg, dgs);
    }
    //BSSRDF *GetBSSRDF(const DifferentialGeometry &dg,  const Transform &ObjectToWorld, MemoryArena &arena) const;

    //private:
    //// GeometricPrimitive Private Data
    //AreaLight *areaLight;
}
