import * as THREE from 'three';
import { OrbitControls } from './build/controls/OrbitControls.js';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(new THREE.Color(0x87CEEB)); // Light blue background

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 50, 100);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Grid setup
const gridSize = 20;
const grid = [];
for (let i = 0; i < gridSize; i++) {
    grid[i] = new Array(gridSize).fill(0);
}

// L-System Setup
const rules = {
    "v": "hvh",  // v expands to horizontal block, vertical road, horizontal block
    "h": "vhv"   // h expands to vertical block, horizontal road, vertical block
};

let currentString = "v";

function generate(iterations) {
    let nextString = "";
    for (let i = 0; i < iterations; i++) {
        nextString = "";
        for (let char of currentString) {
            nextString += rules[char] || char;
        }
        currentString = nextString;
        console.log(currentString);
    }
}

// function applyLSystem(currentString) {
//     // Start from the center of the grid
//     let x = Math.floor(gridSize / 2);
//     let y = Math.floor(gridSize / 2);
    
//     for (let i = 0; i < currentString.length; i++) {
//         let char = currentString[i];
//         switch (char) {
//             case 'v':
//                 // Draw a vertical line
//                 for (let j = 0; j < 50; j++) { // Assuming each line is 10 cells long
//                     grid[x][y] = 1; // Mark the cell as filled
//                     y++; // Move down in the grid
//                     if (y >= gridSize) break; // Stop if we reach the bottom of the grid
//                 }
//                 y--; // Adjust y to stay within the grid
//                 break;
//             case 'h':
//                 // Draw a horizontal line
//                 for (let j = 0; j < 50; j++) { // Assuming each line is 10 cells long
//                     grid[x][y] = 1; // Mark the cell as filled
//                     x++; // Move right in the grid
//                     if (x >= gridSize) break; // Stop if we reach the right edge of the grid
//                 }
//                 x--; // Adjust x to stay within the grid
//                 break;
//         }
//         // Randomly choose the next starting point on the last line
//         if (char === 'v' && currentString[i + 1] === 'h') {
//             // Choose a random point on the current vertical line
//             x += Math.floor(Math.random() * 10) - 5; // Random move left or right
//             x = Math.max(0, Math.min(x, gridSize - 1)); // Ensure x stays within grid bounds
//             console.log(x, y);
//         } else if (char === 'h' && currentString[i + 1] === 'v') {
//             // Choose a random point on the current horizontal line
//             y += Math.floor(Math.random() * 10) - 5; // Random move up or down
//             y = Math.max(0, Math.min(y, gridSize - 1)); // Ensure y stays within grid bounds
//         }
//     }
// }

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let x = Math.floor(gridSize / 2);
let y = Math.floor(gridSize / 2);

var x_prev = x;
var y_prev = y;


console.log(x, y);

// initial start
for (let j = 0; j < 5; j++) { 
    if (x >= gridSize) break;
    grid[y][x] = 1; 
    x++; 

} // should not be touched



console.log(x, y);
// vertical line
var random_value = getRandomInt(x_prev+2,x)-x;
x += random_value; // Random move up or down
x = Math.max(0, Math.min(x, gridSize - 1)); 
console.log(x, y);
console.log(random_value);

for (let j = 0; j < 5; j++) { 
    if (y >= gridSize) break;
    grid[y][x] = 1; 
    y++; 
}
var x_prev = x;

// horizontal line
var random_value = getRandomInt(y_prev+2,y)-y;
y += random_value; // Random move up or down
y = Math.max(0, Math.min(y, gridSize - 1));

for (let j = 0; j < 5; j++) { 
    if (x >= gridSize) break;
    grid[y][x] = 1; 
    x++; 
}
var y_prev = y;


var random_value = getRandomInt(x_prev+2,x)-x;
x += random_value; // Random move up or down
x = Math.max(0, Math.min(x, gridSize - 1)); 
console.log(x, y);
console.log(random_value);

for (let j = 0; j < 5; j++) { 
    if (y >= gridSize) break;
    grid[y][x] = 1; 
    y++; 
}
var x_prev = x;

var random_value = getRandomInt(y_prev+2,y)-y;
y += random_value; // Random move up or down
y = Math.max(0, Math.min(y, gridSize - 1));

for (let j = 0; j < 5; j++) { 
    if (x >= gridSize) break;
    grid[y][x] = 1; 
    x++; 
}
var y_prev = y;



// Draw the coordinate system
const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);


// console.log(x, y);


for (let i = 0; i < gridSize; i++) {

    var temp_array = "";
    for (let j = 0; j < gridSize; j++) {
        temp_array += grid[i][j];
    }
    console.log(temp_array);
}


// Create canvas based on grid
function createCanvas() {
    const cellSize = 1;
    const cellGeometry = new THREE.PlaneGeometry(cellSize, cellSize);
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const color = grid[i][j] === 1 ? new THREE.Color(1, 1, 1) : new THREE.Color(0, 0, 0);
            const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
            const cell = new THREE.Mesh(cellGeometry, material);
            cell.position.set(j -0.5*gridSize, i -0.5*gridSize , 0); // minus 1/2 gridsize can be removed later on. it just for centering
            scene.add(cell);
        }
    }
}

// Generate and apply L-system
generate(1); // You can increase iterations to expand the city plan
// applyLSystem(currentString);
createCanvas();

// Render loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
}
animate();
