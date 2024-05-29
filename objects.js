import * as THREE from 'three';
import { loadModel } from './Importing_gltf.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


const globalProcessed = new Set();

export function addBuildings(grid, gridSize, scene) {
    const cellSize = 1;
    const textureLoader = new THREE.TextureLoader();
    const textures = [
        textureLoader.load('Textures/building_day_texture.jpg'),  // Closer to center
        textureLoader.load('Textures/texturecan-others-0026-plane-1200.jpg'),  // Midway
        textureLoader.load('Textures/building_texture_2.jpg')   // Far from center
    ];

    // Array of roof textures
    const roofTextures = [
        textureLoader.load('Textures/helipad.jpeg'),
        textureLoader.load('Textures/glassroof.jpg'),
        textureLoader.load('Textures/roof.jpeg')
    ];

    const outlineMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(1, 1, 1), side: THREE.BackSide });
    outlineMaterial.transparent = true;
    outlineMaterial.opacity = 0.5;

    const processed = new Set();

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const key = `${i},${j}`;
            if (grid[i][j] === 2 && !processed.has(key)) {
                const { minI, maxI, minJ, maxJ, count } = getClusterBounds(grid, i, j, processed, gridSize);
                const clusterWidth = maxJ - minJ + 1;
                const clusterHeight = maxI - minI + 1;
                const clusterCenterX = (minJ + maxJ) / 2;
                const clusterCenterY = (minI + maxI) / 2;
                const distanceToCenter = Math.sqrt((clusterCenterX - gridSize / 2) ** 2 + (clusterCenterY - gridSize / 2) ** 2);
                const proximityScale = (gridSize / 2 - distanceToCenter) / (gridSize / 2);

                // Choose texture based on proximity
                let textureIndex = 0;
                if (proximityScale > 0.66) {
                    textureIndex = 0;
                } else if (proximityScale > 0.33) {
                    textureIndex = 1;
                } else {
                    textureIndex = 2;
                }

                const buildingMaterial = new THREE.MeshStandardMaterial({ map: textures[textureIndex] });
                const randomHeight = 1 + Math.random() * Math.sqrt(count) * proximityScale * 2; 
                const cubeGeometry = new THREE.BoxGeometry(cellSize * clusterWidth, randomHeight, cellSize * clusterHeight);
                const building = new THREE.Mesh(cubeGeometry, buildingMaterial);
                building.position.set((clusterCenterX - gridSize / 2) * cellSize, randomHeight / 2, (clusterCenterY - gridSize / 2) * cellSize);
                building.castShadow = true;
                building.receiveShadow = true;
                scene.add(building);

                // Add roof with different dimensions and random texture
                const roofHeight = randomHeight * 0.2;  // Example: roof height is 20% of building height
                const roofTextureIndex = Math.floor(Math.random() * roofTextures.length);  // Randomly choose a roof texture
                const roofGeometry = new THREE.BoxGeometry(cellSize * clusterWidth, roofHeight, cellSize * clusterHeight);
                const roofMaterial = new THREE.MeshStandardMaterial({ map: roofTextures[roofTextureIndex] });
                const roof = new THREE.Mesh(roofGeometry, roofMaterial);
                roof.position.set(building.position.x, building.position.y + randomHeight / 2 + roofHeight / 2, building.position.z);
                roof.castShadow = true;
                roof.receiveShadow = true;
                scene.add(roof);

                // Add outline with slightly larger geometry
                const outlineGeometry = new THREE.BoxGeometry(cellSize * clusterWidth * 1.05, randomHeight * 1.05, cellSize * clusterHeight * 1.05);
                const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial.clone()); // Clone material for outline
                outlineMesh.position.copy(building.position);
                scene.add(outlineMesh);
            }
        }
    }
}

export function getClusterBounds(grid, startI, startJ, processed, gridSize) {
    const queue = [[startI, startJ]];
    let minI = gridSize, maxI = 0, minJ = gridSize, maxJ = 0;

    while (queue.length > 0) {
        const [i, j] = queue.shift();
        if (processed.has(`${i},${j}`) || grid[i][j] !== 2) continue;
        processed.add(`${i},${j}`);
        minI = Math.min(minI, i);
        maxI = Math.max(maxI, i);
        minJ = Math.min(minJ, j);
        maxJ = Math.max(maxJ, j);
        // Explore neighbors
        [[i - 1, j], [i + 1, j], [i, j - 1], [i, j + 1]].forEach(([ni, nj]) => {
            if (ni >= 0 && ni < gridSize && nj >= 0 && nj < gridSize && grid[ni][nj] === 2 && !processed.has(`${ni},${nj}`)) {
                queue.push([ni, nj]);
            }
        });
    }
    return {
        minI, maxI, minJ, maxJ,
        count: (maxI - minI + 1) * (maxJ - minJ + 1), // Total cells in cluster
        clusterCenterX: (minJ + maxJ) / 2,
        clusterCenterY: (minI + maxI) / 2,
        distanceToCenter: Math.max(Math.abs((minI + maxI) / 2 - gridSize / 2), Math.abs((minJ + maxJ) / 2 - gridSize / 2))
    };
}




