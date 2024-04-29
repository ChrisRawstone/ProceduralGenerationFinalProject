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

var line_segment_size = 30;
const gridSize = 80;
var iterations_of_Lsystem = 20;

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


// Grid setup
const grid = [];
for (let i = 0; i < gridSize; i++) {
    grid[i] = new Array(gridSize).fill(0);
}


var x = 0;
var y = Math.floor(gridSize / 2);

var x_prev = x;
var y_prev = y;


// initial start
for (let j = 0; j < grid.length; j++) { 
    if (x >= gridSize) break;
    grid[y][x] = 1; 
    x++; 

} 




function recursive_draw_lines(x, y, x_prev, y_prev,depth) {
    draw_vertical_line(x, y, x_prev, y_prev,depth,0); //  0 means making a line upwards
    draw_vertical_line(x, y, x_prev, y_prev,depth,1); // 1 means making a line downwards

}
recursive_draw_lines(x, y, x_prev, y_prev, iterations_of_Lsystem);



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
            y = getRandomInt(y_prev + 2, y - 2)
    
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


// Calculate the percentage of 1s
const countOfOnes = grid.flat().filter(value => value === 1).length;
const totalCells = gridSize * gridSize;
const percentageOfOnes = (countOfOnes / totalCells) * 100;

// Print the result
console.log(`Percentage of fields with 1: ${percentageOfOnes.toFixed(2)}%`);



// Function to place buildings
function placeBuildings(probability, maxBuildingSize) {
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            // Check if current spot is available (not a road or already taken by another building)
            if (grid[i][j] === 0) {
                // Decide randomly whether to place a building here based on probability
                if (Math.random() < probability) {
                    // Randomly decide the size of the building
                    const buildingSize = Math.floor(Math.random() * maxBuildingSize) + 1;

                    // Check if a building of this size can be placed here and has a road next to it
                    if (canPlaceBuilding(i, j, buildingSize)) {
                        // Place the building
                        for (let k = 0; k < buildingSize; k++) {
                            for (let l = 0; l < buildingSize; l++) {
                                grid[i + k][j + l] = 2;
                            }
                        }
                    }
                }
            }
        }
    }
}

// Function to check if a building can be placed
function canPlaceBuilding(x, y, size) {
    // Check grid boundaries
    if (x + size > gridSize || y + size > gridSize) {
        return false;
    }
    
    // Check if adjacent to a road
    let adjacentRoad = false;
    const checkPositions = [
        [x - 1, y], [x + size, y], [x, y - 1], [x, y + size],  // Check edges
        [x - 1, y - 1], [x + size, y - 1], [x - 1, y + size], [x + size, y + size]  // Check corners
    ];

    for (const [checkX, checkY] of checkPositions) {
        if (checkX >= 0 && checkX < gridSize && checkY >= 0 && checkY < gridSize && grid[checkX][checkY] === 1) {
            adjacentRoad = true;
            break;
        }
    }

    if (!adjacentRoad) {
        return false;
    }

    // Ensure the space is available and has at least one empty space or road around it
    for (let i = Math.max(x - 1, 0); i <= Math.min(x + size, gridSize - 1); i++) {
        for (let j = Math.max(y - 1, 0); j <= Math.min(y + size, gridSize - 1); j++) {
            if (i < x || i >= x + size || j < y || j >= y + size) { // Only check the buffer zone
                if (grid[i][j] === 2) { // If there is another building in the buffer
                    return false;
                }
            } else if (grid[i][j] !== 0) { // Check the building area
                return false;
            }
        }
    }

    return true; // Valid position for a building
}

placeBuildings(0.99, 4);








function createCanvas() {
    const cellSize = 1;
    const cellGeometry = new THREE.PlaneGeometry(cellSize, cellSize);

    // Define colors for different types of grid cells
    const colors = {
        0: new THREE.Color(0, 0, 0), // Empty space
        1: new THREE.Color(1, 1, 1), // Road (white)
        2: new THREE.Color(0, 0, 1)  // Building (blue)
    };

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const type = grid[i][j];
            const color = colors[type] || new THREE.Color(0.5, 0.5, 0.5); // Default color if type is not defined
            const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
            const cell = new THREE.Mesh(cellGeometry, material);
            cell.position.set(j - 0.5 * gridSize, i - 0.5 * gridSize, 0); // Center the grid in the scene
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
