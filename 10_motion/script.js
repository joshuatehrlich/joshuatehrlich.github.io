
// CONSTANTS

const BOX_SIZE = [20,20,20];
const BOX_SPACING = [50,25,100];
const BOX_COLOR = [255];


// DEFINITIONS

class Box {
	constructor(position = [0, 0, 0], color = BOX_COLOR, size = BOX_SIZE, spacing = BOX_SPACING, offset = [0, 0, 0]) {
		this.position = position;
		this.target_position = position.slice();
		this.color = color;
		this.size = size;
		this.spacing = spacing;
		this.id = Math.floor(Math.random()*1000000);
		this.offset = offset;
	}
}
let grid = [];


// CORE FUNCTIONS

function addBox(position = [0, 0, 0], color = BOX_COLOR, size = BOX_SIZE, spacing = BOX_SPACING) {
	grid.push(new Box(position, color, size, spacing));
}

function removeBox(position = [0, 0, 0]) {
	grid = grid.filter(box => box.position[0] !== position[0] || box.position[1] !== position[1] || box.position[2] !== position[2]);
}

function addBoxGrid(position = [0, 0, 0], spacing = BOX_SPACING) {
	for (let y = -position[1]; y < position[1]; y++) {
		for (let x = -position[0]; x < position[0]; x++) {
			for (let z = -position[2]; z < position[2]; z++) {
				addBox([x, y, z]);
			}
		}
	}
}


// GEOMETRY CREATION AND RENDERING

function createBox(_box = new Box(), spawner_offset = [0, 0, 0]) {

	let pos = coordToPosition([_box.position[0] + spawner_offset[0], _box.position[1] + spawner_offset[1], _box.position[2] + spawner_offset[2]]);
	let size = BOX_SIZE[0];
	let height = BOX_SIZE[2];

	push();

	fill(_box.color);

	beginShape();
	// draw top face, box size is WIDTH, HEIGHT, DEPTH (width is left face)
	vertex(pos[0], pos[1]);
	vertex(pos[0] - size, pos[1] - height/2);
	vertex(pos[0], pos[1] - height);
	vertex(pos[0] + size, pos[1] - height/2);
	endShape(CLOSE);

	fill(200);
	beginShape();
	vertex(pos[0], pos[1]);
	vertex(pos[0] - size, pos[1] - height/2);
	vertex(pos[0] - size, pos[1] + height/2 + 1000);
	vertex(pos[0], pos[1] + height + 1000);
	endShape(CLOSE);

	fill(120);
	beginShape();
	vertex(pos[0], pos[1]);
	vertex(pos[0] + size, pos[1] - height/2);
	vertex(pos[0] + size, pos[1] + height/2 + 1000);
	vertex(pos[0], pos[1] + height + 1000);
	endShape(CLOSE);

	pop();

	return pos;
}

function coordToPosition(coord = [0, 0, 0]) {
	let xcoord = coord[0];
	let ycoord = coord[1];
	let zcoord = coord[2];
	let size = BOX_SIZE[0];
	let height = BOX_SIZE[2];

	let xpos = window.innerWidth / 2;
	let ypos = window.innerHeight / 2;

	// move down the x axis (top left ot bottom right)
	xpos += xcoord * size;
	ypos += xcoord * height/2;

	// move down the y axis (top left to bottom right)
	ypos += ycoord * height/2;
	xpos -= ycoord * size;

	// move VERTICALLY in the z axis (top to bottom)
	ypos -= zcoord * height;

	return [xpos, ypos];
}

async function renderBoxes() {
	for (let box of grid) {
		let pos = coordToPosition(box.target_position);

		if (box === grid[0]) {
			// console.log(box.target_position);
		}

		let d = dist(mouseX, mouseY, pos[0], pos[1]);
		if (d <= 100) {
			box.offset[2] = (100-d)*0.02;
		} else { box.offset[2] = 0; }
		createBox(box);
		// await new Promise(resolve => setTimeout(resolve, 5));
	}
}

function cullBoxes() {
	// cull boxes that have a box at all positions + 1 in each direction
	for (let box of grid) {
		if (grid.some(b => b.position[0] === box.position[0] + 1 && b.position[1] === box.position[1] + 1 && b.position[2] === box.position[2] + 1)) {
			grid = grid.filter(b => b.position[0] !== box.position[0] || b.position[1] !== box.position[1] || b.position[2] !== box.position[2]);
		}
	}
	console.log(grid.length);
}

function sortBoxes() {
	// reorder grid by z coordinate
	grid.sort((a, b) => a.position[2] - b.position[2]);
	
	// reorder grid by x coordinate
	grid.sort((a, b) => a.position[0] - b.position[0]);

	// reorder grid by y coordinate
	grid.sort((a, b) => a.position[1] - b.position[1]);
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	clear();
	background(0);
	noStroke();

	addBoxGrid([20,20,0.5]);
	removeBox([0,0,0]);

	// addBox([1,1,1]);
	// addBox([0,0,0]);
	// addBox([-1,0,0]);
	// renderBoxes();
	sortBoxes();
	// cullBoxes();
}
function draw() {
	clear();
	background(250);
	for (let box of grid) {
		// box.offset[2] = sin(box.id + (frameCount * 0.05)) * 0.01;
		box.position[2] = lerp(box.position[2], box.target_position[2] + box.offset[2], 0.1);
	}
	renderBoxes();

	if (mouseIsPressed) {
		for (let box of grid) {
			box.target_position[2] += box.offset[2] * 0.1;
		}
	} else if (keyIsDown(SHIFT)) {
		for (let box of grid) {
			box.target_position[2] -= box.offset[2] * 0.1;
		}
	}
}

// function mouseClicked() {
// 	for (let box of grid) {
// 		box.target_position[2] += box.offset[2];
// 	}
// }


// function keyPressed() {
// 	console.log(key);
// 	if (key === "Shift") {
// 		// Save the current canvas with a unique name based on frameCount
// 		for (let box of grid) {
// 			box.target_position[2] -= box.offset[2];
// 		}
// 	}
// 	console.log("saved");
// }

// create a fake 3d environment using shapes with repeated stroke that acts as topographical lines
// 