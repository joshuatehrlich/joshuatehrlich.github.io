import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { DotScreenPass } from 'three/addons/postprocessing/DotScreenPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xffffff );

const camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
const CAMERA_DISTANCE = 2;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const directionalLight = new THREE.DirectionalLight( 0xffffff, 1.5 );
directionalLight.position.set( 10, 10, 20 );
directionalLight.castShadow = true;
scene.add( directionalLight );

const ambientLight = new THREE.AmbientLight( 0xffffff, 0.8 );
scene.add( ambientLight );

// ################
// # Post-Processing Setup #
// ################
const composer = new EffectComposer( renderer );

// First, add the render pass (renders your scene)
const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );

// ################
// # Add cube function #
// ################
// const plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({color: 0xffffff}));
// scene.add(plane);
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial( { color: 0xffffff }); // #0x00ff00 is green
function addCube(pos = new THREE.Vector3(0, 0, 0), size = 1, _geometry = geometry) {
	const cubeMaterial = material.clone();
	cubeMaterial.transparent = true;
	cubeMaterial.opacity = 0;
	cubeMaterial.userData.finalOpacity = Math.random() * 0.5 + 0.5;
	cubeMaterial.userData.fadingIn = true;
	cubeMaterial.userData.finalPosition = pos.clone();


	const cube = new THREE.Mesh( _geometry, cubeMaterial );

	cube.castShadow = true;
	cube.receiveShadow = true;

	cube.position.set(pos.x, pos.y, pos.z);
	cube.material = cubeMaterial;
	scene.add( cube );
	cubeGroup.add(cube);
	cubeGrid.set(key(pos.x, pos.y, pos.z), cube);
	return cube;
}

const cubeGrid = new Map();
function key(x, y, z) {
	return `${x},${y},${z}`;
}
const cubeGroup = new THREE.Group();
cubeGroup.position.x = 0;
cubeGroup.position.y = 0;
cubeGroup.position.z = 0;
scene.add(cubeGroup);
addCube(new THREE.Vector3(0,0,0), 1);


function splitcube(_cube) {
	// console.log(_cube.geometry.parameters.position)
	let _pos = _cube.position;
	// console.log(_pos);
	let _size = _cube.geometry.parameters.width/2;

	_pos = _pos.clone().sub(new THREE.Vector3(_size/2,_size/2,_size/2));
	
	let child_positions = [];
	for (let x = 0; x < 2; x++) {
		for (let y = 0; y < 2; y++) {
			for (let z = 0; z < 2; z++) {
				if (Math.random() > 0.0) {
				child_positions.push(new THREE.Vector3(_pos.x + _size * x, _pos.y + _size * y, _pos.z + _size * z));
				}
			}
		}
	}
	cubeGroup.remove(_cube);
	cubeGrid.delete(key(_cube.position.x, _cube.position.y, _cube.position.z));
	_cube.geometry.dispose();

	let _geometry = new THREE.BoxGeometry(_size, _size, _size);

	for (let pos of child_positions) {
		addCube(pos, _size, _geometry);
		// console.log(pos, _size);
	}
}

function cullCubes() {

	let cubesToCull = [];
	for (let cube of cubeGroup.children) {
		cubesToCull.push(cube);
	}

	for (let cube of cubesToCull) {

		let neighbourCount = 0;
		let _size = cube.geometry.parameters.width;
		let _neighbourpositions = [
			new THREE.Vector3(1,0,0),
			new THREE.Vector3(0,1,0),
			new THREE.Vector3(0,0,1),
			new THREE.Vector3(-1,0,0),
			new THREE.Vector3(0,-1,0),
			new THREE.Vector3(0,0,-1),
		];
		for (let neighbourposition of _neighbourpositions) {
			if (cubeGrid.has(key(cube.position.x + neighbourposition.x*_size, cube.position.y + neighbourposition.y*_size, cube.position.z + neighbourposition.z*_size))) {
				neighbourCount++;
			}
		}

		let _color;
		let _deathchance = 0.0;
		switch (neighbourCount) {
			case 6:
				_color = new THREE.Color(0x00ff00);
				_deathchance = 0.0;
				break;
			case 5:
				_color = new THREE.Color(0x80ff00);
				_deathchance = 0.1;
				break;
			case 4:
				_color = new THREE.Color(0xffff00);
				_deathchance = 0.2;
				break;
			case 3:
				_color = new THREE.Color(0xff8000);
				_deathchance = 0.8;
				break;
			case 2:
				_color = new THREE.Color(0xff4000);
				_deathchance = 1.0;
				break;
			case 1:
				_color = new THREE.Color(0xff0000);
				_deathchance = 1.0;
				break;
			case 0:
				_color = new THREE.Color(0x0000ff);
				_deathchance = 1.0;
				break;
			default:
				_color = new THREE.Color(0x0000ff);
				break;
		}

		cube.material.color = _color;
		if (Math.random() < _deathchance) {
			cubeGroup.remove(cube);
			cubeGrid.delete(key(cube.position.x, cube.position.y, cube.position.z));
			cube.geometry.dispose();
		}
	}
}

