import p5 from "p5";
import { factoryProxy } from "../common";
import { FaceLandmarkDetection } from "../common/MediaPipeCommon";

const v = factoryProxy(
  {
    CANVAS_HEIGHT: 600,
    CANVAS_WIDTH: 600,
    fps: 12,
    videoCapture: new p5.Element("video"),
    canvas: new p5.Element("canvas"),
    landmarks: [],
    point: null,
    landmark_points_68: [
      162, 234, 93, 58, 172, 136, 149, 148, 152, 377, 378, 365, 397, 288, 323,
      454, 389, 71, 63, 105, 66, 107, 336, 296, 334, 293, 301, 168, 197, 5, 4,
      75, 97, 2, 326, 305, 33, 160, 158, 133, 153, 144, 362, 385, 387, 263, 373,
      380, 61, 39, 37, 0, 267, 269, 291, 405, 314, 17, 84, 181, 78, 82, 13, 312,
      308, 317, 14, 87,
    ],
  },
  []
);

/**
 * @param {p5} p5
 */
const script = function (p5) {
  p5.setup = async () => {
    p5.frameRate(v.fps);
    v.videoCapture = p5.createCapture(p5.VIDEO, async (stream) => {
      await FaceLandmarkDetection.init("VIDEO");
      v.CANVAS_WIDTH = v.videoCapture?.width;
      v.CANVAS_HEIGHT = v.videoCapture?.height;
      v.canvas = p5.createCanvas(v.videoCapture.width, v.videoCapture.height);
      v.canvas.addClass("absolute z-[1]");
    });
    v.videoCapture.addClass("absolute");
    v.videoCapture.hide();
  };
  p5.draw = async () => {
    p5.clear();
    p5.background(200, 0);
    v.landmarks = FaceLandmarkDetection.detectForVideo(
      v.videoCapture.elt
    )?.faceLandmarks?.[0];

    if (!!v.landmarks?.length) {
      for (let index = 0; index < v.landmarks.length; index++) {
        v.point = v.landmarks[index];
        if (v.landmark_points_68.includes(index)) {
          p5.fill("#00ff00");
          p5.circle(v.point.x * v.CANVAS_WIDTH, v.point.y * v.CANVAS_HEIGHT, 4);
        } else {
          p5.circle(v.point.x * v.CANVAS_WIDTH, v.point.y * v.CANVAS_HEIGHT, 1);
        }
      }
    }
  };
};
new p5(script);
