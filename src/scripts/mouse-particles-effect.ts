import * as THREE from 'three';
import { canvas, sizes } from './utils/utils';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

/**
 * CONFIG
 */
const particles: Array<THREE.Points> = [];
const mouse = new THREE.Vector2();
const maxParticles = 100;
let particlesActive = 0;
const maxParticlesActive = 10;

/**
 * SCENE & CAMERA
 */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, sizes.aspectRatio, 0.1, 100);
camera.position.z = 5;

/**
 * MESHES
 */
const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial()
);
// scene.add(mesh);

// PARTICLES
const positions = new Float32Array([0, 0, 0]);

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const material = new THREE.PointsMaterial({ size: 0.02, sizeAttenuation: true });

for(let i = 0; i < maxParticles; i++) {
    const particle = new THREE.Points(geometry, material)
    particle.visible = false;
    particle.userData.isActive = false;
    particles.push(particle);
}
scene.add(...particles);


/**
 * RENDER & CONTROLS
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas!
});
renderer.setSize(sizes.w, sizes.h);
renderer.setPixelRatio(sizes.pixelRatio);

const controls = new OrbitControls(camera, renderer.domElement);

const particleVelocity = 0.001;

function loop() {
    // convert vector to 3d space. 
    const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
    for(const particle of particles) {
        if(!particle.userData.isActive && particlesActive < maxParticlesActive) {
            particle.position.copy(vector);
            particle.visible = true;
            particle.userData.isActive = true;
            particlesActive++;
        }

        if(particle.userData.isActive) {
            particle.position.x += Math.random() * particleVelocity;
            particle.position.y += Math.random() * particleVelocity;
        }
        
    }

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

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Optional: Remove after delay
//   setTimeout(() => {
//     scene.remove(dot);
//   }, 2000);
});