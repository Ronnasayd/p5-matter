import "p5";

declare module "p5" {
  type VIDEO = "video";

  interface Element {
    width: number;
    height: number;
  }
  interface p5InstanceExtensions {
    readonly VIDEO: "video";
    createImgPromise(
      src: string,
      alt: string = "default",
      crossOrigin: string = "anonymous"
    ): Promise<Element>;
  }
}
