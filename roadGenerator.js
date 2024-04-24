// Import Three.js
import * as THREE from 'three';

export function generateCityPlan(scene, origin, direction, length, width, roadCount, buildingSpace = 10) {
    if (roadCount <= 0) return; // End condition for recursion

    const roadGeometry = new THREE.BoxGeometry(length, 1, width);
    const roadMaterial = new THREE.MeshBasicMaterial({color: 0x333333});
    const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
    
    roadMesh.position.copy(origin);
    roadMesh.position.add(direction.clone().multiplyScalar(length / 2)); // Move the road into position based on its length and direction
    roadMesh.lookAt(origin.clone().add(direction)); // Orient the road in the correct direction
    scene.add(roadMesh);

    // Generate buildings on either side of the road
    const buildingDepth = 30; // Depth of each building
    const buildingWidth = buildingSpace; // Width of the building along the road
    const buildingGeometry = new THREE.BoxGeometry(buildingDepth, 10, buildingWidth);
    const buildingMaterial = new THREE.MeshBasicMaterial({color: 0xAABBCC});

    for (let side = -1; side <= 1; side += 2) { // Two sides of the road
        const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
        buildingMesh.position.copy(roadMesh.position);
        buildingMesh.position.x += side * (width / 2 + buildingWidth / 2);
        scene.add(buildingMesh);
    }

    // Recursively generate more roads
    const newDirection = new THREE.Vector3( // Randomly choose a new direction forward, left, or right
        direction.z, direction.y, -direction.x * (Math.random() > 0.5 ? 1 : -1)
    );

    const newPosition = roadMesh.position.clone().add(newDirection.clone().multiplyScalar(length));

    generateCityPlan(scene, newPosition, newDirection, length, width, roadCount - 1, buildingSpace);
}
