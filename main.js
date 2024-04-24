import * as THREE from 'three';
import { OrbitControls } from './build/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Set up the scene, camera, and renderer.
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add orbit controls to the camera.
var controls = new OrbitControls(camera, renderer.domElement);

// Set the camera position.
camera.position.z = 50;

// Create a basic material for the cubes.
const material = new THREE.MeshNormalMaterial();
const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x0000FF, side: THREE.BackSide });

// Dimensions for the cubes
var width = 5;
var height = 5;
var depth = 5;
var yOffset = 0; 

// Function to create a circular road-like structure
function createCircularRoad(radius, height, segments, yOffset) {
  const angleIncrement = (2 * Math.PI) / segments;
  const roadWidth = 10; // Width of the road
  const roadDepth = 2; // Depth of the road

  for (let i = 0; i < segments; i++) {
      const angle = i * angleIncrement;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);

      const geometry = new THREE.BoxGeometry(roadWidth, height, roadDepth);
      const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const roadBlock = new THREE.Mesh(geometry, material);

      roadBlock.position.set(x, yOffset, z);
      roadBlock.rotation.y = angle;

      scene.add(roadBlock);
  }
}

// Call the function to create a circular road-like structure
createCircularRoad(100, 1, 50, -2); // Adjust parameters as needed


// Add a ground plane
const groundGeometry = new THREE.PlaneGeometry(500, 500);
const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = - Math.PI / 2; // Rotate the ground to be horizontal
ground.position.set(0,-3,-5)
scene.add(ground);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
class Building {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.material = new THREE.MeshNormalMaterial();
        this.outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x0000FF, side: THREE.BackSide });
        this.init();
    }

    init() {
        var yOffset = 0;
        var generating = true;
        while (generating) {
            const width = 5;
            const height = 5;
            const depth = 5;
            const geometry = new THREE.BoxGeometry(width, height, depth);
            const buildingblock = new THREE.Mesh(geometry, this.material);
            const outlineGeometry = new THREE.BoxGeometry(width * 1.1, height * 1.1, depth * 1.1);
            const outlineMesh = new THREE.Mesh(outlineGeometry, this.outlineMaterial);

            buildingblock.position.set(this.x, this.y + yOffset, this.z);
            outlineMesh.position.set(this.x, this.y + yOffset, this.z);

            scene.add(buildingblock);
            scene.add(outlineMesh);

            yOffset += height;
            generating = Math.random() > 0.1;
        }
    }
}


// Function to generate random coordinates
function getRandomCoord() {
    return Math.floor(Math.random() * 100 - 50);  // Range from -50 to 50
}

// Generate multiple buildings
for (let i = 0; i < 10; i++) {
    new Building(getRandomCoord(), 0, getRandomCoord());
}

// Instantiate the GLTFLoader
const gltfLoader = new GLTFLoader();

// Load a GLTF model
// gltfLoader.load(
//   '/models/hungry/scene.gltf',
//   function (gltf) {
//     // Add the loaded model to the scene
//     const model = gltf.scene;
//     model.scale.set(2, 2, 2); // Set scale to 2 in all axes (increase size by 2 times)
//     model.position.set(100, 0, 0); // Set position
//     scene.add(model);
//   },
//   undefined,
//   function (error) {
//     console.error('Error loading GLTF model:', error);
//   }
// );


// Render loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); 
    renderer.render(scene, camera);
}
animate();