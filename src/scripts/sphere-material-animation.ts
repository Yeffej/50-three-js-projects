import * as THREE from "three";
import { canvas, sizes } from "./utils/utils";
import vShader from "../shaders/sphere-material-animations/vertex.glsl?raw";
import fShader from "../shaders/sphere-material-animations/fragment.glsl?raw";
import { OrbitControls, Timer } from "three/examples/jsm/Addons.js";
import GUI from "lil-gui";

/**
 * CONFIG
 */
const gui = new GUI();
const animations = {
  stripes1: 0,
  stripes2: 1,
  stripes3: 2,
  fade1: 3,
  fade2: 4,
  fade3: 5,
  organic1: 6,
  organic2: 7,
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, sizes.aspectRatio, 0.1, 100);
camera.position.set(0, 0, 6);

/**
 * MESHES
 */
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(2.5, 32, 32),
  new THREE.ShaderMaterial({
    vertexShader: vShader,
    fragmentShader: fShader,
    uniforms: {
      uTime: { value: 0 },
      uAnimationIdx: { value: 7 },
    },
  })
);
scene.add(sphere);

gui.add(sphere.material.uniforms.uAnimationIdx, "value", animations);

/**
 * RENDER & CONTROLS
 */
const renderer = new THREE.WebGLRenderer({ canvas: canvas!, antialias: true });
renderer.setSize(sizes.w, sizes.h);
renderer.setPixelRatio(sizes.pixelRatio);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const timer = new Timer();

function loop() {
  timer.update();
  const { uTime } = sphere.material.uniforms;
  uTime.value = timer.getElapsed();

  controls.update();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(loop);

/**
 * DOM
 */
window.addEventListener("resize", () => {
  sizes.update();

  camera.aspect = sizes.aspectRatio;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.w, sizes.h);
  renderer.setPixelRatio(sizes.pixelRatio);
});
