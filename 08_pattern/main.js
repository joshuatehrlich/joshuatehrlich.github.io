import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { DotScreenPass } from 'three/addons/postprocessing/DotScreenPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xffffff );

const camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight.position.set( 10, 10, 20 );
scene.add( directionalLight );

const ambientLight = new THREE.AmbientLight( 0xffffff, 0.9 );
scene.add( ambientLight );

// ################
// # Post-Processing Setup #
// ################
const composer = new EffectComposer( renderer );

// First, add the render pass (renders your scene)
const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );

// Then add the dot screen effect
const dotScreenPass = new DotScreenPass(
	new THREE.Vector2( 0, 0 ), // center
	0.5,  // angle (rotation)
	1.0   // scale (higher = smaller dots)
);
const bloomPass = new UnrealBloomPass(
	new THREE.Vector2( window.innerWidth, window.innerHeight ), // resolution
	0.2,  // strength (how intense the glow)
	0.4,  // radius (how far the glow spreads)
	0.85  // threshold (only bright objects glow, 0-1)
);
// composer.addPass( dotScreenPass );
composer.addPass( bloomPass );

// ################
// # Add cube funtion #
// ################
const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshBasicMaterial( { color: 0x000000 } ); // #0x00ff00 is green
function addCube(randomness = 1) {
	const cubeMaterial = material.clone();
	cubeMaterial.transparent = true;
	cubeMaterial.opacity = 0;
	cubeMaterial.userData.finalOpacity = Math.random() * 0.5 + 0.5;
	cubeMaterial.userData.fadingIn = true;
	const cube = new THREE.Mesh( geometry, cubeMaterial );
	cube.material = cubeMaterial;
	scene.add( cube );
	cube.position.x = (Math.random() * 10 - 5)*randomness;
	cube.position.y = (Math.random() * 10 - 5)*randomness;
	cube.position.z = (Math.random() * 10 - 5)*randomness;
	return cube;
}

async function addCubes(numberOfCubes = 1, randomness = 1) {
	for (let i = 0; i < numberOfCubes; i++) {
		cubes.push(addCube(randomness));
		await new Promise(resolve => setTimeout(resolve, 100/numberOfCubes));
	}
}

let cubes = [];
cubes.push(addCube(0));

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

// const keysPressed = {
// 	w: false,
// 	a: false,
// 	s: false,
// 	d: false
// }

window.addEventListener("keydown", (event) => {
	console.log(event.key);
	if (event.key == " ") {
		paused = !paused;
	}
	if (event.key == "ArrowUp" || event.key == "w") {
		cameraMovement.y += 1.0;
	}
	if (event.key == "ArrowDown" || event.key == "s") {
		cameraMovement.y -= 1.0;
	}
	if (event.key == "ArrowLeft" || event.key == "a") {
		cameraMovement.x -= 1.0;
	}
	if (event.key == "ArrowRight" || event.key == "d") {
		cameraMovement.x += 1.0;
	}
	if (event.key == "q") {
		cameraMovement.z -= 1.0;
	}
	if (event.key == "e") {
		cameraMovement.z += 1.0;
	}

	cameraMovement.clamp(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1));
});

window.addEventListener("keyup", (event) => {
	if (event.key == "ArrowUp" || event.key == "w") {
		cameraMovement.y -= 1.0;
	}
	if (event.key == "ArrowDown" || event.key == "s") {
		cameraMovement.y += 1.0;
	}
	if (event.key == "ArrowLeft" || event.key == "a") {
		cameraMovement.x += 1.0;
	}
	if (event.key == "ArrowRight" || event.key == "d") {
		cameraMovement.x -= 1.0;
	}
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
let absoluteTime = 0;
function animate() {
  // Use composer instead of renderer.render()
  composer.render();
  for (let cube of cubes) {
    cube.rotation.y += 0.01;
	cube.position.y += Math.sin(absoluteTime + cube.position.x) * 0.01;
	cube.scale.x = Math.sin(absoluteTime + cube.position.x) * 0.4 + 1;
	cube.scale.y = Math.sin(absoluteTime + cube.position.x) * 0.4 + 1;
	cube.scale.z = Math.sin(absoluteTime + cube.position.x) * 0.4 + 1;

	if (cube.material.userData.fadingIn) {
		cube.material.opacity += 0.01;
		if (cube.material.opacity >= cube.material.userData.finalOpacity) {
			cube.material.userData.fadingIn = false;
		}
	}

  }

  // Update camera position
  cameraOffset.x += cameraMovement.x * MOVMENT_SPEED;
  cameraOffset.y += cameraMovement.y * MOVMENT_SPEED;
  cameraOffset.z += cameraMovement.z * MOVMENT_SPEED*0.5;
  console.log(cameraOffset);
  cameraPositionTarget.x = -mousePosition.x * 10 * Math.max(1.0,Math.abs(cameraOffset.z)) + cameraOffset.x;
  cameraPositionTarget.y = mousePosition.y * 10 * Math.max(1.0,Math.abs(cameraOffset.z)) + cameraOffset.y;
  cameraPositionTarget.z = 5 + cameraOffset.z;
  camera.position.lerp(cameraPositionTarget, 0.1);
//   camera.position.x = -mousePosition.x * 10 * Math.max(1.0,cameraOffset.z) + cameraOffset.x;
//   camera.position.y = mousePosition.y * 10 * Math.max(1.0,cameraOffset.z) + cameraOffset.y;
  camera.position.z = 5 + cameraOffset.z;
  absoluteTime += 0.01;

  if (paused) { 
	for (let cube of cubes) {
		// cube.material.opacity = 1;
		cube.material.color = new THREE.Color( 0xffffff );
	}
	scene.background = new THREE.Color( 0x000000 );
	ambientLight.intensity = 10;
	return;
	}
	else {
		for (let cube of cubes) {
			cube.material.color = new THREE.Color( 0x000000 );
		}
		scene.background = new THREE.Color( 0xffffff );
		// material.color = new THREE.Color( 0xffffff );
		ambientLight.intensity = 0.9;
	}

  time += 0.01;
//   console.log(time);
  while (time > 2 && cubes.length < 1000) {
	console.log("adding cube");
	// for (let i = 0; i < cubes.length + 2; i++) {
		// cubes.push(addCube(cubes.length*0.1));	
	// }
	addCubes(cubes.length, cubes.length*0.1);
	time = 0;
  }
}
renderer.setAnimationLoop( animate );