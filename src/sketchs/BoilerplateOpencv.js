//@ts-check
/// <reference path="../../types/p5.d.ts" />

import p5 from "p5";
import { WithOpenCV, factoryProxy } from "../common";
import "../common/p5.ext";

/** @typedef {import('opencv-ts').default} opencv */

const v = factoryProxy(
  {
    width: 500,
    height: 500,
    fps: 60,
    canvas: new p5.Element("canvas"),
  },
  []
);

/** @param {p5} p5 */
const script = function (p5) {
  p5.setup = () => {
    p5.frameRate(v.fps);
    v.canvas = p5.createCanvas(v.width, v.height);
    WithOpenCV.setup((cv) => {});
  };
  p5.draw = () => {
    WithOpenCV.run((cv) => {});
  };
};
new p5(script);
