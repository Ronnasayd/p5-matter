// webgl requires that the first line of the fragment shader specify the precision
// precision is dependent on device, but higher precision variables have more zeros
// sometimes you'll see bugs if you use lowp so stick to mediump or highp
precision highp float;
varying vec2 vTexCoord;

void main() {
  vec2 uv = vTexCoord;
  vec3 color = vec3(uv.x, uv.y, min(uv.x + uv.y, 1.0));
  gl_FragColor = vec4(color,1.0);

}