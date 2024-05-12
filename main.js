import * as THREE from 'three';
import { OrbitControls } from './build/controls/OrbitControls.js';
import { init_grid, initialize_starting_road, populateGridWithRoadsRecursively, placeBuildings, placeTrees, placeSupermarkets,detectRoadJunctions} from './grid.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {addTrees, addSupermarkets, addBuildings, createCanvas, preloadTrees, hdrLoader} from './objects.js';



console.log("hey");

// Set up the scene, camera, and renderer
var scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
// renderer.shadowMap.enabled = true; // Enable shadow maps in the renderer
// renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: Use PCF soft shadows for better shadow quality
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(new THREE.Color(0x87CEEB)); // Light blue background

//Tone Mapping for HDR
renderer.toneMapping= THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=0.6;
renderer.outputEncoding=THREE.sRGBEncoding;



const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 50, 100);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Set up directional light
const light = new THREE.DirectionalLight(0xffffff, 2.0);
light.position.set(-10, 20, 10); // Adjust the position to ensure it's not too far
// light.castShadow = true;
// light.shadow.mapSize.width = 2048; // Higher resolution for shadow map
// light.shadow.mapSize.height = 2048;
// light.shadow.camera.near = 0.5;
// light.shadow.camera.far = 500; // Ensure the far plane encompasses all shadow-receiving objects
// light.shadow.camera.left = -50; // These values might need adjustment
// light.shadow.camera.right = 50;
// light.shadow.camera.top = 50;
// light.shadow.camera.bottom = -50;
scene.add(light);






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
var probability_of_tree = 0.01; // this is the probability of a tree being placed on a cell

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
var newgrid=detectRoadJunctions(grid,gridSize)
// this is visualizing the grid
createCanvas(newgrid,gridSize,scene);




// These are placing Three.js objects in the scene
// addTrees(grid, gridSize, scene);
preloadTrees(scene, () => {
    addTrees(grid, gridSize, scene);
});

addSupermarkets(grid, gridSize, scene);
addBuildings(grid, gridSize, scene);
//hdrLoader(scene,renderer);



// Render loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
}
animate();



for (let i = 0; i < gridSize; i++) {
    console.log(newgrid[i].join(" "));
}

// find coordinates in the grid where the value is 4
for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
        if (newgrid[i][j] === 10 ||newgrid[i][j] === 11 || newgrid[i][j] === 12  ) {
            console.log(`Road found at (${i}, ${j})`);
        }
    }
}
