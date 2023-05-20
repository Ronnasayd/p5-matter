import p5 from "p5";
import { WithOpenCV } from "../common";

/**
 * @typedef {import('opencv-ts').default} opencv
 */
/**
 * @param {p5} p5
 */
const script = function (p5) {
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 400;

  let videoCapture, capture, src, canvas;

  p5.setup = () => {
    p5.frameRate(60);
    canvas = p5.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    videoCapture = p5.createCapture(p5.VIDEO);
    WithOpenCV.setup((/**  @type {opencv}  */ cv) => {
      videoCapture.size(CANVAS_WIDTH, CANVAS_HEIGHT);
      videoCapture.hide();
      capture = new cv.VideoCapture(videoCapture.elt);
      src = new cv.Mat(videoCapture.width, videoCapture.height, cv.CV_8UC4);
    });
  };
  p5.draw = () => {
    WithOpenCV.run((/**  @type {opencv}  */ cv) => {
      capture?.read(src);
      cv.imshow(canvas.elt, src);
    });
  };
};
new p5(script);
