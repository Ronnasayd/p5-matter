//@ts-check
/// <reference path="../../types/p5.d.ts" />

import "../common/p5.ext";

import p5 from "p5";
import { WithOpenCV, factoryProxy } from "../common";
import { FaceLandmarkDetection } from "../common/MediaPipeCommon";
/** @typedef {import('opencv-ts').default} opencv */

const v = factoryProxy({
  width: 600,
  height: 800,
  fps: 24,
  index: 0,
  /** @type {undefined|number[][]}*/ points: undefined,
  img_1: new p5.Element("img"),
  canvas: new p5.Element("canvas"),
  /** @type {opencv['Mat']|null} */ src_1: null,
});

/** @param {p5} p5 */
const script = function (p5) {
  p5.mouseMoved = function (event) {
    const mouse = p5.createVector(
      event?.offsetX / v.canvas.width,
      event?.offsetY / v.canvas.height
    );
    let minDistance = Infinity;
    if (v.points) {
      for (let index = 0; index < v.points?.length; index++) {
        const point = v?.points[index];
        const vpoint = p5.createVector(
          point[0] / v.img_1.width,
          point[1] / v.img_1.height
        );
        const distance = mouse.dist(vpoint);
        if (distance <= minDistance) {
          minDistance = distance;
          v.index = index;
        }
      }
    }
  };

  p5.setup = async () => {
    p5.frameRate(v.fps);
    await FaceLandmarkDetection.init("IMAGE");
    WithOpenCV.setup(async (cv) => {
      v.img_1 = await p5.createImgPromise(
        "https://previews.123rf.com/images/luckybusiness/luckybusiness1212/luckybusiness121200114/16860945-smiling-face-of-a-beautiful-woman-with-health-whitest-teeth.jpg"
      );
      v.width = v.img_1.width;
      v.height = v.img_1.height;
      v.canvas = p5.createCanvas(v.width, v.height);

      v.src_1 = cv.imread(v.img_1.elt);
      v.points = (
        await FaceLandmarkDetection.detectForImage(v.img_1.elt)
      )?.faceLandmarks?.[0]?.map((p) => [
        p.x * v.img_1.width,
        p.y * v.img_1.height,
      ]);
      v.img_1.hide();
    });
  };
  p5.draw = () => {
    p5.clear();
    WithOpenCV.run((cv) => {
      if (v.points && v.src_1) {
        cv.imshow(v.canvas.elt, v.src_1);
        p5.fill("#00ffff");
        for (const point of v.points) {
          p5.circle(point[0], point[1], 5);
        }

        p5.fill("#ff0000");
        p5.stroke(0);
        p5.textSize(20);
        p5.textStyle(p5.BOLD);
        p5.circle(v.points[v.index][0], v.points[v.index][1], 10);
        p5.text(v.index, v.points[v.index][0], v.points[v.index][1]);
      }
    });
  };
};
new p5(script);
