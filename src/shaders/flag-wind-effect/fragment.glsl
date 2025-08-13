uniform sampler2D uTexture;

varying vec2 vUv;
varying float vElevation;

// interpolate between -1 and 1;
float lerp(float x) { 
	return  (x + 1.0) / 2.0;
}

void main() {
	vec4 texture = texture2D(uTexture, vUv); 
	vec4 shadowColor = vec4(0, 0, 0, 1.0);
	float t = lerp(vElevation);
	
	gl_FragColor = mix(shadowColor, texture, t);
}