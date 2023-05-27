import { GPU, Input } from "gpu.js";
import p5 from "p5";
import { WithOpenCV } from "../common";

/**
 * @typedef {import('opencv-ts').default} opencv
 */
/**
 * @param {p5} p5
 */
const script = function (p5) {
  let img, canvas, src, gpu, kmeansKernel, gpuInput, exampleKernel;
  let means = [];
  let colors = [];

  p5.mousePressed = (event) => {
    if (!!img && !!src) {
      means.push([event.offsetX, event.offsetY]);
      colors.push([Math.random(), Math.random(), Math.random()]);
    }
  };
  p5.setup = () => {
    p5.frameRate(60);

    gpu = new GPU({ mode: "cpu" });
    gpuInput = new Input(means, [means.length / 2, 2, 1]);

    WithOpenCV.setup((/**  @type {opencv}  */ cv) => {
      p5.createFileInput((file) => {
        img = p5.createImg(file.data);
        img.hide();

        img.elt.onload = () => {
          src = cv.imread(img.elt);
          canvas = p5.createCanvas(img.width, img.height);
          kmeansKernel = gpu
            .createKernel(function (image, meansLength, means, colors) {
              const index =
                (this.constants.CANVAS_WIDTH *
                  (this.constants.CANVAS_HEIGHT - 1 - this.thread.y) +
                  this.thread.x) *
                this.constants.channels;
              const r = image[index] / 255;
              const g = image[index + 1] / 255;
              const b = image[index + 2] / 255;
              const alpha = image[index + 3] / 255;

              if (meansLength > 3) {
                let minDistance = 2;
                let distanceIndex = 0;
                for (let index = 0; index < meansLength; index++) {
                  const mean = means[index];
                  const mIndex =
                    (this.constants.CANVAS_WIDTH *
                      (this.constants.CANVAS_HEIGHT - 1 - mean[1]) +
                      mean[0]) *
                    this.constants.channels;
                  const rm = image[mIndex] / 255;
                  const gm = image[mIndex + 1] / 255;
                  const bm = image[mIndex + 2] / 255;
                  const distance = Math.sqrt(
                    Math.pow(rm - r, 2) +
                      Math.pow(gm - g, 2) +
                      Math.pow(bm - b, 2)
                  );
                  if (distance < minDistance) {
                    minDistance = distance;
                    distanceIndex = index;
                  }
                }
                this.color(
                  colors[distanceIndex][0],
                  colors[distanceIndex][1],
                  colors[distanceIndex][1],
                  alpha
                );
                // debugger;
              } else {
                this.color(r, g, b, alpha);
              }
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
        gpuInput.size = [means.length / 2, 2, 1];
        kmeansKernel(src.data, means.length, means, colors);
        p5.drawingContext.drawImage(kmeansKernel.canvas, 0, 0);
      });
    }
  };
};
new p5(script);
