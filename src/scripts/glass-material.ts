import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { BASE } from "../constants";

const size = { w: window.innerWidth, h: window.innerHeight };
const canvas = document.getElementById("webgl");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, size.w / size.h, 0.1, 100);
camera.position.z = 5;

const rgbeLoader = new RGBELoader();
rgbeLoader.load(
  `${BASE}/textures/environmentMap/stierberg_sunrise_4k.hdr`,
  (envMap) => {
    envMap.mapping = THREE.EquirectangularReflectionMapping;

    scene.background = envMap;
    scene.environment = envMap;
  }
);

const material = new THREE.MeshPhysicalMaterial({
  roughness: 0,
  metalness: 0.3,
  transparent: true,
  transmission: 1,
  ior: 1.52,
});
const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
scene.add(cube);

const icosahedron = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.75, 3),
  material
);
icosahedron.position.x = 2;
scene.add(icosahedron);

const torusKnot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.5, 0.2),
  material
);
torusKnot.position.x = -2;
scene.add(torusKnot);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas!,
  antialias: true,
  alpha: true,
});
renderer.setSize(size.w, size.h);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

function loop() {
  controls.update();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(loop);

window.addEventListener("resize", () => {
  // update sizes
  size.w = window.innerWidth;
  size.h = window.innerHeight;

  // update camera
  camera.aspect = size.w / size.h;
  camera.updateProjectionMatrix();

  // update renderer
  renderer.setSize(size.w, size.h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
