import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

/**
 * CONFIG
 */
const canvas = document.getElementById('webgl');

/**
 * SCENE AND CAMERA
 */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  800
);
camera.position.set(0, 0, 8);

/**
 * LIGHTS
 */
const hLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
const sLight = new THREE.PointLight(0xffd60a, 5, 20, 1);
sLight.position.set(0, 3.5, 2);

scene.add(hLight);
scene.add(sLight);


/**
 * MESHES
 */
let lineDashMat: THREE.LineDashedMaterial | undefined;
let lines: THREE.LineSegments | undefined;
let totalSegments: number;

const loader = new FontLoader();
loader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
  const textGeo = new TextGeometry("Hello Three.js", {
    font: font,
    size: 1,
    depth: 0.5,
    curveSegments: 6,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.008,
    bevelOffset: 0,
    bevelSegments: 5,
  });
  const textMat = new THREE.MeshPhysicalMaterial({
    color: 0xff5533,
    roughness: 0.2,
    transmission: 1,
    transparent: true,
    thickness: 1,
  });
  const textMesh = new THREE.Mesh(textGeo, textMat);
  const textGroup = new THREE.Group();
  textGroup.add(textMesh);

  textGeo.center(); // same as above but on all 3 axis.

  const edges = new THREE.EdgesGeometry(textGeo);
  lineDashMat = new THREE.LineDashedMaterial({
    color: 0xff5533,
    dashSize: 0.1,
    gapSize: 0.05,
    linewidth: 1,
    scale: 1,
  });

  lines = new THREE.LineSegments(edges, lineDashMat);
  textGroup.add(lines);

  // Initialize draw range
  lines.geometry.setDrawRange(0, 0);
  totalSegments = lines!.geometry.attributes.position.count;

  scene.add(textGroup);
});

const circleObj = new THREE.Mesh(
  new THREE.CircleGeometry(6, 12),
  new THREE.MeshStandardMaterial({ color: 0x00509d, roughness: 0.5 })
);
circleObj.position.set(0, 0, -2);
scene.add(circleObj);


/**
 * RENDERER & FRAME LOOP
 */
const renderer = new THREE.WebGLRenderer({ canvas: canvas!, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;

// Animate draw range
let progress = 0;
let direction = 1;

function animate() {
  if (lines && totalSegments) {
    progress = Math.min(totalSegments, Math.max(0, 50 * direction + progress)); // Drawing speed
    lines.geometry.setDrawRange(0, progress);

    if (progress >= totalSegments) setTimeout(() => (direction = -1), 1000);
    if (progress <= 0) setTimeout(() => (direction = 1), 1000);
  }

  renderer.render(scene, camera);
  controls.update();
}
renderer.setAnimationLoop(animate);

/**
 * DOM EVENTS
 */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})
