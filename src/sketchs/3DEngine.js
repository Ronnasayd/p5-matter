import p5 from "p5";
import { factoryProxy } from "../common";





class TF {
  FORWARD = nj.array([0, 0, 1])
  UP = nj.array([0, -1, 0])
  RIGHT = nj.array([1, 0, 0])
  constructor(alpha, beta, gamma, x, y, z) {
    this._matrix = TF.TF(alpha, beta, gamma, x, y, z);
    this.alpha = alpha
    this.beta = beta
    this.gamma = gamma
    this.x = x
    this.y = y
    this.z = z
  }

  moveForward(value) {
    const [x, y, z, _] = this.matrix().dot(nj.concatenate(this.FORWARD.multiply(value), 1)).tolist()
    this.x = x
    this.y = y
    this.z = z
    this._matrix = TF.TF(this.alpha, this.beta, this.gamma, this.x, this.y, this.z)
    return this
  }

  moveRight(value) {
    const [x, y, z, _] = this.matrix().dot(nj.concatenate(this.RIGHT.multiply(value), 1)).tolist()
    this.x = x
    this.y = y
    this.z = z
    this._matrix = TF.TF(this.alpha, this.beta, this.gamma, this.x, this.y, this.z)
    return this
  }

  moveUp(value) {
    const [x, y, z, _] = this.matrix().dot(nj.concatenate(this.UP.multiply(value), 1)).tolist()
    this.x = x
    this.y = y
    this.z = z
    this._matrix = TF.TF(this.alpha, this.beta, this.gamma, this.x, this.y, this.z)
    return this
  }

  translate(dx, dy, dz) {
    this.x += dx
    this.y += dy
    this.z += dz
    this._matrix = TF.TF(this.alpha, this.beta, this.gamma, this.x, this.y, this.z)
    return this
  }
  // getSub(row, col) {
  //   const [rowStart, rowEnd] = row
  //   const [colStart, colEnd] = col
  //   const data = []
  //   for (let i = rowStart; i < rowEnd; i++) {
  //     const auxData = []
  //     for (let j = colStart; j < colEnd; j++) {
  //       auxData.push(this.matrix.get(i, j))
  //     }
  //     data.push(auxData)
  //   }
  //   return nj.array(data).reshape(rowEnd - rowStart, colEnd - colStart)
  // }
  // setSub(row, col, data) {
  //   const [rowStart, rowEnd] = row
  //   const [colStart, colEnd] = col
  //   let idata = 0

  //   for (let i = rowStart; i < rowEnd; i++) {
  //     let jdata = 0
  //     for (let j = colStart; j < colEnd; j++) {
  //       this.matrix.set(i, j, data.get(idata, jdata))
  //       jdata++
  //     }
  //     idata++
  //   }
  // }
  rotateX(dalpha) {
    this.alpha += dalpha
    this._matrix = TF.TF(this.alpha, this.beta, this.gamma, this.x, this.y, this.z)
    return this
  }
  rotateY(dbeta) {
    this.beta += dbeta
    this._matrix = TF.TF(this.alpha, this.beta, this.gamma, this.x, this.y, this.z)
    return this
  }

  rotateZ(dgamma) {
    this.gamma += dgamma
    this._matrix = TF.TF(this.alpha, this.beta, this.gamma, this.x, this.y, this.z)
    return this
  }


  static RX(degres) {
    return nj.array([
      [1, 0, 0],
      [0, Math.cos(degres), -Math.sin(degres)],
      [0, Math.sin(degres), Math.cos(degres)]
    ])
  }
  static RY(degres) {
    return nj.array([
      [Math.cos(degres), 0, Math.sin(degres)],
      [0, 1, 0],
      [-Math.sin(degres), 0, Math.cos(degres)]
    ])
  }

  static RZ(degres) {
    return nj.array([
      [Math.cos(degres), -Math.sin(degres), 0],
      [Math.sin(degres), Math.cos(degres), 0],
      [0, 0, 1]
    ])
  }
  static RXYZ(dx, dy, dz) {
    return this.RX(dx).dot(this.RY(dy)).dot(this.RZ(dz))
  }

