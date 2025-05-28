import * as THREE from 'three';
import { canvas, sizes } from './utils/utils';
import { BASE } from '../constants';
import GUI from 'lil-gui';

/**
 * CONFIG
 */
let particles: Array<THREE.Points> = [];
const mouse = new THREE.Vector2();

const particlesParameters = {
    max: 200,
    maxActive: 100,
    velocity: 0.001,
    maxDistance: 0.1
}
let particlesActive = 0;

const gui = new GUI({ title: 'Particles Settings' });

gui.add(particlesParameters, 'max').min(1).max(1000).step(1).onFinishChange(() => {
    createParticles();
});
gui.add(particlesParameters, 'maxActive').min(1).max(900).step(1);
gui.add(particlesParameters, 'velocity').min(0.0001).max(0.01).step(0.00001);
gui.add(particlesParameters, 'maxDistance').min(0.05).max(0.5).step(0.0001);


/**
 * SCENE & CAMERA
 */
const scene = new THREE.Scene();
scene.background = new THREE.Color('#aeaeae')
const camera = new THREE.PerspectiveCamera(45, sizes.aspectRatio, 0.1, 100);
camera.position.z = 5;

/**
 * LOADERS
 */
const textureLoader = new THREE.TextureLoader();
const particleTexture =  textureLoader.load(`${BASE}/textures/stars/star_06.png`);

/**
 * PARTICLES
 */
const positions = new Float32Array([0, 0, 0]);

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));


function createParticles() {
    // delete particles
    if(particles.length > 0) {
        // free GPU resources
        particles.forEach((particle) => {
            particle.geometry.dispose();
            (particle.material as  THREE.PointsMaterial).dispose();
            scene.remove(particle);
        });

        // remove all objects (particles)
        particles = [];
        particlesActive = 0; // reset
    }

    // create particles
    for(let i = 0; i < particlesParameters.max; i++) {
        const material = new THREE.PointsMaterial({
            color: new THREE.Color().setRGB(Math.random(), Math.random(), Math.random()),
            size: Math.random() * 0.06, 
            sizeAttenuation: true,
            map: particleTexture,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
    
        const particle = new THREE.Points(geometry, material)
        particle.visible = false;
        particle.userData.isActive = false;
        particle.userData.randomDirection = new THREE.Vector2(0, 0);
    
        particles.push(particle);
    }

    scene.add(...particles);
}
createParticles();


/**
 * RENDER
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas!
});
renderer.setSize(sizes.w, sizes.h);
renderer.setPixelRatio(sizes.pixelRatio);

function loop() {
    // convert vector to 3d space. 
    const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
    for(const particle of particles) {
        if(!particle.userData.isActive && particlesActive < particlesParameters.maxActive) {
            particle.position.copy(vector);
            particle.visible = true;

            particle.userData.isActive = true;
            particle.userData.randomDirection.x = Math.random() + 0.05;
            particle.userData.randomDirection.y = Math.random() + 0.05;
            particle.userData.initialPos = particle.position.clone();

            particlesActive++;
        }

        if(particle.userData.isActive) {
            particle.position.x += particle.userData.randomDirection.x * particlesParameters.velocity;
            particle.position.y += particle.userData.randomDirection.y * particlesParameters.velocity;

            const distance = Math.abs(particle.position.distanceTo(particle.userData.initialPos));
            const alpha = getAlphaOfActiveParticle(distance);

            (particle.material as THREE.PointsMaterial).opacity = alpha;

            if(distance > particlesParameters.maxDistance) {
                particle.visible = false;
                particle.userData.isActive = false;
                particlesActive--;
            }
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
});

/**
 * UTILS
 */
function getAlphaOfActiveParticle(distance: number): number {
    const min = 0;
    const max = particlesParameters.maxDistance;

    return inverseLerp(max, min, distance);
}

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}
function inverseLerp(a: number, b: number, value: number): number {
    return (value - a) / (b - a);
}
