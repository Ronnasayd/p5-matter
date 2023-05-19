import Matter from "matter-js";
import p5 from "p5";
import { Element } from "../common";
/**
 * @param {p5} p5
 */
const script = function (p5) {
  const engine = Matter.Engine.create();
  engine.world.gravity.y = 0.01;
  const floor = new Element(p5, engine, "rectangle", 200, 390, 100, 10, {
    isStatic: true,
    mass: 0,
    label: "Floor",
  });
  const floor_2 = new Element(p5, engine, "rectangle", 150, 340, 10, 100, {
    isStatic: true,
    mass: 0,
    label: "Floor",
  });
  const floor_3 = new Element(p5, engine, "rectangle", 250, 340, 10, 100, {
    isStatic: true,
    mass: 0,
    label: "Floor",
  });

  const balls = [];

  p5.setup = () => {
    Matter.World.add(engine.world, []);
    p5.frameRate(30);
    p5.createCanvas(400, 400);
  };
  p5.draw = () => {
    Matter.Runner.run(engine);
    p5.background(50);
    p5.ellipseMode(p5.RADIUS);
    p5.rectMode(p5.CENTER);
    p5.fill(255);
    floor.update();
    floor_2.update();
    floor_3.update();
    p5.fill("#0099ff");
    for (const ball of balls) {
      ball.update();
    }
    if (balls.length < 90) {
      balls.push(
        new Element(p5, engine, "circle", 200, 20, 6, {
          label: "Ball",
          velocity: { x: 1, y: 0 },
        })
      );
    }
  };
};
new p5(script);
