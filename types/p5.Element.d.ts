import "p5";
export class ext {
  static teste() {
    console.log("AAAAA");
  }
}
declare module "p5" {
  export interface Element {
    width: number;
    height: number;
  }
  interface p5InstanceExtensions {
    createImgPromise(
      src: string,
      alt: string,
      crossOrigin: string
    ): Promise<Element>;
  }
}
