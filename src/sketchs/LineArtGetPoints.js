// @ts-check
import p5 from "p5";
import { WithOpenCV } from "../common";

/**
 * @typedef {import('opencv-ts').default} opencv
 */
/**
 * @param {p5} p5
 */
const script = function (p5) {
  const CANVAS_WIDTH = 1000;
  const CANVAS_HEIGHT = 580;
  let image,
    cannyOneDiv,
    cannyTwoDiv,
    gaussianDiv,
    cannyOneSlider,
    cannyTwoSlider,
    gaussianSlider,
    src,
    ksize,
    canvas,
    cannyOneValue,
    cannyTwoValue,
    gaussianValue,
    button,
    contours,
    hierarchy,
    img;

  p5.setup = () => {
    WithOpenCV.setup((/**  @type {opencv}  */ cv) => {
      image = new cv.Mat();
      hierarchy = new cv.Mat();
      contours = new cv.MatVector();
      p5.createFileInput((file) => {
        img = p5.createImg(file.data, "");

        img.elt.onload = () => {
          src = cv.imread(img.elt);
        };
        img.hide();
        button = p5.createButton("Download");
        button.position(CANVAS_WIDTH + 160, 70);
        button.mousePressed(() => {
          cv.findContours(
            image,
            contours,
            hierarchy,
            cv.RETR_TREE,
            cv.CHAIN_APPROX_SIMPLE
          );
          const points = [];
          for (let i = 0; i < contours.size(); i++) {
            const ci = contours.get(i);
            for (let j = 0; j < ci.data32S.length; j += 2) {
              points.push({ x: ci.data32S[j], y: ci.data32S[j + 1] });
            }
          }
          p5.saveJSON(points, "points");
        });
      });
    });
    p5.frameRate(30);
    canvas = p5.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    cannyOneSlider = p5.createSlider(0, 250, 217);
    cannyTwoSlider = p5.createSlider(0, 250, 84);
    gaussianSlider = p5.createSlider(1, 45, 3, 2);

    gaussianDiv = p5.createDiv(`gaussian:0`);
    cannyOneDiv = p5.createDiv(`canny 1:0`);
    cannyTwoDiv = p5.createDiv(`canny 2:0`);

    cannyOneSlider.position(CANVAS_WIDTH + 20, 10);
    cannyOneDiv.position(CANVAS_WIDTH + 160, 10);

    cannyTwoSlider.position(CANVAS_WIDTH + 20, 30);
    cannyTwoDiv.position(CANVAS_WIDTH + 160, 30);

    gaussianSlider.position(CANVAS_WIDTH + 20, 50);
    gaussianDiv.position(CANVAS_WIDTH + 160, 50);
  };
  p5.draw = () => {
    if (!!img && !!src) {
      WithOpenCV.run((/**  @type {opencv}  */ cv) => {
        cannyOneValue = cannyOneSlider.value();
        cannyTwoValue = cannyTwoSlider.value();
        gaussianValue = gaussianSlider.value();

        gaussianDiv.html(`gaussian: ${gaussianValue}`);
        cannyOneDiv.html(`canny 1: ${cannyOneValue}`);
        cannyTwoDiv.html(`canny 2: ${cannyTwoValue}`);

        cv.cvtColor(src, image, cv.COLOR_RGBA2GRAY, 0);
        ksize = new cv.Size(gaussianValue, gaussianValue);
        cv.GaussianBlur(image, image, ksize, 0, 0, cv.BORDER_DEFAULT);
        cv.Canny(image, image, cannyOneValue, cannyTwoValue);
        cv.bitwise_not(image, image);
        cv.threshold(image, image, 200, 255, cv.THRESH_BINARY);

        cv.imshow(canvas.elt, image);
      });
    }
  };
};
new p5(script);
