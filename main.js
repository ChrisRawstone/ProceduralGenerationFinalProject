import * as THREE from 'three';
import { OrbitControls } from './build/controls/OrbitControls.js';
import { init_grid, initialize_starting_road, populateGridWithRoadsRecursively, placeBuildings, placeTrees, placeSupermarkets, createCanvas} from './grid.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {addTrees, addSupermarkets, addBuildings} from './objects.js';

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


const gridSize = 160;
// var line_segment_size = Math.floor(3/4*gridSize - 1/4*gridSize);
var line_segment_size = 10
var iterations_of_Lsystem = 20;
var weight_bias=1000 ;
var bias_half_life=0.5;

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

// initial start from 1/4 
var x = Math.floor(grid.length*1/4);
var y = Math.floor(gridSize / 2);

var x_prev = x;
var y_prev = y;

console.log("calc",Math.floor(grid.length*3/4)-Math.floor(grid.length*1/4))

// initial start from 1/4 of the road to 3/4 of the road
for (let j = Math.floor(grid.length*1/4); j < Math.floor(grid.length*3/4); j++) { 
    if (x >= gridSize) break;
    grid[y][x] = 1; 
    x++; 

} 


// console.log(Math.floor(grid.length*1/4));

function recursive_draw_lines(x, y, x_prev, y_prev,depth) {
    draw_vertical_line(x, y, x_prev, y_prev,depth,0,weight_bias); //  0 means making a line downwards
    draw_vertical_line(x, y, x_prev, y_prev,depth,1,weight_bias); // 1 means making a line upwards

}
recursive_draw_lines(x, y, x_prev, y_prev, iterations_of_Lsystem);



