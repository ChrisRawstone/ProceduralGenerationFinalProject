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

// Add a ground plane
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = - Math.PI / 2; // Rotate the ground to be horizontal
scene.add(ground);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

var generating = true;
while (generating) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const buildingblock = new THREE.Mesh(geometry, material);

  const outlineGeometry = new THREE.BoxGeometry(width * 1.1, height * 1.1, depth * 1.1);
  const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);

  buildingblock.position.set(0, yOffset, 0);
  outlineMesh.position.set(0, yOffset, 0);

  scene.add(buildingblock);
  scene.add(outlineMesh);

  yOffset += height;

  generating = Math.random() > 0.1;
}

// Instantiate the GLTFLoader
const gltfLoader = new GLTFLoader();

// Load a GLTF model
gltfLoader.load(
  '/models/tree1/scene.gltf',
  function (gltf) {
    // Add the loaded model to the scene
    gltf.scene.position.set(0,0,0)
    scene.add(gltf.scene);
  },
  undefined,
  function (error) {
    console.error('Error loading GLTF model:', error);
  }
);

// Render loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); 
    renderer.render(scene, camera);
}
animate();
