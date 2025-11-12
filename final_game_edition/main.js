import * as THREE from 'three';
import { vec3 } from './lib/utils.js';
import * as CAM from './lib/camera.js';
import * as CUBE from './lib/cube.js';
import * as LIGHTS from './lib/lights.js';
import * as RENDERER from './lib/renderer.js';

// SETUP ////////////////////////////////////////////////////////////////

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const renderer = RENDERER.createRenderer();

const lightGroup = LIGHTS.createLights(scene);
scene.add(lightGroup);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const canvas = document.querySelector('canvas');
const rect = canvas.getBoundingClientRect();

function onMouseMove(event) {
	mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
	mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

const camera = CAM.createCamera(renderer, rect.width, rect.height);
const controls = CAM.createControls(camera, renderer);
// PLAYER

class Player {
	constructor() {
		this.position = vec3(0, 0, 0);
		this.rotation = 0;
		this.speed = 1.0;

		this.space = new CUBE.CubeSpace();
		// this.space.addCube(this.position, vec3(0.5, 0.0, 0.5), 0x000000);
		this.space.render(scene);

		this.cube = this.space.cubes[0];
	}
}

const player = new Player();

window.addEventListener('keydown', (event) => {
	if (event.key == 'd') {
		player.position.x += player.speed;
		// player.cube.target_position.x += player.speed;
	} else if (event.key == 'a') {
		player.position.x -= player.speed;
		// player.cube.target_position.x -= player.speed;
	} else if (event.key == 's') {
		player.position.z += player.speed;
		// player.cube.target_position.z += player.speed;
	} else if (event.key == 'w') {
		player.position.z -= player.speed;
		// player.cube.target_position.z -= player.speed;
	}
});

window.addEventListener('click', (event) => {
	if (selectedCube) {
		player.position.x = selectedCube.target_position.x;
		player.position.z = selectedCube.target_position.z;
	}
});

// child camera to player

// LEVEL ITSELF //////////////////////////////////////////////////////////

const levelSpace = new CUBE.CubeSpace();

levelSpace.addGrid(vec3(20, 0, 20));
levelSpace.group.position.y = -4.5;
levelSpace.render(scene);

// This should just apply to every single cubespace that's active. they should
// be stored in an array.
CUBE.cube_spaces.forEach((space) => {
	CUBE.updateLinesOnResize(camera, renderer, space);
});

window.addEventListener('mousemove', onMouseMove, false);

const cameraGroup = new THREE.Group();
cameraGroup.position.copy(player.position);
cameraGroup.add(camera);
scene.add(cameraGroup);

let selectedCube = null;
let frame_count = 0;

// ANIMATION LOOP
function animate() {
	frame_count++;
	requestAnimationFrame(animate);

	cameraGroup.position.lerp(
		vec3(
			player.position.x - 0.5,
			player.position.y,
			player.position.z - 0.5
		),
		0.02
	);

	// controls.update();

	raycaster.setFromCamera(mouse, camera);

	const cubesMeshes = levelSpace.cubes.map((cube) => cube.mesh);
	const intersects = raycaster.intersectObjects(cubesMeshes);

	for (let cube of levelSpace.cubes) {
		cube.target_position.copy(cube.true_position);
	}

	// DO SOMETHING TO SELECTED WITH MOUSE
	let hoveredCube = null;
	let standingCube = null;
	for (let cube of levelSpace.cubes) {
		if (
			cube.target_position.x == player.position.x &&
			cube.target_position.z == player.position.z
		) {
			standingCube = cube;
		}
		// if (intersects.length > 0 && intersects[0].object === cube.mesh) {
		// 	hoveredCube = cube;
		// }
		if (hoveredCube && standingCube) {
			break;
		}
	}

	for (let cube of levelSpace.cubes) {
		if (standingCube) {
			let distanceToHovered =
				(Math.abs(
					standingCube.target_position.x - cube.target_position.x
				) +
					Math.abs(
						standingCube.target_position.z - cube.target_position.z
					) +
					Math.abs(
						standingCube.target_position.y - cube.target_position.y
					)) /
				3;
			let distanceColor = new THREE.Color(0x000000);
			distanceColor.setHSL(0, 0, distanceToHovered);
			cube.target_position.y =
				cube.true_position.y -
				Math.max((1 - distanceToHovered) * 0.5, 0) +
				Math.sin(
					0.01 * frame_count +
						cube.mesh.position.x * 0.2 +
						cube.mesh.position.z * 0.2
				) *
					0.2;
			cube.setColor(distanceColor);
		}

		let heightColor = new THREE.Color(0x000000);
		heightColor.setHSL(0, 0, 1.0 + cube.mesh.position.y);

		const trueCameraPosition = vec3(
			cameraGroup.position.x + camera.position.x,
			cameraGroup.position.y + camera.position.y,
			cameraGroup.position.z + camera.position.z
		);
		const distanceToCamera = trueCameraPosition.distanceTo(
			cube.mesh.position
		);
		let fognear = 162;
		let fogfar = 179;
		let fog_factor = Math.min(
			Math.max((distanceToCamera - fognear) / (fogfar - fognear), 0),
			1
		);
		cube.wireframe.material.opacity = 1 - fog_factor;

		fognear = 172;
		fogfar = 176;
		fog_factor = Math.min(
			Math.max((distanceToCamera - fognear) / (fogfar - fognear), 0),
			1
		);

		const final_color = new THREE.Color(
			heightColor.r + fog_factor / 2,
			heightColor.g + fog_factor / 2,
			heightColor.b + fog_factor / 2
		);

		if (cube == standingCube) {
			final_color.setHSL(0, 0, 0.0);
			cube.target_position.y += 0.55;
		}

		cube.setColor(final_color);

		if (cube === hoveredCube) {
			// check if moveable to by player

			const x_distance_to_player = Math.abs(
				cube.target_position.x - player.position.x
			);
			const z_distance_to_player = Math.abs(
				cube.target_position.z - player.position.z
			);

			if (Math.abs(x_distance_to_player + z_distance_to_player) == 1) {
				selectedCube = cube;

				final_color.setHSL(0, 0, 0.0);
				cube.setColor(final_color);
				cube.target_position.y = cube.true_position.y + 0.05;

				// if click mouse
			}
		}
		cube.updatePosition();
	}

	// player.cube.updatePosition(0.1, player.position);

	renderer.render(scene, camera);
}

animate();
