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
  let img, canvas, src, gpu, contrastKernel, contrastSlider;
  p5.setup = () => {
    p5.frameRate(60);

    gpu = new GPU({ mode: "gpu" });

    contrastSlider = p5.createSlider(-255, 255, 0);
    contrastSlider.elt.setAttribute("class", "w-[500px] p-2 block");

    WithOpenCV.setup((/**  @type {opencv}  */ cv) => {
      p5.createFileInput((file) => {
        img = p5.createImg(file.data);
        img.hide();
        img.elt.onload = () => {
          src = cv.imread(img.elt);
          canvas = p5.createCanvas(img.width, img.height);
          contrastKernel = gpu
            .createKernel(function (image, contrast) {
              const factor =
                (259 * (contrast + 255)) / (255 * (259 - contrast));
              const index =
                (this.constants.CANVAS_WIDTH *
                  (this.constants.CANVAS_HEIGHT - 1 - this.thread.y) +
                  this.thread.x) *
                this.constants.channels;

              const r = image[index] / 255;
              const g = image[index + 1] / 255;
              const b = image[index + 2] / 255;
              const alpha = image[index + 3] / 255;

              // Clamp adjusted values between 0 and 1
              const clampedR = Math.min(
                Math.max(factor * (r - 0.5) + 0.5, 0),
                1
              );
              const clampedG = Math.min(
                Math.max(factor * (g - 0.5) + 0.5, 0),
                1
              );
              const clampedB = Math.min(
                Math.max(factor * (b - 0.5) + 0.5, 0),
                1
              );

              this.color(clampedR, clampedG, clampedB, alpha);
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
    if (!!img && !!src) {
      WithOpenCV.run(() => {
        contrastKernel(src.data, contrastSlider.value());
        p5.drawingContext.drawImage(contrastKernel.canvas, 0, 0);
      });
    }
  };
};
new p5(script);
