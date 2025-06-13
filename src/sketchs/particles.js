import p5 from "p5";
import data from "../json/graph.json";
const particles = [];
const START_RGB = [255, 0, 100];
const END_RGB = [200, 200, 255];
const NODE_ID = 17;
let image;
let lastImageRef = "";
/**
 * @param {p5} p5
 */
const script = function (p5) {
  p5.preload = () => {
    image = p5.loadImage("assets/particles/muzzle_03.png");
  };
  p5.setup = () => {
    p5.frameRate(20);
    p5.createCanvas(512, 512);
    p5.imageMode(p5.CENTER);
    p5.angleMode(p5.DEGREES);
  };
  p5.draw = () => {
    p5.background(27);
    GRAPH.runStep();
    const { numberOfParticles, imageRef } =
      GRAPH._nodes_by_id[NODE_ID].getOutputData(0);
    if (imageRef != lastImageRef) {
      image = p5.loadImage(`assets/particles/${imageRef}.png`);
    }
    lastImageRef = imageRef;
    for (let i = 0; i < numberOfParticles; i++) {
      let imgCopy = p5.createImage(image.width, image.height);
      imgCopy.copy(
        image,
        0,
        0,
        image.width,
        image.height,
        0,
        0,
        image.width,
        image.height
      );
      let p = new Particle(p5, imgCopy);
      particles.push(p);
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].show(p5);
      if (particles[i].finished()) {
        particles.splice(i, 1);
      }
    }
  };
};
new p5(script);

class Particle {
  /**
   *
   * @param {p5} p5
   */
  constructor(p5, image) {
    this.alpha = 255;
    this.image = image;
    this.p5 = p5;
    GRAPH.runStep();
    const { velocityX, velocityY, rotateDegress, size } =
      GRAPH._nodes_by_id[NODE_ID].getOutputData(0);
    this.vx = p5.random(-velocityX, velocityX);
    this.vy = p5.random(-velocityY, -1);
    this.rotate = p5.random(-rotateDegress, rotateDegress);
    this.width = parseInt(size);
    this.height = parseInt(size);
    this.y = 256;
    this.x = 256 - this.width / 2;
  }

  finished() {
    return this.alpha < 0;
  }

  update(p5) {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 10;
  }
  /**
   *
   * @param {p5} p5
   * @param {p5.Image} image
   */
  show(p5) {
    p5.push();
    p5.translate(this.x, this.y);
    p5.imageMode(p5.CENTER);
    p5.rotate(this.rotate);
    this.image.resize(this.width, this.height);
    this.image.rotate;
    this.image.loadPixels();
    for (let index = 0; index < this.image.pixels.length; index += 4) {
      this.image.pixels[index] =
        START_RGB[0] * (this.alpha / 255) + END_RGB[0] * (1 - this.alpha / 255);
      this.image.pixels[index + 1] =
        START_RGB[1] * (this.alpha / 255) + END_RGB[1] * (1 - this.alpha / 255);
      this.image.pixels[index + 2] =
        START_RGB[2] * (this.alpha / 255) + END_RGB[2] * (1 - this.alpha / 255);
      this.image.pixels[index + 3] = Math.min(
        this.alpha,
        this.image.pixels[index + 3]
      );
    }
    this.image.updatePixels();
    p5.image(this.image, 0, 0, this.width, this.height);
    p5.pop();
  }
}
// Create the graph and canvas
var graph = new LGraph();
new LGraphCanvas("#mycanvas", graph);

// Define the sum function and wrap it as a node
function particleFactory(
  velocityX,
  velocityY,
  numberOfParticles,
  rotateDegress,
  size,
  imageRef
) {
  return {
    velocityX,
    velocityY,
    numberOfParticles,
    rotateDegress,
    size,
    imageRef,
  };
}

LiteGraph.wrapFunctionAsNode(
  "mynodes/particleFactory",
  particleFactory,
  ["Number", "Number", "Number", "Number", "Number", "String"],
  "Object"
);

graph.configure(data);
window.GRAPH = graph;
graph.runStep();
