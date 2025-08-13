import * as THREE from "three";
import { canvas, sizes } from "./utils/utils";
import { OrbitControls, Timer } from "three/examples/jsm/Addons.js";
import vertexShader from "../shaders/flag-wind-effect/vertex.glsl?raw";
import fragmentShader from "../shaders/flag-wind-effect/fragment.glsl?raw";
import GUI from "lil-gui";
import { BASE } from "../constants";

/**
 * CONFIG
 */
const gui = new GUI();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, sizes.aspectRatio, 0.1, 100);
camera.position.set(0, 0, 5);

/**
 * MESHES
 */
const textureLoader = new THREE.TextureLoader();
const drFlag = textureLoader.load(
  `${BASE}/textures/dominican-republic-flag.webp`
);

const flag = new THREE.Mesh(
  new THREE.PlaneGeometry(4, 4, 50, 50),
  new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uFrecuency: { value: new THREE.Vector2(2.5, 3.0) },
      uAmplitude: { value: new THREE.Vector2(0.5, 0.15) },
      uTexture: { value: drFlag },
    },
  })
);
scene.add(flag);

gui
  .add(flag.material.uniforms.uFrecuency.value, "x")
  .min(1.0)
  .max(10.0)
  .step(0.1)
  .name("FrecuencyX");
gui
  .add(flag.material.uniforms.uAmplitude.value, "x")
  .min(0.0)
  .max(1.0)
  .step(0.01)
  .name("AmplitudeX");
gui
  .add(flag.material.uniforms.uFrecuency.value, "y")
  .min(1.0)
  .max(10.0)
  .step(0.1)
  .name("FrecuencyY");
gui
  .add(flag.material.uniforms.uAmplitude.value, "y")
  .min(0.0)
  .max(1.0)
  .step(0.01)
  .name("AmplitudeY");

/**
 * RENDER & CONTROLS & LOOP
 */
const renderer = new THREE.WebGLRenderer({ canvas: canvas!, antialias: true });
renderer.setSize(sizes.w, sizes.h);
renderer.setPixelRatio(sizes.pixelRatio);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

function loop() {
  timer.update();
  const { uTime } = flag.material.uniforms;
  uTime.value = timer.getElapsed();

  controls.update();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(loop);

/**
 * DOM EVENTS
 */
window.addEventListener("resize", () => {
  sizes.update();

  camera.aspect = sizes.aspectRatio;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.w, sizes.h);
  renderer.setPixelRatio(sizes.pixelRatio);
});
