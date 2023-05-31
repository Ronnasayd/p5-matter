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

  let videoCapture, capture, src, canvas, landmarks;

  p5.setup = async () => {
    p5.frameRate(12);
    canvas = p5.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    videoCapture = p5.createCapture(p5.VIDEO, async (stream) => {
      await FaceLandmarkDetection.init("VIDEO");
    });
    videoCapture.hide();
  };
  p5.draw = async () => {
    p5.background(200);
    // p5.image(videoCapture, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    landmarks = FaceLandmarkDetection.detectForVideo(videoCapture.elt);

    p5.fill("#00ff99");
    if (landmarks?.faceLandmarks) {
      for (const landmark of landmarks?.faceLandmarks[0]) {
        p5.circle(landmark.x * CANVAS_WIDTH, landmark.y * CANVAS_HEIGHT, 4, 4);
      }
    }
  };
};
new p5(script);
