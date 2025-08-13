varying vec2 vUv;
varying vec3 vNormal;

void main() {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

    vUv = uv;
    vNormal = normal;
}