function draw_vertical_line(x, y, x_prev, y_prev, depth, direction = 0,bias=weight_bias) {
    if (depth === 0) return;
    // check if out of bounds
    if (x >= gridSize || x < 0) return;
    if (x >= gridSize || x < 0) return;

    // console.log("vertical_line")
    // console.log("x_prev:",x_prev,"x:",x)
    // console.log("y_prev:",y_prev,"y:",y)
    // console.log("bias:",weight_bias)

    x = Math.max(0, Math.min(x, gridSize - 1));

 
    if ((x_prev > x) && (x+2 < x_prev-2)) {
        x = biasedRandom(x+2, x_prev-2,bias);
    } else if ((x > x_prev) && (x+2 > x_prev-2)) {
        x = biasedRandom(x_prev-2, x+2,bias);
    } else {
        // console.log("special case")
        x=x
    }

    // console.log("x_prev:",x_prev,"x:",x)
    // console.log("y_prev:",y_prev,"y:",y)

    x = Math.max(0, Math.min(x, gridSize - 1));
    x_prev = x;

    let adjacentCount = 0; // Counter for adjacent road cells
  
    for (let j = 1; j < line_segment_size; j++) {
        
        if (direction == 0) { // Moving downwards!!
            if (y-j < 0 || y-j >= gridSize)  break;
            // grid[y-j][x]=3;
            // Check both left and right sides of the proposed line
            if (x + 1 < gridSize && grid[y - j][x + 1] == 1) adjacentCount++; 
            if (x - 1 >= 0 && grid[y - j][x - 1] == 1) adjacentCount++; 

            
            // Stop if overwriting another road or out of bounds
            if (!(y-j < gridSize && y-j >= 0) && grid[y-j][x] == 1)  break;
        } else { // Moving upwards!!
            if (y+j >= gridSize || y+j < 0) break;
    
            // Check both left and right sides of the proposed line
            // grid[y+j][x]=3;
            if (x + 1 < gridSize && grid[y + j][x + 1] == 1) adjacentCount++;
            if (x - 1 >= 0 && grid[y + j][x - 1] == 1) adjacentCount++;
            
            // Stop if overwriting another road or out of bounds
            if (!(y+j < gridSize && y+j >= 0) && grid[y+j][x] == 1)  break;
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
    // console.log("x_prev:",x_prev,"x:",x)
    // console.log("y_prev:",y_prev,"y:",y)
    // console.log("bias",bias)
    draw_horizontal_line(x, y, x_prev, y_prev, depth - 1, direction = 0,bias = Math.ceil(bias*bias_half_life));
    draw_horizontal_line(x, y, x_prev, y_prev, depth - 1, direction = 1,bias = Math.ceil(bias*bias_half_life));
}

    function draw_horizontal_line(x, y, x_prev, y_prev, depth, direction = 0,bias = weight_bias) {
        if (depth == 0) return;

        // check if out of bounds
        if (y >= gridSize || y < 0) return;
        if (x >= gridSize || x < 0) return;


        // console.log("horisontal_line")
        // console.log("bias",bias)
        // console.log("x_prev:",x_prev,"x:",x)
        // console.log("y_prev:",y_prev,"y:",y)
        // console.log("bias:",biasedRandom(y_prev, y, bias));

 
        if ((y_prev > y) && (y+2 < y_prev-2)) {
            // console.log("first:", "y+2: ub:", y-2, "y_prev-2: lb:",y_prev-2)
            y = biasedRandom(y+2, y_prev-2, bias); // this should proably be opposite?
        } else if ((y_prev < y) && (y-2 > y_prev+2)) { 
            // console.log("second:", "y_prev+2: lb:", y_prev+2, "y-2: ub:",y-2)
            // console.log("bias:", biasedRandom(y-2, y_prev+2,bias))
            y = biasedRandom(y_prev+2, y-2,bias); // this I think works
        } else {
            console.log("special case")
            y=y
        }

        // console.log("x_prev:",x_prev,"x:",x)
        // console.log("y_prev:",y_prev,"y:",y)

        y = Math.max(0, Math.min(y, gridSize - 1));
        y_prev = y;
    
        let adjacentCount = 0; // To keep track of adjacent road cells

    
        for (let j = 1; j < line_segment_size; j++) {
            if (direction == 0) { // Checks backward direction along x-axis
                if (x-j < 0 || x-j >= gridSize) break;
                if (y + 1 < gridSize && grid[y + 1][x - j] == 1) adjacentCount++;
                if (y - 1 >= 0 && grid[y - 1][x - j] == 1) adjacentCount++;

                if (!(x-j >= gridSize || x-j < 0) && grid[y][x-j] == 1) break; // Stop if overwriting another road
            } else { // Checks forward direction along x-axis
                if (x+j >= gridSize || x+j < 0) break;
                if (y + 1 < gridSize && grid[y + 1][x + j] == 1) adjacentCount++;
                if (y - 1 >= 0 && grid[y - 1][x + j] == 1) adjacentCount++;

                // console.log("x:",x,"y:",y)
                if (!(x+j >= gridSize || x+j < 0) && grid[y][x+j] == 1) break; // Stop if overwriting another road
                
            }
        }
    
        if (adjacentCount > 3) {
            console.log("Cannot place line, too many adjacent roads");
            return; // Exit the function if there are more than 3 adjacent road cells
        }
    
        for (let j = 1; j < line_segment_size; j++) {
            if (x >= gridSize || x <= 0) break; // checks if we are outside the grid
    
            grid[y][x] = 1; // Place the road
    
            if (direction == 0) x--;
            else x++;
    
            if (!(x >= gridSize || x < 0) && grid[y][x] == 1) break; // Stop if overwriting another road
        }
        
        // console.log("x_prev:",x_prev,"x:",x)
        // console.log("y_prev:",y_prev,"y:",y)
        draw_vertical_line(x, y, x_prev, y_prev, depth - 1, direction = 0,bias = Math.ceil(bias*bias_half_life)); 
        draw_vertical_line(x, y, x_prev, y_prev, depth - 1, direction = 1,bias = Math.ceil(bias*bias_half_life));
    }


// Calculate the percentage of 1s
const countOfOnes = grid.flat().filter(value => value === 1).length;
const totalCells = gridSize * gridSize;
const percentageOfOnes = (countOfOnes / totalCells) * 100;

// Print the result
console.log(`Percentage of fields with 1: ${percentageOfOnes.toFixed(2)}%`);

// grid[29][20] = 3;

function biasedRandom(lowerBound, upperBound, biasFactor = 2) {
    // Validate the input to ensure lowerBound is less than upperBound
    if (lowerBound >= upperBound) {
        throw new Error("Lower bound must be less than upper bound.");
    }

    let sum = 0;
    // Summing up 'biasFactor' amount of random numbers to skew the distribution towards the middle
    for (let i = 0; i < biasFactor; i++) {
        sum += Math.random();
    }

    // Average the sum to get a skewed random number
    let avgRandom = sum / biasFactor;

    // Scale and adjust the random number to fit within the bounds
    let biasedRandomNumber = lowerBound + avgRandom * (upperBound - lowerBound);

    return Math.floor(biasedRandomNumber);
}

// Example of usage:
console.log(biasedRandom(40, 69,5)); // Most results will be closer to 15

function placeBuildings(probability, maxBuildingSize) {
    const center = gridSize / 2; // Calculate center of the grid

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === 0) {
                if (Math.random() < probability) {
                    // Start with the smallest building size
                    let buildingSize = 1;
                    let distanceFromCenter = Math.sqrt((center - i) ** 2 + (center - j) ** 2); // Euclidean distance from the center

                    // Modify probability based on distance from center
                    // Closer to center has a higher chance to increase building size
                    let buildingSizeProbability = 0.5 * (1 - distanceFromCenter / center);

                    while (buildingSize < maxBuildingSize && Math.random() < buildingSizeProbability) {
                        buildingSize++;
                    }

                    // Check if the building can be placed
                    if (canPlaceBuilding(i, j, buildingSize)) {
                        for (let k = 0; k < buildingSize; k++) {
                            for (let l = 0; l < buildingSize; l++) {
                                if ((i + k < gridSize) && (j + l < gridSize)) {
                                    grid[i + k][j + l] = 2; // Mark the grid cell as occupied by the building
                                }
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

function placeTrees(treeProbability) {
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === 0 && Math.random() < treeProbability) { // Check if the space is empty and random chance
                // Check adjacent cells
                if (canPlaceTree(i, j)) {
                    grid[i][j] = 4; // Place a tree
                }
            }
        }
    }
}

function canPlaceTree(x, y) {
    const directions = [
        [0, 1], [1, 0], [0, -1], [-1, 0], // Horizontal and vertical
        [1, 1], [-1, -1], [1, -1], [-1, 1] // Diagonal
    ];

    for (let [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && grid[nx][ny] === 4) {
            return false; // There's a tree in an adjacent cell, so cannot place another one here
        }
    }
    return true; // No trees adjacent, can place a tree
}

function placeSupermarkets(baseProbability) {
    for (let i = 0; i <= gridSize - 4; i++) {
        for (let j = 0; j <= gridSize - 4; j++) {
            if (canPlaceSupermarket(i, j)) {
                let roadCount = countAdjacentRoads(i, j); // Count roads adjacent to the 4x4 block
                let adjustedProbability = baseProbability * (1 + roadCount / 8); // Increase probability with more roads
                if (Math.random() < adjustedProbability) {
                    for (let k = 0; k < 4; k++) {
                        for (let l = 0; l < 4; l++) {
                            grid[i + k][j + l] = 3; // Mark these cells as occupied by a supermarket
                        }
                    }
                }
            }
        }
    }
}

function canPlaceSupermarket(x, y) {
    // Ensure the 4x4 block is completely free
    for (let dx = 0; dx < 4; dx++) {
        for (let dy = 0; dy < 4; dy++) {
            if (grid[x + dx][y + dy] !== 0) {
                return false; 
            }
        }
    }
    // Check if there is at least one road adjacent to the 4x4 block
    return countAdjacentRoads(x, y) > 0;
}

function countAdjacentRoads(x, y) {
    let count = 0;
    // Check horizontal and vertical roads adjacent to all sides
    for (let dx = -1; dx <= 4; dx++) {
        for (let dy = -1; dy <= 4; dy++) {
            if (dx === -1 || dx === 4 || dy === -1 || dy === 4) {
                let nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && grid[nx][ny] === 1) {
                    count++;
                }
            }
        }
    }
    return count;
}




placeSupermarkets(0.005);
placeBuildings(0.5, 5);
placeTrees(0.15);







function createCanvas() {
    const cellSize = 1;
    const cellGeometry = new THREE.PlaneGeometry(cellSize, cellSize);

    // Define colors for different types of grid cells
    const colors = {
        0: new THREE.Color(0, 0, 0), // Empty space
        1: new THREE.Color(1, 1, 1), // Road (white)
        2: new THREE.Color(0, 0, 1),  // Building (blue)
        3: new THREE.Color(1, 0.5, 0),  // Super Market (orange)
        4: new THREE.Color(0, 0.5, 0), // Trees (Dark green)
    };

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const type = grid[i][j];
            const color = colors[type] || new THREE.Color(0.5, 0.5, 0.5); // Default color if type is not defined
            const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
            const cell = new THREE.Mesh(cellGeometry, material);

            // Rotate each cell individually
            cell.rotation.x = -Math.PI / 2;

            // Adjust position to center the grid on the xz-plane
            cell.position.set(j - 0.5 * gridSize, 0, i - 0.5 * gridSize);
            scene.add(cell);
        }
    }
}

function addBuildings() {
    const cellSize = 1;
    const buildingMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(0, 0, 1), side: THREE.DoubleSide }); // Blue for buildings
    const processed = new Set(); // To track processed cells

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const key = `${i},${j}`;
            if (grid[i][j] === 2 && !processed.has(key)) {
                // Find contiguous building cells
                const size = getBuildingSize(grid, i, j, processed);
                const baseHeight = 1; // Minimum building height
                const randomHeight = baseHeight + Math.random() * size*2; // Random height influenced by building size

                const cubeGeometry = new THREE.BoxGeometry(cellSize * size, randomHeight, cellSize * size);
                const building = new THREE.Mesh(cubeGeometry, buildingMaterial);
                building.position.set((j + size / 2 - 0.5) * cellSize - 0.5 * gridSize, randomHeight / 2, (i + size / 2 - 0.5) * cellSize - 0.5 * gridSize);
                scene.add(building);
            }
        }
    }
}

