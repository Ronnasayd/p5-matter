import { Delaunay } from "d3-delaunay";
import p5 from "p5";
import { WithOpenCV, factoryProxy } from "../common";
import { FaceLandmarkDetection } from "../common/MediaPipeCommon";

const v = factoryProxy({
  ref: [],
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
    // p5.noLoop();
    p5.frameRate(60);
    v.canvas = p5.createCanvas(460, 460);

    await FaceLandmarkDetection.init("IMAGE");

    WithOpenCV.setup((/**  @type {opencv}  */ cv) => {
      p5.createImg(
        "https://st.depositphotos.com/2325841/2534/i/600/depositphotos_25349029-stock-photo-perfect-skin.jpg",
        "img1",
        "Anonymous",
        (img) => processImage(img, cv)
      );

      p5.createImg(
        "https://img.freepik.com/fotos-gratis/rosto-feminino-caucasiano-lindo-com-maquiagem-brilhante_186202-2064.jpg",
        "img2",
        "Anonymous",
        (img) => processImage(img, cv)
      );
    });
  };
  p5.draw = () => {
    if (v.imgs.length === 2) {
      WithOpenCV.run((/**  @type {opencv}  */ cv) => {
        for (const delaunay of v.delaunay) {
          v.triangles.push(v.getTriangles(delaunay));
        }
        for (const triangle of [v.triangles[0][6]]) {
          const [p1x1, p1y1, p1x2, p1y2, p1x3, p1y3] = triangle;

          const index1 = v.maps[0][`${p1x1}:${p1y1}`];
          const index2 = v.maps[0][`${p1x2}:${p1y2}`];
          const index3 = v.maps[0][`${p1x3}:${p1y3}`];

          const [p2x1, p2y1] = v.imaps[1][index1];
          const [p2x2, p2y2] = v.imaps[1][index2];
          const [p2x3, p2y3] = v.imaps[1][index3];
          v.ref = [p2x1, p2y1, p2x2, p2y2, p2x3, p2y3];

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
            cv.CV_32F
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

          cv.fillConvexPoly(mask, t2RectInt, new cv.Scalar(255), cv.LINE_AA, 0);

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
        }
        p5.noLoop();
        cv.imshow(v.canvas.elt, v.cvImgs[1]);
        p5.triangle(...v.ref);
      });
    }
  };
};
new p5(script);
/**
 *
 * @param {p5.Element} img
 * @param {opencv} cv
 */
function processImage(img, cv) {
  v.imgs.push(img);
  v.cvImgs.push(cv.imread(img.elt));
  img.addClass("h-[150px] inline-block");

  const allPoints = FaceLandmarkDetection.detectForImage(img.elt)
    ?.faceLandmarks?.[0];
  const [points, map, imap] = v.getKeypoints(allPoints, img.width, img.height);
  v.points.push(points);
  v.maps.push(map);
  v.imaps.push(imap);
  v.delaunay.push(Delaunay.from(points));
}
