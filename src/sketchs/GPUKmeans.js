import { GPU } from "gpu.js";
import p5 from "p5";
import { WithOpenCV } from "../common";

/**
 * @typedef {import('opencv-ts').default} opencv
 */

const v = {
  inputCanvas: null,
  outputCanvas: null,
  inputContext: null,
  outputContext: null,
  src: null,
  img: null,
  mX: null,
  mY: null,
  gpu: null,
  kmeansKernel: null,
  NUMBER_COLORS: 2,
  mColor: [255, 255, 255],
  mColors: [],
  mPos: [],
};

function getRGB(data, x, y, width, height, channels) {
  const index = (width * y + x) * channels;
  return data.slice(index, index + channels);
}

/**
 * @param {p5} p5
 */
const input = function (p5) {
  p5.createFileInput(function (file) {
    v.gpu = new GPU({ mode: "gpu" });
    WithOpenCV.setup((/**  @type {opencv}  */ cv) => {
      v.img = p5.createImg(file.data);
      v.img.hide();
      v.img.elt.onload = () => {
        v.src = cv.imread(v.img.elt);
        v.kmeansKernel = v.gpu
          .createKernel(function (
            image,
            meansLength,
            means,
            colors,
            NUMBER_COLORS
          ) {
            const index =
              (this.constants.CANVAS_WIDTH *
                (this.constants.CANVAS_HEIGHT - 1 - this.thread.y) +
                this.thread.x) *
              this.constants.channels;

            const r = image[index] / 255;
            const g = image[index + 1] / 255;
            const b = image[index + 2] / 255;
            const alpha = image[index + 3] / 255;
            const gray = (r + g + b) / 3;

            if (meansLength >= NUMBER_COLORS) {
              let minDistance = 2;
              let distanceIndex = 0;
              for (let i = 0; i < meansLength; i++) {
                const meanY = means[i][1];
                const meanX = means[i][0];

                const mIndex =
                  (this.constants.CANVAS_WIDTH *
                    (this.constants.CANVAS_HEIGHT - 1 - meanY) +
                    meanX) *
                  this.constants.channels;
                const rm = image[mIndex] / 255;
                const gm = image[mIndex + 1] / 255;
                const bm = image[mIndex + 2] / 255;
                const malpha = image[index + 3] / 255;
                const graym = (rm + gm + bm) / 3;

                // const distance = Math.sqrt(Math.pow(graym - gray, 2));

                const distance = Math.sqrt(
                  Math.pow(rm - r, 2) +
                    Math.pow(gm - g, 2) +
                    Math.pow(bm - b, 2) +
                    Math.pow(malpha - alpha, 2)
                );
                if (distance < minDistance) {
                  minDistance = distance;
                  distanceIndex = i;
                }
              }

              this.color(
                colors[distanceIndex][0] / 255,
                colors[distanceIndex][1] / 255,
                colors[distanceIndex][2] / 255,
                colors[distanceIndex][3] / 255
              );
            } else {
              this.color(r, g, b, alpha);
            }
          })
          .setOutput([v.img.width, v.img.height])
          .setDynamicArguments(true)
          .setConstants({
            CANVAS_WIDTH: v.img.width,
            CANVAS_HEIGHT: v.img.height,
            channels: 4,
          })
          .setGraphical(true);
      };
    });
  });
  p5.mouseClicked = function (event) {
    if (v.img) {
      v.mColors.push(v.mColor.slice());
      v.mPos.push([event.offsetX, event.offsetY]);
    }
  };
  p5.mouseMoved = function (event) {
    if (v.img && v.src) {
      v.mX = event.offsetX;
      v.mY = event.offsetY;
      v.mColor = getRGB(v.src.data, v.mX, v.mY, v.img.width, v.img.height, 4);
    }
  };
  p5.setup = () => {
    v.inputCanvas = p5.createCanvas(300, 300);
    v.inputContext = p5.drawingContext;
  };
  p5.draw = () => {
    p5.background(100);
    if (v.img) {
      p5.resizeCanvas(v.img.width, v.img.height);

      p5.image(v.img, 0, 0, v.img.width, v.img.height);
      p5.fill(...v.mColor);
      p5.circle(v.mX, v.mY, 15);
      for (let index = 0; index < v.mColors.length; index++) {
        p5.fill(...v.mColors[index]);
        p5.circle(v.mPos[index][0], v.mPos[index][1], 15);
      }
    }
  };
};
/**
 * @param {p5} p5
 */
const output = function (p5) {
  p5.setup = () => {
    v.outputCanvas = p5.createCanvas(300, 300);
    v.outputContext = p5.drawingContext;
  };
  p5.draw = () => {
    p5.background(120);
    if (v.img) {
      p5.resizeCanvas(v.img.width, v.img.height);

      if (v.mPos.length) {
        v.kmeansKernel(
          v.src.data,
          v.mPos.length,
          v.mPos,
          v.mColors,
          v.NUMBER_COLORS
        );
        p5.drawingContext.drawImage(v.kmeansKernel.canvas, 0, 0);
      }
    }
  };
};
new p5(input);
new p5(output);