function getBuildingSize(grid, startI, startJ, processed) {
    let size = 1;
    // Expand in the j (x) direction
    while (startJ + size < gridSize && grid[startI][startJ + size] === 2 && !processed.has(`${startI},${startJ + size}`)) {
        size++;
    }
    // Mark cells as processed
    for (let x = startJ; x < startJ + size; x++) {
        processed.add(`${startI},${x}`);
    }
    return size;
}


function addTrees() {
    const cellSize = 1;
    const treeHeight = 2; // Fixed height for all trees for simplicity
    const treeRadius = 0.2; // Radius of the tree's trunk
    const treeGeometry = new THREE.CylinderGeometry(treeRadius, treeRadius, treeHeight, 16); // Create a cylinder to represent trees
    const treeMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(0, 0.5, 0) }); // Dark green for trees

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === 4) {  // Check if the cell type is for a tree
                const tree = new THREE.Mesh(treeGeometry, treeMaterial);
                tree.position.set(j - 0.5 * gridSize, treeHeight / 2, i - 0.5 * gridSize);  // Position the tree so it stands upright
                scene.add(tree);
            }
        }
    }
}

function addSupermarkets() {
    const cellSize = 1;
    const supermarketHeight = 1.5; // Set a specific height for supermarkets
    const supermarketGeometry = new THREE.BoxGeometry(cellSize, supermarketHeight, cellSize); // Create a cube for supermarkets
    const supermarketMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.5, 0) }); // Orange color for supermarkets

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === 3) {  // Check if the cell type is for a supermarket
                const supermarket = new THREE.Mesh(supermarketGeometry, supermarketMaterial);
                supermarket.position.set(j - 0.5 * gridSize, supermarketHeight / 2, i - 0.5 * gridSize);  // Center the supermarket cube on the cell
                scene.add(supermarket);
            }
        }
    }
}


addTrees();
addSupermarkets();
createCanvas();
addBuildings();

// Render loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
}
animate();
