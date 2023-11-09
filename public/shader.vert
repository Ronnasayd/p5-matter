
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

// uniform mat4 uProjectionMatrix;
// uniform mat4 uModelViewMatrix;
uniform mat4 myuProjectionMatrix;
uniform mat4 myuModelViewMatrix;


void main() {
  vec4 positionVec4 = vec4(aPosition, 1.0);
  gl_Position = myuProjectionMatrix * myuModelViewMatrix * positionVec4;
  vTexCoord = aTexCoord;
}