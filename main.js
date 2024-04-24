import * as THREE from 'three';
import { OrbitControls } from './build/controls/OrbitControls.js';

// Set up the scene, camera, and renderer.
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.setClearColor(new THREE.Color(0x87CEEB));
// Add orbit controls to the camera.
const controls = new OrbitControls(camera, renderer.domElement);

// Set the camera position to (50, 50, 50).
camera.position.set(0, 50, 100);

// Make the camera look at the origin (0, 0, 0).
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Create a 100x100 grid array.
const gridSize = 100;
const grid = [];
for (let i = 0; i < gridSize; i++) {
    grid[i] = [];
    for (let j = 0; j < gridSize; j++) {
        grid[i][j] = { filled: Math.random() > 0.9 }; // Adjust the probability as needed.
    }
}


// Create a plane geometry for each filled grid cell and add it to the scene.
const cellSize = 1;
const cellGeometry = new THREE.PlaneGeometry(cellSize, cellSize);
for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
        if (grid[i][j].filled) {
            const color = new THREE.Color(Math.random(), Math.random(), Math.random());
            const material = new THREE.MeshBasicMaterial({ color });
            const cell = new THREE.Mesh(cellGeometry, material);
            cell.position.set(i - gridSize / 2, j - gridSize / 2, 0); // Position the cell in the grid.
            scene.add(cell);
        }
    }
}

// Render loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
}
animate();
