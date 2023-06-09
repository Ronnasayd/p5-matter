import "p5";
declare module "p5" {
  export interface Element extends p5.Element {
    width: number;
    height: number;
  }
}
