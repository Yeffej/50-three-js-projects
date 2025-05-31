import * as THREE from 'three';
import { OrbitControls, Sky } from 'three/examples/jsm/Addons.js';
import { sizes, canvas } from './utils/utils';
import GUI from 'lil-gui';
import { BASE } from '../constants';

/**
 * CONFIG
 */
const measures = {
    house: {
        roof: { width: 6, height: 3, depth: 7  },
        walls: { width: 5, height: 4.5, depth: 6 },
        base: { width: 6, height: 1, depth: 7 },
        annex: { 
            walls: { width: 2.5, height: 10, depth: 3.5 },
            roof: { width: 2.6, height: 3 }
        },
        door: { width: 3, height: 3.5 },
    },
    fences: {
        // width: 20,
        // length: 20,
        column: { width: 0.7, height: 3 },
        columnTop: { width: 1, height: 0.2 },
        wall: { width: 3, height: 2, depth: 0.3 },
    }
}

const parameters = {
    doorColor: '#5c8463',
    sunColor: '#ffb703'
}
const skyController = {
    turbidity: 10,
    rayleigh: 3,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.7,
    elevation: 2,
    azimuth: 160,
    // exposure: renderer.toneMappingExposure
};
const gui = new GUI({ title: "House Settings", closeFolders: true });
gui.close();

/**
 * Scene & Camera
 */
const scene = new THREE.Scene();
scene.background = new THREE.Color('#82C8E5');
const camera = new THREE.PerspectiveCamera(75, sizes.aspectRatio, 0.1, 100);
camera.position.set(0, 8, 25);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight('#ffffff', 0.5);
const sunLight = new THREE.DirectionalLight('#ffffff', 1.5);
sunLight.position.set(18, 25, -30);
const sunLightHelper = new THREE.DirectionalLightHelper(sunLight);
sunLightHelper.visible = false;

scene.add(ambientLight, sunLight, sunLightHelper);

gui.add(sunLightHelper, 'visible').name('DlightHelper');


/**
 * SKY
*/
const sky = new Sky();
sky.scale.setScalar( 1000 );
scene.add( sky );

const sun = new THREE.Mesh(
    new  THREE.CircleGeometry(6, 16),
    new THREE.MeshBasicMaterial({ color: parameters.sunColor })
);
sun.position.copy(sunLight.position);

gui.addColor(parameters, 'sunColor').onChange(() => {
    sun.material.color.set(parameters.sunColor);
});

const sunPosition = new THREE.Vector3();
const uniforms = sky.material.uniforms;

const skyChanged = () => {
    uniforms[ 'turbidity' ].value = skyController.turbidity;
    uniforms[ 'rayleigh' ].value = skyController.rayleigh;
    uniforms[ 'mieCoefficient' ].value = skyController.mieCoefficient;
    uniforms[ 'mieDirectionalG' ].value = skyController.mieDirectionalG;

    const phi = THREE.MathUtils.degToRad( 90 - skyController.elevation );
    const theta = THREE.MathUtils.degToRad( skyController.azimuth );
    sunPosition.setFromSphericalCoords( 1, phi, theta );
    uniforms[ 'sunPosition' ].value.copy( sunPosition );

    // renderer.toneMappingExposure = skyController.exposure;
}
// apply initial settings
skyChanged();

const skyGui = gui.addFolder('Sky');

skyGui.add( skyController, 'turbidity', 0.0, 20.0, 0.1 ).onChange( skyChanged );
skyGui.add( skyController, 'rayleigh', 0.0, 4, 0.001 ).onChange( skyChanged );
skyGui.add( skyController, 'mieCoefficient', 0.0, 0.1, 0.001 ).onChange( skyChanged );
skyGui.add( skyController, 'mieDirectionalG', 0.0, 1, 0.001 ).onChange( skyChanged );
skyGui.add( skyController, 'elevation', 0, 10, 0.1 ).onChange( skyChanged );
skyGui.add( skyController, 'azimuth', -180, 180, 0.1 ).onChange( skyChanged );
// skyGui.add( skyController, 'exposure', 0, 1, 0.0001 ).onChange( skyChanged );


