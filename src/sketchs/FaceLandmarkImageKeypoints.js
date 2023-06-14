import { Delaunay } from "d3-delaunay";
import p5 from "p5";
import { factoryProxy } from "../common";
import { FaceLandmarkDetection } from "../common/MediaPipeCommon";
import "../common/p5.ext";

const v = factoryProxy({
  CANVAS_WIDTH: 550,
  CANVAS_HEIGHT: 550,
  fps: 30,
  refImg: new p5.Element("img"),
  canvas: new p5.Element("canvas"),
  getTriangles: function () {
    const triangles = [];
    for (
      let index = 0;
      index < this.delaunay.triangles.length;
      index = index + 3
    ) {
      const t0 = this.delaunay.triangles[index];
      const t1 = this.delaunay.triangles[index + 1];
      const t2 = this.delaunay.triangles[index + 2];

      const p0x = this.delaunay.points[t0 * 2];
      const p0y = this.delaunay.points[t0 * 2 + 1];

      const p1x = this.delaunay.points[t1 * 2];
      const p1y = this.delaunay.points[t1 * 2 + 1];

      const p2x = this.delaunay.points[t2 * 2];
      const p2y = this.delaunay.points[t2 * 2 + 1];

      triangles.push([p0x, p0y, p1x, p1y, p2x, p2y]);
    }
    return triangles;
  },
  getKeypoints: function () {
    const points = [];
    const map = {};
    const imap = {};
    for (const index of v.landmark_points_68) {
      points.push([
        this.faceLandmarks[index].x * v.CANVAS_WIDTH,
        this.faceLandmarks[index].y * v.CANVAS_HEIGHT,
      ]);
      map[
        `${this.faceLandmarks[index].x * v.CANVAS_WIDTH}:${
          this.faceLandmarks[index].y * v.CANVAS_HEIGHT
        }`
      ] = index;

      imap[index] = [
        this.faceLandmarks[index].x * v.CANVAS_WIDTH,
        this.faceLandmarks[index].y * v.CANVAS_HEIGHT,
      ];
    }

    return [points, map, imap];
  },
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
  p5.setup = async () => {
    await FaceLandmarkDetection.init("IMAGE");
    p5.frameRate(v.fps);
    v.refImg = await p5.createImgPromise(
      "https://img.freepik.com/fotos-gratis/retrato-da-vista-frontal-de-um-rosto-de-mulher-jovem-e-bela_186202-460.jpg?w=2000",
      "img1",
      "Anonymous"
    );
    v.refImg.addClass("absolute z-[0] h-[550px]");
    v.CANVAS_WIDTH = (v.refImg.width / v.refImg.height) * v.CANVAS_HEIGHT;
    v.canvas = p5.createCanvas(v.CANVAS_WIDTH, v.CANVAS_HEIGHT);
    v.canvas.addClass("absolute z-[1]");
    v.faceLandmarks = (
      await FaceLandmarkDetection.detectForImage(v.refImg.elt)
    ).faceLandmarks[0];
  };
  p5.draw = () => {
    p5.background(255, 0);
    if (!!v.faceLandmarks.length) {
      const [points, map, imap] = v.getKeypoints();
      v.delaunay = Delaunay.from(points);

      p5.noFill();
      p5.stroke(0, 255, 250, 1);
      p5.strokeWeight(2);
      for (const triangle of v.getTriangles()) {
        p5.triangle(...triangle);
      }

      p5.fill("#ff0000");
      for (const point of points) {
        p5.circle(point[0], point[1], 4);
        p5.text(map[`${point[0]}:${point[1]}`], point[0], point[1]);
      }
    }
  };
};
new p5(script);
