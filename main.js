import * as THREE from 'three';
import { OrbitControls } from './build/controls/OrbitControls.js';
import { init_grid, initialize_starting_road, populateGridWithRoadsRecursively, placeBuildings, placeTrees, placeSupermarkets, createCanvas} from './grid.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {addTrees, addSupermarkets, addBuildings} from './objects.js';
import { getRandomTreeIndex,loadModel } from './Importing_gltf.js';

console.log("hey");

// Set up the scene, camera, and renderer
var scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true; // Enable shadow maps in the renderer
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: Use PCF soft shadows for better shadow quality
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(new THREE.Color(0x87CEEB)); // Light blue background

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 50, 100);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Set up directional light
const light = new THREE.DirectionalLight(0xffffff, 2.0);
light.position.set(-10, 20, 10); // Adjust the position to ensure it's not too far
light.castShadow = true;
light.shadow.mapSize.width = 2048; // Higher resolution for shadow map
light.shadow.mapSize.height = 2048;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 500; // Ensure the far plane encompasses all shadow-receiving objects
light.shadow.camera.left = -50; // These values might need adjustment
light.shadow.camera.right = 50;
light.shadow.camera.top = 50;
light.shadow.camera.bottom = -50;
scene.add(light);



var grid;
var x_prev, y_prev;

var gridSize = 160;
var line_segment_size = 20;
var iterations_of_Lsystem = 5;
var weight_bias = 100;
var bias_half_life = 1;


var x = Math.floor(gridSize * 1 / 4);
var y = Math.floor(gridSize / 2);




grid = init_grid(gridSize);
[grid, x, x_prev, y, y_prev] = initialize_starting_road(grid, gridSize, x, y);
populateGridWithRoadsRecursively(grid, x, y, x_prev, y_prev, iterations_of_Lsystem, gridSize, line_segment_size, weight_bias, bias_half_life);

// this is placing buildings, trees, and supermarkets on the grid
placeSupermarkets(grid,gridSize, 0.005);
placeBuildings(grid,gridSize,0.9, 5);
placeTrees(grid,gridSize,0.15);

// this is visualizing the grid
createCanvas(grid,gridSize,scene);




// These are placing Three.js objects in the scene
addTrees(grid, gridSize, scene);
addSupermarkets(grid, gridSize, scene);
addBuildings(grid, gridSize, scene);

// Render loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
}
animate();
