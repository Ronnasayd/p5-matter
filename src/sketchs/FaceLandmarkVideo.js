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

    v.video = p5.createVideo(
      "https://rr13---sn-pmcg-4vgs.googlevideo.com/videoplayback?expire=1686210878&ei=3jSBZPySG5m01wK7u4KACQ&ip=79.142.79.63&id=o-AFF0OrsYtZIedK35fYWa9_QK4fjb3sZP5-YdtH6lTbh7&itag=22&source=youtube&requiressl=yes&spc=qEK7B5fFam9IrYeDs--9297HipgA6fPCEB_xAtLbyg&vprv=1&svpuc=1&mime=video%2Fmp4&ns=1Iqz5Qcu7E24mTjBKNw2YBwN&cnr=14&ratebypass=yes&dur=10.193&lmt=1618595629387277&fexp=24007246,24350018&beids=24350018&c=WEB&txp=6316222&n=yQs9Ldz7j1BQ9Q&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Ccnr%2Cratebypass%2Cdur%2Clmt&sig=AOq0QJ8wRQIgb8A2EpbuphHo3dxatyIX_xShMzquhPYzHcSB4LCfxCMCIQD7Kk9Go34gwGy8AN8ukyNoH6xT4B9qewcULzrt624Nlw%3D%3D&title=BELLA%20POARCH%20FACE%20EMOJI%20%7C%20TIKTOK%20COMPILATION&rm=sn-1gie67s&req_id=c4bd1885c7c5a3ee&ipbypass=yes&redirect_counter=2&cm2rm=sn-8p52xgnvo5a-uixe7l&cms_redirect=yes&cmsv=e&mh=E2&mip=2804:5d34:a79:7b00:31d8:b507:f865:fd0a&mm=29&mn=sn-pmcg-4vgs&ms=rdu&mt=1686188461&mv=m&mvi=13&pcm2cms=yes&pl=48&lsparams=ipbypass,mh,mip,mm,mn,ms,mv,mvi,pcm2cms,pl&lsig=AG3C_xAwRQIhALjH_ksgKDg8O7sSx5Uo94zjmLI9u7JxUJfV_9MPsSLhAiAmgvwT3YT1Yg4Ao8K-plXpHWOJWsJbGn0hgOvlIsL39g%3D%3D",
      (e) => {
        v.video.volume(0);
        v.video.loop();
        v.video.size((600 * v.video.width) / v.video.height, 600);
        v.video.addClass("absolute z-[0] top-0");
        v.canvas = p5
          .createCanvas(v.video.width, v.video.height)
          .addClass(`absolute z-[1] w-full h-full`);
      }
    );
    await FaceLandmarkDetection.init("VIDEO");
  };
  p5.draw = async () => {
    p5.clear();
    v.faceLandmarks = (
      await FaceLandmarkDetection.detectForVideo(v.video.elt)
    )?.faceLandmarks?.[0];
    if (v.faceLandmarks.length) {
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
