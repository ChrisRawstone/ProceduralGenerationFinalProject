import * as THREE from 'three';
import { loadModel } from './Importing_gltf.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Define a global processed set
const globalProcessed = new Set();

export function addBuildings(grid, gridSize, scene) {
    const cellSize = 1;
    const buildingTexture = new THREE.TextureLoader().load('Textures/building_texture_3.jpg');
    const buildingMaterial = new THREE.MeshStandardMaterial({ map: buildingTexture });
    const outlineMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(0, 0, 0), side: THREE.BackSide, transparent: true, opacity: 1 });

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const key = `${i},${j}`;
            if (grid[i][j] === 2 && !globalProcessed.has(key)) {
                const bounds = getClusterBounds(grid, i, j, globalProcessed, gridSize);
                const clusterWidth = bounds.maxJ - bounds.minJ + 1;
                const clusterHeight = bounds.maxI - bounds.minI + 1;
                const randomHeight = 1 + Math.random() * Math.sqrt(bounds.count) * ((gridSize / 2 - bounds.distanceToCenter) / (gridSize / 2)) * 2;

                const cubeGeometry = new THREE.BoxGeometry(cellSize * clusterWidth, randomHeight, cellSize * clusterHeight);
                const building = new THREE.Mesh(cubeGeometry, buildingMaterial.clone()); // Clone material for this instance
                building.position.set((bounds.clusterCenterX - gridSize / 2) * cellSize, randomHeight / 2, (bounds.clusterCenterY - gridSize / 2) * cellSize);
                building.castShadow = true;
                building.receiveShadow = true;
                scene.add(building);

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
        // const loader = new THREE.GLTFLoader(); // Assuming you're using GLTF format
        var loader = new GLTFLoader();
        loader.load(
            path,
            (gltf) => {
                const model = gltf.scene;
                model.traverse((node) => {
                    if (node.isMesh) {
                        node.castShadow = true;
                        node.receiveShadow = true;
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

export function addTrees(grid, gridSize, scene,scale_of_tree) {
    const cellSize = 1;
    const treeHeight = 2; // Fixed height for all trees for simplicity
    const treeRadius = 0.2; // Radius of the tree's trunk
    const treeGeometry = new THREE.CylinderGeometry(treeRadius, treeRadius, treeHeight, 16); // Create a cylinder to represent trees
    const treeMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(0, 0.5, 0) }); // Dark green for trees
    
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === 4) {  // Check if the cell type is for a tree
                const treeIndex = getRandomTreeIndex();
                // const treePath = trees[treeIndex];
                const originalModel = preloadedTrees[`models/${trees[3]}/scene.gltf`];
                if (originalModel) {
                    const newTree = originalModel.clone(); // Clone the preloaded tree model
                    newTree.position.set(j - 0.5 * gridSize, (treeHeight / 2)-1, i - 0.5 * gridSize);
                    newTree.scale.set(scale_of_tree, scale_of_tree, scale_of_tree); // Scale if needed
                    newTree.castShadow = true;
                    newTree.receiveShadow = true;
                    scene.add(newTree);
                } else {
                    // Fallback to a cylinder if the model is not loaded
                    const fallbackTree = new THREE.Mesh(treeGeometry, treeMaterial);
                    fallbackTree.position.set(j - 0.5 * gridSize, treeHeight / 2, i - 0.5 * gridSize);
                    // fallbackTree.scale.set(scale_of_tree, scale_of_tree, scale_of_tree);
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

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === 3) {  // Check if the cell type is for a supermarket
                const supermarket = new THREE.Mesh(supermarketGeometry, supermarketMaterial);
                supermarket.position.set(j - 0.5 * gridSize, supermarketHeight / 2, i - 0.5 * gridSize);  // Center the supermarket cube on the cell
                supermarket.castShadow = true;
                supermarket.receiveShadow = true;
                scene.add(supermarket);
            }
        }
    }
}

export function createGround(scene, gridSize, texturePath) {
    const groundSize = gridSize; // Define the size of the ground
    const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
    const loader = new THREE.TextureLoader();

    loader.load(texturePath, function(texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(5, 5); // Adjust these values based on your texture and aesthetic needs
        const groundMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(0, -0.01, 0); // Slightly lower to avoid z-fighting
        ground.receiveShadow = true;
        scene.add(ground);
    });
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

            const material = new THREE.MeshBasicMaterial({ color: color});
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