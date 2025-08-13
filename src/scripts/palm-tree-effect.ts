import * as THREE from "three";
import { canvas, sizes } from "./utils/utils";
import vshader from "../shaders/palm-tree-effect/vertex.glsl?raw";
import fshader from "../shaders/palm-tree-effect/fragment.glsl?raw";
import { Timer } from "three/examples/jsm/Addons.js";

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
/**
 * MESHES
 */
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2),
  new THREE.ShaderMaterial({
    vertexShader: vshader,
    fragmentShader: fshader,
    uniforms: {
      uTime: new THREE.Uniform(0),
    },
  })
);
scene.add(plane);

/**
 * RENDER & CONTROLS
 */
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas! });
renderer.setSize(sizes.w, sizes.h);
renderer.setPixelRatio(sizes.pixelRatio);

const timer = new Timer();

function loop() {
  timer.update();
  const { uTime } = plane.material.uniforms;
  uTime.value = timer.getElapsed();

  renderer.render(scene, camera);
}
renderer.setAnimationLoop(loop);

window.addEventListener("resize", () => {
  sizes.update();

  renderer.setSize(sizes.w, sizes.h);
  renderer.setPixelRatio(sizes.pixelRatio);
});
