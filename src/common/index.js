import Matter from "matter-js";
import p5 from "p5";
export class Element {
  map = {
    circle: "circle",
    rectangle: "rect",
  };
  /**
   *
   * @param {p5} p5
   * @param {Matter.Engine} engine
   * @param {String} type
   * @param {Object} MatterArgs
   */
  constructor(p5, engine, type, ...args) {
    this._p5 = p5;
    this._type = type;
    this._args = args;
    this._body = Matter.Bodies[type](...args);
    Matter.World.add(engine.world, [this._body]);
  }
  update() {
    const size =
      this._type === "circle" ? [this._args[2]] : this._args.slice(2, 4);
    this._p5[this.map[this._type]](
      this._body.position.x,
      this._body.position.y,
      ...size
    );
  }
}

export class WithOpenCV {
  load = false;

  static run(callback) {
    if (this.load) {
      this._insert().then(() => {
        if (callback) callback(cv);
      });
    }
  }
  static setup(callback) {
    this._insert().then(() => {
      if (callback) callback(cv);
    });
  }

  static _insert() {
    if (this.load) {
      return Promise.resolve(true);
    }
    return new Promise((resolve) => {
      console.log("inserting opencv ...");
      let script = document.createElement("script");
      script.src = "opencv.js";
      script.onload = () => {
        cv["onRuntimeInitialized"] = () => {
          if (typeof cv !== "undefined") {
            console.log(`openCV loaded!`);
            this.load = true;
            resolve(true);
          }
        };
      };

      document.body.appendChild(script);
    });
  }
}
/**
 * @template U
 * @param {U} object
 * @returns {U}
 */
export function factoryProxy(object) {
  const _keys = [];
  object.log = (key) => {
    _keys.push(key);
  };
  const handler = {
    get(target, key) {
      return target[key];
    },
    set(target, key, value) {
      if (_keys.includes(key)) {
        if (typeof value === "object") {
          console.log(`[${key}]:`, value);
        } else {
          console.log(`[${key}]:${value}`);
        }
      }
      return Reflect.set(target, key, value);
    },
  };
  return new Proxy(object, handler);
}
export function landmarks2Points(landmarks, CANVAS_WIDTH, CANVAS_HEIGHT) {
  const points = [];
  for (let index = 0; index < landmarks.length; index++) {
    const element = landmarks[index];
    points.push([element.x * CANVAS_WIDTH, element.y * CANVAS_HEIGHT]);
  }
  return points;
}
