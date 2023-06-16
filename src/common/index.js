import { Delaunay } from "d3-delaunay";
import Matter from "matter-js";
import p5 from "p5";
/**
 * @typedef {import('opencv-ts').default} opencv
 */
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

  /**
   *
   * @param {(cv:opencv)=>void} callback
   */
  static run(callback) {
    if (this.load) {
      this._insert().then(() => {
        if (callback) callback(cv);
      });
    }
  }
  /**
   *
   * @param {(cv:opencv)=>void} callback
   */
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
      let script = window.document.createElement("script");
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

      window.document.body.appendChild(script);
    });
  }
}
/**
 * @template U
 * @param {U} object
 * @returns {U & log:(param:string)=>void}
 */
export function factoryProxy(object) {
  const _keys = [];

  const handler = {
    get(target, key) {
      return Reflect.get(target, key);
    },
    set(target, key, value) {
      if (_keys.includes(key)) {
        if (typeof value === "object") {
          console.log(`[${key}]:`, value);
        } else {
          console.log(`[${key}]:${value}`);
        }
      }
      if (typeof value === "object")
        return Reflect.set(target, key, new Proxy(value, handler));

      return Reflect.set(target, key, value);
    },
  };
  object.log = (key) => {
    _keys.push(key);
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

export const KEYPOINTS_68 = {
  Contour: [
    162, 234, 93, 58, 172, 136, 149, 148, 152, 377, 378, 365, 397, 288, 323,
    454, 389, 301, 293, 334, 296, 336, 107, 66, 105, 63, 71,
  ],
  Nose: [168, 197, 5, 4, 75, 97, 2, 326, 305],
  RightEye: [33, 160, 158, 133, 153, 144],
  LeftEye: [362, 385, 387, 263, 373, 380],
  Mounth: [
    61, 39, 37, 0, 267, 269, 291, 405, 314, 17, 84, 181, 78, 82, 13, 312, 308,
    317, 14, 87,
  ],
};
/**
 *
 * @param {string} path
 * @returns
 */
export function getPointsBySVG(path) {
  return new Promise((resolve, reject) => {
    const points = {};
    fetch(path).then((response) => {
      response.text().then((svg) => {
        const div = window.document.createElement("div");
        div.innerHTML = svg;
        window.document.body.appendChild(div);
        const paths = window.document.querySelectorAll("path");
        for (const path of paths) {
          const index = path.getAttribute("id");
          const { x, y } = path.getBBox();
          if (x >= 0 && y >= 0) points[index] = [x, y];
        }
        window.document.body.removeChild(div);
        resolve(points);
      });
    });
  });
}

export class MapPoints {
  build(map) {
    this._mapKeys = {};
    this._mapPoints = {};
    this._points = [];
    for (const key in map) {
      this._mapKeys[key] = map[key];
      this._mapPoints[`${map[key][0]}:${map[key][1]}`] = key;
      this._points.push(map[key]);
    }
    return this;
  }
  getPoints() {
    return this._points;
  }
  getPointByIndex(index) {
    return this._mapKeys[index];
  }
  getIndexByPoint(x, y) {
    return this._mapPoints[`${x}:${y}`];
  }

  getTriangleByIndexes(indexes) {
    const triangle = [];
    for (const index of indexes) {
      triangle.push(...this._mapKeys[index]);
    }
    return triangle;
  }
  getIndexesByTriangle(triangle) {
    const indexes = [];
    for (let index = 0; index < triangle.length; index = index + 2) {
      const px = triangle[index];
      const py = triangle[index + 1];

      indexes.push(this._mapPoints[`${px}:${py}`]);
    }
    return indexes;
  }
  getTriangles() {
    this._delaunay = Delaunay.from(this._points);
    const triangles = [];
    for (
      let index = 0;
      index < this._delaunay.triangles.length;
      index = index + 3
    ) {
      const t0 = this._delaunay.triangles[index];
      const t1 = this._delaunay.triangles[index + 1];
      const t2 = this._delaunay.triangles[index + 2];

      const p0x = this._delaunay.points[t0 * 2];
      const p0y = this._delaunay.points[t0 * 2 + 1];

      const p1x = this._delaunay.points[t1 * 2];
      const p1y = this._delaunay.points[t1 * 2 + 1];

      const p2x = this._delaunay.points[t2 * 2];
      const p2y = this._delaunay.points[t2 * 2 + 1];

      triangles.push([p0x, p0y, p1x, p1y, p2x, p2y]);
    }
    return triangles;
  }
}
