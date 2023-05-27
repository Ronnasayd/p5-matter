import { GPU } from "gpu.js";
import p5 from "p5";
/**
 * @param {p5} p5
 */
const script = function (p5) {
  let gpu, positionsKernel;
  p5.setup = () => {
    gpu = new GPU({ mode: "cpu" });
    positionsKernel = gpu
      .createKernel(function () {
        debugger;
        return [Math.random() * 512, Math.random() * 512];
      })
      .setOutput([1000]);

    p5.frameRate(60);
    p5.createCanvas(512, 512);
  };
  p5.draw = () => {
    p5.background(50);
    p5.ellipseMode(p5.RADIUS);
    positionsKernel();
  };
};
new p5(script);
