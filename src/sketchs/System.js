import Matter from "matter-js";
import p5 from "p5";

class World {
  constructor(elements) {
    this.elements = elements;
  }
  init(engine) {
    for (const element of this.elements) {
      element.add2World(engine);
    }
  }
  update() {
    for (const element of this.elements) {
      element.update();
    }
  }
  add(element) {
    this.elements.push(element);
  }

  calculate() {
    const forces = [];
    for (const element_1 of this.elements) {
      let force = { x: 0, y: 0 };
      for (const element_2 of this.elements) {
        if (element_1 !== element_2) {
          const f = this.calculateForce(element_1.body, element_2.body);
          force = Matter.Vector.add(force, f);
        }
      }
      forces.push(force);
    }
    for (let index = 0; index < this.elements.length; index++) {
      const element = this.elements[index];
      element.applyForce(forces[index]);
    }
  }
  calculateForce(planet, satellite) {
    const distance = Matter.Vector.sub(planet.position, satellite.position);
    const direction = Matter.Vector.normalise(distance);

    const gravitationalForceMagnitude =
      (planet.mass * satellite.mass) / Matter.Vector.magnitudeSquared(distance);
    const gravitationalForce = Matter.Vector.mult(
      direction,
      gravitationalForceMagnitude
    );

    if (Matter.Vector.magnitude(distance) < 75) {
      return gravitationalForce;
    }

    return Matter.Vector.rotate(gravitationalForce, Math.PI);
  }
}

class Element {
  /**
   *
   * @param {p5} p5
   * @param {Number} x
   * @param {Number} y
   * @param {Number} radius
   */
  constructor(p5, x, y, radius, p5args, Matterargs) {
    this.p5 = p5;
    (this.x = x), (this.y = y);
    this.radius = radius;
    this.p5args = p5args;
    this.body = Matter.Bodies.circle(x, y, radius, { ...Matterargs });
  }
  update() {
    this.p5.fill(this.p5args.color);
    this.p5.circle(this.body.position.x, this.body.position.y, this.radius);
  }
  add2World(engine) {
    Matter.World.add(engine.world, [this.body]);
  }
  applyForce(force) {
    Matter.Body.applyForce(this.body, this.body.position, force);
  }
}

/**
 * @param {p5} p5
 */
const script = function (p5) {
  const engine = Matter.Engine.create();
  const planet = new Element(
    p5,
    200,
    200,
    30,
    {
      color: "#456789",
    },
    {
      mass: 30 / 100,
    }
  );
  const satellites = [];
  for (let index = 0; index < 40; index++) {
    const size = p5.random() * 15;
    const s = new Element(
      p5,
      p5.random() * 600,
      p5.random() * 600,
      size,
      {
        color: "#956799",
      },
      {
        mass: size / 100,
      }
    );
    satellites.push(s);
  }

  const world = new World([planet, ...satellites]);

  p5.setup = () => {
    p5.frameRate(60);
    p5.createCanvas(600, 600);

    engine.world.gravity.y = 0;

    world.init(engine);
  };
  p5.draw = () => {
    Matter.Runner.run(engine);

    p5.background(50);
    p5.ellipseMode(p5.RADIUS);
    world.calculate();
    world.update();
  };
};
new p5(script);
