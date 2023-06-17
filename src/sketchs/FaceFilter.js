//@ts-check
/// <reference path="../../types/p5.d.ts" />

import p5 from "p5";
import {
  KEYPOINTS_68,
  MapPoints,
  WithOpenCV,
  factoryProxy,
  getPointsBySVG,
} from "../common";
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
  refIn: [23, 55, 34],
  delaunay: {},
  /** @type {?MapPoints}*/ mapPointsFilter: null,
  /** @type {?MapPoints} */ mapPointsFace: null,
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
        "https://img.freepik.com/premium-photo/beautiful-face-young-adult-woman-with-clean-fresh-skin_78203-1897.jpg"
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

      let eyes = v.mapPointsFace.getPointsByIndexes([
        ...KEYPOINTS_68.LeftEye,
        ...KEYPOINTS_68.RightEye,
      ]);
      let contour = v.mapPointsFace.getPointsByIndexes([
        ...KEYPOINTS_68.Contour,
      ]);

      let eyePoints = cv.matFromArray(eyes.length, 1, cv.CV_32SC2, eyes.flat());
      let contourPoints = cv.matFromArray(
        contour.length,
        1,
        cv.CV_32SC2,
        contour.flat()
      );
      let eyeRect = cv.minAreaRect(eyePoints);
      let contourRect = cv.minAreaRect(contourPoints);
      if (eyeRect.size.height > eyeRect.size.width) {
        let h = eyeRect.size.height;
        eyeRect.size.height = eyeRect.size.width;
        eyeRect.size.width = h;
        eyeRect.angle += 90;
      }
      eyeRect.size.width = contourRect.size.width;
      eyeRect.size.height =
        (contourRect.size.width * v.filterImgCV.rows) / v.filterImgCV.cols;

      let filterPoints = cv
        .rotatedRectPoints(eyeRect)
        .map((p) => [p.x, p.y])
        .sort((a, b) => a[0] - b[0] + a[1] - b[1]);

      let filterPointsMat = cv.matFromArray(
        filterPoints.length,
        1,
        cv.CV_32FC2,
        filterPoints.flat()
      );

      const p2 = cv.matFromArray(
        4,
        1,
        cv.CV_32FC2,
        [
          [0, 0],
          [0, v.filterImgCV.rows - 1],
          [v.filterImgCV.cols - 1, v.filterImgCV.rows - 1],
          [v.filterImgCV.cols - 1, 0],
        ]
          .sort((a, b) => a[0] - b[0] + a[1] - b[1])
          .flat()
      );

      const trans = cv.getPerspectiveTransform(
        p2,
        filterPointsMat,
        cv.DECOMP_LU
      );

      const dst = new cv.Mat();

      cv.warpPerspective(v.filterImgCV, dst, trans, v.srcImgCV.size());

      const channels = new cv.MatVector();
      cv.split(dst, channels);

      const mask = channels.get(3);

      const dst2 = new cv.Mat();
      const dst3 = new cv.Mat();
      const dst4 = new cv.Mat();

      const inverseMask = new cv.Mat();
      cv.bitwise_not(mask, inverseMask);
      cv.bitwise_or(dst, dst, dst2, mask);
      cv.bitwise_and(v.srcImgCV, v.srcImgCV, dst3, inverseMask);
      cv.bitwise_or(dst2, dst3, dst4);

      cv.imshow(v.canvas.elt, dst4);
    });
    p5.noLoop();
  };
  p5.draw = () => {
    WithOpenCV.run((cv) => {});
  };
};
new p5(script);
