import * as THREE from 'three';
import { FontLoader, OrbitControls, TextGeometry } from 'three/examples/jsm/Addons.js';
import { BASE } from '../constants';
import GUI from 'lil-gui';

interface Parameters {
    material?: THREE.Material;
}

/**
 * CONFIG
 */
const canvas = document.getElementById('webgl');
const size = {
    w: window.innerWidth,
    h: window.innerHeight,
    get aspect() {
        return this.w / this.h;
    },
    update() {
        this.w = window.innerWidth;
        this.h = window.innerHeight;
    }
};

// Debug
const parameters: Parameters = {};
const gui = new GUI({ title: "Options" });


// Mouse Event
const mouse = {
    x: 0,
    y: 0,
    distance: 50
}

window.addEventListener('mousemove', (e) => {
    mouse.x = -(e.clientX / size.w - 0.5);
    mouse.y = (e.clientY / size.h - 0.5);
});

/**
 * SCENE & CAMERA
 */
const scene = new THREE.Scene();
const initialCameraPosition = {x: 100, y: -5, z: 10};
const camera = new THREE.PerspectiveCamera(75, size.aspect, 0.1, 100);
camera.position.set(initialCameraPosition.x, initialCameraPosition.y, initialCameraPosition.z);

/**
 * loaders
 */
const textureLoader = new THREE.TextureLoader();
const chocolateMatcap = textureLoader.load(`${BASE}/textures/matcaps/1.png`);
chocolateMatcap.colorSpace = THREE.SRGBColorSpace;
const softMatcap = textureLoader.load(`${BASE}/textures/matcaps/6.png`);
softMatcap.colorSpace = THREE.SRGBColorSpace;
const bloomMatcap = textureLoader.load(`${BASE}/textures/matcaps/2.png`);
bloomMatcap.colorSpace = THREE.SRGBColorSpace;
const slimeMatcap = textureLoader.load(`${BASE}/textures/matcaps/7.png`);
slimeMatcap.colorSpace = THREE.SRGBColorSpace;
const gloomMatcap = textureLoader.load(`${BASE}/textures/matcaps/3.png`);
gloomMatcap.colorSpace = THREE.SRGBColorSpace;
const futureMatcap = textureLoader.load(`${BASE}/textures/matcaps/8.png`);
futureMatcap.colorSpace = THREE.SRGBColorSpace;

/** 
 * Meshes 
*/
const materials = {
    normal: new THREE.MeshNormalMaterial(),
    chocolate: new THREE.MeshMatcapMaterial({
        matcap: chocolateMatcap
    }),
    soft: new THREE.MeshMatcapMaterial({
        matcap: softMatcap
    }),
    bloom: new THREE.MeshMatcapMaterial({
        matcap: bloomMatcap
    }),
    gloom: new THREE.MeshMatcapMaterial({
        matcap: gloomMatcap
    }),
    slime: new THREE.MeshMatcapMaterial({
        matcap: slimeMatcap
    }),
    future: new THREE.MeshMatcapMaterial({
        matcap: futureMatcap
    }),
};

parameters.material = materials.normal

let text: THREE.Mesh;
const fontLoader = new FontLoader();
fontLoader.load(`${BASE}/fonts/open-sans_italic.json`, (font) => {
    const textGeometry = new TextGeometry('Text Donuts Effect\n         By Yeff', {
        font: font,
		size: 1,
		depth: 0.5,
		curveSegments: 3,
		bevelEnabled: true,
		bevelThickness: 0.03,
		bevelSize: 0.02,
		bevelOffset: 0,
		bevelSegments: 3
    });
    textGeometry.center();

    const textMaterial = parameters.material;
    text = new THREE.Mesh(textGeometry, textMaterial);

    camera.lookAt(text.position);
    scene.add(text);
});


const meshesCount = 500; 
const geometrys = [
    new THREE.TorusGeometry(0.5, 0.3),
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.SphereGeometry(0.7, 16, 16)
]

const randomMeshes = new THREE.Group();

for(let i = 0; i < meshesCount; i++) {
    const random = Math.random();
    const idx = random <= 0.6 
        ? 0 
        : random <= 0.75 ? 1 : 2;

    const mesh = new THREE.Mesh(geometrys[idx], parameters.material);
    const azimuthalAngle = Math.random() * Math.PI * 2;
    const polarAngle = Math.random() * Math.PI;
    const radius = Math.random() *  40  + 7;
    
    mesh.position.x = Math.sin(polarAngle) * Math.cos(azimuthalAngle) * radius;
    mesh.position.y = Math.cos(polarAngle) * radius;
    mesh.position.z = Math.sin(polarAngle) * Math.sin(azimuthalAngle) * radius;

    randomMeshes.add(mesh);
}

scene.add(randomMeshes);


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas: canvas! });
renderer.setSize(size.w, size.h);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Controls & Clock
 */
// const controls = new OrbitControls(camera, renderer.domElement);

const clock = new THREE.Clock();
let previousTime = 0;

let initialAnimations = false;
let count = 0;

const offset = { x: 0, y: 0, z: 0 };
let once = false;

function loop() {
    const elapsedTime = clock.getElapsedTime();
    const dt = elapsedTime - previousTime;
    previousTime = elapsedTime;

    if(text) {
        // initial animation
        if(!initialAnimations && camera.position.x > 10) {
            camera.position.x += (10 - camera.position.x) * dt;
        } else {
            initialAnimations = true;
            // floating animation
        }

            // camera.position.y = Math.sin(elapsedTime) * 2 + initialCameraPosition.y;
            // camera.position.z = Math.cos(elapsedTime) * 0.7 + initialCameraPosition.z;

        camera.position.x += (mouse.x * mouse.distance - camera.position.x) * dt;
        camera.position.y += (mouse.y * mouse.distance - camera.position.y) * dt;


        camera.lookAt(text.position);
    }

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
}
loop();


/**
 * GUI
 */
gui.add(mouse, 'distance').min(10).max(200).step(1).name('MouseDistance');
gui.add(parameters, 'material', materials).onChange(() => {
    text.material = parameters.material!;
    randomMeshes.children.forEach((mesh) => {
        if(mesh instanceof THREE.Mesh) {
            mesh.material = parameters.material;
        }
    })
})

