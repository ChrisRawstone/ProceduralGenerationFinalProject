import * as THREE from 'three';
import { OrbitControls } from './build/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Set up the scene, camera, and renderer.
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.setClearColor(new THREE.Color(0x87CEEB));
// Add orbit controls to the camera.
var controls = new OrbitControls(camera, renderer.domElement);

// Set the camera position to (50, 50, 50).
camera.position.set(50, 50, 50);

// Make the camera look at the origin (0, 0, 0).
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

    init() {
        var generating = true;
        const size = 5;  // Size of each cube
        while (generating) {
            for (let i = 0; i < this.scale; i++) {
                for (let j = 0; j < this.scale; j++) {
                    const geometry = new THREE.BoxGeometry(size, size, size);
                    const buildingBlock = new THREE.Mesh(geometry, this.material);
                    const outlineGeometry = new THREE.BoxGeometry(size * 1.1, size * 1.1, size * 1.1);
                    const outlineMesh = new THREE.Mesh(outlineGeometry, this.outlineMaterial);

                    buildingBlock.position.set(this.x + i * size, this.y, this.z + j * size);
                    outlineMesh.position.set(this.x + i * size, this.y, this.z + j * size);

                    scene.add(buildingBlock);
                    scene.add(outlineMesh);
                }
            }
            this.y += size;  // Increase y for the next layer of cubes
            generating = Math.random() > 0.1;  // Randomly decide if another layer should be added
        }
    }
}

// Function to generate random coordinates
function getRandomCoord() {
    return Math.floor(Math.random() * 100 - 50);  // Range from -50 to 50
}

// Generate multiple buildings with increasing scale factors
// Adjust probability of building generation based on the scale
for (let i = 0; i < 10; i++) {  // Increased loop count for demonstration
    let scale = i + 1;
    // Decreasing probability of generating a building with a larger base layer
    if (Math.random() < Math.exp(-0.01 * scale)) {
        new Building(getRandomCoord(), 0, getRandomCoord(), scale);
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
    controls.update(); 
    renderer.render(scene, camera);
}
animate();