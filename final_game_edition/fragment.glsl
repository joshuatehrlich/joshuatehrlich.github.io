uniform vec3 color;
uniform vec3 wireframeColor;
uniform float wireframeWidth;

varying vec3 vBarycentric;
varying vec3 vNormal;

void main() {
    // Detect edges by checking if normal changes (sharp edges only)
    vec3 dx = dFdx(vNormal);
    vec3 dy = dFdy(vNormal);
    float normalChange = length(dx) + length(dy);
    
    // Barycentric wireframe
    float minDist = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);
    float wireframe = smoothstep(0.0, wireframeWidth, minDist);
    
    // Only show wireframe at sharp edges (where normal changes)
    float edgeThreshold = 0.2;
    float isSharpEdge = smoothstep(0.1, edgeThreshold, normalChange);
    
    // Mix: only draw lines at sharp edges
    float finalWireframe = mix(1.0, wireframe, isSharpEdge);
    vec3 finalColor = mix(wireframeColor, color, finalWireframe);
    
    // Calculate opacity: opaque at edges (wireframe), transparent at center
    float opacity = 1.0 - finalColor.x;
    
    gl_FragColor = vec4(finalColor, opacity);
}