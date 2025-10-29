function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);
}

// CONSTANTS

const BOX_SIZE = 50;
const BOX_SPACING = BOX_SIZE;
const BOX_COLOR = [255];


// DEFINITIONS

class Box {
	constructor(position = [0, 0, 0], color = BOX_COLOR, size = BOX_SIZE, spacing = BOX_SPACING) {
		this.position = position;
		this.color = color;
		this.size = size;
		this.spacing = spacing;
	}
}
let grid = [];


// CORE FUNCTIONS

function addBox(position = [0, 0, 0], color = BOX_COLOR, size = BOX_SIZE, spacing = BOX_SPACING) {
	grid.push(new Box(position, color, size, spacing));
}

function addBoxGrid(position = [0, 0, 0], spacing = BOX_SPACING) {
	for (let x = 0; x < position[0]; x++) {
		for (let y = 0; y < position[1]; y++) {
			for (let z = 0; z < position[2]; z++) {
				grid.push(new Box([x - position[0] / 2, y - position[1] / 2, z - position[2] + 1]));
			}
		}
	}
}


// GEOMETRY CREATION AND RENDERING

function createBox(_box) {
	push();
	// stroke(random(255));
	_box.position[2] += random(-1, 1) * 0.02;
	fill(_box.color);
	translate(_box.position[0] * _box.spacing, _box.position[1] * _box.spacing, _box.position[2] * _box.spacing);
	box(_box.size);
	pop();
}
function renderBoxes() {
	for (let box of grid) {
		createBox(box);
	}
}

function draw() {
	clear();
	background(0);
	// console.log(a);
	// lights();
	ortho();
	// orbitControl();


	fill(255);
	rotateX(PI/3.3);
	rotateZ(PI/4);

	// createBox([0, 0, 0], color(255, 0, 0));
	// createBox([1, 0, 0], color(0, 255, 0));
	addBoxGrid([50, 50, 1]);
	addBox([0, 0, 1], color(255));

	renderBoxes();
	console.log(frameRate());
}

function mouseClicked() {
	console.log("mouse clicked");
}


function keyPressed() {
	if (key === "s") {
		// Save the current canvas with a unique name based on frameCount
		saveCanvas('motion_' + frameCount, 'png');
	}
	console.log("saved");
}

// create a fake 3d environment using shapes with repeated stroke that acts as topographical lines
// 