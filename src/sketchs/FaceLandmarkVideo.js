import p5 from "p5";
import { factoryProxy, keypoints68 } from "../common";
import { FaceLandmarkDetection } from "../common/MediaPipeCommon";

const v = factoryProxy({
  video: new p5.Element("video"),
  canvas: new p5.Element("canvas"),
  faceLandmarks: [],
});

/**
 * @typedef {import('opencv-ts').default} opencv
 */
/**
 * @param {p5} p5
 */
const script = function (p5) {
  p5.setup = async () => {
    p5.frameRate(24);

    v.video = p5.createVideo("/example.mp4", (e) => {
      v.video.volume(0);
      v.video.loop();
      v.video.size((600 * v.video.width) / v.video.height, 600);
      v.video.addClass("absolute z-[0] top-0");
      v.canvas = p5
        .createCanvas(v.video.width, v.video.height)
        .addClass(`absolute z-[1] w-full h-full`);
    });
    await FaceLandmarkDetection.init("VIDEO");
  };
  p5.draw = async () => {
    p5.clear();
    v.faceLandmarks = (
      await FaceLandmarkDetection.detectForVideo(v.video.elt)
    )?.faceLandmarks?.[0];
    if (!!v.faceLandmarks?.length) {
      p5.noFill();
      p5.stroke("#ff0000");
      p5.strokeWeight(2);
      p5.beginShape();
      for (const index of keypoints68.Contour) {
        p5.vertex(
          v.faceLandmarks[index].x * v.canvas.width,
          v.faceLandmarks[index].y * v.canvas.height
        );
      }
      p5.endShape(p5.CLOSE);

      p5.beginShape();
      for (const index of keypoints68.LeftEye) {
        p5.vertex(
          v.faceLandmarks[index].x * v.canvas.width,
          v.faceLandmarks[index].y * v.canvas.height
        );
      }
      p5.endShape(p5.CLOSE);

      p5.beginShape();
      for (const index of keypoints68.RightEye) {
        p5.vertex(
          v.faceLandmarks[index].x * v.canvas.width,
          v.faceLandmarks[index].y * v.canvas.height
        );
      }
      p5.endShape(p5.CLOSE);
      p5.beginShape();
      for (const index of keypoints68.Nose) {
        p5.vertex(
          v.faceLandmarks[index].x * v.canvas.width,
          v.faceLandmarks[index].y * v.canvas.height
        );
      }
      p5.endShape();

      p5.beginShape();
      for (const index of keypoints68.Mounth) {
        p5.vertex(
          v.faceLandmarks[index].x * v.canvas.width,
          v.faceLandmarks[index].y * v.canvas.height
        );
      }
      p5.endShape(p5.CLOSE);
    }
  };
};
new p5(script);
