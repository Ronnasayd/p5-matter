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
  const withOpenCV = new WithOpenCV();
  let canvas, src, dst1, dst2, ksize, slider, value, capture;

  p5.setup = () => {
    withOpenCV.setup((/**  @type {opencv}  */ cv) => {
      dst1 = new cv.Mat();
      dst2 = new cv.Mat();
      const videoCapture = p5.createCapture(p5.VIDEO);
      videoCapture.size(CANVAS_WIDTH, CANVAS_HEIGHT);
      videoCapture.hide();
      capture = new cv.VideoCapture(videoCapture.elt);
      src = new cv.Mat(videoCapture.width, videoCapture.height, cv.CV_8UC4);
    });
    p5.frameRate(60);
    canvas = p5.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    slider = p5.createSlider(1, 45, 3, 2);
  };
  p5.draw = () => {
    withOpenCV.run((/**  @type {opencv}  */ cv) => {
      capture?.read(src);
      value = slider.value();
      cv.cvtColor(src, dst1, cv.COLOR_RGBA2GRAY, 0);
      ksize = new cv.Size(value, value);
      cv.GaussianBlur(dst1, dst2, ksize, 0, 0, cv.BORDER_DEFAULT);
      cv.imshow(canvas.elt, dst2);
    });
  };
};
new p5(script);
