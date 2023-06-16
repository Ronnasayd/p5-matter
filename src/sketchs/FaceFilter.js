//@ts-check
/// <reference path="../../types/p5.d.ts" />

import p5 from "p5";
import { MapPoints, WithOpenCV, factoryProxy, getPointsBySVG } from "../common";
import { FaceLandmarkDetection } from "../common/MediaPipeCommon";
import "../common/p5.ext";
/**
 * @typedef {import('opencv-ts').default} opencv
 */

const v = factoryProxy({
  width: 500,
  height: 600,
  fps: 60,
  imgRef: new p5.Element("img"),
  imgFilter: new p5.Element("img"),
  canvas: new p5.Element("canvas"),
  glassPointsRef: {},
  facePointsRef: {},
  refIndexes: [162, 389, 454, 234],
  delaunay: {},
  /** @type {MapPoints|null}*/ mapPointsFilter: null,
  /** @type {MapPoints|null} */ mapPointsFace: null,
  /** @type {?opencv['Mat']}*/ srcImgCV: null,
  /** @type {?opencv['Mat']}*/ filterImgCV: null,
});

/**
 * @param {p5} p5
 */
const script = function (p5) {
  p5.setup = async () => {
    p5.background(0);
    await FaceLandmarkDetection.init("IMAGE");

    WithOpenCV.setup(async (cv) => {
      v.glassPointsRef = await getPointsBySVG("/filters/oculos_ref.svg");
      v.mapPointsFilter = new MapPoints().build(v.glassPointsRef);
      v.imgRef = await p5.createImgPromise(
        "https://img.freepik.com/premium-photo/beautiful-face-young-adult-woman-with-clean-fresh-skin_78203-1897.jpg",
        "img",
        "anonymous"
      );
      v.srcImgCV = cv.imread(v.imgRef.elt);
      (v.width = v.imgRef.width), (v.height = v.imgRef.height);
      v.canvas = p5.createCanvas(v.width, v.height);

      // @ts-ignore
      v.facePointsRef = (
        await FaceLandmarkDetection.detectForImage(v.imgRef.elt)
      )?.faceLandmarks[0].reduce((prev, next, index) => {
        prev[index] = [next.x * v.imgRef.width, next.y * v.imgRef.height];
        return prev;
      }, {});
      v.mapPointsFace = new MapPoints().build(v.facePointsRef);

      v.imgFilter = await p5.createImgPromise(
        "/filters/oculos.png",
        "filter",
        "anonymous"
      );
      v.filterImgCV = cv.imread(v.imgFilter.elt);

      cv.cvtColor(v.filterImgCV, v.filterImgCV, cv.COLOR_RGB2RGBA);
      cv.cvtColor(v.srcImgCV, v.srcImgCV, cv.COLOR_RGB2RGBA);

      v.imgRef.hide();
      v.imgFilter.hide();

      const p1 = cv.matFromArray(
        4,
        1,
        cv.CV_32FC2,
        v.refIndexes
          .map((index) => v.mapPointsFace?.getPointByIndex(index))
          .flat()
      );
      const p2 = cv.matFromArray(
        4,
        1,
        cv.CV_32FC2,
        [
          [0, 0],
          [v.filterImgCV.cols - 1, 0],
          [v.filterImgCV.cols - 1, v.filterImgCV.rows - 1],
          [0, v.filterImgCV.rows - 1],
        ].flat()
      );

      const r1 = cv.boundingRect(p1);
      const rect1 = new cv.Rect(r1.x, r1.y, r1.width, r1.height);
      const roi1 = v.srcImgCV.roi(rect1);
      const trans = cv.getPerspectiveTransform(p2, p1, cv.DECOMP_LU);
      const dst = new cv.Mat();

      cv.warpPerspective(v.filterImgCV, dst, trans, v.srcImgCV.size());

      const mask = new cv.Mat.zeros(v.srcImgCV.size(), cv.CV_8UC1);
      const t2RectInt = cv.matFromArray(4, 1, cv.CV_32SC2, [...p1.data32F]);
      // @ts-ignore
      cv.fillConvexPoly(mask, t2RectInt, new cv.Scalar(255));
      const dst2 = new cv.Mat();
      const dst3 = new cv.Mat();
      const dst4 = new cv.Mat();

      const inverseMask = new cv.Mat();
      cv.bitwise_not(mask, inverseMask);
      cv.bitwise_or(dst, dst, dst2, mask);
      cv.bitwise_and(v.srcImgCV, v.srcImgCV, dst3, inverseMask);
      cv.bitwise_or(dst3, dst2, dst4);

      cv.imshow(v.canvas.elt, dst4);
    });
  };
  p5.draw = () => {
    WithOpenCV.run((cv) => {});
  };
};
new p5(script);
