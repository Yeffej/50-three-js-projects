import GUI from "lil-gui";
import * as THREE from "three";
import { GLTFLoader, OrbitControls, Timer } from "three/examples/jsm/Addons.js";

/**
 * CONFIG
 */
const canvas = document.getElementById('webgl');
const size = {
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

const gui = new GUI();
const debugObj = {
    ambientLightColor: '#ffffff',
    directionalLightColor: '#ffffff',
    floorColor: '#2a9d8f'
}

const keys = {
    up: ['ArrowUp', 'w', 'W'],
    down: ['ArrowDown', 's', 'S'],
    left: ['ArrowLeft', 'a', 'A'],
    right: ['ArrowRight', 'd', 'D'],
    run: ['Space', ' ']
}

// controls the character movements
const controller = {
    x: 0,
    z: 0,
    run: false
}

// associates the animation name with its index.
const animationsNameIdx = {
    idle: 0,
    walk: 3,
    run: 1,
}

/**
 * SCENE & CAMERA
 */
const scene = new THREE.Scene();
// scene.fog = new THREE.Fog(debugObj.floorColor, 5, 20);
scene.fog = new THREE.FogExp2(debugObj.floorColor, 0.05);
scene.background = new THREE.Color(debugObj.floorColor);
const camera = new THREE.PerspectiveCamera(45, size.aspectRatio, 0.1, 100);
camera.position.set(0, 2, 8);

/**
 * LIGHTS
 */
const ambientLight = new THREE.AmbientLight(debugObj.ambientLightColor, 1);
const directionalLight = new THREE.DirectionalLight(debugObj.directionalLightColor, 2);
directionalLight.position.set(2, 4, 0);

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
directionalLightHelper.visible = false;
scene.add(ambientLight, directionalLight, directionalLightHelper);

gui.add(directionalLightHelper, 'visible').name('HelperVisible');
gui.addColor(debugObj, 'ambientLightColor').onChange(() => {
    ambientLight.color.set(debugObj.ambientLightColor);
});
gui.addColor(debugObj, 'directionalLightColor').onChange(() => {
    directionalLight.color.set(debugObj.directionalLightColor);
});


/**
 * Meshes
 */
let animationMixer: THREE.AnimationMixer;
let animations: Array<THREE.AnimationAction>;
let currentAnimationIdx = animationsNameIdx.idle;
let soldier: THREE.Object3D;

const gltfLoader = new GLTFLoader();
gltfLoader.load('/models/soldier/Soldier.glb', (gltf) => {
    soldier = new THREE.Group();
    const soldierMesh = gltf.scene.children[0];
    soldierMesh.position.set(0, 0, 0);

    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    soldierMesh.applyQuaternion(quaternion);

    soldier.add(soldierMesh);

    animationMixer = new THREE.AnimationMixer(soldierMesh);
    const animationsClips = gltf.animations;
    animations =  animationsClips.map((clip) => animationMixer.clipAction(clip));
    animations[currentAnimationIdx].play();

    scene.add(soldier);

    console.log(soldierMesh);
})

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: debugObj.floorColor, metalness: 0.8, roughness: 0.2 })
);
floor.rotation.x = -Math.PI * 0.5;
gui.addColor(debugObj, 'floorColor').onChange(() => {
    floor.material.color.set(debugObj.floorColor);
});
scene.add(floor);


/**
 * Renderer & Controls
 */
const renderer = new THREE.WebGLRenderer({ canvas: canvas! });
renderer.setSize(size.w, size.h);
renderer.setPixelRatio(size.pixelRatio);

const controls = new OrbitControls(camera, renderer.domElement);
const timer = new Timer();

function changeAnimation(targetAnimation: number, duration = 0.5) {
    animations[currentAnimationIdx].fadeOut(duration);
    animations[targetAnimation].reset().fadeIn(duration).play();
    currentAnimationIdx = targetAnimation;
}

/**
 * FRAME LOOP
 */
const loop = () => {
    timer.update();
    const dt = timer.getDelta();
    const elapsedTime = timer.getElapsed();

    // update character animations
    if(animationMixer && animations) {
        if(controller.x === 0 && controller.z === 0) {
            const targetAnimation = animationsNameIdx.idle;
            if(targetAnimation !== currentAnimationIdx) {
                changeAnimation(targetAnimation);
            }
        }else {
            const targetAnimation = controller.run? animationsNameIdx.run : animationsNameIdx.walk;
            if(targetAnimation != currentAnimationIdx) {
                changeAnimation(targetAnimation);
            }
        }

        animationMixer.update(dt);
    }

    // update character position and rotation
    if(soldier) {
        if(controller.x !== 0 || controller.z !== 0) {
            const angle = Math.atan2(controller.x, controller.z);
            const targetQuat = new THREE.Quaternion();
            targetQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);

            soldier.quaternion.slerp(targetQuat, 0.1);
            // soldier.rotation.y += (angle - soldier.rotation.y) * dt * 5;
        }
    }

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(loop);


/**
 * DOM EVENTS
 */
window.addEventListener('resize', () => {
    size.update();

    camera.aspect = size.aspectRatio;
    camera.updateProjectionMatrix();

    renderer.setSize(size.w, size.h);
    renderer.setPixelRatio(size.pixelRatio);
});

function setController(key: string, reset = false) {
    const value = reset? 0: 1;
    if(keys.up.includes(key)) {
        controller.z = value * -1;
    } else if(keys.down.includes(key)) {
        controller.z = value;
    }

    if(keys.left.includes(key)) {
        controller.x = value * -1;
    } else if(keys.right.includes(key)) {
        controller.x = value;
    }

    if(keys.run.includes(key)) {
        controller.run = !reset;
    }
}

window.addEventListener('keydown', (e) => {
    setController(e.key);
})

window.addEventListener('keyup', (e) => {
    setController(e.key, true);
})
