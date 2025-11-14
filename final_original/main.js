import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x000000 );

const camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 100;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.SphereGeometry(1, 32, 32 );

let vectorSpaces = [];

class Dot {
	constructor(x, y, z, color) {
		this.position = new THREE.Vector3(x, y, z);
		this.color = new THREE.Color().copy(color);
		this.mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: color, transparent: true, opacity: 1.0 } ) );
		this.mesh.position;
	}
}

class VectorSpace {
	constructor(basis, default_color = new THREE.Color(0.2,0.2,0.2), offset = new THREE.Vector3(0,0,0), dots = [], target_basis) {
		this.basis = basis;
		this.target_basis = basis.map(row => row.slice());
		this.dots = dots;
		vectorSpaces.push(this);
		this.default_color = default_color;
		this.offset = offset;
	}

	addDot(x, y, z, color = this.default_color, spacing = 10) {

		const new_dot = new Dot((x + this.offset.x)*spacing, (y + this.offset.y)*spacing, (z + this.offset.z)*spacing, color);
		this.dots.push(new_dot);
		scene.add( new_dot.mesh );
		new_dot.mesh.position.copy(new_dot.position);
	}
	positionDots() {
		
		for (let x = 0; x < this.target_basis.length; x++) {
			for (let y = 0; y < this.target_basis[x].length; y++) {
				this.basis[x][y] = THREE.MathUtils.lerp(this.basis[x][y], this.target_basis[x][y], 0.05);
			}
		}

		for (let dot of this.dots) {
			dot.mesh.position.copy(new THREE.Vector3(
				(dot.position.x*this.basis[0][0] + dot.position.y*this.basis[0][1]),
				(dot.position.x*this.basis[1][0] + dot.position.y*this.basis[1][1]),
				(dot.position.z)
			));
		}
	}
}


function createGrid(vectorSpace, width = 10, height = 10, spacing = 10) {
	for (let x = -width/2; x < width/2 + 1; x++) {
		for (let y = -height/2; y < height/2 + 1; y++) {
			vectorSpace.addDot(x, y, 0);
		}
	}
}


let vecspace1 = new VectorSpace([[1, 0], [0, 1]], new THREE.Color(0.2,0.2,0.2));
let backgroundSpace = new VectorSpace([[1, 0], [0, 1]], new THREE.Color(0.01,0.01,0.01));
let basisSpace = new VectorSpace([[1, 0], [0, 1]], new THREE.Color(1.0,1.0,1.0));
function setup() {

	createGrid(backgroundSpace, 100, 100);

	createGrid(vecspace1, 10, 10, 10);
	basisSpace.addDot(0, 0, 0);
	basisSpace.addDot(1, 0, 0);
	basisSpace.addDot(0, 1, 0);
	basisSpace.addDot(-1, 0, 0);
	basisSpace.addDot(0, -1, 0);
	// createGrid(basisSpace, 1, 1, 10);

	connectBasisControls(vecspace1);
	connectBasisControls(basisSpace);
	// moveBasis(vecspace1);
}

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );

	vecspace1.positionDots();
	basisSpace.positionDots();
}

let invert = false;

document.addEventListener("keydown", (event) => {
	if (event.key === "Shift") {
		invert = true;
	}
});

document.addEventListener("keyup", (event) => {
	if (event.key === "Shift") {
		invert = false;
	}
});

function connectBasisControls(vectorSpace) {
	let basisControllers = document.querySelectorAll(".basis .square");
	for (let x = 0; x < 2; x++) {
		for (let y = 0; y < 2; y++) {

			const ctrl = basisControllers[x*2+y];
			ctrl.textContent = basisSpace.target_basis[x][y];	
			ctrl.addEventListener("mousedown", (event) => {
				
				if (invert && vectorSpace.target_basis[x][y] > 0) {
					vectorSpace.target_basis[x][y] -= 1.0;
				} else if (!invert) {
					vectorSpace.target_basis[x][y] += 1.0;
				}
				ctrl.textContent = (vectorSpace.target_basis[x][y]);
				console.log(vectorSpace.target_basis[x][y]);
			});
		}
	}
}

setup();
animate();