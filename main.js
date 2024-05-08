import * as THREE from 'three';
import { OrbitControls } from './build/controls/OrbitControls.js';
import { init_grid, initialize_starting_road, populateGridWithRoadsRecursively, placeBuildings, placeTrees, placeSupermarkets} from './grid.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {addTrees, addSupermarkets, addBuildings, createCanvas, preloadTrees,addShadows} from './objects.js';


console.log("hey");

// Set up the scene, camera, and renderer
var scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(new THREE.Color(0x87CEEB)); // Light blue background

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smoothly damping effect during rotation
controls.dampingFactor = 0.05;

camera.position.set(0, 50, 100);
camera.lookAt(new THREE.Vector3(0, 0, 0));

const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);


// this is adding shadows to the scene . you can turn off by commenting out this line
addShadows(scene);

const cubeTextureLoader = new THREE.CubeTextureLoader();
cubeTextureLoader.setPath('Textures/skybox/');   
const skyboxTexture = cubeTextureLoader.load([
    'right.jpg', 'left.jpg', 'top.jpg',
    'bottom.jpg', 'front.jpg', 'back.jpg'
]);
scene.background = skyboxTexture;



// Parameters for City Generation
var grid;
var x_prev, y_prev;

var gridSize = 160; // this determines the map size
var line_segment_size = 20; // this will make longer roads if it is higher
var iterations_of_Lsystem = 5; // the higher this value is the more roads will be generated
var weight_bias = 100; // the higher this value is the symmetric the roads will be. This can be anywhere from 0 to 10000
var bias_half_life = 0.5; // the lower this value is the less symetric the roads will be from the middle. This can be anywhere from 0 to 1

var probability_of_supermarket = 0.005; // this is the probability of a supermarket being placed on a cell
var probability_of_building = 0.9; // this is the probability of a building being placed on a cell
var probability_of_tree = 0.05; // this is the probability of a tree being placed on a cell

var scale_of_tree = 0.2; // this is the scale of the tree

// Starting positions of the first road - if you are unsure of what to put here, just leave it as is
var x = Math.floor(gridSize * 1 / 4);
var y = Math.floor(gridSize / 2);




grid = init_grid(gridSize);
[grid, x, x_prev, y, y_prev] = initialize_starting_road(grid, gridSize, x, y);
populateGridWithRoadsRecursively(grid, x, y, x_prev, y_prev, iterations_of_Lsystem, gridSize, line_segment_size, weight_bias, bias_half_life);

// print array nicely
// print my grid array nicely



// this is placing buildings, trees, and supermarkets on the grid
placeSupermarkets(grid,gridSize, probability_of_supermarket);
placeBuildings(grid,gridSize,probability_of_building, 5);
placeTrees(grid,gridSize,probability_of_tree);

// for (let i = 0; i < gridSize; i++) {
//     console.log(grid[i].join(" "));
// }

// this is visualizing the grid
createCanvas(grid,gridSize,scene);



// These are placing Three.js objects in the scene
// addTrees(grid, gridSize, scene);
preloadTrees(scene, () => {
    addTrees(grid, gridSize, scene,scale_of_tree);
});

addSupermarkets(grid, gridSize, scene);
addBuildings(grid, gridSize, scene);





// Render loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
}
animate();
