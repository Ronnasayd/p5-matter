//@ts-check
/// <reference path="../../types/p5.d.ts" />

import p5 from "p5";
import { WithOpenCV, factoryProxy } from "../common";
import "../common/p5.ext";

/**  @typedef {import('opencv-ts').default} opencv */
const v = factoryProxy(
  {
    width: 500,
    height: 500,
    fps: 60,
    canvas: new p5.Element("canvas"),
    videoCapture: new p5.Element("video"),
    /** @type {opencv['Mat']|null} */ src: null,
    /** @type {opencv['VideoCapture']|null} */ capture: null,
  },
  []
);

/**  @param {p5} p5 */
const script = function (p5) {
  p5.setup = () => {
    p5.frameRate(v.fps);
    v.canvas = p5.createCanvas(v.width, v.height);
    v.videoCapture = p5.createCapture(p5.VIDEO);

    WithOpenCV.setup((cv) => {
      v.videoCapture.size(v.width, v.height);
      v.videoCapture.hide();
      v.capture = new cv.VideoCapture(v.videoCapture.elt);
      v.src = new cv.Mat(
        v.videoCapture.width,
        v.videoCapture.height,
        cv.CV_8UC4
      );
    });
  };
  p5.draw = () => {
    WithOpenCV.run((cv) => {
      if (v.src) {
        v?.capture?.read(v.src);
        cv.imshow(v.canvas.elt, v.src);
      }
    });
  };
};
new p5(script);
