
import * as THREE from 'three';
import { OrbitControls } from './build/controls/OrbitControls.js';

// Set up the scene, camera, and renderer.
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add orbit controls to the camera.
var controls = new OrbitControls(camera, renderer.domElement);

// Set the camera position.
camera.position.z = 50;

// Create a basic material for the cubes.
class Building {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.material = new THREE.MeshNormalMaterial();
        this.outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x0000FF, side: THREE.BackSide });
        this.init();
    }

    init() {
        var yOffset = 0;
        var generating = true;
        while (generating) {
            const width = 5;
            const height = 5;
            const depth = 5;
            const geometry = new THREE.BoxGeometry(width, height, depth);
            const buildingblock = new THREE.Mesh(geometry, this.material);
            const outlineGeometry = new THREE.BoxGeometry(width * 1.1, height * 1.1, depth * 1.1);
            const outlineMesh = new THREE.Mesh(outlineGeometry, this.outlineMaterial);

            buildingblock.position.set(this.x, this.y + yOffset, this.z);
            outlineMesh.position.set(this.x, this.y + yOffset, this.z);

            scene.add(buildingblock);
            scene.add(outlineMesh);

            yOffset += height;
            generating = Math.random() > 0.1;
        }
    }
}

// Function to generate random coordinates
function getRandomCoord() {
    return Math.floor(Math.random() * 100 - 50);  // Range from -50 to 50
}

// Generate multiple buildings
for (let i = 0; i < 10; i++) {
    new Building(getRandomCoord(), 0, getRandomCoord());
}

// Render loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();