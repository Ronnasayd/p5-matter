import p5 from "p5";
import { factoryProxy } from "../common";
import { FaceLandmarkDetection } from "../common/MediaPipeCommon";

const v = factoryProxy({
  CANVAS_HEIGHT: 600,
  CANVAS_WIDTH: 600,
  fps: 12,
  videoCapture: null,
  landmarks: null,
});

/**
 * @typedef {import('opencv-ts').default} opencv
 */
/**
 * @param {p5} p5
 */
const script = function (p5) {
  p5.setup = async () => {
    p5.frameRate(v.fps);
    v.videoCapture = p5.createCapture(p5.VIDEO, async (stream) => {
      await FaceLandmarkDetection.init("VIDEO");
      v.CANVAS_WIDTH = v.videoCapture.width;
      v.CANVAS_HEIGHT = v.videoCapture.height;
      v.canvas = p5.createCanvas(v.videoCapture.width, v.videoCapture.height);
      v.canvas.addClass("absolute z-[1]");
    });
    v.videoCapture.addClass("absolute");
    v.videoCapture.hide();
  };
  p5.draw = async () => {
    p5.clear();
    p5.background(200, 0);
    v.landmarks = FaceLandmarkDetection.detectForVideo(
      v.videoCapture.elt
    )?.faceLandmarks?.[0];

    p5.fill("#00ff99");
    if (v.landmarks) {
      for (const landmark of v.landmarks) {
        p5.circle(landmark.x * v.CANVAS_WIDTH, landmark.y * v.CANVAS_HEIGHT, 1);
      }
    }
  };
};
new p5(script);
