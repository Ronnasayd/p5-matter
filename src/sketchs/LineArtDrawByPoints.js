import p5 from "p5";

/**
 * @param {p5} p5
 */
const script = function (p5) {
  let points;

  p5.setup = () => {
    p5.frameRate(60);
    p5.createCanvas(1800, 580);
    p5.loadJSON("points.json", {}, "json", (data) => {
      points = data.sort((a, b) => a.y - b.y + 580 / 2 + a.x - b.x + 1800 / 2);
      p5.beginShape(p5.LINES);
      for (const point of points) {
        p5.vertex(point.x, point.y);
      }
      p5.endShape();
    });
    p5.noLoop();
  };
  p5.draw = () => {
    p5.background(255);
  };
};
new p5(script);
