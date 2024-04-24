import * as THREE from 'three';
import { OrbitControls } from './build/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Set up the scene, camera, and renderer.
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.setClearColor(new THREE.Color(0x87CEEB));
// Add orbit controls to the camera.
var controls = new OrbitControls(camera, renderer.domElement);

// Set the camera position to (50, 50, 50).
camera.position.set(50, 50, 50);

// Make the camera look at the origin (0, 0, 0).
camera.lookAt(new THREE.Vector3(0, 0, 0));


// Parameters
const gridSize = 100;
const grid = Array.from({ length: gridSize }, () => new Array(gridSize).fill(false));

// Road generation function
function generateRoad(x, y, fromDirection) {
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize || grid[y][x]) return; // Bounds and overlap check

    grid[y][x] = true; // Mark the grid cell as having a road

    // Create road segment in Three.js
    const roadGeometry = new THREE.BoxGeometry(1, 0.1, 1);
    const roadMaterial = new THREE.MeshBasicMaterial({ color: 0x686868 });
    const roadSegment = new THREE.Mesh(roadGeometry, roadMaterial);
    roadSegment.position.set(x - gridSize / 2, 0, y - gridSize / 2);
    scene.add(roadSegment);

    // Randomly decide to end the road or continue branching
    const continueStraight = Math.random() < 0.9;
    const branchCross = Math.random() < 0.1; // Probability to branch a crossroad
    const branchT = Math.random() < 0.1; // Probability to branch a T-road

    if (continueStraight) {
        // Continue in the same direction
        if (fromDirection === 'north') generateRoad(x, y - 1, 'north');
        else if (fromDirection === 'south') generateRoad(x, y + 1, 'south');
        else if (fromDirection === 'east') generateRoad(x + 1, y, 'east');
        else if (fromDirection === 'west') generateRoad(x - 1, y, 'west');
    }

    if (branchCross || branchT) {
        // Create crossroads or T-roads
        if (!branchT || branchCross) {
            generateRoad(x, y - 1, 'north');
            generateRoad(x, y + 1, 'south');
        }
        generateRoad(x + 1, y, 'east');
        generateRoad(x - 1, y, 'west');
    }
}

// Filter out roads with adjacent roads
// Filter out roads with adjacent roads
function filterRoads() {
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (grid[y][x]) { // If current cell has a road
                // Check adjacent cells for existing roads
                const neighbors = [
                    { dx: 0, dy: -1 }, // North
                    { dx: 0, dy: 1 },  // South
                    { dx: -1, dy: 0 }, // West
                    { dx: 1, dy: 0 }   // East
                ];

                // Flag to track if any adjacent cell contains a road
                let hasAdjacentRoad = false;

                for (const neighbor of neighbors) {
                    const nx = x + neighbor.dx;
                    const ny = y + neighbor.dy;
                    if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && grid[ny][nx]) {
                        hasAdjacentRoad = true;
                        break; // No need to check other neighbors
                    }
                }

                // If any adjacent cell contains a road, remove the road from the current cell
                if (hasAdjacentRoad) {
                    grid[y][x] = false;
                }
            }
        }
    }
}

// Filter roads
filterRoads();



// Start road generation from the center of the grid
generateRoad(Math.floor(gridSize / 2), Math.floor(gridSize / 2), 'north');

// Render loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
}
animate();
