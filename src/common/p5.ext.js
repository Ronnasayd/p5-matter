import p5 from "p5";

p5.prototype.createImgPromise = function (
  src = "",
  alt = "",
  crossOrigin = ""
) {
  return new Promise((resolve, reject) => {
    this.createImg(src, alt, crossOrigin, (img) => {
      resolve(img);
    });
  });
};
