//@ts-check
/// <reference path="../../types/p5.d.ts" />

import p5 from "p5";
import { WithOpenCV, factoryProxy, getPointsBySVG } from "../common";
import "../common/p5.ext";
/**
 * @typedef {import('opencv-ts').default} opencv
 */

const v = factoryProxy({
  width: 0,
  height: 0,
  fps: 60,
  imgRef: new p5.Element("img"),
  imgFilter: new p5.Element("img"),
  canvas: new p5.Element("canvas"),
  glassPoints: {},
});

/**
 * @param {p5} p5
 */
const script = function (p5) {
  p5.setup = () => {
    WithOpenCV.setup(async (cv) => {
      v.glassPoints = await getPointsBySVG("/filters/oculos_ref.svg");
      v.imgRef = await p5.createImgPromise(
        "https://img.freepik.com/fotos-gratis/retrato-da-vista-frontal-de-um-rosto-de-mulher-jovem-e-bela_186202-460.jpg?w=2000",
        "img",
        "anonymous"
      );
      v.imgRef.addClass("absolute z-0 h-full");
      v.height = p5.windowHeight;
      v.width = v.imgRef.width;
      v.canvas = p5.createCanvas(v.width, v.height).addClass("absolute z-[1]");

      v.imgFilter = await p5.createImgPromise(
        "/filters/oculos.png",
        "filter",
        "anonymous"
      );
    });
    p5.noLoop();
  };
  p5.draw = () => {
    WithOpenCV.run((cv) => {});
  };
};
new p5(script);
