import { GPU } from "gpu.js";
import p5 from "p5";
/**
 * @param {p5} p5
 */
const script = function (p5) {
  let gpu, positions;
  p5.setup = () => {
    gpu = new GPU();
    positions = gpu
      .createKernel(function () {
        return Math.random() * 512;
      })
      .setOutput([2, 500]);

    p5.frameRate(60);
    p5.createCanvas(512, 512);
  };
  p5.draw = () => {
    p5.background(50);
    p5.ellipseMode(p5.RADIUS);
    const result = positions();
    for (const position of result) {
      p5.circle(position[0], position[1], 4);
    }
  };
};
new p5(script);
