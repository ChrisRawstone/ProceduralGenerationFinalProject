import * as THREE from "three";
import { OrbitControls } from "./build/controls/OrbitControls.js";

// Set up the scene, camera, and renderer.
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.setClearColor(new THREE.Color(0x87ceeb));
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
    this.scale = scale; // Number of cubes along one side of the building
    this.material = new THREE.MeshNormalMaterial();
    this.outlineMaterial = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      side: THREE.BackSide,
    });
    this.init();
  }

  init() {
    var generating = true;
    const size = 5; // Size of each cube
    while (generating) {
      for (let i = 0; i < this.scale; i++) {
        for (let j = 0; j < this.scale; j++) {
          const geometry = new THREE.BoxGeometry(size, size, size);
          const buildingBlock = new THREE.Mesh(geometry, this.material);
          const outlineGeometry = new THREE.BoxGeometry(
            size * 1.1,
            size * 1.1,
            size * 1.1
          );
          const outlineMesh = new THREE.Mesh(
            outlineGeometry,
            this.outlineMaterial
          );

          buildingBlock.position.set(
            this.x + i * size,
            this.y,
            this.z + j * size
          );
          outlineMesh.position.set(
            this.x + i * size,
            this.y,
            this.z + j * size
          );

          scene.add(buildingBlock);
          scene.add(outlineMesh);
        }
      }
      this.y += size; // Increase y for the next layer of cubes
      generating = Math.random() > 0.1; // Randomly decide if another layer should be added
    }
  }
}

// Function to generate random coordinates
function getRandomCoord() {
  return Math.floor(Math.random() * 100 - 50); // Range from -50 to 50
}

// Generate multiple buildings with increasing scale factors
// Adjust probability of building generation based on the scale
for (let i = 0; i < 10; i++) {
  // Increased loop count for demonstration
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

class Park {
  constructor(x, y, z, size) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.size = size; // Size of the park
    this.init();
  }

  init() {
    // Create grass
    const grass = new Grass(this.x, this.y, this.z, this.size);
    // Create trees
    for (let i = 0; i < 2; i++) {
      const treeX = this.x + Math.random() * this.size - this.size / 2;
      const treeZ = this.z + Math.random() * this.size - this.size / 2;
      new Tree(treeX, this.y, treeZ);
    }
    // Create benches
    for (let i = 0; i < 2; i++) {
      const benchX = this.x + Math.random() * this.size - this.size / 2;
      const benchZ = this.z + Math.random() * this.size - this.size / 2;
      new Bench(benchX, this.y, benchZ);
    }
    // Create pavement
    const pavement = new Pavement(this.x, this.y - 0.01, this.z, this.size);
  }
}

class Tree {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.init();
  }

  init() {
    const treeGeometry = new THREE.CylinderGeometry(1, 1, 8, 32);
    const treeMaterial = new THREE.MeshBasicMaterial({ color: 0x228b22 });
    const tree = new THREE.Mesh(treeGeometry, treeMaterial);

    tree.position.set(this.x, this.y + 4, this.z);
    scene.add(tree);
  }
}

class Grass {
  constructor(x, y, z, size) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.size = size;
    this.init();
  }

  init() {
    const grassTexture = new THREE.TextureLoader().load("grass.jpg");
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(this.size / 10, this.size / 10);
    const grassMaterial = new THREE.MeshBasicMaterial({ map: grassTexture });
    const grassGeometry = new THREE.PlaneGeometry(this.size, this.size);
    const grass = new THREE.Mesh(grassGeometry, grassMaterial);

    grass.rotation.x = -Math.PI / 2; // Lay the grass flat
    grass.position.set(this.x, this.y - 0.01, this.z);
    scene.add(grass);
  }
}

class Bench {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.init();
  }

  init() {
    const benchGeometry = new THREE.BoxGeometry(4, 1, 1);
    const benchMaterial = new THREE.MeshBasicMaterial({ color: 0x8b4513 });
    const bench = new THREE.Mesh(benchGeometry, benchMaterial);

    bench.position.set(this.x, this.y, this.z);
    scene.add(bench);
  }
}

class Pavement {
  constructor(x, y, z, size) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.size = size;
    this.init();
  }

  init() {
    const albedoTexture = new THREE.TextureLoader().load(
      "path/to/hexagon-pavers1_albedo.jpg"
    );
    const heightTexture = new THREE.TextureLoader().load(
      "path/to/hexagon-pavers1_height.jpg"
    );
    const normalTexture = new THREE.TextureLoader().load(
      "path/to/hexagon-pavers1_normal-ogl.jpg"
    );
    const aoTexture = new THREE.TextureLoader().load(
      "path/to/hexagon-pavers1_ao.jpg"
    );

    // Set up material
    const pavementMaterial = new THREE.MeshStandardMaterial({
      map: albedoTexture, // Albedo texture for color
      displacementMap: heightTexture, // Height texture for bump mapping
      normalMap: normalTexture, // Normal texture for surface normals
      aoMap: aoTexture, // Ambient occlusion texture for shading
      roughness: 0.7, // Adjust as needed
      metalness: 0.2, // Adjust as needed
    });
    
    pavementTexture.wrapS = THREE.RepeatWrapping;
    pavementTexture.wrapT = THREE.RepeatWrapping;
    pavementTexture.repeat.set(this.size / 10, this.size / 10);

    const pavementGeometry = new THREE.PlaneGeometry(this.size, this.size);
    const pavement = new THREE.Mesh(pavementGeometry, pavementMaterial);

    pavement.rotation.x = -Math.PI / 2; // Lay the pavement flat
    pavement.position.set(this.x, this.y - 0.02, this.z);
    scene.add(pavement);
  }
}

// Usage
new Park(0, 0, 0, 50); // Create a park at position (0, 0, 0) with size 50
animate();
