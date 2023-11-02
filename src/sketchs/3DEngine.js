import p5 from "p5";



const [WIDTH, HEIGHT] = [560, 560];
const PI = Math.PI;

class TF {
  constructor(dx, dy, dz, x, y, z) {
    this.data = TF.TF(dx, dy, dz, x, y, z);
  }



  translate(x, y, z) {
    const translation = this.data.dot(nj.array([x, y, z, 1]).reshape(4, 1))
    this.setSub([0, 4], [3, 4], translation)
    return this
  }
  getSub(row, col) {
    const [rowStart, rowEnd] = row
    const [colStart, colEnd] = col
    const data = []
    for (let i = rowStart; i < rowEnd; i++) {
      const auxData = []
      for (let j = colStart; j < colEnd; j++) {
        auxData.push(this.data.get(i, j))
      }
      data.push(auxData)
    }
    return nj.array(data).reshape(rowEnd - rowStart, colEnd - colStart)
  }
  setSub(row, col, data) {
    const [rowStart, rowEnd] = row
    const [colStart, colEnd] = col
    let idata = 0

    for (let i = rowStart; i < rowEnd; i++) {
      let jdata = 0
      for (let j = colStart; j < colEnd; j++) {
        this.data.set(i, j, data.get(idata, jdata))
        jdata++
      }
      idata++
    }
  }
  rotateX(degres) {
    const RX = TF.RX(degres)
    const MX = this.getSub([0, 3], [0, 3])
    const NMX = RX.dot(MX)
    this.setSub([0, 3], [0, 3], NMX)
    return this
  }
  rotateY(degres) {
    const RY = TF.RY(degres)
    const MY = this.getSub([0, 3], [0, 3])
    const NMY = RY.dot(MY)
    this.setSub([0, 3], [0, 3], NMY)
    return this
  }

  rotateZ(degres) {
    const RZ = TF.RZ(degres)
    const MZ = this.getSub([0, 3], [0, 3])
    const NMZ = RZ.dot(MZ)
    this.setSub([0, 3], [0, 3], NMZ)
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
  position() {
    return this.getSub([0, 4], [3, 4])
  }
}

class CAM {
  constructor(fx, fy, sx, sy) {
    this.fx = fx
    this.fy = fy
    this.sx = sx
    this.sy = sy
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
    const extrisic = this.tf.data.dot(pos)
    return this.getIntrisic().dot(extrisic)
  }
}

class Cube {
  constructor() {
    this.vertices = [
      [-20, -20, -20, 1],
      [20, -20, -20, 1],
      [20, 20, -20, 1],
      [-20, 20, -20, 1],
      [-20, -20, 20, 1],
      [20, -20, 20, 1],
      [20, 20, 20, 1],
      [-20, 20, 20, 1],
    ]
  }
}


let tf = new TF(0, 0, 0, WIDTH / 2, HEIGHT / 2, 0)
let cam = new CAM(1, 1, 0, 0)
let cube = new Cube()
let position
let project
let vertice
let vp

/**
 * @param {p5} p5
 */
const script = function (p5) {
  p5.setup = () => {
    p5.frameRate(60);
    p5.createCanvas(WIDTH, HEIGHT);
    cam.tf.translate(WIDTH / 2, HEIGHT / 2, 40).rotateX(PI / 6).rotateY(PI / 6)

  };
  p5.draw = () => {
    p5.background(50);
    p5.ellipseMode(p5.RADIUS);
    // cam.tf.rotateZ(0.1)
    for (vertice of cube.vertices) {
      vp = nj.array(vertice).reshape(4, 1)
      project = cam.project(vp)
      const x = project.get(0, 0)
      const y = project.get(0, 1)
      const z = project.get(0, 2)
      p5.circle(x, y, 100 / z)
    }
    // position = tf.translate(1, 1, 0.0).rotateZ(0.01).position()
    // project = cam.project(position)
    // const x = project.get(0, 0)
    // const y = project.get(0, 1)
    // const z = project.get(0, 2)
    // p5.circle(x, y, 100 / z)
  };
};
new p5(script);