  static TF(dx, dy, dz, px, py, pz) {
    const RT = this.RXYZ(dx, dy, dz)
    const position = nj.array([px, py, pz]).reshape(3, 1)
    const lastLine = nj.array([0, 0, 0, 1]).reshape(4, 1)
    const concatenation = nj.concatenate(RT, position)
    const transform = nj.concatenate(concatenation.T, lastLine)
    return transform.T
  }
  setPosition(x, y, z) {
    this.x = x
    this.y = y
    this.z = z
    this._matrix = TF.TF(this.alpha, this.beta, this.gamma, this.x, this.y, this.z)
    return this
  }
  position() {
    return nj.array([this.x, this.y, this.z, 1])
  }

  setEuler(alpha, beta, gamma) {
    this.alpha = alpha
    this.beta = beta
    this.gamma = gamma
    this._matrix = TF.TF(this.alpha, this.beta, this.gamma, this.x, this.y, this.z)
    return this
  }
  euler() {
    return [this.alpha, this.beta, this.gamma]
  }
  matrix() {
    return this._matrix
  }
  imatrix() {
    return nj.negative(this._matrix)
  }
}

class CAM {
  constructor(fx = 1, fy = 1, sx = 0, sy = 0, afovx = PI / 6, afovy = PI / 6) {
    this.fx = fx
    this.fy = fy
    this.sx = sx
    this.sy = sy
    this.afovx = afovx
    this.afovy = afovy
    this.WIDTH = 2 * this.fx * Math.atan(this.afovx)
    this.HEIGHT = 2 * this.fy * Math.atan(this.afovy)
    this.tf = new TF(0, 0, 0, 0, 0, 0)
    this.intrisic = nj.array([
      [fx, 0, sx],
      [0, fy, sy],
      [0, 0, 1]
    ]).dot(nj.array([
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0]
    ]))
  }

  getPoints() {
    const [x, y, z, _] = this.tf.position().tolist()
    return [
      [x - this.WIDTH / 2, y - this.HEIGHT / 2, z - this.fx,],
      [x - this.WIDTH / 2, y + this.HEIGHT / 2, z - this.fx,],
      [x + this.WIDTH / 2, y - this.HEIGHT / 2, z - this.fx,],
      [x + this.WIDTH / 2, y + this.HEIGHT / 2, z - this.fx,],
      [x, y, z],
    ]
  }
  getIntrisic() {
    this.intrisic = nj.array([
      [this.fx, 0, this.sx],
      [0, this.fy, this.sy],
      [0, 0, 1]
    ]).dot(nj.array([
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0]
    ]))
    return this.intrisic
  }
  project(pos) {
    const extrisic = this.tf.matrix().dot(pos)
    return this.getIntrisic().dot(extrisic)
  }

  toCanvas(WIDTH, HEIGHT, position) {
    let [x, y, w] = position.tolist()
    x = x / w
    y = y / w

    const lwi = - this.WIDTH / 2
    const lwm = this.WIDTH / 2
    const lhi = -this.HEIGHT / 2
    const lhm = this.HEIGHT / 2
    const px = (x - lwi) / (lwm - lwi)
    const py = (y - lhi) / (lhm - lhi)
    return [px * WIDTH, py * HEIGHT]
  }
}

