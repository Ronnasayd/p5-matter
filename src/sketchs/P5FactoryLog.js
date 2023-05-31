import p5 from "p5";
import { factoryProxy } from "../common";

const v = factoryProxy({
  CANVAS_WIDTH: 500,
  CANVAS_HEIGHT: 500,
  fps: 6,
  pos: [500 / 2, 500 / 2, 30],
  color: [255, 0, 0],
});

/**
 * @param {p5} p5
 */
const script = function (p5) {
  p5.setup = () => {
    p5.frameRate(v.fps);
    p5.createCanvas(v.CANVAS_WIDTH, v.CANVAS_HEIGHT);
    v.log("color");
  };
  p5.draw = () => {
    p5.background(50);
    v.pos = [
      p5.random().toFixed(2) * v.CANVAS_WIDTH,
      p5.random().toFixed(2) * v.CANVAS_HEIGHT,
      p5.random().toFixed(2) * 50,
    ];
    v.color = [
      255 * p5.random().toFixed(2),
      255 * p5.random().toFixed(2),
      255 * p5.random().toFixed(2),
    ];
    p5.fill(...v.color);
    p5.circle(...v.pos);
  };
};
new p5(script);
