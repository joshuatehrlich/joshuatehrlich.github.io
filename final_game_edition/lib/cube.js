import * as THREE from 'three';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { vec3 } from './utils.js';


export let cube_spaces = [];

export class Cube {
	constructor(position, size = vec3(1), color = 0xffffff, lineWidth = 3) {
		this.geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
		this.material = new THREE.MeshStandardMaterial({ color: color });
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.true_position = position.clone();
		this.target_position = position.clone();
		this.mesh.position.copy(position);
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = true;
		this.material.transparent = true;
		
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
	
	setColor(color) { this.material.color.set(color); }

	updatePosition(speed = 0.1, target_position = this.target_position) {
		this.mesh.position.lerp(target_position, speed);
		this.wireframe.position.lerp(target_position, speed);
	}
}


export class CubeSpace {
	constructor() {
		this.cubes = [];
		this.group = new THREE.Group();
		cube_spaces.push(this);
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
					let wall = 0;
					if (x > 2) {
						wall = -0.5;
					}
					this.addCube(vec3(
						spacing *(x),
						spacing *(Math.sin(x*z*0.2)*0.2 + Math.random()*0.3 + wall),
						spacing *(z)));
				}
		}
	}

	render(scene) {
		scene.add(this.group);
	}
}


export function updateLinesOnResize(camera, renderer, space) {
	window.addEventListener('resize', () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
		
		// Update all LineSegments2 materials resolution
		space.cubes.forEach(cube => {
			if (cube.wireframe && cube.wireframe.material.resolution) {
				cube.wireframe.material.resolution.set(window.innerWidth, window.innerHeight);
			}
		});
	});
}