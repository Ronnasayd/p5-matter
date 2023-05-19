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
  let canvas, src, image, ksize, slider, value, capture, videoCapture;

  p5.setup = () => {
    withOpenCV.setup((/**  @type {opencv}  */ cv) => {
      image = new cv.Mat();
      videoCapture = p5.createCapture(p5.VIDEO);
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
      cv.cvtColor(src, image, cv.COLOR_RGBA2GRAY, 0);
      ksize = new cv.Size(value, value);
      cv.GaussianBlur(image, image, ksize, 0, 0, cv.BORDER_DEFAULT);
      cv.imshow(canvas.elt, image);
    });
  };
};
new p5(script);
