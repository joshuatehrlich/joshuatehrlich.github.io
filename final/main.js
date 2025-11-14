import * as THREE from 'three';
import { vec3, col } from './lib/utils.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = col(0x000000);

const camera = new THREE.PerspectiveCamera(
	90,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.z = 100;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const geometry = new THREE.SphereGeometry(1, 32, 32);

let vectorSpaces = [];

const SPACING = 10;

class Dot {
	constructor(position, origin, material, lineMaterial = null) {
		this.origin = origin;
		this.position = position;
		this.material = material;
		this.mesh = new THREE.Mesh(geometry, this.material);
		this.mesh.position.copy(
			this.origin.clone().add(this.position).multiplyScalar(SPACING)
		);

		// line from origin to position
		const start = this.origin.clone().multiplyScalar(SPACING);
		const end = this.origin
			.clone()
			.add(this.position)
			.multiplyScalar(SPACING);
		const positions = [start.x, start.y, start.z, end.x, end.y, end.z];
		this.lineGeometry = new LineGeometry();
		this.lineGeometry.setPositions(positions);

		if (lineMaterial) {
			this.lineMaterial = lineMaterial;
		} else {
			this.lineMaterial = new LineMaterial({
				color: this.material.color,
				linewidth: 5, // in world units with size attenuation, pixels otherwise
				resolution: new THREE.Vector2(
					window.innerWidth,
					window.innerHeight
				),
				transparent: this.material.transparent,
				opacity: this.material.opacity,
			});
		}

		this.line = new Line2(this.lineGeometry, this.lineMaterial);

		this.line.renderOrder = -1;
		scene.add(this.line);
		scene.add(this.mesh);
	}

	setOpacity(mesh_opacity, line_opacity) {
		this.mesh.material.opacity = mesh_opacity;
		this.line.material.opacity = line_opacity;
	}

	setRenderOrder(render_order) {
		this.renderOrder = render_order;
		this.mesh.renderOrder = render_order;
		this.line.renderOrder = render_order;
		return this;
	}

	getTruePosition() {
		return this.origin.clone().add(this.position.clone());
	}

	reposition() {
		this.mesh.position.copy(
			this.origin.clone().add(this.position).multiplyScalar(SPACING)
		);
		const start = this.origin.clone().multiplyScalar(SPACING);
		const end = this.origin
			.clone()
			.add(this.position)
			.multiplyScalar(SPACING);
		this.line.geometry.setPositions([
			start.x,
			start.y,
			start.z,
			end.x,
			end.y,
			end.z,
		]);
	}
}

class VectorSpace {
	constructor(
		basis,
		material,
		lineMaterial = null,
		offset = vec3(0, 0, 0),
		dots = [],
		linearDots = [],
		target_basis
	) {
		this.basis = basis;
		this.target_basis = basis.map((row) => row.slice());
		this.dots = dots;
		this.linear_dots = linearDots;
		this.offset = offset;
		this.material = material;
		this.lineMaterial = lineMaterial;
		vectorSpaces.push(this);
	}

	addDot(x, y, z) {
		const new_dot = new Dot(
			vec3(x, y, z),
			this.offset,
			this.material,
			this.lineMaterial
		);

		this.dots.push(new_dot);
	}

	addLinearDot(x, y, z) {
		const new_dot = new Dot(
			vec3(x, y, z),
			this.linear_dots.length === 0
				? this.offset
				: this.linear_dots[
						this.linear_dots.length - 1
					].getTruePosition(),
			this.material,
			this.lineMaterial
		);

		this.linear_dots.push(new_dot);
	}

	removeLinearDot(x, y, z) {
		// get dot to remove
		const dot_to_remove = this.linear_dots.find(
			(dot) =>
				dot.position.x === x &&
				dot.position.y === y &&
				dot.position.z === z
		);
		if (dot_to_remove) {
			scene.remove(dot_to_remove.line);
			scene.remove(dot_to_remove.mesh);
			this.linear_dots.splice(this.linear_dots.indexOf(dot_to_remove), 1);
		}
	}

	positionLinearDots() {
		for (let i = 0; i < this.linear_dots.length; i++) {
			const dot = this.linear_dots[i];
			if (i === 0) {
				dot.origin.copy(this.offset);
			} else {
				dot.origin.copy(this.linear_dots[i - 1].getTruePosition());
			}
			dot.reposition();
		}
	}

	positionDots() {
		for (let x = 0; x < this.target_basis.length; x++) {
			for (let y = 0; y < this.target_basis[x].length; y++) {
				for (let z = 0; z < this.target_basis[x][y].length; z++) {
					this.basis[x][y][z] = THREE.MathUtils.lerp(
						this.basis[x][y][z],
						this.target_basis[x][y][z],
						0.05
					);
				}
			}
		}

		for (let dot of this.dots) {
			dot.mesh.position.copy(
				new THREE.Vector3(
					dot.position.x * this.basis[0][0][0] +
						dot.position.y * this.basis[0][0][1] +
						dot.position.z * this.basis[0][0][2],
					dot.position.x * this.basis[0][1][0] +
						dot.position.y * this.basis[0][1][1] +
						dot.position.z * this.basis[0][1][2],
					dot.position.x * this.basis[0][2][0] +
						dot.position.y * this.basis[0][2][1] +
						dot.position.z * this.basis[0][2][2]
				)
			);
		}
	}
}

function createGrid(vectorSpace, width = 10, height = 10, depth = 10) {
	for (let x = -width / 2; x < width / 2 + 1; x++) {
		for (let y = -height / 2; y < height / 2 + 1; y++) {
			for (let z = -depth / 2; z < depth / 2 + 1; z++) {
				vectorSpace.addDot(x, y, z);
			}
		}
	}
}
const backgroundSpace = new VectorSpace(
	[
		[1, 0, 0],
		[0, 1, 0],
		[0, 0, 1],
	],
	new THREE.MeshBasicMaterial({
		color: col(1.0),
		opacity: 0.05,
		transparent: true,
		depthTest: false,
		depthWrite: false,
	}),
	new LineMaterial({
		color: col(1.0),
		transparent: true,
		opacity: 0.01,
		linewidth: 5,
		resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
		depthTest: false,
		depthWrite: false,
	})
);
const playerSpace = new VectorSpace(
	[
		[1, 0, 0],
		[0, 1, 0],
		[0, 0, 1],
	],
	new THREE.MeshBasicMaterial({
		color: col(1.0, 1.0, 1.0),
		transparent: true,
		opacity: 1.0,
	}),
	new LineMaterial({
		color: col(1.0, 1.0, 1.0),
		transparent: true,
		opacity: 1.0,
		linewidth: 5,
		resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
	})
);
playerSpace.addLinearDot(0, 0, 0);

function setup() {
	createGrid(backgroundSpace, 30, 30, 0);
}

function animate() {
	controls.update();
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

setup();
animate();

document.querySelector('.menu').addEventListener('click', (e) => {
	if (e.target.id === 'vec1') {
		if (e.target.classList.contains('added')) {
			playerSpace.removeLinearDot(2, 0, 0);
		} else {
			playerSpace.addLinearDot(2, 0, 0);
		}
		e.target.classList.toggle('added');
	} else if (e.target.id === 'vec2') {
		if (e.target.classList.contains('added')) {
			playerSpace.removeLinearDot(0, 2, 0);
		} else {
			playerSpace.addLinearDot(0, 2, 0);
		}
		e.target.classList.toggle('added');
	} else if (e.target.id === 'vec3') {
		if (e.target.classList.contains('added')) {
			playerSpace.removeLinearDot(1, 1, 0);
		} else {
			playerSpace.addLinearDot(1, 1, 0);
		}
		e.target.classList.toggle('added');
	}

	playerSpace.positionLinearDots();
});
