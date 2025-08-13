import * as THREE from "three";
import { canvas, sizes } from "./utils/utils";

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
/**
 * MESHES
 */
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2),
  new THREE.MeshBasicMaterial()
);
scene.add(plane);

/**
 * RENDER & CONTROLS
 */
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas! });
renderer.setSize(sizes.w, sizes.h);
renderer.setPixelRatio(sizes.pixelRatio);

function loop() {
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(loop);

window.addEventListener("resize", () => {
  sizes.update();

  // camera

  renderer.setSize(sizes.w, sizes.h);
  renderer.setPixelRatio(sizes.pixelRatio);
});
