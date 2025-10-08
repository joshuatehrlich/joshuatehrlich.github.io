import * as THREE from 'three';

// ============================================================================
// CONSTANTS AND VARIABLES
// ============================================================================

const sources = [
    { file: "../06_fof/test2.md", title: "ramblings used for testing..." },
    { file: "../06_fof/source.md", title: "oh the places you'll go by dr. seuss" },
    { file: "../06_fof/source3.md", title: "excerpt from the little prince by antoine de saint-exupéry" },
    { file: "../06_fof/sourceanjali.md", title: "by anjali gauld" },
    { file: "../06_fof/test.md", title: "###^^^#######" }
];

let currentSource = 0;
let maxLines = 0;
let maxHeight = 0;

// Three.js scene setup
let scene, camera, renderer;
let textGroup;
let letterMeshes = [];
let columnGroups = [];
let columnTargetY = []; // Target Y positions for smooth animation

// Interaction state
let mouseX = 0;
let mouseY = 0;
let zoomLevel = 1;
let targetRotationX = 0;
let targetRotationY = 0;
let currentRotationX = 0;
let currentRotationY = 0;

// Raycasting for hover detection
let raycaster;
let mouse;
let hoveredLetter = null;
let currentHoveredLine = null;

// Texture cache for performance
let textureCache = {};

// ============================================================================
// THREE.JS SETUP
// ============================================================================

function initThreeJS() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf7f5f1);

    // Camera
    camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
    );
    camera.position.z = 100;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Raycaster for hover detection
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Main text group
    textGroup = new THREE.Group();
    scene.add(textGroup);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================================================
// TEXT RENDERING
// ============================================================================