const trees = [
    'tree1',
    'tree2',
    'oak_trees',
    'tree4'
    // Add more tree paths as needed
];

const preloadedTrees = {}; // Object to hold preloaded models

export function preloadTrees(scene, callback) {
    let loadedCount = 0;

    function onLoad() {
        loadedCount++;
        if (loadedCount === trees.length) {
            callback(); // All models loaded
        }
    }

    function loadModel(path, callback) {
        var loader = new GLTFLoader();
        loader.load(
            path,
            (gltf) => {
                const model = gltf.scene;
                model.traverse((node) => {
                    if (node.isMesh) {
                        node.castShadow = true;  // Enable shadow casting for the tree model
                        node.receiveShadow = true;  // Enable shadow receiving for the tree model
                    }
                });
                preloadedTrees[path] = model;
                callback();
            },
            undefined,
            (error) => {
                console.error(`Error loading model: ${path}`, error);
                callback();
            }
        );
    }

    trees.forEach((treePath) => {
        loadModel(`models/${trees[3]}/scene.gltf`, onLoad);
    });
}

function getRandomTreeIndex() {
    return Math.floor(Math.random() * trees.length);
}

export function addTrees(grid, gridSize, scene, scale_of_tree) {
    const cellSize = 1;
    const treeHeight = 2; // Fixed height for all trees for simplicity
    const treeRadius = 0.2; // Radius of the tree's trunk
    const treeGeometry = new THREE.CylinderGeometry(treeRadius, treeRadius, treeHeight, 16); // Create a cylinder to represent trees
    const treeMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(0, 0.5, 0) }); // Dark green for trees
    
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === 4) {  // Check if the cell type is for a tree
                const treeIndex = getRandomTreeIndex();
                const originalModel = preloadedTrees[`models/${trees[3]}/scene.gltf`];
                if (originalModel) {
                    const newTree = originalModel.clone(); // Clone the preloaded tree model
                    newTree.position.set(j - 0.5 * gridSize, (treeHeight / 2) - 1, i - 0.5 * gridSize);
                    newTree.scale.set(scale_of_tree, scale_of_tree, scale_of_tree); // Scale if needed
                    newTree.castShadow = true;
                    newTree.receiveShadow = true;
                    newTree.userData.type = 'tree'; // Set userData to identify tree objects
                    scene.add(newTree);
                } else {
                    // Fallback to a cylinder if the model is not loaded
                    const fallbackTree = new THREE.Mesh(treeGeometry, treeMaterial);
                    fallbackTree.position.set(j - 0.5 * gridSize, treeHeight / 2, i - 0.5 * gridSize);
                    fallbackTree.userData.type = 'tree';
                    fallbackTree.castShadow = true;
                    fallbackTree.receiveShadow = true;
                    scene.add(fallbackTree);
                }
            }
        }
    }
}   

export function addSupermarkets(grid, gridSize, scene) {
    const cellSize = 1;
    const supermarketHeight = 1.5; // Set a specific height for supermarkets
    const supermarketGeometry = new THREE.BoxGeometry(cellSize, supermarketHeight, cellSize); // Create a cube for supermarkets
    const supermarketMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(1, 0.5, 0) }); // Orange color for supermarkets

    // Load texture for the small cube
    const textureLoader = new THREE.TextureLoader();
    const cubeTexture = textureLoader.load('Textures/fan.jpeg'); // Replace with your texture file path

    // Define smaller cube properties
    const cubeSize = cellSize * 0.5; // Size of the smaller cube
    const smallCubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize); // Create a smaller cube geometry
    const smallCubeMaterial = new THREE.MeshStandardMaterial({ map: cubeTexture }); // Apply the texture to the cube material

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === 3) {  // Check if the cell type is for a supermarket
                const supermarket = new THREE.Mesh(supermarketGeometry, supermarketMaterial);
                supermarket.position.set(j - 0.5 * gridSize, supermarketHeight / 2, i - 0.5 * gridSize);  // Center the supermarket cube on the cell
                supermarket.castShadow = true;
                supermarket.receiveShadow = true;
                scene.add(supermarket);

                // Add a smaller cube on top of the supermarket
                const smallCube = new THREE.Mesh(smallCubeGeometry, smallCubeMaterial);
                smallCube.position.set(supermarket.position.x, supermarket.position.y + supermarketHeight / 2 + cubeSize / 2, supermarket.position.z);
                smallCube.castShadow = true;
                smallCube.receiveShadow = true;
                scene.add(smallCube);
            }
        }
    }
}
const textureLoader = new THREE.TextureLoader();
const textures = {
    10: textureLoader.load('textures/roadF.jpg'),  // Texture for straight roads
    11: textureLoader.load('textures/intersection_1.jpg'),  // Texture for intersections
    12: textureLoader.load('textures/Troad.jpg'),    // Texture for T-junctions
};

