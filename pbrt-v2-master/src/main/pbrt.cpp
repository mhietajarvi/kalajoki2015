
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
#include <samplers\random.h>
#include <samplers\bestcandidate.h>
#include <samplers\halton.h>
#include <samplers\stratified.h>
#include <cameras\perspective.h>
#include <film/image.h>
#include <filters\box.h>
#include <filters\gaussian.h>
#include <transform.h>
#include <lights\point.h>
#include <materials\glass.h>
#include <materials\matte.h>
#include <materials\shinymetal.h>
#include <materials\mirror.h>
#include <shapes\sphere.h>
#include <accelerators\bvh.h>
#include <integrators\directlighting.h>
#include <integrators\whitted.h>
#include <integrators\path.h>
#include <integrators\single.h>
#include <textures\constant.h>

using std::map;
using std::string;
using std::vector;

void print(const char *name, const Vector &v) {
	printf("%s %g %g %g\n", name, v.x, v.y, v.z);
}
void print(const char *name, const Normal &v) {
	printf("%s %g %g %g\n", name, v.x, v.y, v.z);
}
void print(const char *name, const Point &v) {
	printf("%s %g %g %g\n", name, v.x, v.y, v.z);
}

void print(const DifferentialGeometry &dg) {

	printf("dudx %g\n", dg.dudx);
	printf("dvdx %g\n", dg.dvdx);
	printf("dudy %g\n", dg.dudy);
	printf("dvdy %g\n", dg.dvdy);
	printf("u %g\n", dg.u);
	printf("v %g\n", dg.v);
	print("dpdx", dg.dpdx);
	print("dpdy", dg.dpdy);
	print("dpdu", dg.dpdu);
	print("dpdv", dg.dpdv);
	print("dndu", dg.dndu);
	print("dndv", dg.dndv);
	print("p", dg.p);
	print("nn", dg.nn);
}

