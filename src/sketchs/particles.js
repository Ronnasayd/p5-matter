import p5 from "p5";
const particles = [];
const startRGB = [255, 0, 100];
const endRGB = [200, 200, 255];

let image, pixels;
/**
 * @param {p5} p5
 */
const script = function (p5) {
  p5.preload = () => {
    image = p5.loadImage("assets/particles/spark_01.png");
  };
  p5.setup = () => {
    p5.frameRate(20);
    p5.createCanvas(512, 512);
    p5.imageMode(p5.CENTER);
    p5.angleMode(p5.DEGREES);
  };
  p5.draw = () => {
    p5.background(50);
    for (let i = 0; i < 2; i++) {
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
    this.width = 50;
    this.height = 50;
    this.y = 256;
    this.x = 256 - this.width;
    this.rotate = p5.random(-45, 45);
    this.vx = p5.random(-1, 1);
    this.vy = p5.random(-8, -1);
    this.alpha = 255;
    this.image = image;
    this.p5 = p5;
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
        startRGB[0] * (this.alpha / 255) + endRGB[0] * (1 - this.alpha / 255);
      this.image.pixels[index + 1] =
        startRGB[1] * (this.alpha / 255) + endRGB[1] * (1 - this.alpha / 255);
      this.image.pixels[index + 2] =
        startRGB[2] * (this.alpha / 255) + endRGB[2] * (1 - this.alpha / 255);
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
