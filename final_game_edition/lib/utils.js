import * as THREE from 'three';

export function vec3(x, y = null, z = null) {
	if (y === null && z === null) {
		return new THREE.Vector3(x, x, x);
	}
	return new THREE.Vector3(x, y, z);
}

// Add barycentric coordinates to geometry for wireframe rendering
export function addBarycentricCoordinates(geometry) {
	const positions = geometry.attributes.position;
	const vertexCount = positions.count;
	
	// Create barycentric coordinate array
	// Each triangle has 3 vertices with pattern: (1,0,0), (0,1,0), (0,0,1)
	const barycentrics = new Float32Array(vertexCount * 3);
	
	for (let i = 0; i < vertexCount; i++) {
		const vertexInTriangle = i % 3;
		
		if (vertexInTriangle === 0) {
			barycentrics[i * 3] = 1.0;
			barycentrics[i * 3 + 1] = 0.0;
			barycentrics[i * 3 + 2] = 0.0;
		} else if (vertexInTriangle === 1) {
			barycentrics[i * 3] = 0.0;
			barycentrics[i * 3 + 1] = 1.0;
			barycentrics[i * 3 + 2] = 0.0;
		} else {
			barycentrics[i * 3] = 0.0;
			barycentrics[i * 3 + 1] = 0.0;
			barycentrics[i * 3 + 2] = 1.0;
		}
	}
	
	geometry.setAttribute('barycentric', new THREE.BufferAttribute(barycentrics, 3));
	return geometry;
}