/**
 * textures
 */
// load color/diffuse textures
const textureLoader = new THREE.TextureLoader();
textureLoader.setPath(`${BASE}/textures`)

const floorColorTexture = textureLoader.load('/sparse_grass/sparse_grass_diff_1k.webp'); 
const concreteColorTexture = textureLoader.load('/concrete_floor_worn_001/concrete_floor_worn_001_diff_1k.webp'); 
const houseWallsColorTexture = textureLoader.load('/weathered_brown_planks/weathered_brown_planks_diff_1k.webp'); 
const houseRoofColorTexture = textureLoader.load('/ceramic_roof_01/ceramic_roof_01_diff_1k.webp'); 
const hAnnexRoofColorTexture = textureLoader.load('/roof_07/roof_07_diff_1k.webp');
const houseDoorColorTexture =  textureLoader.load('/door/color.webp');

// load Ambient Occlusion, Roughness, metalness textures
const floorARMTexture = textureLoader.load('/sparse_grass/sparse_grass_arm_1k.webp'); 
const concreteARMTexture = textureLoader.load('/concrete_floor_worn_001/concrete_floor_worn_001_arm_1k.webp'); 
const houseWallsARMTexture = textureLoader.load('/weathered_brown_planks/weathered_brown_planks_arm_1k.webp'); 
const houseRoofARMTexture = textureLoader.load('/ceramic_roof_01/ceramic_roof_01_arm_1k.webp'); 
const hAnnexRoofARMTexture = textureLoader.load('/roof_07/roof_07_arm_1k.webp');
const houseDoorAOTexture =  textureLoader.load('/door/ambientOcclusion.webp'); 
const houseDoorRoughnessTexture =  textureLoader.load('/door/roughness.webp'); 
const houseDoorMetalnessTexture =  textureLoader.load('/door/metalness.webp');

// load Normals Textures
const floorNormalsTexture = textureLoader.load('/sparse_grass/sparse_grass_nor_gl_1k.webp'); 
const concreteNormalsTexture = textureLoader.load('/concrete_floor_worn_001/concrete_floor_worn_001_nor_gl_1k.webp'); 
const houseWallsNormalsTexture = textureLoader.load('/weathered_brown_planks/weathered_brown_planks_nor_gl_1k.webp'); 
const houseRoofNormalsTexture = textureLoader.load('/ceramic_roof_01/ceramic_roof_01_nor_gl_1k.webp'); 
const hAnnexRoofNormalsTexture = textureLoader.load('/roof_07/roof_07_nor_gl_1k.webp');
const houseDoorNormalsTexture =  textureLoader.load('/door/normal.webp');

// load displacements Textures
const floorDisplacementTexture = textureLoader.load('/sparse_grass/sparse_grass_disp_1k.webp'); 
const houseDoorDisplacementTexture =  textureLoader.load('/door/height.webp');

// load alpha textures
const floorAlphaTexture = textureLoader.load('/alpha/rounded.webp'); 
const houseDoorAlphaTexture =  textureLoader.load('/door/alpha.webp');

// add color space
floorColorTexture.colorSpace = THREE.SRGBColorSpace;
concreteColorTexture.colorSpace = THREE.SRGBColorSpace;
houseWallsColorTexture.colorSpace = THREE.SRGBColorSpace;
houseRoofColorTexture.colorSpace = THREE.SRGBColorSpace;
hAnnexRoofColorTexture.colorSpace = THREE.SRGBColorSpace;
houseDoorColorTexture.colorSpace = THREE.SRGBColorSpace;

// Ajust mapping size
floorColorTexture.wrapS = THREE.RepeatWrapping;
floorColorTexture.wrapT = THREE.RepeatWrapping;
floorColorTexture.repeat.setScalar(8);

floorARMTexture.wrapS = THREE.RepeatWrapping;
floorARMTexture.wrapT = THREE.RepeatWrapping;
floorARMTexture.repeat.setScalar(8);

