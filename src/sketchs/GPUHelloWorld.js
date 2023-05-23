import { GPU } from "gpu.js";
import p5 from "p5";
/**
 * @param {p5} p5
 */
const script = function (p5) {
  let gpu, positionsKernel, positions, updatePositionsKernel;
  p5.setup = () => {
    gpu = new GPU();
    positionsKernel = gpu
      .createKernel(function () {
        return [Math.random() * 512, Math.random() * 512];
      })
      .setOutput([1000]);
    updatePositionsKernel = gpu
      .createKernel(function (positions) {
        return [
          positions[this.thread.x][0] + 2 * (Math.random() - 0.5),
          positions[this.thread.x][1] + 2 * (Math.random() - 0.5),
        ];
      })
      .setOutput([1000]);

    positions = positionsKernel();

    p5.frameRate(60);
    p5.createCanvas(512, 512);
  };
  p5.draw = () => {
    p5.background(50);
    p5.ellipseMode(p5.RADIUS);
    positions = updatePositionsKernel(positions);
    for (const position of positions) {
      p5.circle(position[0], position[1], 4);
    }
  };
};
new p5(script);
