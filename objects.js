import * as THREE from 'three';
import { getRandomTreeIndex,loadModel } from './Importing_gltf.js';
// Make a tree 
// const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);

// // Create trunk material
// const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });

// // Create trunk mesh
// const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

// // Create leaves geometry
// const leavesGeometry = new THREE.SphereGeometry(0.5, 8, 8);

// // Create leaves material
// const leavesMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

// // Create leaves mesh
// const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
// leaves.position.y = 1; // Position leaves on top of the trunk

// // Create a group to hold the tree
// const stupidtree = new THREE.Group();
// tree.add(trunk); // Add trunk to the tree group
// tree.add(leaves);


export function addBuildings(grid, gridSize, scene) {
    const cellSize = 1;
    const buildingMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(0, 0, 1), side: THREE.DoubleSide }); // Blue for buildings
    const outlineMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(1, 1, 1), side: THREE.BackSide }); // White outline
    outlineMaterial.transparent = true;
    outlineMaterial.opacity = 0.5; // Adjust transparency as needed
    const processed = new Set(); // To track processed cells

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const key = `${i},${j}`;
            if (grid[i][j] === 2 && !processed.has(key)) {
                // Find contiguous building cells
                const size = getBuildingSize(grid, i, j, processed, gridSize);
                const baseHeight = 1; // Minimum building height
                const randomHeight = baseHeight + Math.random() * size * 2; // Random height influenced by building size

                const cubeGeometry = new THREE.BoxGeometry(cellSize * size, randomHeight, cellSize * size);
                const building = new THREE.Mesh(cubeGeometry, buildingMaterial);
                building.position.set((j + size / 2 - 0.5) * cellSize - 0.5 * gridSize, randomHeight / 2, (i + size / 2 - 0.5) * cellSize - 0.5 * gridSize);
                building.castShadow = true; // Buildings cast shadows
                building.receiveShadow = true; // Buildings receive shadows
                scene.add(building);

                // Add outline
                const outlineScale = 1.05; // How much larger the outline is
                const outlineGeometry = new THREE.BoxGeometry(cellSize * size * outlineScale, randomHeight * outlineScale, cellSize * size * outlineScale);
                const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);
                outlineMesh.position.copy(building.position);
                scene.add(outlineMesh);
            }
        }
    }
}





export function getBuildingSize(grid, startI, startJ, processed, gridSize) {
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


export function addTrees(grid, gridSize, scene) {
    const cellSize = 1;
    const treeHeight = 2; // Fixed height for all trees for simplicity
    const treeRadius = 0.2; // Radius of the tree's trunk
    const treeGeometry = new THREE.CylinderGeometry(treeRadius, treeRadius, treeHeight, 16); // Create a cylinder to represent trees
    const treeMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(0, 0.5, 0) }); // Dark green for trees
   
   //gltf
    // var index=getRandomTreeIndex()
    // loadModel(index,scene);


    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === 4) {  // Check if the cell type is for a tree
                const tree = new THREE.Mesh(treeGeometry, treeMaterial);
                var index=getRandomTreeIndex()
               // loadModel(index,scene,j - 0.5 * gridSize, (treeHeight / 2)-1, i - 0.5 * gridSize,0.5)
                tree.position.set(j - 0.5 * gridSize, treeHeight / 2, i - 0.5 * gridSize);  // Position the tree so it stands upright
                tree.castShadow = true; // Buildings cast shadows
                tree.receiveShadow = true; // Buildings receive shadows
                scene.add(tree);
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
                scene.add(supermarket);
            }
        }
    }
}