floorNormalsTexture.wrapS = THREE.RepeatWrapping;
floorNormalsTexture.wrapT = THREE.RepeatWrapping;
floorNormalsTexture.repeat.setScalar(8);

floorDisplacementTexture.wrapS = THREE.RepeatWrapping;
floorDisplacementTexture.wrapT = THREE.RepeatWrapping;
floorDisplacementTexture.repeat.setScalar(8);



/**
 * MESHES
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80, 128, 128),
    new THREE.MeshStandardMaterial({
        map: floorColorTexture,
        aoMap: floorARMTexture,
        roughnessMap: floorARMTexture,
        metalnessMap: floorARMTexture,
        normalMap: floorNormalsTexture,
        displacementMap: floorDisplacementTexture,
        displacementBias: -0.4,
        alphaMap: floorAlphaTexture,
        transparent: true
    })
);
floor.rotation.x = -Math.PI * 0.5;

gui.add(floor.material, 'displacementBias').min(-1).max(1).step(0.01);
gui.add(floor.material, 'displacementScale').min(0).max(3).step(0.01);

const house = new THREE.Group();
const walls = new THREE.Mesh(
    new THREE.BoxGeometry(
        measures.house.walls.width,
        measures.house.walls.height,
        measures.house.walls.depth
    ),
    new THREE.MeshStandardMaterial({
        map: houseWallsColorTexture,
        aoMap: houseWallsARMTexture,
        roughnessMap: houseWallsARMTexture,
        metalnessMap: houseWallsARMTexture,
        normalMap: houseWallsNormalsTexture,
    })
);
walls.position.y = measures.house.walls.height * 0.5 + measures.house.base.height;

const base = new THREE.Mesh(
    new THREE.BoxGeometry(
        measures.house.base.width,
        measures.house.base.height,
        measures.house.base.depth
    ),
    new THREE.MeshStandardMaterial({
        map: concreteColorTexture,
        aoMap: concreteARMTexture,
        roughnessMap: concreteARMTexture,
        metalnessMap: concreteARMTexture,
        normalMap: concreteNormalsTexture
    })
);
base.position.y = measures.house.base.height * 0.5;

const roof = new THREE.Mesh(
    createRoofGeometry(
        measures.house.roof.width,
        measures.house.roof.height,
        measures.house.roof.depth,
    ),
    new THREE.MeshStandardMaterial({
        map: houseRoofColorTexture,
        aoMap: houseRoofARMTexture,
        roughnessMap: houseRoofARMTexture,
        metalnessMap: houseRoofARMTexture,
        normalMap: houseRoofNormalsTexture
    })
)
roof.position.y = measures.house.base.height + measures.house.walls.height;

const door = new THREE.Mesh(
    new THREE.PlaneGeometry(
        measures.house.door.width,
        measures.house.door.height,
        32,
        32
    ),
    new THREE.MeshStandardMaterial({
        color: parameters.doorColor,
        alphaMap: houseDoorAlphaTexture,
        transparent: true,
        map: houseDoorColorTexture,
        aoMap: houseDoorAOTexture,
        roughnessMap: houseDoorRoughnessTexture,
        metalnessMap: houseDoorMetalnessTexture,
        normalMap: houseDoorNormalsTexture,
        displacementMap: houseDoorDisplacementTexture,
        displacementBias: -0.1,
        displacementScale: 0.3
    })
);
door.position.z = measures.house.walls.depth * 0.5 + 0.01;
door.position.y = measures.house.door.height * 0.5 + measures.house.base.height - 0.1;

gui.addColor(parameters, 'doorColor').onChange(() => {
    door.material.color.set(parameters.doorColor);
});
gui.add(door.material, 'displacementBias').min(-1).max(1).step(0.01).name('doorDispBias');
gui.add(door.material, 'displacementScale').min(0).max(3).step(0.01).name('doorDispScale');


const annex = new THREE.Group();
const annexWalls = new THREE.Mesh(
    new THREE.BoxGeometry(
        measures.house.annex.walls.width,
        measures.house.annex.walls.height,
        measures.house.annex.walls.depth
    ),
    new THREE.MeshStandardMaterial({
        map: houseWallsColorTexture,
        aoMap: houseWallsARMTexture,
        roughnessMap: houseWallsARMTexture,
        metalnessMap: houseWallsARMTexture,
        normalMap: houseWallsNormalsTexture
    })
);
annexWalls.position.y = measures.house.annex.walls.height * 0.5;

const annexRoof = new THREE.Mesh(
    new THREE.ConeGeometry(
        measures.house.annex.roof.width,
        measures.house.annex.roof.height,
        4
    ),
    new THREE.MeshStandardMaterial({
        map: hAnnexRoofColorTexture,
        aoMap: hAnnexRoofARMTexture,
        roughnessMap: hAnnexRoofARMTexture,
        metalnessMap: hAnnexRoofARMTexture,
        normalMap: hAnnexRoofNormalsTexture
    })
)
annexRoof.position.y = measures.house.annex.roof.height * 0.5 + measures.house.annex.walls.height;
annexRoof.rotation.y = Math.PI * 0.25;

const annexOffset = measures.house.walls.width * 0.7;
annex.position.x = annexOffset;

// FENCE
const fence = new THREE.Group;
const fenceMaterial = new THREE.MeshStandardMaterial({
    map: concreteColorTexture,
    aoMap: concreteARMTexture,
    metalnessMap: concreteARMTexture,
    roughnessMap: concreteARMTexture,
    normalMap: concreteNormalsTexture
});

const fcolumn = new THREE.Group();
const fcolumnMain = new THREE.Mesh(
    new THREE.BoxGeometry(
        measures.fences.column.width,
        measures.fences.column.height,
        measures.fences.column.width,
    ),
    fenceMaterial
);
fcolumnMain.castShadow = true;
fcolumnMain.receiveShadow = true;

const fcolumnTop = new THREE.Mesh(
    new THREE.BoxGeometry(
        measures.fences.columnTop.width,
        measures.fences.columnTop.height,
        measures.fences.columnTop.width,
    ),
    fenceMaterial
);
fcolumnTop.castShadow = true;
fcolumnTop.receiveShadow = true;

fcolumnTop.position.y = measures.fences.column.height * 0.5;
fcolumn.add(fcolumnMain, fcolumnTop);

const fwall = new THREE.Mesh(
    new THREE.BoxGeometry(
        measures.fences.wall.width,
        measures.fences.wall.height,
        measures.fences.wall.depth,
    ),
    fenceMaterial
);

const fcolumn2 = fcolumn.clone();

fcolumn.position.y = measures.fences.column.height * 0.5;
fcolumn.position.x = -(measures.fences.wall.width * 0.5 + measures.fences.column.width * 0.5);

fcolumn2.position.y = measures.fences.column.height * 0.5;
fcolumn2.position.x = measures.fences.wall.width * 0.5 + measures.fences.column.width * 0.5;

fwall.position.y = measures.fences.wall.height * 0.5;
fence.add(fcolumn, fwall, fcolumn2);

// Create all the fences to form a perimeter.
const fenceWidth = measures.fences.column.width * 2 + measures.fences.wall.width;
const fenceGroup = new THREE.Group();
const countX = 7;
const countZ = 7;
// const countWidth = Math.floor(measures.fences.width / fenceWidth);
// const countLength = Math.floor(measures.fences.length / fenceWidth);
let left = 1;
let right = 1;
let groupDirection = 1;
for (let i = 0; i < countX * 2; i++) {
    if(i === 0) continue;
    if(i % countX == 0) {
        groupDirection *= -1;
        left = 1;
        right = 1;
    }

    const direction = i % 2 == 0? 1 : -1
    const fenceMesh = fence.clone();
    if(i % countX == 0) {
        fenceMesh.position.x = 0;
    } else if(direction === -1) {
        fenceMesh.position.x = fenceWidth * left * direction;
        left++;
    } else if(direction === 1) {
        fenceMesh.position.x = fenceWidth * right * direction;
        right++;
    }

    fenceMesh.position.z = fenceWidth * 0.5 * countZ * groupDirection;
    fenceGroup.add(fenceMesh);
}

for (let i = 0; i < countZ * 2; i++) {
    if(i % countZ == 0) {
        groupDirection *= -1;
        left = 1;
        right = 1;
    }
    const direction = i % 2 == 0? 1 : -1
    const fenceMesh = fence.clone();
    fenceMesh.rotation.y = Math.PI * 0.5;
    if(i % countX == 0) {
        fenceMesh.position.z = 0;
    } else if(direction === -1) {
        fenceMesh.position.z = fenceWidth * left * direction;
        left++;
    } else if(direction === 1) {
        fenceMesh.position.z = fenceWidth * right * direction;
        right++;
    }

    fenceMesh.position.x = fenceWidth * 0.5 * countX * groupDirection;
    fenceGroup.add(fenceMesh);
}


annex.add(annexWalls, annexRoof);
house.add(walls, base, roof, annex, door);
scene.add(floor, house, fenceGroup, sun);


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
controls.enableDamping = true;
controls.enablePan = false;
// zoom
controls.maxDistance = 50;
controls.minDistance = 8;
// rotation
controls.maxPolarAngle = Math.PI * 0.45;

/**
 * SHADOWS
 */
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

