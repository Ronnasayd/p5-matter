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
  let canvas, src, dst1, dst2, ksize, slider, value, capture, captureImage;

  p5.setup = () => {
    withOpenCV.setup((/**  @type {opencv}  */ cv) => {
      dst1 = new cv.Mat();
      dst2 = new cv.Mat();
    });
    p5.frameRate(60);
    canvas = p5.createCanvas(400, 400);
    capture = p5.createCapture(p5.VIDEO);
    slider = p5.createSlider(1, 13, 3, 2);
    capture.hide();
  };
  p5.draw = () => {
    withOpenCV.run((/**  @type {opencv}  */ cv) => {
      value = slider.value();
      captureImage = capture.get();
      src = cv.imread(captureImage.canvas);
      cv.cvtColor(src, dst1, cv.COLOR_RGBA2GRAY, 0);
      ksize = new cv.Size(value, value);
      cv.GaussianBlur(dst1, dst2, ksize, 0, 0, cv.BORDER_DEFAULT);
      cv.imshow(canvas.elt, dst2);
    });
  };
};
new p5(script);
