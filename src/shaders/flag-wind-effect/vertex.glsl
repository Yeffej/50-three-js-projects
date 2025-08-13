uniform float uTime;
uniform vec2 uFrecuency;
uniform vec2 uAmplitude;

varying vec2 vUv;
varying float vElevation;

void main() {
	vec4 modelPosition = modelMatrix * vec4( position, 1.0 );
	float elevation = sin(modelPosition.x * uFrecuency.x + uTime) * uAmplitude.x;
	elevation += sin(modelPosition.y * uFrecuency.y - uTime) * uAmplitude.y;
    modelPosition.z += elevation;

	vec4 viewPosition = viewMatrix * modelPosition;
	gl_Position = projectionMatrix * viewPosition;

	vUv = uv;
	vElevation = elevation;
}