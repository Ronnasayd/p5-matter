import { Delaunay } from "d3-delaunay";
import p5 from "p5";
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

  let videoCapture, capture, src, canvas, landmarks, gpu, points;

  function landmarks2Points(landmarks) {
    const points = [];
    for (let index = 0; index < landmarks.length; index++) {
      const element = landmarks[index];
      points.push([element.x * CANVAS_WIDTH, element.y * CANVAS_HEIGHT]);
    }
    return points;
  }

  p5.setup = async () => {
    p5.frameRate(12);
    canvas = p5.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    videoCapture = p5.createCapture(p5.VIDEO, async (stream) => {
      await FaceLandmarkDetection.init();
    });
    videoCapture.hide();
  };
  p5.draw = async () => {
    p5.background(200);
    // p5.image(videoCapture, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    landmarks = FaceLandmarkDetection.detect(videoCapture.elt)
      ?.faceLandmarks?.[0];

    p5.noFill();
    p5.stroke("#ff0000");
    if (!!landmarks) {
      points = Delaunay.from(landmarks2Points(landmarks)).trianglePolygons();
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
