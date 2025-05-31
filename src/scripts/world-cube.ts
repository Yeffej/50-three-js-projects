import * as THREE from "three";
import { canvas, sizes } from "./utils/utils";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { BASE } from "../constants";

/**
 * SCENE & CAMERA
 */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, sizes.aspectRatio, 0.1, 100);
camera.position.z = 50;

/**
 * MESHES
 */
const textureLoader2 = new THREE.TextureLoader();
textureLoader2.setPath(`${BASE}/textures/environmentMap/penguins/`);

const texture_ft = textureLoader2.load('arid2_ft.jpg');
const texture_bk = textureLoader2.load('arid2_bk.jpg');
const texture_lf = textureLoader2.load('arid2_lf.jpg');
const texture_rt = textureLoader2.load('arid2_rt.jpg');
const texture_up = textureLoader2.load('arid2_up.jpg');
const texture_dn = textureLoader2.load('arid2_dn.jpg');

texture_ft.colorSpace = THREE.SRGBColorSpace;
texture_bk.colorSpace = THREE.SRGBColorSpace;
texture_lf.colorSpace = THREE.SRGBColorSpace;
texture_rt.colorSpace = THREE.SRGBColorSpace;
texture_up.colorSpace = THREE.SRGBColorSpace;
texture_dn.colorSpace = THREE.SRGBColorSpace;

const materials = [
    new THREE.MeshBasicMaterial({ map: texture_ft, side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ map: texture_bk, side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ map: texture_up, side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ map: texture_dn, side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ map: texture_rt, side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ map: texture_lf, side: THREE.BackSide }),
];

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(40, 40, 40),
  materials
);
scene.add(cube);



/**
 * RENDERER & controls
 */
const renderer = new THREE.WebGLRenderer({ canvas: canvas! });
renderer.setSize(sizes.w, sizes.h);
renderer.setPixelRatio(sizes.pixelRatio);

const controls = new OrbitControls(camera, renderer.domElement);

function loop() {
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
loop();

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
