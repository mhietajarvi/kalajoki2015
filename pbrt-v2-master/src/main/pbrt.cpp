
/*
    pbrt source code Copyright(c) 1998-2012 Matt Pharr and Greg Humphreys.

    This file is part of pbrt.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are
    met:

    - Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.

    - Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
    IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
    TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
    PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
    HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
    SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
    LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
    DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
    THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
    OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

 */


// main/pbrt.cpp*
#include "stdafx.h"
#include "api.h"
#include "probes.h"
#include "parser.h"
#include "parallel.h"

/*
// main program
int main(int argc, char *argv[]) {
    Options options;
    vector<string> filenames;
    // Process command-line arguments
    for (int i = 1; i < argc; ++i) {
        if (!strcmp(argv[i], "--ncores")) options.nCores = atoi(argv[++i]);
        else if (!strcmp(argv[i], "--outfile")) options.imageFile = argv[++i];
        else if (!strcmp(argv[i], "--quick")) options.quickRender = true;
        else if (!strcmp(argv[i], "--quiet")) options.quiet = true;
        else if (!strcmp(argv[i], "--verbose")) options.verbose = true;
        else if (!strcmp(argv[i], "--help") || !strcmp(argv[i], "-h")) {
            printf("usage: pbrt [--ncores n] [--outfile filename] [--quick] [--quiet] "
                   "[--verbose] [--help] <filename.pbrt> ...\n");
            return 0;
        }
        else filenames.push_back(argv[i]);
    }

    // Print welcome banner
    if (!options.quiet) {
        printf("pbrt version %s of %s at %s [Detected %d core(s)]\n",
               PBRT_VERSION, __DATE__, __TIME__, NumSystemCores());
        printf("Copyright (c)1998-2014 Matt Pharr and Greg Humphreys.\n");
        printf("The source code to pbrt (but *not* the book contents) is covered by the BSD License.\n");
        printf("See the file LICENSE.txt for the conditions of the license.\n");
        fflush(stdout);
    }
    pbrtInit(options);
    // Process scene description
    PBRT_STARTED_PARSING();
    if (filenames.size() == 0) {
        // Parse scene from standard input
        ParseFile("-");
    } else {
        // Parse scene from input files
        for (u_int i = 0; i < filenames.size(); i++)
            if (!ParseFile(filenames[i]))
                Error("Couldn't open scene file \"%s\"", filenames[i].c_str());
    }
    pbrtCleanup();
    return 0;
}
*/

#include <renderers\samplerrenderer.h>
#include <samplers\adaptive.h>
#include <cameras\perspective.h>
#include <film/image.h>
#include <filters\box.h>
#include <transform.h>
#include <lights\point.h>
#include <materials\glass.h>
#include <materials\matte.h>
#include <materials\shinymetal.h>
#include <materials\mirror.h>
#include <shapes\sphere.h>
#include <accelerators\bvh.h>
#include <integrators\directlighting.h>
#include <integrators\path.h>
#include <integrators\single.h>
#include <textures\constant.h>

using std::map;
using std::string;
using std::vector;

