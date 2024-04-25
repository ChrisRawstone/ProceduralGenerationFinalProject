import * as THREE from 'three';
import { OrbitControls } from './build/controls/OrbitControls.js';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(new THREE.Color(0x87CEEB)); // Light blue background

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 50, 100);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Grid setup
const gridSize = 80;
const grid = [];
for (let i = 0; i < gridSize; i++) {
    grid[i] = new Array(gridSize).fill(0);
}



function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



var x = 0;
var y = Math.floor(gridSize / 2);

var x_prev = x;
var y_prev = y;


console.log(x, y);

// initial start
for (let j = 0; j < grid.length; j++) { 
    if (x >= gridSize) break;
    grid[y][x] = 1; 
    x++; 

} // s
console.log(x, y);

var line_segment_size = 15;

function recursive_draw_lines(x, y, x_prev, y_prev,depth) {
    draw_vertical_line(x, y, x_prev, y_prev,depth,0);
    draw_vertical_line(x, y, x_prev, y_prev,depth,1);

}
recursive_draw_lines(x, y, x_prev, y_prev,15);




function draw_vertical_line(x, y, x_prev, y_prev, depth, direction = 0) {
    if (depth === 0) return;

    if (x_prev > x)
        x = getRandomInt(x_prev - 2, x + 2);
    else
        x = getRandomInt(x_prev + 2, x - 2);

    x = Math.max(0, Math.min(x, gridSize - 1));
    x_prev = x;

    let adjacentCount = 0; // Counter for adjacent road cells

    for (let j = 1; j < line_segment_size; j++) {
        if (direction === 0) { // Moving upwards
            if (y-j < 0 || y-j >= gridSize) break;
    
            // Check both left and right sides of the proposed line
            if (x + 1 < gridSize && grid[y - j][x + 1] == 1) adjacentCount++;
            if (x - 1 >= 0 && grid[y - j][x - 1] == 1) adjacentCount++;
        } else { // Moving downwards
            if (y+j >= gridSize || y+j < 0) break;
    
            // Check both left and right sides of the proposed line
            if (x + 1 < gridSize && grid[y + j][x + 1] == 1) adjacentCount++;
            if (x - 1 >= 0 && grid[y + j][x - 1] == 1) adjacentCount++;
        }
    }
    
    if (adjacentCount > 3) {
        console.log("Cannot place line, too many adjacent roads");
        return; // Exit the function if there are more than 3 adjacent road cells
    }
    

    for (let j = 1; j < line_segment_size; j++) {
        if (y >= gridSize || y < 0) break;

        grid[y][x] = 1; // Place the road

        if (direction === 0) y--;
        else y++;

        // Stop if overwriting another road or out of bounds
        if (!(y < gridSize && y >= 0) || grid[y][x] == 1) break; 
    }

    draw_horizontal_line(x, y, x_prev, y_prev, depth - 1, direction = 0);
    draw_horizontal_line(x, y, x_prev, y_prev, depth - 1, direction = 1);
}

    function draw_horizontal_line(x, y, x_prev, y_prev, depth, direction = 0) {
        if (depth === 0) return;
    
        if (y_prev > y)
            y = getRandomInt(y_prev - 2, y + 2);
        else
            y = getRandomInt(y_prev + 2, y - 2);
    
        y = Math.max(0, Math.min(y, gridSize - 1));
        y_prev = y;
    
        let adjacentCount = 0; // To keep track of adjacent road cells
    
        for (let j = 1; j < line_segment_size; j++) {
            if (direction == 0) { // Checks backward direction along x-axis
                if (x-j < 0 || x-j >= gridSize) break;
                if (y + 1 < gridSize && grid[y + 1][x - j] == 1) adjacentCount++;
                if (y - 1 >= 0 && grid[y - 1][x - j] == 1) adjacentCount++;
            } else { // Checks forward direction along x-axis
                if (x+j >= gridSize || x+j < 0) break;
                if (y + 1 < gridSize && grid[y + 1][x + j] == 1) adjacentCount++;
                if (y - 1 >= 0 && grid[y - 1][x + j] == 1) adjacentCount++;
            }
        }
    
        if (adjacentCount > 4) {
            console.log("Cannot place line, too many adjacent roads");
            return; // Exit the function if there are more than 3 adjacent road cells
        }
    
        for (let j = 1; j < line_segment_size; j++) {
            if (x >= gridSize || x < 0) break;
    
            grid[y][x] = 1; // Place the road
    
            if (direction == 0) x--;
            else x++;
    
            if (!(x >= gridSize || x < 0) && grid[y][x] == 1) break; // Stop if overwriting another road
        }
    
        draw_vertical_line(x, y, x_prev, y_prev, depth - 1, direction = 0);
        draw_vertical_line(x, y, x_prev, y_prev, depth - 1, direction = 1);
    }
    





// Draw the coordinate system
const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);




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



createCanvas();

// Render loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
}
animate();
