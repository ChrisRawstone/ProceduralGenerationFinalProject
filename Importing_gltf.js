import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const trees = [
    'tree1',
    'tree2',
    'oak_trees',
    'tree4'
    // Add more tree paths as needed
];
export function getRandomTreeIndex() {
    return Math.floor(Math.random() * trees.length);
}
var position= new THREE.Vector3(0,0,0)

export function loadModel(treeIndex, sceneName, x, y, z, scale) {
    var loader = new GLTFLoader();
    console.log(`models/${trees[3]}/scene.gltf`); // Access the trees array directly
    loader.load(
        `models/${trees[3]}/scene.gltf`, // Corrected path without brackets
        function (gltf) {
            const model = gltf.scene;
            model.position.set(x, y, z); // Set the position
            model.scale.set(scale, scale, scale);
            sceneName.add(model);
        },
        undefined,
        function (error) {
            console.error('Error loading GLTF model', error);
        }
    );
}