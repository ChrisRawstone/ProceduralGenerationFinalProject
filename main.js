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

var gridSize = 100; // this determines the map size
var line_segment_size = 5; // this will make longer roads if it is higher
var iterations_of_Lsystem = 10; // the higher this value is the more roads will be generated
var weight_bias = 0; // the higher this value is the symmetric the roads will be. This can be anywhere from 0 to 10000
var bias_half_life = 0.4; // the lower this value is the less symetric the roads will be from the middle. This can be anywhere from 0 to 1

var probability_of_supermarket = 0.005; // this is the probability of a supermarket being placed on a cell
var probability_of_building = 0.9; // this is the probability of a building being placed on a cell
var probability_of_tree = 0.05; // this is the probability of a tree being placed on a cell

var scale_of_tree = 0.2; // this is the scale of the tree


// Starting positions of the first road - if you are unsure of what to put here, just leave it as is
var x = Math.floor(gridSize * 1 / 4);
var y = Math.floor(gridSize / 2);





grid = init_grid(gridSize);
// Initialize road starting point based on mouse drag
[grid, x, x_prev, y, y_prev] = initialize_starting_road(grid, gridSize, x, y);


// print array nicely
// print my grid array nicely


// controls.update();

// Create and add cells to the scene based on the grid
createCanvas(grid, gridSize, scene);


let controlsEnabled = false;
controls.enabled = controlsEnabled;

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

let isDrawing = false;

function startDrawing(event) {
    if (!controlsEnabled) {
        isDrawing = true;
        handleCanvasInteraction(event);
    }
}

function stopDrawing(event) {
    isDrawing = false;
    // console.log('Grid updated:', grid); // Print the grid array
    createCanvas(grid, gridSize, scene)
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
            if (lineInfo) {
                console.log('Line detected:', lineInfo);
                populateGridWithRoadsRecursively(grid, lineInfo.endX, lineInfo.endY, lineInfo.startX, lineInfo.startY, iterations_of_Lsystem, gridSize, line_segment_size, weight_bias, bias_half_life);
                // populateGridWithRoadsRecursively(grid, x, y, x_prev, y_prev, iterations_of_Lsystem, gridSize, line_segment_size, weight_bias, bias_half_life);

            }

            console.log('Grid updated:', grid); // Print the grid array
        }
    }
}

function checkForLines(grid, x, y, gridSize) {
    // Horizontal check
    let startX = x, endX = x;
    let count = 1;
    for (let i = x - 1; i >= 0 && grid[y][i] === 1; i--, startX--);
    for (let i = x + 1; i < gridSize && grid[y][i] === 1; i++, endX++);
    if (endX - startX > 4) return { startX, endX, startY: y, endY: y };

    // Vertical check
    let startY = y, endY = y;
    count = 1;
    for (let j = y - 1; j >= 0 && grid[j][x] === 1; j--, startY--);
    for (let j = y + 1; j < gridSize && grid[j][x] === 1; j++, endY++);
    if (endY - startY > 4) return { startX: x, endX: x, startY, endY };

    return null;
}




// Attach event listeners for mouse actions
renderer.domElement.addEventListener('mousedown', startDrawing, false);
renderer.domElement.addEventListener('mouseup', stopDrawing, false);
renderer.domElement.addEventListener('mousemove', handleMouseMove, false);



// print array nicely
// print my grid array nicely with each row on a new line

// print my grid array nicely





// Animation loop to render the scene
function animate() {
    requestAnimationFrame(animate);
    // controls.update();
    renderer.render(scene, camera);
}

animate();