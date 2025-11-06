import * as THREE from 'three';


// LIGHTS
export function createLights(scene) {
	const ambientLight = new THREE.AmbientLight( 0xffffff, 1.2 );
	scene.add( ambientLight );

	const skylight = new THREE.DirectionalLight( 0xffffff, .7 );
	skylight.position.set( 90, 20, -30 );
	scene.add( skylight );

	const light = new THREE.DirectionalLight( 0xffffff, 4 );
	light.position.set( -15, 15, 15 );
	scene.add( light );
	light.castShadow = true;
}