import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const trees = [
    'tree1',
    'tree2',
    'oak_trees'
    // Add more tree paths as needed
];
export function getRandomTreeIndex() {
    return Math.floor(Math.random() * trees.length);
}
var position= new THREE.Vector3(0,0,0)

export function loadModel(treeIndex,sceneName) {
    var loader = new GLTFLoader();
    loader.load(
        `models/${trees[treeIndex]}/scene.gltf`,
        function ( gltf ) {
            const model = gltf.scene;
            model.position.copy(position);
            sceneName.add( model );
        },
        undefined,
        function ( error ) {
            console.error( 'Error loading GLTF model', error );
        }
    );
}
