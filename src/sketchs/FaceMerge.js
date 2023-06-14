import { Delaunay } from "d3-delaunay";
import p5 from "p5";
import { WithOpenCV, factoryProxy } from "../common";
import { FaceLandmarkDetection } from "../common/MediaPipeCommon";
import "../common/p5.ext";

const v = factoryProxy({
  alpha: 0.5,
  canvas: new p5.Element("canvas"),
  cvImgs: [],
  imgs: [],
  points: [],
  delaunay: [],
  maps: [],
  imaps: [],
  triangles: [],
  landmark_points_68: [
    162, 234, 93, 58, 172, 136, 149, 148, 152, 377, 378, 365, 397, 288, 323,
    454, 389, 71, 63, 105, 66, 107, 336, 296, 334, 293, 301, 168, 197, 5, 4, 75,
    97, 2, 326, 305, 33, 160, 158, 133, 153, 144, 362, 385, 387, 263, 373, 380,
    61, 39, 37, 0, 267, 269, 291, 405, 314, 17, 84, 181, 78, 82, 13, 312, 308,
    317, 14, 87,
  ],
  getTriangles: function (delaunay) {
    const triangles = [];
    for (let index = 0; index < delaunay.triangles.length; index = index + 3) {
      const t0 = delaunay.triangles[index];
      const t1 = delaunay.triangles[index + 1];
      const t2 = delaunay.triangles[index + 2];

      const p0x = delaunay.points[t0 * 2];
      const p0y = delaunay.points[t0 * 2 + 1];

      const p1x = delaunay.points[t1 * 2];
      const p1y = delaunay.points[t1 * 2 + 1];

      const p2x = delaunay.points[t2 * 2];
      const p2y = delaunay.points[t2 * 2 + 1];

      triangles.push([p0x, p0y, p1x, p1y, p2x, p2y]);
    }
    return triangles;
  },
  getKeypoints: function (faceLandmarks, width, height) {
    const points = [];
    const map = {};
    const imap = {};
    const limit = [
      [0, 0],
      [0, height / 2],
      [width - 1, height / 2],
      [0, height - 1],
      [width / 2, 0],
      [width - 1, 0],
      [width / 2, height - 1],
      [width - 1, height - 1],
    ];
    for (const index of v.landmark_points_68) {
      points.push([
        faceLandmarks[index].x * width,
        faceLandmarks[index].y * height,
      ]);
      map[
        `${faceLandmarks[index].x * width}:${faceLandmarks[index].y * height}`
      ] = index;

      imap[index] = [
        faceLandmarks[index].x * width,
        faceLandmarks[index].y * height,
      ];
    }
    for (let index = 0; index < limit.length; index++) {
      const point = limit[index];
      const refIndex = index + 1000;
      points.push([point[0], point[1]]);
      map[`${point[0]}:${point[1]}`] = refIndex;
      imap[refIndex] = [point[0], point[1]];
    }

    return [points, map, imap];
  },
});

/**
 * @typedef {import('opencv-ts').default} opencv
 */
/**
 * @param {p5} p5
 */
