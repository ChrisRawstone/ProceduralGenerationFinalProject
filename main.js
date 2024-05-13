import * as THREE from 'three';
import { OrbitControls } from './build/controls/OrbitControls.js';
import { init_grid, initialize_starting_road, populateGridWithRoadsRecursively, placeBuildings, placeTrees, placeSupermarkets} from './grid.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {addTrees, addSupermarkets, addBuildings, preloadTrees,addShadows} from './objects.js';


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
var probability_of_tree = 0.01; // this is the probability of a tree being placed on a cell

var scale_of_tree = 0.2; // this is the scale of the tree


// Starting positions of the first road - if you are unsure of what to put here, just leave it as is
var x = Math.floor(gridSize * 1 / 4);
var y = Math.floor(gridSize / 2);





grid = init_grid(gridSize);
// Initialize road starting point based on mouse drag
// [grid, x, x_prev, y, y_prev] = initialize_starting_road(grid, gridSize, x, y);
// populateGridWithRoadsRecursively(grid, x, y, x_prev, y_prev, iterations_of_Lsystem, gridSize, line_segment_size, weight_bias, bias_half_life);





// print array nicely
// print my grid array nicely


// controls.update();

// Create and add cells to the scene based on the grid
var {scene, meshGrid} = createCanvas(grid, gridSize, scene);

placeTrees(grid,gridSize,probability_of_tree);
preloadTrees(scene, () => {
    addTrees(grid, gridSize, scene,scale_of_tree);
});

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
    // createCanvas(grid, gridSize, scene)
    updateCanvas(grid, grid, meshGrid, gridSize);  // Update the canvas with new grid data
    console.log('Grid updated:', grid); // Print the grid array

    // console.log('x:', x, 'y:', y);
    // console.log('x_prev:', x_prev, 'y_prev:', y_prev);
}

function handleMouseMove(event) {
    if (isDrawing && !controlsEnabled) {
        handleCanvasInteraction(event);
    }
}

export function createCanvas(grid, gridSize, scene) {
    const cellSize = 1;
    const cellGeometry = new THREE.PlaneGeometry(cellSize, cellSize);
    const meshGrid = new Array(gridSize).fill(null).map(() => new Array(gridSize).fill(null));

    const colors = {
        0: new THREE.Color(88/255,45/255,15/255),
        1: new THREE.Color(1, 1, 1),
        2: new THREE.Color(0, 0, 1),
        3: new THREE.Color(1, 0.5, 0),
        4: new THREE.Color(0, 0.5, 0),
        5: new THREE.Color(0.6, 0.4, 0.2),
    };

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const type = grid[i][j];
            const color = colors[type] || new THREE.Color(0.5, 0.5, 0.5);
            const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
            const cell = new THREE.Mesh(cellGeometry, material);
            cell.rotation.x = -Math.PI / 2;
            cell.position.set(j - 0.5 * gridSize, 0, i - 0.5 * gridSize);
            cell.castShadow = true;
            cell.receiveShadow = true;
            scene.add(cell);
            meshGrid[i][j] = cell;
        }
    }
    return { scene, meshGrid };  // Return both scene and meshGrid
}

export function updateCanvas(oldGrid, newGrid, meshGrid, gridSize) {
    const colors = {
        0: new THREE.Color(88/255,45/255,15/255),
        1: new THREE.Color(1, 1, 1),
        2: new THREE.Color(0, 0, 1),
        3: new THREE.Color(1, 0.5, 0),
        4: new THREE.Color(0, 0.5, 0),
        5: new THREE.Color(0.6, 0.4, 0.2),
    };

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (oldGrid[i][j] !== newGrid[i][j]) {  // Check for changes
                const type = newGrid[i][j];
                const color = colors[type] || new THREE.Color(0.5, 0.5, 0.5);
                const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
                meshGrid[i][j].material = material;  // Update only the material
            }
        }
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
                console.log('Line info:', lineInfo);
                console.log("hit1")
                const oldGrid = grid.map(row => row.slice());  // Create a shallow copy of the grid for comparison
                console.log("hit2")
                // populateGridWithRoadsRecursively(grid, lineInfo.endX, lineInfo.endY, lineInfo.startX, lineInfo.startY, 1, gridSize, 5, 0.5, 10);
                populateGridWithRoadsRecursively(grid, lineInfo.endX, lineInfo.endY, lineInfo.startX, lineInfo.startY, iterations_of_Lsystem, gridSize, line_segment_size, weight_bias, bias_half_life);

                
                console.log("hit3")
                updateCanvas(oldGrid, grid, meshGrid, gridSize);  // Update the canvas with new grid data



                //print line info
                console.log("hit4")

                placeSupermarkets(grid,gridSize, probability_of_supermarket);
                placeBuildings(grid,gridSize,probability_of_building, 5);


                addSupermarkets(grid, gridSize, scene);
                addBuildings(grid, gridSize, scene);

                console.log("hit100!!!")

            }

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