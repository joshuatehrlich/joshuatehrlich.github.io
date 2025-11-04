
// CONSTANTS

const BOX_SIZE = [20,20,20];
const BOX_SPACING = [50,25,100];
const BOX_COLOR = [255];
const EXTENSION = 10;

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
			if (abs(x) + abs(y) < position[0]) {
				for (let z = -position[2]; z < position[2]; z++) {
					addBox([x, y, z]);
				}
			}
		}
	}
}

function getDistanceFromBox(target_box, box) {
	let distance = 0;
	distance += Math.abs(target_box.position[0] - box.position[0]);
	distance += Math.abs(target_box.position[1] - box.position[1]);
	distance += Math.abs(target_box.position[2] - box.position[2]);
	return distance;
}


// GEOMETRY CREATION AND RENDERING

function createBox(_box = new Box(), spawner_offset = [0, 0, 0]) {

	let pos = coordToPosition([_box.position[0] + spawner_offset[0], _box.position[1] + spawner_offset[1], _box.position[2] + spawner_offset[2]]);
	let size = BOX_SIZE[0];
	let height = BOX_SIZE[2];

	push();

	let depth = 0.5;
	depth = 0.6-(_box.position[1]+_box.position[0])/70;

	fill(_box.color*(1-depth)+255*depth);

	beginShape();
	// draw top face, box size is WIDTH, HEIGHT, DEPTH (width is left face)
	vertex(pos[0], pos[1]);
	vertex(pos[0] - size, pos[1] - height/2);
	vertex(pos[0], pos[1] - height);
	vertex(pos[0] + size, pos[1] - height/2);
	endShape(CLOSE);

	let impact = 0.1;

	let leftColor = [200*impact+_box.color[0]*(1-impact)];
	fill(leftColor*(1-depth)+255*depth);
	beginShape();
	vertex(pos[0], pos[1]);
	vertex(pos[0] - size, pos[1] - height/2);
	vertex(pos[0] - size, 2000);//pos[1] + height/2 + EXTENSION);
	vertex(pos[0], 2000);//pos[1] + height + EXTENSION);
	endShape(CLOSE);

	let rightColor = [120*impact+_box.color[0]*(1-impact)];
	fill(rightColor*(1-depth)+255*depth);
	beginShape();
	vertex(pos[0], pos[1]);
	vertex(pos[0] + size, pos[1] - height/2);
	vertex(pos[0] + size, 2000);//pos[1] + height/2 + EXTENSION);
	vertex(pos[0], 2000);//pos[1] + height + EXTENSION);
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

let target_box = null;
let brush_size = 10;
async function renderBoxes() {
	for (let box of grid) {
		mouseOver = false;
		let pos = coordToPosition(box.target_position);

		if (box === grid[0]) {
			// console.log(box.target_position);
		}

		let d = dist(mouseX, mouseY, pos[0], pos[1]);
		if (d<= 10) {
			target_box = box;
			box.color = [0, 0, 0];
		}

		if (!target_box) {
			createBox(box);
			continue;
		}
		
		let _color = sin(box.position[2]/2+2)*127 + 127;
		box.color = [_color];

		let _dist = getDistanceFromBox(target_box, box);

		if (_dist <= brush_size) {
			// box.color = (_color -((10-_dist)/10)*255);
			stroke((((_dist)/brush_size)*box.color[0]+255)/2);
			// box.color = box.color[0] - ((10-_dist)/10)*255;
			
			box.offset[2] = ((brush_size-_dist)*0.1);
		}
		else {
			noStroke();
			box.offset[2] = 0;
		}
		// if (d <= 100) {
		// 	box.offset[2] = (100-d)*0.02;
		// } else { box.offset[2] = 0; }
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

let GRID_SIZE = 20;
function setup() {
	createCanvas(windowWidth, windowHeight);
	clear();
	background(0);
	noStroke();

	addBoxGrid([GRID_SIZE,GRID_SIZE,0.5]);
	removeBox([0,0,0]);

	// addBox([1,1,1]);
	// addBox([0,0,0]);
	// addBox([-1,0,0]);
	// renderBoxes();
	sortBoxes();
	cullBoxes();
}
function draw() {
	clear();
	background(255);
	for (let box of grid) {
		// box.offset[2] = sin(box.id + (frameCount * 0.05)) * 0.01;
		box.position[2] = lerp(box.position[2], box.target_position[2] + box.offset[2], 0.1);
	}
	renderBoxes();

	if (keyIsDown(32)) {
		for (let box of grid) {
			box.target_position[2] += box.offset[2] * 0.2;
		}
	} else if (keyIsDown(SHIFT)) {
		for (let box of grid) {
			box.target_position[2] -= box.offset[2] * 0.2;
		}
	} else if (keyIsDown(17)) {
		for (let box of grid) {
			box.target_position[2] = lerp(box.target_position[2], target_box.target_position[2], box.offset[2]);
		}
	}
}

function keyPressed() {
	if (key === "1") {
		brush_size = 2.5;
	} else if (key === "2") {
		brush_size = 5;
	} else if (key === "3") {
		brush_size = 10;
	} else if (key === "4") {
		brush_size = 20;
	} else if (key === "5") {
		brush_size = 30;
	} else if (key === "6") {
		brush_size = 40;
	} else if (key === "7") {
		brush_size = 50;
	} else if (key === "8") {
		brush_size = 100;
	} else if (key === "9") {
		brush_size = 200;
	} else if (key === "0") {
		brush_size = 300;
	} else if (key === "g") {
		GRID_SIZE += 1;
		grid = [];
		setup();
	} else if (key === "G") {
		GRID_SIZE -= 1;
		grid = [];
		setup();
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