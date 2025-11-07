import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createCamera(renderer, width, height) {
	const ZOOM_FACTOR = 120;
	const camera = new THREE.OrthographicCamera(
		-width / 2 / ZOOM_FACTOR,
		width / 2 / ZOOM_FACTOR,
		height / 2 / ZOOM_FACTOR,
		-height / 2 / ZOOM_FACTOR, 0.1, 1000 );
	camera.position.z = 100;

	camera.position.y = 100;
	camera.position.z = 100;
	camera.position.x = 100;
	camera.lookAt(0, 0, 0);
	return camera;
}

export function createControls(camera, renderer) {
	const controls = new OrbitControls( camera, renderer.domElement );
	controls.enableDamping = true;
	controls.dampingFactor = 0.25;
	controls.enableZoom = true;
	return controls;
}