const script = function (p5) {
  p5.setup = async () => {
    p5.frameRate(60);

    v.canvas = p5.createCanvas(300, 440);

    await FaceLandmarkDetection.init("IMAGE");

    WithOpenCV.setup(async (/**  @type {opencv}  */ cv) => {
      let img;
      img = await p5.createImgPromise(
        "https://img.freepik.com/premium-photo/beautiful-face-young-adult-woman-with-clean-fresh-skin_78203-1897.jpg",
        "img2",
        "Anonymous"
      );
      processImage(0, img, cv);
      img = await p5.createImgPromise(
        "https://img.freepik.com/fotos-gratis/retrato-da-vista-frontal-de-um-rosto-de-mulher-jovem-e-bela_186202-460.jpg?w=2000",
        "img1",
        "Anonymous"
      );
      processImage(1, img, cv);
      for (const delaunay of v.delaunay) {
        v.triangles.push(v.getTriangles(delaunay));
      }
      for (const triangle of v.triangles[0]) {
        const [p1x1, p1y1, p1x2, p1y2, p1x3, p1y3] = triangle;

        const index1 = v.maps[0][`${p1x1}:${p1y1}`];
        const index2 = v.maps[0][`${p1x2}:${p1y2}`];
        const index3 = v.maps[0][`${p1x3}:${p1y3}`];

        const [p2x1, p2y1] = v.imaps[1][index1];
        const [p2x2, p2y2] = v.imaps[1][index2];
        const [p2x3, p2y3] = v.imaps[1][index3];

        const t1 = cv.matFromArray(3, 1, cv.CV_32FC2, [
          p1x1,
          p1y1,
          p1x2,
          p1y2,
          p1x3,
          p1y3,
        ]);

        const t2 = cv.matFromArray(3, 1, cv.CV_32FC2, [
          p2x1,
          p2y1,
          p2x2,
          p2y2,
          p2x3,
          p2y3,
        ]);

        const r1 = cv.boundingRect(t1);
        const r2 = cv.boundingRect(t2);

        const mask = new cv.Mat.zeros(
          new cv.Size(r2.width, r2.height),
          cv.CV_8UC1
        );

        const t1Rect = cv.matFromArray(3, 1, cv.CV_32FC2, [
          p1x1 - r1.x,
          p1y1 - r1.y,
          p1x2 - r1.x,
          p1y2 - r1.y,
          p1x3 - r1.x,
          p1y3 - r1.y,
        ]);
        const t2Rect = cv.matFromArray(3, 1, cv.CV_32FC2, [
          p2x1 - r2.x,
          p2y1 - r2.y,
          p2x2 - r2.x,
          p2y2 - r2.y,
          p2x3 - r2.x,
          p2y3 - r2.y,
        ]);

        const t2RectInt = cv.matFromArray(3, 1, cv.CV_32SC2, [
          p2x1 - r2.x,
          p2y1 - r2.y,
          p2x2 - r2.x,
          p2y2 - r2.y,
          p2x3 - r2.x,
          p2y3 - r2.y,
        ]);

        cv.fillConvexPoly(mask, t2RectInt, new cv.Scalar(255), cv.LINE_8, 0);
        const inverseMask = new cv.Mat();
        cv.bitwise_not(mask, inverseMask);

        const rect1 = new cv.Rect(r1.x, r1.y, r1.width, r1.height);
        const rect2 = new cv.Rect(r2.x, r2.y, r2.width, r2.height);

        const roi1 = v.cvImgs[0].roi(rect1);
        const roi2 = v.cvImgs[1].roi(rect2);

        const size = new cv.Size(r2.width, r2.height);

        const transform = cv.getAffineTransform(t1Rect, t2Rect);

        const dst = new cv.Mat();

        cv.warpAffine(
          roi1,
          dst,
          transform,
          size,
          cv.INTER_LINEAR,
          cv.BORDER_REFLECT_101
        );
        const dst2 = new cv.Mat();
        const dst3 = new cv.Mat();
        const dst4 = new cv.Mat();
        const dst5 = new cv.Mat();

        cv.bitwise_and(dst, dst, dst2, mask);
        cv.bitwise_and(roi2, roi2, dst3, inverseMask);

        cv.bitwise_or(dst2, dst3, dst4);
        cv.addWeighted(dst4, v.alpha, roi2, 1 - v.alpha, 0, dst5);

        dst5.copyTo(roi2);
      }

      cv.imshow(v.canvas.elt, v.cvImgs[1]);
    });
    p5.noLoop();
  };
  p5.draw = () => {};
};
new p5(script);
/**
 * @param {number} index
 * @param {p5.Element} img
 * @param {opencv} cv
 */
function processImage(index, img, cv) {
  v.imgs[index] = img;
  v.cvImgs[index] = cv.imread(img.elt);
  img.addClass("h-[150px] inline-block");

  const allPoints = FaceLandmarkDetection.detectForImage(img.elt)
    ?.faceLandmarks?.[0];
  const [points, map, imap] = v.getKeypoints(allPoints, img.width, img.height);
  v.points[index] = points;
  v.maps[index] = map;
  v.imaps[index] = imap;
  v.delaunay[index] = Delaunay.from(points);
}