class Cube {
  constructor(alpha = 0, beta = 0, gamma = 0, x = 0, y = 0, z = 0, sx = 10, sy = 10, sz = 10) {
    this.tf = new TF(alpha, beta, gamma, x, y, z)
    this.scale = [sx, sy, sz]
    // this.vertices = [
    //   [-1, -1, 1, 1],
    //   [1, -1, 1, 1],
    //   [1, 1, 1, 1],
    //   [-1, 1, 1, 1],
    //   [-1, 1, -1, 1],
    //   [-1, -1, -1, 1],
    //   [1, -1, -1, 1],
    //   [1, 1, -1, 1],
    // ]
    this.indexes = [
      [0, 1, 2, 3],
      [1, 6, 7, 2],
      [6, 5, 4, 7],
      [3, 4, 5, 0],
      [3, 2, 7, 4],
      [0, 5, 6, 1]
    ]
    this.colors = [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255,],
      [255, 255, 0],
      [0, 255, 255],
      [255, 0, 255],
    ]



  }
  vertices() {
    const [sx, sy, sz] = this.scale
    return [
      [-sx + this.tf.x, -sy + this.tf.y, sz + this.tf.z, 1],
      [sx + this.tf.x, -sy + this.tf.y, sz + this.tf.z, 1],
      [sx + this.tf.x, sy + this.tf.y, sz + this.tf.z, 1],
      [-sx + this.tf.x, sy + this.tf.y, sz + this.tf.z, 1],
      [-sx + this.tf.x, sy + this.tf.y, -sz + this.tf.z, 1],
      [-sx + this.tf.x, -sy + this.tf.y, -sz + this.tf.z, 1],
      [sx + this.tf.x, -sy + this.tf.y, -sz + this.tf.z, 1],
      [sx + this.tf.x, sy + this.tf.y, -sz + this.tf.z, 1],
    ]
  }
}

const [WIDTH, HEIGHT] = [560, 560];
const PI = Math.PI;



const v = factoryProxy({
  cam: new CAM(100, 100, 0, 0, PI / 4, PI / 4),
  triangle: [
    nj.array([-10, 0, 0, 1]),
    nj.array([10, 0, 0, 1]),
    nj.array([0, 10, 0, 1])
  ],
  position: nj.array([0, 0, 0, 1]),
  cube: new Cube(0, 0, 0, 0, 0, 0, 20, 20, 20),
  vertices: [[]],
  mousePressed: false
})

/**
 * @param {p5} p5
 */
const script = function (p5) {
  function moveCam() {
    if (p5.keyIsDown(87)) {
      v.cam.tf.moveUp(0.5)
    }
    if (p5.keyIsDown(83)) {
      v.cam.tf.moveUp(-0.5)
    }

    if (p5.keyIsDown(65)) {
      v.cam.tf.moveRight(-0.5)
    }
    if (p5.keyIsDown(68)) {
      v.cam.tf.moveRight(0.5)
    }
  }
  p5.mouseWheel = event => {
    v.cam.tf.moveForward(event.delta > 0 ? 2 : -2)
  }

  p5.mouseMoved = event => {
    v.cam.tf.rotateY(-0.05 * ((event.clientX - WIDTH / 2) / WIDTH))
    v.cam.tf.rotateX(0.05 * ((event.clientY - HEIGHT / 2) / HEIGHT))


  }
  // p5.mousePressed = (event) => {
  //   v.mousePressed = event.which == 2
  // }
  // p5.mouseReleased = (event) => {
  //   console.log(event)
  //   v.mousePressed = false
  //   v.cam.tf.rotateY(-0.5 * ((event.clientX - WIDTH / 2) / WIDTH))
  //   v.cam.tf.rotateX(0.5 * ((event.clientY - HEIGHT / 2) / HEIGHT))
  // }

  p5.setup = () => {
    p5.frameRate(60);
    p5.createCanvas(WIDTH, HEIGHT);
    p5.ellipseMode(p5.RADIUS)
    p5.rectMode(p5.CENTER)
    v.cam.tf.translate(0, 0, 100)
  };
  p5.draw = () => {
    moveCam()
    p5.background(50);
    // v.cam.tf.rotateY(0.01)
    v.vertices = v.cube.vertices()
    for (const indexes of v.cube.indexes) {
      p5.noFill()
      p5.beginShape()
      for (const index of indexes) {
        v.position = v.cam.project(nj.array(v.vertices[index]))
        v.position = v.cam.toCanvas(WIDTH, HEIGHT, v.position)
        p5.vertex(v.position[0], v.position[1])

      }
      p5.endShape(p5.CLOSE)
    }


  };
};
new p5(script);
