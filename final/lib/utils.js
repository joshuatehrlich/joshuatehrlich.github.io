import * as THREE from 'three';

export function vec3(x, y = null, z = null) {
	if (y === null && z === null) {
		return new THREE.Vector3(x, x, x);
	} else if (z === null) {
		return new THREE.Vector3(x, y, 0);
	} else {
		return new THREE.Vector3(x, y, z);
	}
}

export function col(r, g = null, b = null) {
	if (g === null && b === null) {
		return new THREE.Color(r, r, r);
	} else {
		return new THREE.Color(r, g, b);
	}
}
