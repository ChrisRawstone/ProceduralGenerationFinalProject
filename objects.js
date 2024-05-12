import * as THREE from 'three';
import { loadModel } from './Importing_gltf.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';


export function addBuildings(grid, gridSize, scene) {
    const cellSize = 1;
    const buildingTexture = new THREE.TextureLoader().load('Textures/building_night_texture.jpg');
    const buildingMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(0, 0, 1)}); // Blue for buildings
    const outlineMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(1, 1, 1), side: THREE.BackSide }); // White outline
    outlineMaterial.transparent = true;
    outlineMaterial.opacity = 0.5; // Adjust transparency as needed
    const processed = new Set(); // To track processed cells

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const key = `${i},${j}`;
            if (grid[i][j] === 2 && !processed.has(key)) {
                // Detect entire cluster of contiguous 2's
                const { minI, maxI, minJ, maxJ, count } = getClusterBounds(grid, i, j, processed, gridSize);
                const clusterWidth = maxJ - minJ + 1;
                const clusterHeight = maxI - minI + 1;
                const clusterCenterX = (minJ + maxJ) / 2;
                const clusterCenterY = (minI + maxI) / 2;
                const distanceToCenter = Math.max(Math.abs(clusterCenterY - gridSize / 2), Math.abs(clusterCenterX - gridSize / 2));
                const proximityScale = (gridSize / 2 - distanceToCenter) / (gridSize / 2); // Scaled 0-1, 1 is closest to center
                const randomHeight = 1 + Math.random() * Math.sqrt(count) * proximityScale * 2; // Height based on cluster size and center proximity

                const cubeGeometry = new THREE.BoxGeometry(cellSize * clusterWidth, randomHeight, cellSize * clusterHeight);
                const building = new THREE.Mesh(cubeGeometry, buildingMaterial);
                building.position.set((clusterCenterX - gridSize / 2 ) * cellSize, randomHeight / 2, (clusterCenterY - gridSize / 2 ) * cellSize);
                // building.castShadow = true;
                // building.receiveShadow = true;
                scene.add(building);

                // Add outline
                const outlineScale = 1.05;
                const outlineGeometry = new THREE.BoxGeometry(cellSize * clusterWidth * outlineScale, randomHeight * outlineScale, cellSize * clusterHeight * outlineScale);
                const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);
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
        // Check neighbors
        [[i - 1, j], [i + 1, j], [i, j - 1], [i, j + 1]].forEach(([ni, nj]) => {
            if (ni >= 0 && ni < gridSize && nj >= 0 && nj < gridSize && grid[ni][nj] === 2 && !processed.has(`${ni},${nj}`)) {
                queue.push([ni, nj]);
            }
        });
    }
    return {
        minI, maxI, minJ, maxJ,
        count: (maxI - minI + 1) * (maxJ - minJ + 1) // Total number of cells in the cluster
    };
}

//HDR Loader

export function hdrLoader(scene, renderer) {
   new RGBELoader().load("../HDR/hdr.hdr",function(texture){
    texture.mapping= THREE.EquirectangularReflectionMapping;
    scene.background=texture
    scene.environment=texture;
   });
}

const trees = [
    'tree5',
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
        const loader = new GLTFLoader();
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
        loadModel(`models/tree4/scene.gltf`, onLoad);
    });
}

export function addTrees(grid, gridSize, scene) {
    const cellSize = 1;
    const treeHeight = 2; // Fixed height for all trees for simplicity
    const treeRadius = 0.2; // Radius of the tree's trunk
    const treeGeometry = new THREE.CylinderGeometry(treeRadius, treeRadius, treeHeight, 16); // Create a cylinder to represent trees
    const treeMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(0, 0.5, 0) }); // Dark green for trees

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === 4) {  // Check if the cell type is for a tree
                const treeIndex = getRandomTreeIndex();
                const treePath = trees[treeIndex];
                const originalModel = preloadedTrees[`models/tree4/scene.gltf`];
                if (originalModel) {
                    const newTree = originalModel.clone(); // Clone the preloaded tree model
                    newTree.position.set(j - 0.5 * gridSize, (treeHeight / 2) - 1, i - 0.5 * gridSize);
                    newTree.scale.set(0.2, 0.2, 0.2); // Scale if needed
                    scene.add(newTree);
                } else {
                    // Fallback to a cylinder if the model is not loaded
                    const fallbackTree = new THREE.Mesh(treeGeometry, treeMaterial);
                    fallbackTree.position.set(j - 0.5 * gridSize, treeHeight / 2, i - 0.5 * gridSize);
                    scene.add(fallbackTree);
                }
            }
        }
    }
}

function getRandomTreeIndex() {
    return Math.floor(Math.random() * trees.length);
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
                scene.add(supermarket);
            }
        }
    }
}
//Loading Textures
const textureLoader = new THREE.TextureLoader();
const textures = {
    10: textureLoader.load('Textures/road.jpeg'),  // Texture for straight roads
    11: textureLoader.load('Textures/intersection.png'),  // Texture for intersections
    12: textureLoader.load('Textures/t_junction.jpg'),    // Texture for T-junctions
};
export function createCanvas(grid, gridSize, scene) {
    const cellSize = 1;
    const cellGeometry = new THREE.PlaneGeometry(cellSize, cellSize);

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const type = grid[i][j];
            let material;

            if (textures[type]) { // Check if there is a texture defined for this type
                material = new THREE.MeshBasicMaterial({ map: textures[type] });
            } else {
                // Fallback color if no texture is defined
                const colors = {
                    0: new THREE.Color(0.6, 0.4, 0.2), // Empty space
                   10: new THREE.Color(1, 1, 1), // Road (white)
                    11: new THREE.Color(0.5,1, 1), // Road (white)
                    12:new THREE.Color(1, 0.5, 1), // Road (white)
                    2: new THREE.Color(0, 0, 1),  // Building (blue)
                    3: new THREE.Color(1, 0.5, 0),  // Super Market (orange)
                    4: new THREE.Color(0, 0.5, 0), // Trees (Dark green)
                    5: new THREE.Color(0.6, 0.4, 0.2), // Brown
                };
                const color = colors[type] || new THREE.Color(0.5, 0.5, 0.5);
                material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
            }

            const cell = new THREE.Mesh(cellGeometry, material);
            cell.rotation.x = -Math.PI / 2;
            cell.position.set(j - 0.5 * gridSize, 0, i - 0.5 * gridSize);
            scene.add(cell);
        }
    }
    return scene;
}

