import p5 from "p5";
import { WithOpenCV } from "../common";
/**
 * @typedef {import('opencv-ts').default} opencv
 */
/**
 * @param {p5} p5
 */
const script = function (p5) {
  const withOpenCV = new WithOpenCV();
  let canvas, src, dst1, dst2, slider, value, capture, img;

  p5.preload = () => {
    img = p5.loadImage("lenna.png");
  };

  p5.setup = () => {
    withOpenCV.setup((/**  @type {opencv}  */ cv) => {
      dst1 = new cv.Mat();
      dst2 = new cv.Mat();
    });
    p5.frameRate(60);
    canvas = p5.createCanvas(600, 600);
    capture = p5.createCapture(p5.VIDEO);
    slider = p5.createSlider(0, 250, 100);
    capture.hide();
  };
  p5.draw = () => {
    withOpenCV.run((/**  @type {opencv}  */ cv) => {
      value = slider.value();
      src = cv.imread(img.canvas);
      cv.cvtColor(src, dst1, cv.COLOR_RGBA2GRAY, 0);
      cv.threshold(dst1, dst2, value, 200, cv.THRESH_BINARY);
      cv.imshow(canvas.elt, dst2);
    });
  };
};
new p5(script);
