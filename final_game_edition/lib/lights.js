import * as THREE from 'three';

// LIGHTS
export function createLights(scene) {
	const lightGroup = new THREE.Group();
	const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
	lightGroup.add(ambientLight);

	const skylight = new THREE.DirectionalLight(0xffffff, 0.7);
	skylight.position.set(90, 20, -30);
	lightGroup.add(skylight);

	const light = new THREE.DirectionalLight(0xffffff, 4);
	light.position.set(-15, 15, 15);
	lightGroup.add(light);
	light.castShadow = true;

	return lightGroup;
}
