uniform float uTime;

varying vec2 vUv;

// TODO: Palm tree throwing some coconut.

void main() {
    // vec4 color1 = vec4(1.0, 0.38, 0.0, 1.0);
    // vec4 color2 = vec4(1.0, 0.95, 0.2, 1.0);
    vec4 color1 = vec4(0.0, 1.0, 0.0, 1.0);
    vec4 color2 = vec4(0.0, 1.0, 0.33, 1.0);
    vec4 color = mix(color1, color2, sqrt(vUv.y));

    vec2 palmPos = vec2(0.35, 0.7);
    palmPos.x += vUv.y * sin(uTime * 0.8) * 0.025;
    palmPos.y += vUv.y * sin(uTime * 0.1) * 0.025;
    vec2 palmDist = vUv - palmPos;

    float radius = 0.15 + 0.08 * cos(atan(palmDist.y, palmDist.x) * 10.0 + palmDist.x * 20.0);
    color *= smoothstep(radius, radius + 0.01, length(palmDist));

    radius = 0.015;
    radius += cos(palmDist.y * 100.0) * 0.0025;
    radius += exp(vUv.y * -40.0);
    color *= 1.0 -
        ((1.0 - smoothstep(radius, radius + 0.005, abs(palmDist.x - sin(palmDist.y * 2.0) * 0.25))) *
        (1.0 - step(0.0, palmDist.y)));

    // final color    
    gl_FragColor = color;
}