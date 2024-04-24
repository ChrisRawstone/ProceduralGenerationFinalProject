
import * as THREE from 'three';
import { OrbitControls } from './build/controls/OrbitControls.js';

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
const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x0000FF, side: THREE.BackSide }); // Blue color, render on the back side

// Dimensions for the cubes
var width = 5;
var height = 5;
var depth = 5;
var yOffset = 0; // Initial y-position offset 

var generating = true;
while (generating) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const buildingblock = new THREE.Mesh(geometry, material);

  const outlineGeometry = new THREE.BoxGeometry(width * 1.1, height * 1.1, depth * 1.1); // Slightly larger
  const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);

  // Positioning cubes
  buildingblock.position.set(0, yOffset, 0);
  outlineMesh.position.set(0, yOffset, 0);

  scene.add(buildingblock);
  scene.add(outlineMesh);

  yOffset += height; // Move the next cube up by the height of one cube

  // Random chance to continue generating
  generating = Math.random() > 0.1; // 90% chance to add another cube, adjust this value to change probability
}

// Render loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // for camera control
    renderer.render(scene, camera);
}
animate();
