import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

/**
 * CONFIG
 */
const canvas = document.getElementById('webgl');
const sizes = {
    w: window.innerWidth,
    h: window.innerHeight,
    get aspectRatio() {
        return this.w / this.h;
    },
    get pixelRatio() {
        return Math.min(window.devicePixelRatio, 2);
    },
    update() {
        this.w = window.innerWidth;
        this.h = window.innerHeight;
    }
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, sizes.aspectRatio, 0.1, 100);
camera.position.z = 5;

/**
 * MESHES
 */
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: '#2a9d8f' })
);
scene.add(cube);


/**
 * Renderer & Frame Loop
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas!,
    antialias: true,
    alpha: true
});
renderer.setSize(sizes.w, sizes.h);
renderer.setPixelRatio(sizes.pixelRatio);

const controls = new OrbitControls(camera, renderer.domElement);


function loop() {
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(loop);

/**
 * DOM EVENTS
 */
window.addEventListener('resize', () => {
    sizes.update();

    camera.aspect = sizes.aspectRatio;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.w, sizes.h);
    renderer.setPixelRatio(sizes.pixelRatio);
});

