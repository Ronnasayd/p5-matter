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

/**  @typedef {import('opencv-ts').default} opencv */
const v = factoryProxy(
  {
    width: 450,
    height: 450,
    fps: 60,
    refIndexes: [162, 389, 454, 234],
    glassPointsRef: [],
    /**@type {?MapPoints}*/ mapPointsFilter: null,
    /**@type {?MapPoints}*/ mapPointsFace: null,
    /** @type {?opencv['Mat']} */ src: null,
    /** @type {?opencv['Mat']} */ filter: null,
    /** @type {?opencv['VideoCapture']} */ capture: null,
    canvas: new p5.Element("canvas"),
    videoCapture: new p5.Element("video"),
    imgFilter: new p5.Element("img"),
    facePointsRef: {},
  },
  []
);

/**  @param {p5} p5 */
const script = function (p5) {
  let p1, p2, r1, rect1, trans, dst;
  let channels, mask, dst2, dst3, dst4, inverseMask;
  let eyes, contour, filterPoints, h;
  let eyePoints, contourPoints, eyeRect, contourRect;

  p5.setup = async () => {
    p5.frameRate(v.fps);
    await FaceLandmarkDetection.init("VIDEO");
    v.glassPointsRef = await getPointsBySVG("/filters/oculos_ref.svg");
    v.mapPointsFilter = new MapPoints().build(v.glassPointsRef);

    v.canvas = p5.createCanvas(v.width, v.height);
    v.videoCapture = p5.createCapture(p5.VIDEO);

    WithOpenCV.setup(async (cv) => {
      v.imgFilter = await p5.createImgPromise(
        "/filters/oculos.png",
        "filter",
        "anonymous"
      );
      v.imgFilter.hide();
      v.filter = cv.imread(v.imgFilter.elt);

      v.videoCapture.size(v.width, v.height);
      v.videoCapture.hide();
      v.capture = new cv.VideoCapture(v.videoCapture.elt);
      v.src = new cv.Mat(
        v.videoCapture.width,
        v.videoCapture.height,
        cv.CV_8UC4
      );
    });
  };
  p5.draw = () => {
    // @ts-ignore
    p5.clear();
    WithOpenCV.run(async (cv) => {
      if (v.src && v.filter) {
        v?.capture?.read(v.src);
        //@ts-ignore
        v.facePointsRef = (
          await FaceLandmarkDetection.detectForVideo(v.videoCapture.elt)
        )?.faceLandmarks?.[0]?.reduce((prev, next, index) => {
          prev[index] = [
            next.x * v.videoCapture.width,
            next.y * v.videoCapture.height,
          ];
          return prev;
        }, {});

        if (v.facePointsRef) {
          channels = new cv.MatVector();
          dst2 = new cv.Mat();
          dst3 = new cv.Mat();
          dst4 = new cv.Mat();

          inverseMask = new cv.Mat();
          v.mapPointsFace = new MapPoints().build(v.facePointsRef);
          eyes = v.mapPointsFace.getPointsByIndexes([
            ...KEYPOINTS_68.LeftEye,
            ...KEYPOINTS_68.RightEye,
          ]);
          contour = v.mapPointsFace.getPointsByIndexes([
            ...KEYPOINTS_68.Contour,
          ]);

          eyePoints = cv.matFromArray(eyes.length, 1, cv.CV_32SC2, eyes.flat());
          contourPoints = cv.matFromArray(
            contour.length,
            1,
            cv.CV_32SC2,
            contour.flat()
          );
          eyeRect = cv.minAreaRect(eyePoints);
          contourRect = cv.minAreaRect(contourPoints);
          if (eyeRect.size.height > eyeRect.size.width) {
            h = eyeRect.size.height;
            eyeRect.size.height = eyeRect.size.width;
            eyeRect.size.width = h;
            eyeRect.angle += 90;
          }
          eyeRect.size.width = contourRect.size.width;
          eyeRect.size.height =
            (contourRect.size.width * v.filter.rows) / v.filter.cols;

          filterPoints = cv
            .rotatedRectPoints(eyeRect)
            .map((p) => [p.x, p.y])
            .sort((a, b) => a[0] - b[0] + (a[1] - b[1]));

          p1 = cv.matFromArray(
            filterPoints.length,
            1,
            cv.CV_32FC2,
            filterPoints.flat()
          );

          p2 = cv.matFromArray(
            4,
            1,
            cv.CV_32FC2,
            [
              [0, 0],
              [v.filter.cols - 1, 0],
              [v.filter.cols - 1, v.filter.rows - 1],
              [0, v.filter.rows - 1],
            ]
              .sort((a, b) => a[0] - b[0] + (a[1] - b[1]))
              .flat()
          );

          r1 = cv.boundingRect(p1);
          rect1 = new cv.Rect(r1.x, r1.y, r1.width, r1.height);
          trans = cv.getPerspectiveTransform(p2, p1, cv.DECOMP_LU);
          dst = new cv.Mat();

          cv.warpPerspective(v.filter, dst, trans, v.src.size());

          cv.split(dst, channels);

          mask = channels.get(3);

          cv.bitwise_not(mask, inverseMask);
          cv.bitwise_or(dst, dst, dst2, mask);
          cv.bitwise_and(v.src, v.src, dst3, inverseMask);
          cv.bitwise_or(dst2, dst3, dst4);

          cv.imshow(v.canvas.elt, dst4);

          mask.delete();
          inverseMask.delete();
          channels.delete();
          dst.delete();
          dst2.delete();
          dst3.delete();
          dst4.delete();
          eyePoints.delete();
          contourPoints.delete();
        }
      }
    });
  };
};
new p5(script);
