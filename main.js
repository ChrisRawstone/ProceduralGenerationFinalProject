import * as THREE from 'three';
import { OrbitControls } from './build/controls/OrbitControls.js';
import { init_grid, initialize_starting_road,generateGridwithRoadsFinal } from './grid.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';



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


var x_prev, y_prev;
var gridSize = 160;

var line_segment_size = 10
var iterations_of_Lsystem = 20;
var weight_bias = 1000;
var bias_half_life = 0.5;

var x = Math.floor(gridSize * 1 / 4);
var y = Math.floor(gridSize / 2);




grid = generateGridwithRoadsFinal(x, y, x_prev, y_prev, iterations_of_Lsystem,line_segment_size, gridSize, weight_bias, bias_half_life);


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
                const randomHeight = baseHeight + Math.random() * size * 2; // Random height influenced by building size

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
