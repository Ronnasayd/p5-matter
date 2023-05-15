import Matter from "matter-js";
import p5 from "p5";
/**
 * @param {p5} p5
 */
const script = function (p5) {
  const engine = Matter.Engine.create();
  p5.setup = () => {
    p5.frameRate(60);
    p5.createCanvas(400, 400);
  };
  p5.draw = () => {
    Matter.Runner.run(engine);
    p5.background(50);
    p5.ellipseMode(p5.RADIUS);
  };
};
new p5(script);
