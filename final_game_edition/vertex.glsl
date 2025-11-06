attribute vec3 barycentric;
varying vec3 vBarycentric;
varying vec3 vNormal;

void main() {
    vBarycentric = barycentric;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}