function groundCubes() {
	let all_grounded = false;
	while (!all_grounded) {
		all_grounded = true;
		for (let cube of cubeGroup.children) {
			let _size = cube.geometry.parameters.height;
			let _posy = cube.position.y;
			let _floor_posy = _posy-_size/2;
			if (
				!cubeGrid.has(key(cube.position.x, _posy-_size, cube.position.z))
				&& _floor_posy > -0.5
			) {
				all_grounded = false;
				console.log(_posy,_floor_posy);
				// cube.material.color = new THREE.Color(0x00ff00);
				cube.position.y -= _size;
				cubeGrid.delete(key(cube.position.x, _posy, cube.position.z));
				cubeGrid.set(key(cube.position.x, cube.position.y, cube.position.z), cube);
			}
		}
	}
}

function colorCubes() {
	for (let cube of cubeGroup.children) {
		let _abs_posy = (cube.position.y - cube.geometry.parameters.height/2) + 0.5;
		let lightness;
		if (Math.round(_abs_posy*100) % 5 == 0) {
			lightness = 0.5;
			cube.material.opacity = 1.0
		} else {
			lightness = 0.7;
			cube.material.opacity = 0.5;
		}
		cube.material.color = new THREE.Color().setHSL(-_abs_posy*0.4-.34, 1.0, lightness);
	}
}

function processCubes() {
	let splitCubes = [];
	for (let cube of cubeGroup.children) {
		splitCubes.push(cube);
	}
	for (let i = 0; i < splitCubes.length; i++) {
		splitcube(splitCubes[i]);
	}
	groundCubes();
	if (cubeGroup.children.length > 10) cullCubes();
	groundCubes();
	colorCubes();
}

// #########################
// # Camera tracking mouse #
// #########################
let cameraMovement = new THREE.Vector3(0,0,0);
let cameraOffset = new THREE.Vector3(0,0,0);
const MOVMENT_SPEED = 1.0;
const mousePosition = new THREE.Vector2();

window.addEventListener( "mousemove", ( event ) => {
	mousePosition.x = ( event.clientX / window.innerWidth ) - 0.5;
	mousePosition.y = ( event.clientY / window.innerHeight ) - 0.5;
} );

let paused = false;

window.addEventListener("keydown", (event) => {
	// console.log(event.key);
	if (event.key == "q") {
		cameraMovement.z -= 1.0;
	}
	if (event.key == "e") {
		cameraMovement.z += 1.0;
	}
	if (event.key == " ") {
		processCubes();
	}

	cameraMovement.clamp(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1));
});

window.addEventListener("keyup", (event) => {
	if (event.key == "q") {
		cameraMovement.z += 1.0;
	}
	if (event.key == "e") {
		cameraMovement.z -= 1.0;
	}
	cameraMovement.clamp(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1));
});

// Handle window resize
window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	composer.setSize(window.innerWidth, window.innerHeight);
});

// ###############
// # Animation loop #
// ###############

let cameraPositionTarget = new THREE.Vector3(0,0,0);

let time = 0;
function animate() {
  // Use composer instead of renderer.render()
  renderer.render(scene, camera);
	time += 0.01;
  console.log(cubeGroup.children.length);
  const _cubes = Array.from(cubeGroup.children);
  for (let cube of _cubes) {

	// if (cube.material.userData.fadingIn) {
	// 	cube.material.opacity += 0.01;
	// 	if (cube.material.opacity >= cube.material.userData.finalOpacity) {
	// 		cube.material.userData.fadingIn = false;
	// 	}
	// }
	// else {
	cube.material.opacity = Math.min(1.0,((Math.sin(time+cube.position.y+cube.position.x+cube.position.z+(cube.material.userData.finalOpacity*5))*0.5+0.5)*0.7+0.3)*cube.material.userData.finalOpacity);
	// cube.position.y = cube.material.userData.finalPosition.y + Math.sin(time+cube.position.x+cube.position.z)*cube.geometry.parameters.height/2;
	// cube.geometry.translate(0, Math.sin(time+cube.position.x+cube.position.z)*(cube.geometry.parameters.height/400), 0);
	// }

  }
//   }

  // Update camera position
  cameraOffset.z += cameraMovement.z * MOVMENT_SPEED*0.1;
//   console.log(cameraOffset);
  cubeGroup.rotation.y = mousePosition.x * 10; 
  cubeGroup.rotation.x = mousePosition.y * 10;
  cameraPositionTarget.z = 5 + cameraOffset.z;
  camera.position.lerp(cameraPositionTarget, 0.1);
  camera.position.z = CAMERA_DISTANCE + cameraOffset.z;

}

renderer.setAnimationLoop( animate );