import * as THREE from 'three';
import { vec3 } from './lib/utils.js';
import * as CAM from './lib/camera.js';
import * as CUBE from './lib/cube.js';
import * as LIGHTS from './lib/lights.js';
import * as RENDERER from './lib/renderer.js';

// SETUP ////////////////////////////////////////////////////////////////

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xffffff );

const renderer = RENDERER.createRenderer();

const camera = CAM.createCamera(renderer);
const controls = CAM.createControls(camera, renderer);

LIGHTS.createLights(scene);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
    // Convert mouse position to normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// LEVEL ITSELF //////////////////////////////////////////////////////////

const levelSpace = new CUBE.CubeSpace();

levelSpace.addGrid();
levelSpace.addCube(vec3(0, 1, 0));
levelSpace.addCube(vec3(0, 2, 0));
levelSpace.addCube(vec3(1, 1, 2));
levelSpace.render(scene);

// This should just apply to every single cubespace that's active. they should be stored in an array.
CUBE.cube_spaces.forEach(space => {
	CUBE.updateLinesOnResize(camera, renderer, space);
});

window.addEventListener('mousemove', onMouseMove, false);

// ANIMATION LOOP
function animate() {
    requestAnimationFrame(animate);

	controls.update();

    raycaster.setFromCamera(mouse, camera);
    
    const cubesMeshes = levelSpace.cubes.map(cube => cube.mesh);
    const intersects = raycaster.intersectObjects(cubesMeshes);


	for (let cube of levelSpace.cubes) {
		cube.target_position.copy(cube.true_position);
	}
    
    // DO SOMETHING TO SELECTED WITH MOUSE
    if (intersects.length > 0) {
        const hoveredMesh = intersects[0].object;
        const hoveredCube = levelSpace.cubes.find(c => c.mesh === hoveredMesh);

		hoveredCube.target_position.y = hoveredCube.true_position.y + 0.5;
    }

	CUBE.cube_spaces.forEach(space => {
		for (let cube of space.cubes) {
			cube.mesh.position.lerp(cube.target_position, 0.1);
			cube.wireframe.position.lerp(cube.target_position, 0.1);
		}
	});

    renderer.render(scene, camera);

}

animate();