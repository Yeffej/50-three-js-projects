import * as THREE from "three";
import { canvas, sizes } from "./utils/utils";
import { GLTFLoader, OrbitControls, Timer } from "three/examples/jsm/Addons.js";
import GUI from "lil-gui";
import { BASE } from "../constants";

/**
 * CONFIG
 */
// const setAnimationTimer = (seconds: number) => performance.now() + seconds * 1000;
const gui = new GUI();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, sizes.aspectRatio, 0.1, 100);
const cameraMirror = camera.clone();

camera.position.set(0, 2, 6);

const renderTarget = new THREE.WebGLRenderTarget(512, 512);

/**
 * LIGHTS
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
const directionalLight = new THREE.DirectionalLight(0x90e0ef, 2.5);
directionalLight.position.set(-1, 2, 5);
scene.add(ambientLight, directionalLight);

/**
 * MESHES
 */
let animationMixerOwl: THREE.AnimationMixer;
let animationMixerFox: THREE.AnimationMixer;
let foxAnimationTimer = 0;
let aTimerSeconds = 15; // FOX animation timer time in seconds
let nextFoxAnimation = () => console.log("NOT WORKING");

const gltfLoader = new GLTFLoader();
gltfLoader.load(`${BASE}/models/owl/realistic_animated_owl.glb`, (gltf) => {
  // console.log(gltf);
  const owl = gltf.scene;
  owl.position.x = -2.5;
  owl.scale.setScalar(0.8);

  animationMixerOwl = new THREE.AnimationMixer(owl);
  const animationAction = animationMixerOwl.clipAction(gltf.animations[0]);
  animationAction.play();

  scene.add(owl);
});

gltfLoader.load(`${BASE}/models/fox/Fox.glb`, (gltf) => {
  // console.log(gltf);
  const fox = gltf.scene;
  fox.position.x = 2.5;
  fox.scale.setScalar(0.03);

  animationMixerFox = new THREE.AnimationMixer(fox);
  let animationActions = gltf.animations.map((clip) =>
    animationMixerFox.clipAction(clip)
  );
  let animationIdx = 0;
  animationActions[animationIdx].play(); // idle

  foxAnimationTimer = aTimerSeconds;
  nextFoxAnimation = () => {
    animationActions[animationIdx].fadeOut(0.5);
    animationIdx++;

    if (animationIdx >= animationActions.length) {
      animationIdx = 0;
    }

    animationActions[animationIdx].reset().fadeIn(0.5).play();
  };

  scene.add(fox);
});

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshNormalMaterial()
);

const mirror = new THREE.Mesh(
  new THREE.CircleGeometry(4, 16),
  new THREE.MeshStandardMaterial({
    map: renderTarget.texture,
    metalness: 0.7,
    roughness: 0.3,
    side: THREE.BackSide,
  })
);
mirror.position.set(0, 1, -5);
mirror.rotation.y = Math.PI;
cameraMirror.position.copy(mirror.position);
cameraMirror.lookAt(0, 0, 0);

const mirrorHelper = new THREE.CameraHelper(cameraMirror);
mirrorHelper.visible = false;
scene.add(mirrorHelper);

gui.add(mirror.material, "metalness").min(0).max(1).step(0.01);
gui.add(mirror.material, "roughness").min(0).max(1).step(0.01);
gui.add(mirrorHelper, "visible").name("MirrorCameraHelper");

scene.add(cube, mirror);

/**
 * RENDER & CONTROLS
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas!,
  antialias: true,
});
renderer.setSize(sizes.w, sizes.h);
renderer.setPixelRatio(sizes.pixelRatio);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const timer = new Timer();

function loop() {
  timer.update();

  if (animationMixerOwl) {
    animationMixerOwl.update(timer.getDelta());
  }

  if (animationMixerFox) {
    const timerCount = foxAnimationTimer - timer.getElapsed();
    if (timerCount <= 0) {
      nextFoxAnimation();
      foxAnimationTimer += aTimerSeconds;
    }
    animationMixerFox.update(timer.getDelta());
  }

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.001;

  // draw render target scene to render target
  mirror.visible = false;
  updateMirrorCamera();
  renderer.setRenderTarget(renderTarget);
  renderer.render(scene, cameraMirror);
  renderer.setRenderTarget(null);
  mirror.visible = true;

  controls.update();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(loop);

/**
 * DOM & UTILS
 */
window.addEventListener("resize", () => {
  sizes.update();

  camera.aspect = sizes.aspectRatio;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.w, sizes.h);
  renderer.setPixelRatio(sizes.pixelRatio);
});

// Helper to flip cameraMirror relative to the mirror plane
function updateMirrorCamera() {
  const camPos = camera.position.clone();
  const invertVector = new THREE.Vector3(-1, -1, 1);
  camPos.multiply(invertVector);
  cameraMirror.lookAt(camPos);
}
