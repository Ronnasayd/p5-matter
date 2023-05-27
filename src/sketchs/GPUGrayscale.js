import { GPU } from "gpu.js";
import p5 from "p5";
import { WithOpenCV } from "../common";

/**
 * @typedef {import('opencv-ts').default} opencv
 */
/**
 * @param {p5} p5
 */
const script = function (p5) {
  // const pixels = [];
  let img, canvas, src, gpu, grayscaleKernel;
  // p5.mousePressed = (event) => {
  //   if (!!img && !!src) {
  //     pixels.push(src.ucharPtr(event.offsetX, event.offsetY).slice(0, 3));
  //   }
  // };
  p5.setup = () => {
    p5.frameRate(60);

    gpu = new GPU({ mode: "gpu" });

    WithOpenCV.setup((/**  @type {opencv}  */ cv) => {
      p5.createFileInput((file) => {
        img = p5.createImg(file.data);
        img.hide();
        img.elt.onload = () => {
          src = cv.imread(img.elt);
          canvas = p5.createCanvas(img.width, img.height);
          grayscaleKernel = gpu
            .createKernel(function (image) {
              const index =
                (this.constants.CANVAS_WIDTH *
                  (this.constants.CANVAS_HEIGHT - 1 - this.thread.y) +
                  this.thread.x) *
                this.constants.channels;
              const r = image[index] / 255;
              const g = image[index + 1] / 255;
              const b = image[index + 2] / 255;
              const alpha = image[index + 3] / 255;
              const gray = (r + b + g) / 3;
              this.color(gray, gray, gray, alpha);
            })
            .setOutput([img.width, img.height])
            .setConstants({
              CANVAS_WIDTH: img.width,
              CANVAS_HEIGHT: img.height,
              channels: 4,
            })
            .setGraphical(true);
        };
      });
    });
  };
  p5.draw = () => {
    p5.background(50);
    p5.ellipseMode(p5.RADIUS);
    if (!!img && !!src) {
      WithOpenCV.run((/**  @type {opencv}  */ cv) => {
        grayscaleKernel(src.data);
        p5.drawingContext.drawImage(grayscaleKernel.canvas, 0, 0);
      });
    }
  };
};
new p5(script);