function createTextTexture(char, options = {}) {
    const fontSize = options.fontSize || 52; // Slightly larger for better rendering
    const isBold = options.isBold || false;
    const isLight = options.isLight || false;
    
    // Create cache key
    const cacheKey = `${char}_${isBold}_${isLight}`;
    
    // Return cached texture if available
    if (textureCache[cacheKey]) {
        return textureCache[cacheKey];
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 64;
    canvas.height = 64;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set font with proper weight
    let fontWeight = '400'; // normal
    if (isBold) fontWeight = '700'; // bold
    if (isLight) fontWeight = '300'; // light
    ctx.font = `${fontWeight} ${fontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000000';
    
    ctx.fillText(char, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    // Cache the texture
    textureCache[cacheKey] = texture;
    return texture;
}

function createLetterMesh(char, lineNumber, options = {}) {
    const group = new THREE.Group();
    
    // Create background plane
    const bgGeometry = new THREE.PlaneGeometry(2, 2);
    const bgMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
    });
    const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
    bgMesh.position.z = -0.01; // Slightly behind the text
    group.add(bgMesh);
    
    // Create text plane
    const geometry = new THREE.PlaneGeometry(2, 2);
    const texture = createTextTexture(char, options);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: options.opacity || 1,
        side: THREE.DoubleSide
    });
    
    const textMesh = new THREE.Mesh(geometry, material);
    group.add(textMesh);
    
    // Store references and user data on the group
    group.userData = {
        char: char,
        lineNumber: lineNumber,
        columnIndex: options.columnIndex || 0,
        rowIndex: options.rowIndex || 0,
        originalColor: options.color || '#000000',
        originalOpacity: options.opacity || 1,
        originalScale: 1,
        textMesh: textMesh,
        bgMesh: bgMesh
    };
    
    return group;
}

// ============================================================================
// PARSING FUNCTIONS
// ============================================================================

async function loadAndParseLines(source) {
    const response = await fetch(source);
    const rawText = await response.text();
    const normalizedText = rawText.replace(/\r\n|\r/g, "\n");
    const lines = normalizedText.split(/(?<=[.!?])|\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .flatMap(line => {
            if (line.length <= 420) return [line];
            
            const chunks = [];
            let remaining = line;
            
            while (remaining.length > 120) {
                let splitPos = remaining.lastIndexOf(' ', 120);
                if (splitPos === -1) splitPos = 120;
                chunks.push(remaining.slice(0, splitPos).trim());
                remaining = remaining.slice(splitPos).trim();
            }
            
            if (remaining.length > 0) {
                chunks.push(remaining);
            }
            
            return chunks;
        });
    return lines;
}

function createTextMeshes(textSource) {
    // Clear previous meshes
    letterMeshes.forEach(group => {
        group.children.forEach(mesh => {
            mesh.geometry.dispose();
            if (mesh.material.map) {
                // Don't dispose textures as they're cached
                // mesh.material.map.dispose();
            }
            mesh.material.dispose();
        });
    });
    letterMeshes = [];
    columnGroups = [];
    textGroup.clear();

    // Find max line length
    let maxLineLength = 0;
    for (let line of textSource) {
        if (line.length > maxLineLength) {
            maxLineLength = line.length;
        }
    }
    maxLineLength += 2;

    // Create column groups
    columnTargetY = [];
    for (let i = 0; i < maxLineLength; i++) {
        const columnGroup = new THREE.Group();
        columnGroups.push(columnGroup);
        columnTargetY.push(0); // Initialize target Y position
        textGroup.add(columnGroup);
    }

    // Add letters to columns
    let lineNumber = 0;
    for (let sourceLine of textSource) {
        let line = sourceLine;
        let startIndex = Math.max(0, Math.floor((maxLineLength - line.length) / 2));

        for (let i = startIndex; i < (line.length + startIndex); i++) {
            const char = line[i - startIndex];
            
            // Determine styling
            let isBold = false;
            let isLight = false;
            if (lineNumber % 2 === 0) {
                isLight = true;
            } else if ((lineNumber + 1) % 4 === 0) {
                isBold = true;
            }

            const letterMesh = createLetterMesh(char + " ", lineNumber, {
                columnIndex: i,
                rowIndex: columnGroups[i].children.length,
                isBold: isBold,
                isLight: isLight
            });

            columnGroups[i].add(letterMesh);
            letterMeshes.push(letterMesh);
        }

        lineNumber++;
    }

    maxLines = lineNumber;

    // Calculate max height
    maxHeight = 0;
    for (let column of columnGroups) {
        if (column.children.length > maxHeight) {
            maxHeight = column.children.length;
        }
    }

    // Position columns and apply depth coloring
    const spacing = 2.5;
    columnGroups.forEach((column, i) => {
        column.position.x = (i - maxLineLength / 2) * spacing;
    });

    colorAndPositionLetters();
}

function findAbsoluteLetterHeight(columnIndex, rowIndex) {
    const localVerticalLength = columnGroups[columnIndex].children.length;
    return rowIndex + (maxHeight - localVerticalLength) / 2;
}

function colorAndPositionLetters() {
    let deepestDepth = 0;

    // First pass: find deepest depth for each line
    for (let i = 0; i < maxLines; i++) {
        let deepestAbsoluteHeight = 0;

        letterMeshes.forEach(mesh => {
            if (mesh.userData.lineNumber === i) {
                const absoluteHeight = findAbsoluteLetterHeight(
                    mesh.userData.columnIndex,
                    mesh.userData.rowIndex
                );
                if (absoluteHeight > deepestAbsoluteHeight) {
                    deepestAbsoluteHeight = absoluteHeight;
                }
            }
        });

        // Second pass for this line: apply depth
        letterMeshes.forEach(mesh => {
            if (mesh.userData.lineNumber === i) {
                const absoluteHeight = findAbsoluteLetterHeight(
                    mesh.userData.columnIndex,
                    mesh.userData.rowIndex
                );
                const depth = deepestAbsoluteHeight - absoluteHeight;
                
                if (depth > deepestDepth) {
                    deepestDepth = depth;
                }

                mesh.userData.depth = depth;
                mesh.userData.deepestAbsoluteHeight = deepestAbsoluteHeight;
            }
        });
    }

    // Third pass: apply colors and Z positions based on depth
    letterMeshes.forEach(group => {
        const depth = group.userData.depth;
        const textOpacity = 0.3 + (depth / deepestDepth) * 0.7;
        const colorValue = 0.1 + (depth / deepestDepth) * 0.9;
        const zDepth = depth * 2;

        // Update text mesh
        const textMesh = group.userData.textMesh;
        textMesh.material.opacity = textOpacity;
        textMesh.material.color.setRGB(colorValue * 0.3, colorValue * 0.3, colorValue * 0.3);
        
        // Update background mesh - darker when closer (less depth), lighter when farther (more depth)
        const bgMesh = group.userData.bgMesh;
        const bgOpacity = (1.0 - (depth / deepestDepth)) * 0.2;
        bgMesh.material.opacity = bgOpacity;
        
        group.position.z = zDepth;

        // Store original values
        group.userData.originalOpacity = textOpacity;
        group.userData.originalColorValue = colorValue * 0.3;
        group.userData.originalBgOpacity = bgOpacity;
        group.userData.originalZ = zDepth;
        group.userData.depth = depth;
        group.userData.maxDepth = deepestDepth;
    });

    // Position letters vertically within columns (centered like flexbox)
    // Use absolute height so letters with same absolute position align perfectly
    const verticalSpacing = 2.5;
    columnGroups.forEach((column, columnIndex) => {
        column.children.forEach((letter, rowIndex) => {
            // Calculate absolute height (same as used for alignment)
            const absoluteHeight = findAbsoluteLetterHeight(columnIndex, rowIndex);
            // Position based on absolute height from center
            letter.position.y = (maxHeight / 2 - absoluteHeight) * verticalSpacing;
            letter.userData.originalY = letter.position.y;
        });
    });
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

document.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomSpeed = -0.001;
    zoomLevel += e.deltaY * zoomSpeed;
    zoomLevel = Math.max(0.5, Math.min(2, zoomLevel));
}, { passive: false });

// Touch events for mobile
let initialPinchDistance = null;
let initialZoomLevel = 1;

document.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialPinchDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
        initialZoomLevel = zoomLevel;
    }
}, { passive: false });

document.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && initialPinchDistance) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
        
        const scale = currentDistance / initialPinchDistance;
        zoomLevel = initialZoomLevel * scale;
        zoomLevel = Math.max(0.5, Math.min(2, zoomLevel));
    }
}, { passive: false });

document.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
        initialPinchDistance = null;
    }
}, { passive: false });

document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;

    targetRotationY = mouseX * 60 * (Math.PI / 180);
    targetRotationX = mouseY * -60 * (Math.PI / 180);

    // Update mouse position for raycasting
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

document.querySelector('.next').addEventListener('click', () => {
    currentSource++;
    if (currentSource >= sources.length) {
        currentSource = 0;
    }
    main();
});

// ============================================================================
// ANIMATION LOOP
// ============================================================================

function animate() {
    requestAnimationFrame(animate);

    // Smooth rotation
    currentRotationX += (targetRotationX - currentRotationX) * 0.05;
    currentRotationY += (targetRotationY - currentRotationY) * 0.05;

    textGroup.rotation.x = currentRotationX;
    textGroup.rotation.y = currentRotationY;
    textGroup.scale.setScalar(zoomLevel);

    // Raycasting for hover detection
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(letterMeshes, true); // Recursive to get children

    // Reset all column target positions first
    for (let i = 0; i < columnTargetY.length; i++) {
        columnTargetY[i] = 0;
    }

    // Handle new hover
    if (intersects.length > 0) {
        // Find the parent group of the intersected mesh
        let intersectedObject = intersects[0].object;
        let hoveredGroup = intersectedObject.parent;
        
        // Make sure we have the group with userData
        if (!hoveredGroup.userData.lineNumber && hoveredGroup.parent) {
            hoveredGroup = hoveredGroup.parent;
        }
        
        hoveredLetter = hoveredGroup;
        const hoveredLineNumber = hoveredGroup.userData.lineNumber;

        const hoveredAbsoluteHeight = findAbsoluteLetterHeight(
            hoveredGroup.userData.columnIndex,
            hoveredGroup.userData.rowIndex
        );

        // Highlight all letters in the hovered line and set target positions
        letterMeshes.forEach(group => {
            if (group.userData.lineNumber === hoveredLineNumber) {
                const textMesh = group.userData.textMesh;
                const bgMesh = group.userData.bgMesh;
                textMesh.material.opacity = 1.0;
                textMesh.material.color.setRGB(0, 0, 0); // Full black when hovered
                bgMesh.material.opacity = 0; // Hide background when hovered
                
                // Scale up more to make it more prominent/bold-looking
                const isHovered = (group === hoveredGroup);
                group.scale.setScalar(isHovered ? 1.6 : 1.5);

                // Calculate target Y position to align the line
                const letterAbsoluteHeight = findAbsoluteLetterHeight(
                    group.userData.columnIndex,
                    group.userData.rowIndex
                );
                const heightDifference = letterAbsoluteHeight - hoveredAbsoluteHeight;
                const verticalSpacing = 2.5;
                // Move column so this letter aligns with the hovered letter
                // Column offset = (hovered Y) - (this letter's current Y relative to column)
                columnTargetY[group.userData.columnIndex] = heightDifference * verticalSpacing;
            }
        });

        // Reset styling for non-hovered letters
        if (currentHoveredLine !== hoveredLineNumber) {
            letterMeshes.forEach(group => {
                if (group.userData.lineNumber === currentHoveredLine) {
                    const textMesh = group.userData.textMesh;
                    const bgMesh = group.userData.bgMesh;
                    textMesh.material.opacity = group.userData.originalOpacity;
                    const originalColor = group.userData.originalColorValue || 0.3;
                    textMesh.material.color.setRGB(originalColor, originalColor, originalColor);
                    bgMesh.material.opacity = group.userData.originalBgOpacity;
                    group.scale.setScalar(1);
                }
            });
        }

        currentHoveredLine = hoveredLineNumber;
    } else {
        // Reset styling for previously hovered line
        if (currentHoveredLine !== null) {
            letterMeshes.forEach(group => {
                if (group.userData.lineNumber === currentHoveredLine) {
                    const textMesh = group.userData.textMesh;
                    const bgMesh = group.userData.bgMesh;
                    textMesh.material.opacity = group.userData.originalOpacity;
                    const originalColor = group.userData.originalColorValue || 0.3;
                    textMesh.material.color.setRGB(originalColor, originalColor, originalColor);
                    bgMesh.material.opacity = group.userData.originalBgOpacity;
                    group.scale.setScalar(1);
                }
            });
        }
        
        currentHoveredLine = null;
        hoveredLetter = null;
    }

    // Animate letter pulsing
    const time = Date.now() * 0.001;
    letterMeshes.forEach((group, index) => {
        if (!group.userData.lineNumber || group.userData.lineNumber !== currentHoveredLine) {
            const scale = 1 + Math.sin(time + index * 0.1) * 0.15;
            group.scale.setScalar(scale);
        }
    });

    // Smoothly interpolate column positions
    columnGroups.forEach((column, index) => {
        const targetY = columnTargetY[index];
        column.position.y += (targetY - column.position.y) * 0.2; // Slightly faster for better responsiveness
    });

    renderer.render(scene, camera);
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
    document.querySelector('.title').textContent = sources[currentSource].title;

    maxHeight = 0;
    maxLines = 0;

    const TEXT_SEQUENCE = await loadAndParseLines(sources[currentSource].file);
    createTextMeshes(TEXT_SEQUENCE);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

initThreeJS();
main();
animate();

