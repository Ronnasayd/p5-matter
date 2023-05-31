import { Delaunay } from "d3-delaunay";
import p5 from "p5";
import { landmarks2Points } from "../common";
import { FaceLandmarkDetection } from "../common/MediaPipeCommon";
/**
 * @typedef {import('opencv-ts').default} opencv
 */
/**
 * @param {p5} p5
 */
const script = function (p5) {
  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 600;

  let videoCapture, canvas, landmarks, points;

  p5.setup = async () => {
    p5.frameRate(12);
    canvas = p5.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    videoCapture = p5.createCapture(p5.VIDEO, async () => {
      await FaceLandmarkDetection.init("VIDEO");
    });
    videoCapture.hide();
  };
  p5.draw = async () => {
    p5.background(250);
    // p5.image(videoCapture, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    landmarks = FaceLandmarkDetection.detectForVideo(videoCapture.elt)
      ?.faceLandmarks?.[0];
    p5.noFill();
    p5.stroke("#00aaff");
    if (!!landmarks) {
      points = Delaunay.from(
        landmarks2Points(landmarks, CANVAS_WIDTH, CANVAS_HEIGHT)
      ).trianglePolygons();
      for (const point of points) {
        p5.triangle(
          point[0][0],
          point[0][1],
          point[1][0],
          point[1][1],
          point[2][0],
          point[2][1]
        );
      }
    }
  };
};
new p5(script);