int testSimpleScene() {

	ParamSet params;
	Transform t = LookAt(Point(0,0,0), Point(0,0,1), Vector(0,1,0));

	AnimatedTransform cam2world(&t, 0, &t, 0);

	params.AddString("filename", new string("render.png"), 1);
	BoxFilter *filter = CreateBoxFilter(params);
	ImageFilm *film = CreateImageFilm(params, filter);
	PerspectiveCamera *camera = CreatePerspectiveCamera(params, cam2world, film);
	AdaptiveSampler *sampler = CreateAdaptiveSampler(params, film, camera);

	//PathIntegrator *surfaceIg = CreatePathSurfaceIntegrator(params);
	DirectLightingIntegrator *surfaceIg = CreateDirectLightingIntegrator(params);
	SingleScatteringIntegrator *volumeIg = CreateSingleScatteringIntegrator(params);

    SamplerRenderer renderer(sampler, camera, surfaceIg, volumeIg, false);

	VolumeRegion *volumeRegion = NULL;

	vector<Light*> lights;
	lights.push_back(CreatePointLight(Translate(Vector(1,1,1)), params));
	lights.push_back(CreatePointLight(Translate(Vector(0,4,0)), params));


	Transform obj2world = Translate(Vector(-1,-1,3));
	Transform world2obj = Inverse(obj2world);
	Sphere *sphere1 = CreateSphereShape(&obj2world, &world2obj, false, params);

	Transform obj2world2 = Translate(Vector(0.7,0.7,2.6));
	Transform world2obj2 = Inverse(obj2world2);
	Sphere *sphere2 = CreateSphereShape(&obj2world2, &world2obj2, false, params);

    TextureParams tparams(params, params, map<string, Reference<Texture<float> > >(),
		map<string, Reference<Texture<Spectrum> > >());

	MirrorMaterial *mirror = new MirrorMaterial(new ConstantTexture<Spectrum>(Spectrum(0.9f)), NULL);

	ShinyMetalMaterial *metal = new ShinyMetalMaterial(
		new ConstantTexture<Spectrum>(Spectrum(1.f)),
		new ConstantTexture<float>(0.1f),
		new ConstantTexture<Spectrum>(Spectrum(1.f)),
		NULL); //CreateShinyMetalMaterial(Transform(), tparams);
	GlassMaterial *glass = CreateGlassMaterial(Transform(), tparams);

	float c1[] = {0.4f,0.8f,0.f};
	Spectrum spec1 = RGBSpectrum::FromRGB(c1);

	MatteMaterial *matte = new MatteMaterial(
		new ConstantTexture<Spectrum>(spec1),
		new ConstantTexture<float>(0.1f), NULL);
		
  //  Reference<Texture<Spectrum> > Kd = mp.GetSpectrumTexture("Kd", Spectrum(0.5f));
  //  Reference<Texture<float> > sigma = mp.GetFloatTexture("sigma", 0.f);
  //  Reference<Texture<float> > bumpMap = mp.GetFloatTextureOrNull("bumpmap");
  //  return ;		
		//CreateMatteMaterial(Transform(), tparams);

    Reference<Primitive> prim1 = new GeometricPrimitive(sphere1, metal, NULL);
    Reference<Primitive> prim2 = new GeometricPrimitive(sphere2, matte, NULL);

	vector<Reference<Primitive> > prims;
	prims.push_back(prim1);
	prims.push_back(prim2);
    Primitive *accel = CreateBVHAccelerator(prims, params);

    Scene *scene = new Scene(accel, lights, volumeRegion);

//    Scene(Primitive *accel, const vector<Light *> &lts, VolumeRegion *vr);

//TODO: 
//	create scene
//	step through to see that something happens
//	start building minimal viable js version
//	- unit test js functionality against similar c++ unit results


	renderer.Render(scene);
	film->WriteImage(1);

	return 0;
}

int testDiffGeom() {

	DifferentialGeometry dg(Point(1,1,1),Vector(0,1,0), Vector(0,1,1),
		Normal(1,1,-1), Normal(1,3,-1), 2, 2, NULL);

	RayDifferential ray(Point(0,0,0), Vector(3,4,5), 0);
	ray.hasDifferentials = true;
	ray.rxOrigin = ray.o + Point(0.1, 0.1, 0.1);
	ray.rxDirection = ray.d + Vector(0.12, 0.12, 0.12);
	ray.ryOrigin = ray.o + Point(-0.1, 0.1, 0.01);
	ray.ryDirection = ray.d + Vector(-0.12, 0.12, 0.02);

	dg.ComputeDifferentials(ray);

	printf("dudx %f\n", dg.dudx);
	printf("dvdx %f\n", dg.dvdx);
	printf("dudy %f\n", dg.dudy);
	printf("dvdy %f\n", dg.dvdy);
	printf("dpdx %f %f %f\n", dg.dpdx.x, dg.dpdx.y, dg.dpdx.z);
	printf("dpdy %f %f %f\n", dg.dpdy.x, dg.dpdy.y, dg.dpdy.z);

	return 0;
}

int main(int argc, char *argv[]) {

	//return testSimpleScene();

	return testDiffGeom();
}