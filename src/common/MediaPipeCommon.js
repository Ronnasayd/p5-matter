import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export class FaceLandmarkDetection {
  /**
   *
   * @param {'VIDEO'|'IMAGE'} runningMode
   */
  static async init(runningMode) {
    this.vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );
    this.faceLandmarker = await FaceLandmarker.createFromOptions(this.vision, {
      baseOptions: {
        delegate: "GPU",
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
      },
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
      runningMode,
      numFaces: 1,
    });
  }

  static detectForImage(image) {
    if (!!this.faceLandmarker) {
      return this.faceLandmarker.detect(image);
    }
    return { faceLandmarkers: [] };
  }
  static detectForVideo(video) {
    if (!!this.faceLandmarker) {
      return this.faceLandmarker.detectForVideo(video, Date.now());
    }
    return { faceLandmarkers: [] };
  }
}