sunLight.castShadow = true;
sunLight.shadow.mapSize.setScalar(256);
sunLight.shadow.camera.far = 60;
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.top = 10;
sunLight.shadow.camera.bottom = -10;
sunLight.shadow.camera.left = -20;
sunLight.shadow.camera.right = 20;

const shadowHelper = new THREE.CameraHelper(sunLight.shadow.camera);
shadowHelper.visible = false;
scene.add(shadowHelper);
gui.add(shadowHelper, 'visible').name('SunShadowCamera');

floor.receiveShadow = true;
house.children.forEach((child) => {
    child.castShadow = true;
    child.receiveShadow = true;
});
annex.children.forEach((child) => {
    child.castShadow = true;
    child.receiveShadow = true;
});
fenceGroup.traverse((child) => {
    child.castShadow = true;
    child.receiveShadow = true;
});



function loop() {
    // make the sun always look in front
    sun.lookAt(camera.position);

    controls.update();
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


/** 
 * Utils Functions
 */
function createRoofGeometry(width = 4, height = 2, depth = 4, flat = true) {
  // h = half
  const hw = width / 2;
  const hd = depth / 2;

  const positions = new Float32Array([
    // Front triangle
    0, height, hd,     
    -hw, 0, hd,        
    hw, 0, hd,         

    // Back triangle
    0, height, -hd,    
    hw, 0, -hd,        
    -hw, 0, -hd,       

    // Right side face
    0, height, hd,     
    hw, 0, hd,         
    hw, 0, -hd,        
    0, height, -hd,  

    // Left side face
    0, height, hd,     
    0, height, -hd,    
    -hw, 0, -hd,       
    -hw, 0, hd,        

    // flat bottom 
    -hw, 0, -hd,           
    hw, 0, -hd,           
    hw, 0, hd,           
    -hw, 0, hd,           
  ]);

  const indices = [
    // Front triangle
    0, 1, 2,
    // Back triangle
    3, 4, 5,
    // Right side
    6, 7, 8,
    6, 8, 9,
    // Left side
    10, 11, 12,
    10, 12, 13,
    // flat bottom
    14, 15, 16,
    16, 17, 14,
  ];

   // Each triangle gets basic UVs: (0,0), (1,0), (1,1), etc.
  const uvs = new Float32Array([
    // Front triangle
    0.5, 1,
    0, 0,
    1, 0,

    // Back triangle
    0.5, 1,
    1, 0,
    0, 0,

    // Right face
    0, 1,
    1, 1,
    1, 0,
    0, 0,

    // Left face
    0, 1,
    1, 1,
    1, 0,
    0, 0,

    // flat bottom
    0, 0,
    1, 0,
    1, 1,
    0, 1,
  ]);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.computeVertexNormals(); // Important for lighting

  return geometry;
}


