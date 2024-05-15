import * as THREE from 'three';
import { OrbitControls } from './build/controls/OrbitControls.js';
import { init_grid, initialize_starting_road, populateGridWithRoadsRecursively, placeBuildings, placeTrees, placeSupermarkets,detectRoadJunctions, groupBuildings} from './grid.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {addTrees, addSupermarkets, addBuildings, preloadTrees,addShadows, createCanvas, updateCanvas} from './objects.js';
import {checkForLines} from './interactive_controls.js';

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

//Tone Mapping for HDR
renderer.toneMapping= THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=0.6;
renderer.outputEncoding=THREE.sRGBEncoding;



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

var gridSize = 100; // this determines the map size
var line_segment_size = 20; // this will make longer roads if it is higher
var iterations_of_Lsystem = 5; // the higher this value is the more roads will be generated
var weight_bias = 100; // the higher this value is the symmetric the roads will be. This can be anywhere from 0 to 10000
var bias_half_life = 0.5; // the lower this value is the less symetric the roads will be from the middle. This can be anywhere from 0 to 1

var probability_of_supermarket = 0.005; // this is the probability of a supermarket being placed on a cell
var probability_of_building = 0.9; // this is the probability of a building being placed on a cell
var probability_of_tree = 0.002; // this is the probability of a tree being placed on a cell

var scale_of_tree = 0.2; // this is the scale of the tree

// Starting positions of the first road - if you are unsure of what to put here, just leave it as is
var x = Math.floor(gridSize * 1 / 4);
var y = Math.floor(gridSize / 2);

let isDrawing = false;
let controlsEnabled = false;
controls.enabled = controlsEnabled;



grid = init_grid(gridSize);
// Initialize the grid



var junctionGrid = detectRoadJunctions(grid, gridSize);


var {scene, meshGrid} = createCanvas(junctionGrid, gridSize, scene);

function toggleControls() {
    controls.enabled = !controls.enabled;
    controlsEnabled = controls.enabled;
    console.log('OrbitControls ' + (controlsEnabled ? 'enabled' : 'disabled'));
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'e') {
        toggleControls();
    }
});


function startDrawing(event) {
    if (!controlsEnabled) {
        isDrawing = true;
        handleCanvasInteraction(event);
    }
}

function stopDrawing(event) {
    isDrawing = false;

    updateCanvas(grid, grid, meshGrid, gridSize);  // Update the canvas with new grid data
    console.log('Grid updated:', grid); // Print the grid array

}

function handleMouseMove(event) {
    if (isDrawing && !controlsEnabled) {
        handleCanvasInteraction(event);
    }
}



function handleCanvasInteraction(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Raycasting to find intersected objects
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const intersect = intersects[0];
        const mesh = intersect.object;
        const x = Math.floor(intersect.point.x + gridSize / 2);
        const y = Math.floor(intersect.point.z + gridSize / 2);

        if (grid[y][x] === 0) { // Check if the cell is empty before drawing
            grid[y][x] = 1;
            mesh.material.color.set(1, 1, 1); // Set to white

            // Check for lines of more than 5 ones horizontally or vertically
            const lineInfo = checkForLines(grid, x, y, gridSize);
            // Example usage within your handleCanvasInteraction
            if (lineInfo) {

                var junctionoldGrid = detectRoadJunctions(grid, gridSize);
                
                const oldGrid = grid.map(row => row.slice());  // Create a shallow copy of the grid for comparison
                // populateGridWithRoadsRecursively(grid, lineInfo.endX, lineInfo.endY, lineInfo.startX, lineInfo.startY, 1, gridSize, 5, 0.5, 10);
                populateGridWithRoadsRecursively(grid, lineInfo.endX, lineInfo.endY, lineInfo.startX, lineInfo.startY, iterations_of_Lsystem, gridSize, line_segment_size, weight_bias, bias_half_life);

                var junctionGrid = detectRoadJunctions(grid, gridSize);

                updateCanvas(oldGrid, junctionGrid, meshGrid, gridSize);  // Update the canvas with new grid data


                placeSupermarkets(grid,gridSize, probability_of_supermarket);
                placeBuildings(grid,gridSize,probability_of_building, 5);


                addSupermarkets(grid, gridSize, scene);
                addBuildings(grid, gridSize, scene);

            }

        }
    }


}


// Get input elements and their corresponding value display elements
const lineSegmentSizeInput = document.getElementById('line_segment_size');
const lineSegmentSizeValue = document.getElementById('line_segment_size_value');
const iterationsOfLSystemInput = document.getElementById('iterations_of_Lsystem');
const iterationsOfLSystemValue = document.getElementById('iterations_of_Lsystem_value');
const weightBiasInput = document.getElementById('weight_bias');
const weightBiasValue = document.getElementById('weight_bias_value');
const biasHalfLifeInput = document.getElementById('bias_half_life');
const biasHalfLifeValue = document.getElementById('bias_half_life_value');
const probabilityOfTreeInput = document.getElementById('probability_of_tree');
const probabilityOfTreeValue = document.getElementById('probability_of_tree_value');

// Update value displays
lineSegmentSizeValue.textContent = lineSegmentSizeInput.value;
iterationsOfLSystemValue.textContent = iterationsOfLSystemInput.value;
weightBiasValue.textContent = weightBiasInput.value;
biasHalfLifeValue.textContent = biasHalfLifeInput.value;
probabilityOfTreeValue.textContent = probabilityOfTreeInput.value;

// Event listeners to update variables and display values
lineSegmentSizeInput.addEventListener('input', (event) => {
    line_segment_size = event.target.value;
    lineSegmentSizeValue.textContent = event.target.value;
});

iterationsOfLSystemInput.addEventListener('input', (event) => {
    iterations_of_Lsystem = event.target.value;
    iterationsOfLSystemValue.textContent = event.target.value;
});

weightBiasInput.addEventListener('input', (event) => {
    weight_bias = event.target.value;
    weightBiasValue.textContent = event.target.value;
});

biasHalfLifeInput.addEventListener('input', (event) => {
    bias_half_life = event.target.value;
    biasHalfLifeValue.textContent = event.target.value;
});



probabilityOfTreeInput.addEventListener('input', (event) => {
    probability_of_tree = event.target.value;
    probabilityOfTreeValue.textContent = event.target.value;

    // Remove existing trees from the scene
    const treesToRemove = [];
    scene.traverse((child) => {
        if (child.userData.type === 'tree') {
            treesToRemove.push(child);
        }
    });
    treesToRemove.forEach(tree => scene.remove(tree));

    // Clear existing trees from the grid
    grid.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell === 4) { // Assuming 4 represents a tree
                grid[y][x] = 0; // Clear the cell
            }
        });
    });

    // Place new trees
    placeTrees(grid, gridSize, probability_of_tree);
    preloadTrees(scene, () => {
        addTrees(grid, gridSize, scene, scale_of_tree);
    });
});

// Attach event listeners for mouse actions
renderer.domElement.addEventListener('mousedown', startDrawing, false);
renderer.domElement.addEventListener('mouseup', stopDrawing, false);
renderer.domElement.addEventListener('mousemove', handleMouseMove, false);








// Animation loop to render the scene
function animate() {
    requestAnimationFrame(animate);
    // controls.update();
    renderer.render(scene, camera);
}

animate();