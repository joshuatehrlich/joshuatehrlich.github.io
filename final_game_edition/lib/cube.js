import * as THREE from 'three';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { vec3 } from './utils.js';

function createTextTexture(text, fontSize = 64, color = '#444444') {
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');

	canvas.width = 512;
	canvas.height = 256;

	// context.fillStyle = '#ffffff';
	// context.fillRect(0, 0, canvas.width, canvas.height);

	context.font = `${fontSize}px Times New Roman`;
	context.fillStyle = color;
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.fillText(text, canvas.width / 2, canvas.height / 2);

	const texture = new THREE.CanvasTexture(canvas);
	return texture;
}

export let cube_spaces = [];

export class Cube {
	constructor(
		position,
		size = vec3(1, 10, 1),
		color = 0xffffff,
		lineWidth = 3,
		text = ' '
	) {
		this.geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
		this.material = new THREE.MeshStandardMaterial({ color: color });
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.true_position = position.clone();
		this.target_position = position.clone();
		this.mesh.position.copy(position);
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = true;
		this.material.transparent = true;

		// TEXt
		this.text = text;
		const textTexture = createTextTexture(text);
		const textGeometry = new THREE.PlaneGeometry(1, 0.5); // Width, height
		this.textMaterial = new THREE.MeshBasicMaterial({
			map: textTexture,
			transparent: true,
			side: THREE.FrontSide, // So it's visible from both sides
			// make render above cubes
			depthTest: false,
			depthWrite: false,
		});
		this.textMesh = new THREE.Mesh(textGeometry, this.textMaterial);

		// Position it above the cube (local coordinates since it's a child)
		this.textMesh.position.set(0, size.y / 2 + 0.1, 0);
		this.textMesh.rotation.set(-Math.PI / 2, 0, 0);
		this.textMesh.scale.set(2.0, 2.0, 2.0);
		this.textMesh.receiveShadow = true;

		this.mesh.add(this.textMesh);

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
			resolution: new THREE.Vector2(
				window.innerWidth,
				window.innerHeight
			),
			transparent: true,
			opacity: 1.0,
		});

		this.wireframe = new LineSegments2(lineGeometry, lineMaterial);
		this.wireframe.position.copy(position);
		this.wireframe.computeLineDistances();
	}

	setColor(color) {
		this.material.color.set(color);
	}

	updatePosition(speed = 0.1, target_position = this.target_position) {
		this.mesh.position.lerp(target_position, speed);
		this.wireframe.position.lerp(target_position, speed);
	}

	updateText(text) {
		this.text = text;
		const textTexture = createTextTexture(text);
		this.textMaterial.map = textTexture;
	}

	updateTextColor(color) {
		const textTexture = createTextTexture(this.text, 64, color);
		this.textMaterial.map = textTexture;
	}
}

export class CubeSpace {
	constructor() {
		this.cubes = [];
		this.group = new THREE.Group();
		cube_spaces.push(this);
	}

	addCube(
		position,
		size = vec3(0.99, 10, 0.99),
		color = 0xffffff,
		lineWidth = 3
	) {
		const cube = new Cube(position, size, color, lineWidth);
		this.cubes.push(cube);
		this.group.add(cube.mesh);
		this.group.add(cube.wireframe); // Add wireframe too
	}

	addGrid(size = vec3(30, 0, 30)) {
		const spacing = 1;
		for (let x = -size.x / 2; x < size.x / 2 + 1; x++) {
			for (let z = -size.z / 2; z < size.z / 2 + 1; z++) {
				let wall = 0;
				if (x > 2) {
					wall = -0.0;
				}
				this.addCube(
					vec3(
						spacing * x,
						spacing *
							(Math.sin(x * z * 0.2) * 0.2 +
								Math.random() * 0.01 +
								wall),
						spacing * z
					)
				);
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
		space.cubes.forEach((cube) => {
			if (cube.wireframe && cube.wireframe.material.resolution) {
				cube.wireframe.material.resolution.set(
					window.innerWidth,
					window.innerHeight
				);
			}
		});
	});
}
