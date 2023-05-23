import { GPU } from "gpu.js";
import p5 from "p5";
/**
 * @param {p5} p5
 */
const script = function (p5) {
  let gpu,
    positionsKernel,
    positions,
    distances,
    collisions,
    updatePositionsKernel,
    calculateDistancesKernel,
    isCollisionKernel;
  const NUMBER_PARTICLES = 800;
  p5.setup = () => {
    gpu = new GPU();
    positionsKernel = gpu
      .createKernel(function () {
        return [Math.random() * 512, Math.random() * 512];
      })
      .setOutput([NUMBER_PARTICLES]);

    calculateDistancesKernel = gpu
      .createKernel(function (positions) {
        return Math.sqrt(
          Math.pow(
            positions[this.thread.x][0] - positions[this.thread.y][0],
            2
          ) +
            Math.pow(
              positions[this.thread.x][1] - positions[this.thread.y][1],
              2
            )
        );
      })
      .setOutput([NUMBER_PARTICLES, NUMBER_PARTICLES]);
    updatePositionsKernel = gpu
      .createKernel(function (positions, distances) {
        for (let index = 0; index < this.constants.NUMBER_PARTICLES; index++) {
          let vx = 0;
          let vy = 0;
          if (distances[this.thread.x][index] < 10 && this.thread.x !== index) {
            vx = (positions[this.thread.x][0] - positions[index][0]) / 5;
            vy = (positions[this.thread.x][1] - positions[index][1]) / 5;

            return [
              positions[this.thread.x][0] + vx,
              positions[this.thread.x][1] + vy,
            ];
          }
        }

        return [
          positions[this.thread.x][0] + 4 * (Math.random() - 0.5),
          positions[this.thread.x][1] + 4 * (Math.random() - 0.5),
        ];
      })
      .setOutput([NUMBER_PARTICLES])
      .setConstants({ NUMBER_PARTICLES });
    isCollisionKernel = gpu
      .createKernel(function (distances) {
        for (let index = 0; index < this.constants.NUMBER_PARTICLES; index++) {
          if (distances[this.thread.x][index] < 10 && this.thread.x !== index) {
            return 1;
          }
        }
        return 0;
      })
      .setOutput([NUMBER_PARTICLES])
      .setConstants({ NUMBER_PARTICLES });

    positions = positionsKernel();

    p5.frameRate(60);
    p5.createCanvas(512, 512);
  };
  p5.draw = () => {
    p5.background(50);
    p5.ellipseMode(p5.RADIUS);
    distances = calculateDistancesKernel(positions);
    collisions = isCollisionKernel(distances);

    positions = updatePositionsKernel(positions, distances);
    for (let index = 0; index < NUMBER_PARTICLES; index++) {
      collisions[index] ? p5.fill("#ffaa00") : p5.fill("#00aaff");
      p5.circle(positions[index][0], positions[index][1], 5);
    }
  };
};
new p5(script);
