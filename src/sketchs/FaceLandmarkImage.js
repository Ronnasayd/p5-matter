import { Delaunay } from "d3-delaunay";
import p5 from "p5";
import { factoryProxy, landmarks2Points } from "../common";
import { FaceLandmarkDetection } from "../common/MediaPipeCommon";

const v = factoryProxy({
  CANVAS_WIDTH: 550,
  CANVAS_HEIGHT: 550,
  fps: 30,
  refImg: null,
  canvas: null,
  faceLandmarks: [],
  delaunay: [],
  landmark_points_68: [
    162, 234, 93, 58, 172, 136, 149, 148, 152, 377, 378, 365, 397, 288, 323,
    454, 389, 71, 63, 105, 66, 107, 336, 296, 334, 293, 301, 168, 197, 5, 4, 75,
    97, 2, 326, 305, 33, 160, 158, 133, 153, 144, 362, 385, 387, 263, 373, 380,
    61, 39, 37, 0, 267, 269, 291, 405, 314, 17, 84, 181, 78, 82, 13, 312, 308,
    317, 14, 87,
  ],
});

/**
 * @param {p5} p5
 */
const script = function (p5) {
  p5.createFileInput(async function (file) {
    v.refImg = p5.createImg(file.data);
    v.refImg.addClass("absolute z-[0] h-[550px]");
    v.refImg.elt.onload = async (e) => {
      v.CANVAS_WIDTH = (v.refImg.width / v.refImg.height) * v.CANVAS_HEIGHT;
      v.canvas = p5.createCanvas(v.CANVAS_WIDTH, v.CANVAS_HEIGHT);
      v.canvas.addClass("absolute z-[1]");
      v.faceLandmarks = (
        await FaceLandmarkDetection.detectForImage(v.refImg.elt)
      ).faceLandmarks[0];
    };
  });
  p5.setup = async () => {
    await FaceLandmarkDetection.init("IMAGE");
    p5.frameRate(v.fps);
  };
  p5.draw = () => {
    p5.background(255, 0);
    if (!!v.faceLandmarks.length) {
      p5.fill("#ff0000");
      for (const index of v.landmark_points_68) {
        p5.circle(
          v.faceLandmarks[index].x * v.CANVAS_WIDTH,
          v.faceLandmarks[index].y * v.CANVAS_HEIGHT,
          4
        );
      }
      p5.noFill();
      p5.stroke(0, 255, 50, 1);
      p5.strokeWeight(2);
      v.delaunay = Delaunay.from(
        landmarks2Points(v.faceLandmarks, v.CANVAS_WIDTH, v.CANVAS_HEIGHT)
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
