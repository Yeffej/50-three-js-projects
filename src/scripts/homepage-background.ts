import * as THREE from 'three';
import { BASE } from '../constants';

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

/**
 * Scene & Camera
 */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, sizes.aspectRatio, 0.1, 100);
camera.position.set(1, 1, 10);
camera.lookAt(0, 0, 0);

// add the camera in a group to control and animate his movements
const cameraPhysics = new THREE.Group();
cameraPhysics.add(camera);
scene.add(cameraPhysics);

/**
 * Meshes
 */
const textureLoader = new THREE.TextureLoader();
const starTexture = textureLoader.load(`${BASE}/textures/stars/star_06.png`);
starTexture.colorSpace = THREE.SRGBColorSpace;

const particlesCount = 800;
const particlesPositions = new Float32Array(particlesCount * 3);
const particlesColors = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesPositions.length; i++) {
    particlesPositions[i] = (Math.random() - 0.5) * 25;
    particlesColors[i] = Math.random();
}

const particlesGeo = new THREE.BufferGeometry();
particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3));
particlesGeo.setAttribute('color', new THREE.BufferAttribute(particlesColors, 3));

const particles = new THREE.Points(
    particlesGeo, 
    new THREE.PointsMaterial({ 
        vertexColors: true,
        map: starTexture,
        transparent: true,
        size: 0.2,
        sizeAttenuation: true,
        depthWrite: false,
    })
);
scene.add(particles);

// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial({ color: '#2a9d8f' })
// );
// scene.add(cube);

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

const clock = new THREE.Clock();

function loop() {
    const elapsedTime = clock.getElapsedTime();

    const radius = 6;
    const speed = 0.2;
    cameraPhysics.position.x = Math.cos(elapsedTime * speed) * radius;
    cameraPhysics.position.z = Math.sin(elapsedTime * speed) * radius;

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
