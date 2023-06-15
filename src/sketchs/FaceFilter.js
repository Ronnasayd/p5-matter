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
  delaunay: {},
  /**
   * @type {MapPoints}
   */
  // @ts-ignore
  mapPointsFilter: {},
  /**
   * @type {MapPoints}
   */
  // @ts-ignore
  mapPointsFace: {},
  /**
   * @type {opencv['Mat']}
   */
  // @ts-ignore
  srcImgCV: {},
  /**
   * @type {opencv['Mat']}
   */
  // @ts-ignore
  filterImgCV: {},
});

/**
 * @param {p5} p5
 */
const script = function (p5) {
  p5.setup = async () => {
    v.canvas = p5.createCanvas(v.width, v.height);
    await FaceLandmarkDetection.init("IMAGE");

    WithOpenCV.setup(async (cv) => {
      v.glassPointsRef = await getPointsBySVG("/filters/oculos_ref.svg");
      v.mapPointsFilter = new MapPoints().build(v.glassPointsRef);
      v.imgRef = await p5.createImgPromise(
        "https://i0.wp.com/news.biharprabha.com/wp-content/uploads/2012/04/smiling_girl.jpg?ssl=1",
        "img",
        "anonymous"
      );
      v.srcImgCV = cv.imread(v.imgRef.elt);
      v.imgRef.addClass("h-[500px] w-[500px]");

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
      for (const triangle of v.mapPointsFilter.getTriangles()) {
        const [p1x1, p1y1, p1x2, p1y2, p1x3, p1y3] = triangle;
        const indexes = v.mapPointsFilter.getIndexesByTriangle(triangle);
        const [p2x1, p2y1, p2x2, p2y2, p2x3, p2y3] =
          v.mapPointsFace.getTriangleByIndexes(indexes);
        const t1 = cv.matFromArray(3, 1, cv.CV_32FC2, [
          p1x1,
          p1y1,
          p1x2,
          p1y2,
          p1x3,
          p1y3,
        ]);

        const t2 = cv.matFromArray(3, 1, cv.CV_32FC2, [
          p2x1,
          p2y1,
          p2x2,
          p2y2,
          p2x3,
          p2y3,
        ]);

        const r1 = cv.boundingRect(t1);
        const r2 = cv.boundingRect(t2);

        const mask = new cv.Mat.zeros(
          new cv.Size(r2.width, r2.height),
          cv.CV_8UC1
        );

        const t1Rect = cv.matFromArray(3, 1, cv.CV_32FC2, [
          p1x1 - r1.x,
          p1y1 - r1.y,
          p1x2 - r1.x,
          p1y2 - r1.y,
          p1x3 - r1.x,
          p1y3 - r1.y,
        ]);
        const t2Rect = cv.matFromArray(3, 1, cv.CV_32FC2, [
          p2x1 - r2.x,
          p2y1 - r2.y,
          p2x2 - r2.x,
          p2y2 - r2.y,
          p2x3 - r2.x,
          p2y3 - r2.y,
        ]);

        const t2RectInt = cv.matFromArray(3, 1, cv.CV_32SC2, [
          p2x1 - r2.x,
          p2y1 - r2.y,
          p2x2 - r2.x,
          p2y2 - r2.y,
          p2x3 - r2.x,
          p2y3 - r2.y,
        ]);

        // @ts-ignore
        cv.fillConvexPoly(mask, t2RectInt, new cv.Scalar(255), cv.LINE_8, 0);
        const inverseMask = new cv.Mat();
        cv.bitwise_not(mask, inverseMask);

        const rect1 = new cv.Rect(r1.x, r1.y, r1.width, r1.height);
        const rect2 = new cv.Rect(r2.x, r2.y, r2.width, r2.height);

        const roi1 = v.filterImgCV.roi(rect1);
        const roi2 = v.srcImgCV.roi(rect2);

        const size = new cv.Size(r2.width, r2.height);

        const transform = cv.getAffineTransform(t1Rect, t2Rect);

        const dst = new cv.Mat();

        cv.warpAffine(
          roi1,
          dst,
          transform,
          size,
          cv.INTER_LINEAR,
          cv.BORDER_REFLECT_101
        );
        const dst2 = new cv.Mat();
        const dst3 = new cv.Mat();
        const dst4 = new cv.Mat();

        cv.bitwise_and(dst, dst, dst2, mask);
        cv.bitwise_and(roi2, roi2, dst3, inverseMask);

        cv.bitwise_or(dst2, dst3, dst4);

        dst4.copyTo(roi2);
      }
      cv.imshow(v.canvas.elt, v.srcImgCV);
    });
    // p5.noLoop();
  };
  p5.draw = () => {
    WithOpenCV.run((cv) => {});
  };
};
new p5(script);
