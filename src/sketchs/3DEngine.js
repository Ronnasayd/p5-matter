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
  constructor(WIDTH = 400, HEIGHT = 400, sx = 0, sy = 0, fov = 60 * PI / 180, tf = new TF(0, 0, 0, 0, 0, 0)) {
    this.sx = sx
    this.sy = sy
    this.fov = fov
    this.WIDTH = WIDTH
    this.HEIGHT = HEIGHT
    this.fx = this.WIDTH / (2 * Math.tan(this.fov / 2))
    this.fy = this.HEIGHT / (2 * Math.tan(this.fov / 2))
    this.tf = tf

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

    return nj.concatenate(this.intrisic.T, nj.array([0, 0, 0, 1]).reshape(4, 1)).T
  }

  getProjectMatrix() {
    return this.getIntrisic().dot(this.tf.matrix())
  }
  project(pos) {
    return this.getIntrisic().dot(this.tf.matrix().dot(pos))
  }
  /**
   * 
   * @param {number} WIDTH 
   * @param {number} HEIGHT 
   * @param {*} items 
   * @param {string} isWEBGL 
   * @param {p5} p5 
   */
  render(WIDTH, HEIGHT, items, isWEBGL, p5) {
    for (const item of items) {
      p5.beginShape()
      for (const vertice of item.vertices()) {
        let points = this.project(vertice)
        if (!!isWEBGL) {
          points = this.toCanvasWEBGL(WIDTH, HEIGHT, points)
        } else {
          points = this.toCanvas(WIDTH, HEIGHT, points)
        }
        p5.vertex(...points)
      }
      p5.endShape(p5.CLOSE)
    }
  }

  toCanvasWEBGL(WIDTH, HEIGHT, position) {

    let [x, y, w, _] = position.tolist()

    x = x / w
    y = y / w
    w = w / w


    const LEFT = - this.WIDTH / 2
    const RIGHT = this.WIDTH / 2
    const BOTTOM = -this.HEIGHT / 2
    const TOP = this.HEIGHT / 2

    const px = ((x - LEFT) / (RIGHT - LEFT)) / this.WIDTH
    const py = ((y - BOTTOM) / (TOP - BOTTOM)) / this.HEIGHT

    return [(px) * WIDTH, (py) * HEIGHT, w]
  }

  toCanvas(WIDTH, HEIGHT, position) {

    let [x, y, w, _] = position.tolist()

    x = x / w
    y = y / w
    w = w / w


    const LEFT = - this.WIDTH / 2
    const RIGHT = this.WIDTH / 2
    const BOTTOM = -this.HEIGHT / 2
    const TOP = this.HEIGHT / 2

    const px = ((x - LEFT) / (RIGHT - LEFT)) / this.WIDTH
    const py = ((y - BOTTOM) / (TOP - BOTTOM)) / this.HEIGHT

    return [(px + 0.5) * WIDTH, (py + 0.5) * HEIGHT, w]
  }
}

class CAMPerspective {
  constructor(near = 10, far = 10000, aspect = 1, fov = 60 * PI / 180, tf = new TF(0, 0, 0, 0, 0, -5)) {
    this.near = near
    this.far = far
    this.aspect = aspect
    this.fov = fov
    this.tf = tf
    this.top = near * Math.tan(fov / 2)
    this.bottom = -this.top
    this.right = this.top * aspect
    this.left = -this.right

  }


  getIntrisic() {
    // Webgl perspective intrisic matrix
    // In Opengl/Webgl matrix is column major so this matrix is in this format
    return nj.array([
      [2 * this.near / (this.right - this.left), 0, 0, 0],
      [0, -2 * this.near / (this.top - this.bottom), 0, 0,],
      [(this.right + this.left) / (this.right - this.left), (this.top + this.bottom) / (this.top - this.bottom), -(this.far + this.near) / (this.far - this.near), -1],
      [0, 0, -2 * this.far * this.near / (this.far - this.near), 0]
    ])

  }

  getProjectMatrix() {
    // How intrisic matrix is column major we use transposes
    return this.tf.matrix().T.dot(this.getIntrisic())
  }
  project(pos) {
    // (A*B)T = BT *AT
    pos = this.tf.matrix().dot(pos)
    return pos.T.dot(this.getIntrisic())
  }
  /**
   * 
   * @param {number} WIDTH 
   * @param {number} HEIGHT 
   * @param {*} items 
   * @param {string} isWEBGL 
   * @param {p5} p5 
   */
  render(WIDTH, HEIGHT, items, isWEBGL, p5) {
    for (const item of items) {
      p5.beginShape()
      for (const vertice of item.vertices()) {
        let points = this.project(vertice)
        if (!!isWEBGL) {
          points = this.toCanvasWEBGL(WIDTH, HEIGHT, points)
        } else {
          points = this.toCanvas(WIDTH, HEIGHT, points)
        }
        p5.vertex(points[0], points[1], points[2])
      }
      p5.endShape(p5.CLOSE)
    }
  }

