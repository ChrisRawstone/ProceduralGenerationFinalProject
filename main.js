
import * as THREE from 'three';
import { OrbitControls } from './build/controls/OrbitControls.js';

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


class Building {
    constructor(x, y, z, scale) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.scale = scale;  // Number of cubes along one side of the building
        this.material = new THREE.MeshNormalMaterial();
        this.outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x0000FF, side: THREE.BackSide });
        this.init();
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



// Render loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();