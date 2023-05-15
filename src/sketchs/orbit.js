import Matter from "matter-js";
import p5 from "p5";
/**
 *
 * @param {p5} p5
 */
const script = function (p5) {
  const engine = Matter.Engine.create();
  const planet = Matter.Bodies.circle(200, 200, 20, {
    isStatic: true,
    mass: 0.002,
  });
  const satellite = Matter.Bodies.circle(170, 200, 10, {
    mass: 0.002,
  });
  function calculateForce(planet, satellite) {
    const distance = Matter.Vector.sub(planet.position, satellite.position);
    const direction = Matter.Vector.normalise(distance);

    const direction90 = Matter.Vector.rotate(direction, Math.PI / 2);

    const gravitationalForceMagnitude =
      (planet.mass * satellite.mass) / Matter.Vector.magnitudeSquared(distance);
    const gravitationalForce = Matter.Vector.mult(
      direction90,
      gravitationalForceMagnitude
    );

    Matter.Body.applyForce(satellite, satellite.position, gravitationalForce);
  }

  p5.setup = () => {
    p5.frameRate(24);
    engine.world.gravity.y = 0;
    Matter.World.add(engine.world, [planet, satellite]);
    Matter.Events.on(engine, "beforeUpdate", (event) =>
      calculateForce(planet, satellite)
    );
    p5.createCanvas(400, 400);
  };
  p5.draw = () => {
    p5.background(50);
    p5.ellipseMode(p5.RADIUS);

    Matter.Runner.run(engine);
    p5.stroke(0);
    p5.fill(100, 255, 255);
    p5.circle(planet.position.x, planet.position.y, planet.circleRadius);
    p5.fill(255, 255, 100);
    p5.stroke(0);
    p5.circle(
      satellite.position.x,
      satellite.position.y,
      satellite.circleRadius
    );
  };
};
new p5(script);
