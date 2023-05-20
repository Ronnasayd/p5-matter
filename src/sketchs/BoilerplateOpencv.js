import p5 from "p5";
import { WithOpenCV } from "../common";

/**
 * @typedef {import('opencv-ts').default} opencv
 */
/**
 * @param {p5} p5
 */
const script = function (p5) {
  p5.setup = () => {
    p5.frameRate(60);
    p5.createCanvas(400, 400);
    WithOpenCV.setup((/**  @type {opencv}  */ cv) => {
      console.log(cv.getBuildInformation());
    });
  };
  p5.draw = () => {
    WithOpenCV.run((/**  @type {opencv}  */ cv) => {});
  };
};
new p5(script);
