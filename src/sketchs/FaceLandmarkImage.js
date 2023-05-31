import { Delaunay } from "d3-delaunay";
import p5 from "p5";
import { factoryProxy, landmarks2Points } from "../common";
import { FaceLandmarkDetection } from "../common/MediaPipeCommon";

const v = factoryProxy({
  CANVAS_WIDTH: 600,
  CANVAS_HEIGHT: 600,
  fps: 30,
  refImg_1: null,
  faceLandmarks_1: [],
  delaunay: [],
});

/**
 * @param {p5} p5
 */
const script = function (p5) {
  p5.createFileInput(async function (file) {
    v.refImg_1 = p5.createImg(file.data);
    v.refImg_1.elt.onload = async (e) => {
      v.faceLandmarks_1 = (
        await FaceLandmarkDetection.detectForImage(v.refImg_1.elt)
      ).faceLandmarks[0];
    };
  });
  p5.setup = async () => {
    await FaceLandmarkDetection.init("IMAGE");
    p5.frameRate(v.fps);
    p5.createCanvas(v.CANVAS_WIDTH, v.CANVAS_HEIGHT);
  };
  p5.draw = () => {
    p5.background(250);
    if (!!v.faceLandmarks_1) {
      p5.noFill();
      p5.stroke("#00aaff");
      v.delaunay = Delaunay.from(
        landmarks2Points(v.faceLandmarks_1, v.CANVAS_WIDTH, v.CANVAS_HEIGHT)
      ).trianglePolygons();
      for (const point of v.delaunay) {
        p5.triangle(
          point[0][0],
          point[0][1],
          point[1][0],
          point[1][1],
          point[2][0],
          point[2][1]
        );
      }
    }
  };
};
new p5(script);
