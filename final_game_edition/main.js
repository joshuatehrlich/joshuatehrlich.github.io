import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { vec3, addBarycentricCoordinates } from './lib/utils.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xffffff );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// CAMERA
const ZOOM_FACTOR = 120;
const camera = new THREE.OrthographicCamera(
	-window.innerWidth / 2 / ZOOM_FACTOR,
	window.innerWidth / 2 / ZOOM_FACTOR,
	window.innerHeight / 2 / ZOOM_FACTOR,
	-window.innerHeight / 2 / ZOOM_FACTOR, 0.1, 1000 );
camera.position.z = 100;

camera.position.y = 100;
camera.position.z = 100;
camera.position.x = 100;
camera.lookAt(0, 0, 0);

const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

// LIGHTS
const ambientLight = new THREE.AmbientLight( 0xffffff, 1.2 );
scene.add( ambientLight );

const skylight = new THREE.DirectionalLight( 0xffffff, .7 );
skylight.position.set( 90, 20, -30 );
scene.add( skylight );

const light = new THREE.DirectionalLight( 0xffffff, 4 );
light.position.set( -15, 15, 15 );
scene.add( light );
light.castShadow = true;

// CUBE CLASSES
class Cube {
	constructor(position, size = vec3(1), color = 0xffffff, lineWidth = 3) {
		this.geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
		this.material = new THREE.MeshStandardMaterial({ color: color });
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.position.copy(position);
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = true;
		
		// WIREFRAME
		const edges = new THREE.EdgesGeometry(this.geometry);
		const positions = edges.attributes.position;
		const points = [];
		for (let i = 0; i < positions.count; i++) {
			points.push(
				positions.getX(i),
				positions.getY(i),
				positions.getZ(i)
			);
		}
		
		const lineGeometry = new LineSegmentsGeometry();
		lineGeometry.setPositions(points);
		
		const lineMaterial = new LineMaterial({
			color: 0x000000,
			linewidth: lineWidth,
			resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
			transparent: true,
			opacity: 1.0
		});
		
		this.wireframe = new LineSegments2(lineGeometry, lineMaterial);
		this.wireframe.position.copy(position);
		this.wireframe.computeLineDistances();
	}
}

class CubeSpace {
	constructor() {
		this.cubes = [];
		this.group = new THREE.Group();
	}

	addCube(position, size = vec3(.99), color = 0xffffff, lineWidth = 3) {
		const cube = new Cube(position, size, color, lineWidth);
		this.cubes.push(cube);
		this.group.add(cube.mesh);
		this.group.add(cube.wireframe);  // Add wireframe too
	}

	addGrid(size = vec3(30, 0, 30)) {
		const spacing = 1;
		for (let x = -size.x / 2; x < size.x / 2 + 1; x++) {
				for (let z = -size.z / 2; z < size.z / 2 + 1; z++) {
					this.addCube(vec3(
						spacing *(x),
						spacing *(size.y),
						spacing *(z)));
				}
		}
	}

	render() {
		scene.add(this.group);
	}
}


// LEVEL ITSELF
const levelSpace = new CubeSpace();

levelSpace.addGrid();
levelSpace.addCube(vec3(0, 1, 0));
levelSpace.addCube(vec3(0, 2, 0));
levelSpace.addCube(vec3(1, 1, 2));
levelSpace.render();

// Window resize handler for LineSegments2 resolution
window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	
	// Update all LineSegments2 materials resolution
	levelSpace.cubes.forEach(cube => {
		if (cube.wireframe && cube.wireframe.material.resolution) {
			cube.wireframe.material.resolution.set(window.innerWidth, window.innerHeight);
		}
	});
});


// Setup raycaster and mouse position tracker
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Track mouse movement
function onMouseMove(event) {
    // Convert mouse position to normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener('mousemove', onMouseMove, false);

// ANIMATION LOOP
function animate() {
    requestAnimationFrame(animate);

	controls.update();

	    // Update raycaster with camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    
    // Get all cube meshes to check against
    const cubesMeshes = levelSpace.cubes.map(cube => cube.mesh);
    
    // Check for intersections
    const intersects = raycaster.intersectObjects(cubesMeshes);
    
    // Reset all cubes to default state
    // levelSpace.cubes.forEach(cube => {
    //     cube.mesh.material.emissive.setHex(0x000000); // No highlight
    // });
    
    // Highlight hovered cube
    if (intersects.length > 0) {
        const hoveredMesh = intersects[0].object;
        
        // You can also get the cube object if needed
        const hoveredCube = levelSpace.cubes.find(c => c.mesh === hoveredMesh);

		// hoveredCube.mesh.position.y += 0.1;
		// hoveredCube.wireframe.position.y += 0.1;
    }

    renderer.render(scene, camera);

}
animate();