int testSimpleScene() {

	ParamSet params;

	int xres = 500;
	int yres = 500;
	params.AddInt("xresolution", &xres, 1);
	params.AddInt("yresolution", &yres, 1);

	Transform t = LookAt(Point(0,0,0), Point(0,0,-100), Vector(0,1,0));

	AnimatedTransform cam2world(&t, 0, &t, 0);

	params.AddString("filename", new string("render.png"), 1);
	//BoxFilter *filter = CreateBoxFilter(params);
	GaussianFilter *filter = new GaussianFilter(3, 3, 0.001f);


	ImageFilm *film = CreateImageFilm(params, filter);
	PerspectiveCamera *camera = CreatePerspectiveCamera(params, cam2world, film);

	//AdaptiveSampler *sampler = CreateAdaptiveSampler(params, film, camera);
	//Sampler *sampler = CreateRandomSampler(params, film, camera);
	//Sampler *sampler = CreateBestCandidateSampler(params, film, camera);
	//Sampler *sampler = CreateHaltonSampler(params, film, camera);
	//StratifiedSampler *sampler = CreateStratifiedSampler(params, film, camera);

    bool jitter = false;
    int xstart, xend, ystart, yend;
    film->GetSampleExtent(&xstart, &xend, &ystart, &yend);
    int xsamp = 1;
    int ysamp = 1;
    StratifiedSampler *sampler = new StratifiedSampler(
		xstart, xend, ystart, yend,
		xsamp, ysamp,
        jitter, camera->shutterOpen, camera->shutterClose);

	//PathIntegrator *surfaceIg = CreatePathSurfaceIntegrator(params);
	//DirectLightingIntegrator *surfaceIg = CreateDirectLightingIntegrator(params);
	WhittedIntegrator *surfaceIg = CreateWhittedSurfaceIntegrator(params);

	SingleScatteringIntegrator *volumeIg = CreateSingleScatteringIntegrator(params);

    SamplerRenderer renderer(sampler, camera, surfaceIg, volumeIg, false);

	VolumeRegion *volumeRegion = NULL;

	vector<Light*> lights;

	float il1[] = {1.f,1.f,1.f};
	float il2[] = {2.f,0.5f,0.3f};
	float il3[] = {0.f,0.2f,1.3f};

	lights.push_back(new PointLight(Translate(Vector(2,2,0)), RGBSpectrum::FromRGB(il1)));
	lights.push_back(new PointLight(Translate(Vector(-2,-2,-2)), RGBSpectrum::FromRGB(il2)));
	lights.push_back(new PointLight(Translate(Vector(-2, 2,-2)), RGBSpectrum::FromRGB(il3)));
	//(MCreatePointLight(Translate(Vector(2,2,0)), params));
	//lights.push_back(CreatePointLight(Translate(Vector(0,4,0)), params));

	Transform obj2world = Translate(Vector(0,0,-2));
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

	//float c1[] = {0.f,10.99f,0.f};
	float c1[] = {5.f,5.f,5.f};
	Spectrum spec1 = RGBSpectrum::FromRGB(c1, SpectrumType::SPECTRUM_REFLECTANCE);

	MatteMaterial *matte = new MatteMaterial(
		new ConstantTexture<Spectrum>(spec1),
		new ConstantTexture<float>(0.0f), NULL);
		
  //  Reference<Texture<Spectrum> > Kd = mp.GetSpectrumTexture("Kd", Spectrum(0.5f));
  //  Reference<Texture<float> > sigma = mp.GetFloatTexture("sigma", 0.f);
  //  Reference<Texture<float> > bumpMap = mp.GetFloatTextureOrNull("bumpmap");
  //  return ;		
		//CreateMatteMaterial(Transform(), tparams);

    Reference<Primitive> prim1 = new GeometricPrimitive(sphere1, matte, NULL);
    //Reference<Primitive> prim2 = new GeometricPrimitive(sphere2, metal, NULL);

	vector<Reference<Primitive> > prims;
	prims.push_back(prim1);
	//prims.push_back(prim2);
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

void testDiffGeom() {

	printf("\n### testDiffGeom:\n");

	DifferentialGeometry dg(Point(1,1,1),Vector(0,1,0), Vector(0,1,1),
		Normal(1,1,-1), Normal(1,3,-1), 2, 2, NULL);

	RayDifferential ray(Point(0,0,0), Vector(3,4,5), 0);
	ray.hasDifferentials = true;
	ray.rxOrigin = ray.o + Point(0.1, 0.1, 0.1);
	ray.rxDirection = ray.d + Vector(0.12, 0.12, 0.12);
	ray.ryOrigin = ray.o + Point(-0.1, 0.1, 0.01);
	ray.ryDirection = ray.d + Vector(-0.12, 0.12, 0.02);

	dg.ComputeDifferentials(ray);
	print(dg);
}


void testSphere(DifferentialGeometry *dg) {

	printf("\n### testSphere:\n");

	Transform o2w = Translate(Vector(0.7,0.7,0.17));
	Transform w2o = Inverse(o2w);

	Sphere sp(&o2w, &w2o, false, 3.3, -2, 1, 270);

	//DifferentialGeometry dg;

	Ray ray(Point(-10,0,0), Vector(1,0.1,0.1), 0, 100);
	float tHit;
	float rayEpsilon;
	bool isect = sp.Intersect(ray, &tHit, &rayEpsilon, dg);

	printf("isect %i\n", (int)isect);
	printf("tHit %g\n", tHit);
	printf("rayEpsilon %g\n", rayEpsilon);
	print(*dg);
}

void testMaterial(DifferentialGeometry &dg) {

	float c1[] = {1.f,1.f,1.f};
	Spectrum spec1 = RGBSpectrum::FromRGB(c1, SpectrumType::SPECTRUM_REFLECTANCE);

	MatteMaterial *matte = new MatteMaterial(
		new ConstantTexture<Spectrum>(spec1),
		new ConstantTexture<float>(0.0f), NULL);

	MemoryArena m;

	BSDF* bsdf = matte->GetBSDF(dg, dg, m);

	Vector woW = Point(-10,0,0) - dg.p;
	Vector wiW = Point(-7,2,2) - dg.p;
	// world vectors

	Spectrum spec = bsdf->f(woW, wiW);
	float rgb[3];
	spec.ToRGB(rgb);

	printf("spectrum %g %g %g\n", rgb[0], rgb[1], rgb[2]);

}

void testCamera() {

	ParamSet params;

	GaussianFilter *filter = new GaussianFilter(2, 2, 2);
	float crop[4] = { 0, 1, 0, 1 };
    ImageFilm* film = new ImageFilm(100, 100, filter, crop, "filename", false);

	Transform t = LookAt(Point(0,0,0), Point(0,0,-100), Vector(0,1,0));
	AnimatedTransform cam2world(&t, 0, &t, 0);

	//BoxFilter *filter = CreateBoxFilter(params);
	//ImageFilm *film = CreateImageFilm(params, filter);
	PerspectiveCamera *camera = CreatePerspectiveCamera(params, cam2world, film);

    bool jitter = false; //params.FindOneBool("jitter", true);
    // Initialize common sampler parameters
    int xstart, xend, ystart, yend;
    film->GetSampleExtent(&xstart, &xend, &ystart, &yend);
    int xsamp = 1;
    int ysamp = 1;
    StratifiedSampler *sampler = new StratifiedSampler(
		xstart, xend, ystart, yend,
		xsamp, ysamp,
        jitter, camera->shutterOpen, camera->shutterClose);

	RNG rng;
	Sample sample(sampler, NULL, NULL, NULL);

	int count = 0;
	while (sampler->GetMoreSamples(&sample, rng) && count < 10) {

		//sample.imageX
		printf("sample imageX: %g, imageY: %g\n", sample.imageX, sample.imageY);

		Ray ray;
		camera->GenerateRay(sample, &ray);

		print("ray.o", ray.o);
		print("ray.d", ray.d);
		printf("ray mint: %g, maxt: %g", ray.mint, ray.maxt);

		count++;
	}

	//CameraSample sample;

	//camera->GenerateRay(
}

int main(int argc, char *argv[]) {

	//return testSimpleScene();

	//testCamera();
	testSimpleScene();
	//DifferentialGeometry dg;
	//testSphere(&dg);
	//testMaterial(dg);
	//testDiffGeom();

	return 0;
}