// export function createCanvas(grid, gridSize, scene) {
//     const cellSize = 1;
//     const cellGeometry = new THREE.PlaneGeometry(cellSize, cellSize);

//     for (let i = 0; i < gridSize; i++) {
//         for (let j = 0; j < gridSize; j++) {
//             const type = grid[i][j];
//             let material;

//             if (textures[type]) { // Check if there is a texture defined for this type
//                 material = new THREE.MeshBasicMaterial({ map: textures[type] });
//             } else {
//                 // Fallback color if no texture is defined
//                 const colors = {
//                     0: new THREE.Color(88/255,45/255,15/255), // Empty space
//                     1: new THREE.Color(1, 1, 1), // Road (white)
//                     2: new THREE.Color(0, 0, 1),  // Building (blue)
//                     3: new THREE.Color(1, 0.5, 0),  // Super Market (orange)
//                     4: new THREE.Color(0, 0.5, 0), // Trees (Dark green)
//                     5: new THREE.Color(0.6, 0.4, 0.2), // Brown
//                 };
//                 const color = colors[type] || new THREE.Color(0.5, 0.5, 0.5);
//                 material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
//             }

//             const cell = new THREE.Mesh(cellGeometry, material);
//             cell.rotation.x = -Math.PI / 2;
//             cell.position.set(j - 0.5 * gridSize, 0, i - 0.5 * gridSize);
//             scene.add(cell);
//         }
//     }
//     return scene;
// }

function shouldRotateTJunction(grid, x, y, gridSize) {
    // Define road types for quick lookup
    const roadTypes = new Set([10, 11, 12]);

    // Check directly adjacent cells for roads
    const directions = [
        { dx: -1, dy: 0 }, // Left
        { dx: 1, dy: 0 },  // Right
        { dx: 0, dy: -1 }, // Up
        { dx: 0, dy: 1 }   // Down
    ];

    let missingRoads = directions.filter(dir => {
        const nx = x + dir.dx;
        const ny = y + dir.dy;
        return nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && !roadTypes.has(grid[ny][nx]);
    });

    // Check for buildings opposite the missing road within 3 blocks radius
    for (const missing of missingRoads) {
        for (let i = 1; i <= 3; i++) {
            const nx = x - missing.dx * i;
            const ny = y - missing.dy * i;
            if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && grid[ny][nx] === 2) {
                return true;  // Rotate if a building is found opposite a missing road
            }
        }
    }

    return false;
}



export function addShadows(scene) {


    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(20, 20, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;


    const d = 100;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;

    scene.add(directionalLight);

    // const lightHelper = new THREE.DirectionalLightHelper(directionalLight);
    // scene.add(lightHelper);

    // const shadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    // scene.add(shadowHelper);
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
            let material;

            if (textures[type]) { // Check if there is a texture defined for this type
                material = new THREE.MeshBasicMaterial({ map: textures[type] });
            } else {

            const type = grid[i][j];
            const color = colors[type] || new THREE.Color(0.5, 0.5, 0.5);
            // if (type === 1) continue;
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
            const type = newGrid[i][j];
            let material;
            if (oldGrid[i][j] !== newGrid[i][j]) {  // Check for changes
                if (textures[type]) { // Check if there is a texture defined for this type
                    material = new THREE.MeshBasicMaterial({ map: textures[type] });
                    meshGrid[i][j].material = material;
                } else {
                    const type = newGrid[i][j];
                    const color = colors[type] || new THREE.Color(0.5, 0.5, 0.5);
                    const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
                    meshGrid[i][j].material = material;  // Update only the material'
                }
            }
        }
    }
}