  toCanvasWEBGL(WIDTH, HEIGHT, position) {

    let [x, y, z, w] = position.tolist()

    x = x / w
    y = y / w
    z = z / w
    w = w / w

    return [x, y, z, w]
  }


}
class Triangle {
  constructor(tf = new TF(0, 0, 0, 0, 0, 0), scale = [50, 50]) {
    this.tf = tf
    this.scale = scale
  }
  vertices() {
    const [x, y, z, _] = this.tf.position().tolist()
    const [sx, sy] = this.scale
    return [
      nj.array([x - sx, y - sy, z, 1]),
      nj.array([x + sx, y - sy, z, 1]),
      nj.array([x, y + sy, z, 1])
    ]
  }
}

class Model {
  constructor(model = null, tf = new TF(0, 0, 0, 0, 0, 0)) {
    this.model = model
    this.tf = tf
  }
}


const [WIDTH, HEIGHT] = [560, 560];
const PI = Math.PI;

let shader



const v = factoryProxy({
  // cam: new CAM(WIDTH, HEIGHT, WIDTH / 2, HEIGHT / 2, 60 * PI / 180, new TF(0, 0, 0, 0, 0, 1)),
  cam: new CAMPerspective(0.1, 1000, WIDTH / HEIGHT, 60 * PI / 180, new TF(0, 0, 0, 0, 0, -5)),
  model: new Model(null, new TF(0, 0, 0, 0, 0, 0)),
  triangles: [
    new Triangle(new TF(0, 0, 0, 0, 0, 0)),
    new Triangle(new TF(0, 0, 0, -200, 0, 0,)),
    new Triangle(new TF(0, 0, 0, 200, 0, 0))]
})

/**
 * @param {p5} p5
 */
const script = function (p5) {
  function moveCam(delta) {

    if (p5.keyIsDown(87)) {
      v.cam.tf.moveUp(delta)
    }
    if (p5.keyIsDown(83)) {
      v.cam.tf.moveUp(-delta)
    }

    if (p5.keyIsDown(65)) {
      v.cam.tf.moveRight(-delta)
    }
    if (p5.keyIsDown(68)) {
      v.cam.tf.moveRight(delta)
    }
  }
  p5.mouseWheel = event => {
    v.cam.tf.moveForward(event.delta > 0 ? 2 : -2)
  }

  p5.preload = async () => {
    shader = p5.loadShader('shader.vert', 'shader.frag')
    v.model.model = p5.loadModel("/example.obj")
  }

  p5.setup = () => {
    p5.frameRate(60);
    v.renderer = p5.createCanvas(WIDTH, HEIGHT, p5.WEBGL);
    p5.ellipseMode(p5.CENTER)
    p5.rectMode(p5.CENTER)
    p5.noStroke()

    // // generate a p5 camera with the same values of mine for tests
    // v.camera = p5.createCamera()
    // p5.setCamera(v.camera)
    // p5.perspective(60 * PI / 180, WIDTH / HEIGHT, 0.1, 1000)
    // v.camera.setPosition(0, 0, 5)



  };
  p5.draw = () => {
    // controls to move cam
    moveCam(0.1)
    p5.clear()


    if (!!shader) {
      p5.shader(shader)
      // pass values to shaders
      shader.setUniform('myColor', [1.0, 0.0, 1.0]); // send red as a uniform
      shader.setUniform('myuProjectionMatrix', v.cam.getIntrisic().tolist().flat())
      shader.setUniform('myuModelViewMatrix', v.model.tf.matrix().T.dot(v.cam.tf.matrix().T).tolist().flat())


      v.model.tf.rotateY(0.005).rotateX(0.005).rotateZ(0.005)
      p5.model(v.model.model)

      p5.resetShader()

      // // compare my values with p5 values
      // console.log(nj.array([...v.renderer._curCamera.cameraMatrix.mat4]).reshape(4, 4) + "")
      // console.log(v.cam.tf.matrix().T + "")
      // console.log(nj.array([...v.renderer._curCamera.projMatrix.mat4]).reshape(4, 4) + "")
      // console.log(v.cam.getIntrisic() + "")
      // console.log(nj.array([...v.renderer.uMVMatrix.mat4]).reshape(4, 4) + "")
      // console.log(v.model.tf.matrix().T.dot(v.cam.tf.matrix().T) + "")
    }


  };
};
new p5(script);