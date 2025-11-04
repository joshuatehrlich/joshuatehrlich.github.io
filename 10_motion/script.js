
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
		this.original_position = position.slice();
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
let _stroke = 190;
function createBox(_box = new Box(), spawner_offset = [0, 0, 0]) {

	let pos = coordToPosition([_box.position[0] + spawner_offset[0], _box.position[1] + spawner_offset[1], _box.position[2] + spawner_offset[2]]);
	let opos = coordToPosition(_box.original_position);
	let size = BOX_SIZE[0];
	let height = BOX_SIZE[2];

	push();

	let depth = 0.5;
	depth = 0.6-(_box.position[1]+_box.position[0])/50;
	let impact = 0.1;
	let down_blocker = GRID_SIZE*(BOX_SIZE[0]*.5)+650;

	fill(_box.color*(1-depth)+255*depth);

	depth -= 0.3;

	stroke(_stroke*(1-depth)+255*depth);


	beginShape();
	
	let verts = [
		[pos[0], pos[1]],
		[pos[0] - size, pos[1] - height/2],
		[pos[0], pos[1] - height],
		[pos[0] + size, pos[1] - height/2]
	]
	for (let vert of verts) {
		if (vert[1] > down_blocker) {
			vert[1] = down_blocker;
		}
		vertex(vert[0], vert[1]);
	}
	endShape(CLOSE);


	let leftColor = [200*impact+_box.color[0]*(1-impact)];
	fill(leftColor*(1-depth)+255*depth);
	beginShape();

	verts = [
		[pos[0], pos[1]],
		[pos[0] - size, pos[1] - height/2],
		[pos[0] - size, down_blocker],
		[pos[0], down_blocker]
	]
	for (let vert of verts) {
		if (vert[1] > down_blocker) {
			vert[1] = down_blocker;
		}
		vertex(vert[0], vert[1]);
	}
	endShape(CLOSE);
	


	let rightColor = [120*impact+_box.color[0]*(1-impact)];
	fill(rightColor*(1-depth)+255*depth);
	beginShape();

	verts = [
		[pos[0], pos[1]],
		[pos[0] + size, pos[1] - height/2],
		[pos[0] + size, down_blocker],
		[pos[0], down_blocker]
	]
	for (let vert of verts) {
		if (vert[1] > down_blocker) {
			vert[1] = down_blocker;
		}
		vertex(vert[0], vert[1]);
	}
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
	let ypos = window.innerHeight / 1.7;

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
			let closeness = (brush_size-_dist)/brush_size;
			_stroke = closeness*0+(box.color[0]-80)*(1-closeness);
			// box.color = box.color[0] - ((10-_dist)/10)*255;
			
			box.offset[2] = ((brush_size-_dist)*0.1);
		}
		else {
			_stroke = box.color[0]-80;
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
	background(255);
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
		document.documentElement.style.setProperty("--brush-size", "10.5%");
	} else if (key === "2") {
		brush_size = 5;
		document.documentElement.style.setProperty("--brush-size", "20%");
	} else if (key === "3") {
		brush_size = 7;
		document.documentElement.style.setProperty("--brush-size", "30%");
	} else if (key === "4") {
		brush_size = 10;
		document.documentElement.style.setProperty("--brush-size", "40%");
	} else if (key === "5") {
		brush_size = 20;
		document.documentElement.style.setProperty("--brush-size", "50%");
	} else if (key === "6") {
		brush_size = 30;
		document.documentElement.style.setProperty("--brush-size", "60%");
	} else if (key === "7") {
		brush_size = 40;
		document.documentElement.style.setProperty("--brush-size", "70%");
	} else if (key === "8") {
		brush_size = 60;
		document.documentElement.style.setProperty("--brush-size", "80%");
	} else if (key === "9") {
		brush_size = 80;
		document.documentElement.style.setProperty("--brush-size", "90%");
	} else if (key === "0") {
		brush_size = 150;
		document.documentElement.style.setProperty("--brush-size", "100%");
	} else if (key.toLowerCase() === "m") {
		GRID_SIZE += 1;
		grid = [];
		setup();
	} else if (key.toLowerCase() === "n") {
		GRID_SIZE -= 1;
		grid = [];
		setup();
	}
}

let help_visible = true;
document.addEventListener("mousedown", function(event) {
	if (help_visible) {
		toggleHelp();
	}
});
document.addEventListener("keydown", function(event) {
	if (event.key === "h" || help_visible) {
		toggleHelp();
	}
});
function toggleHelp() {
	help_visible = !help_visible;
	if (help_visible) {
		document.body.classList.remove("help-hidden");
	} else {
		document.body.classList.add("help-hidden");
	}
}

// This code is mostly fine for attaching a click event to the help button that toggles help.
// However, a possible issue is if the element with class `.help-button` does not exist (e.g., the DOM hasn't finished loading yet),
// help_button would be `null`, leading to an error when calling `addEventListener` on it.
// A safer version would ensure the element is present before attaching the event:


document.addEventListener("DOMContentLoaded", function() {
	document.querySelector("h1.help-button").addEventListener("click", function() {
		toggleHelp();
	});
	showTutorial(document.querySelector(".controls"));
});

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
async function showTutorial(tutorial) {
	let tutorialText = tutorial.innerHTML;
	tutorial.textContent = "";
	let inCode = false;
	let codeSpan = "";
	let addedClass = "normal";

	for (let i = 0; i < tutorialText.length; i++) {

		if (tutorialText[i] === "<") {
			inCode = true;
		}
		if (inCode) {
			codeSpan += tutorialText[i];
			if (tutorialText[i] === ">") {
				inCode = false;
				let span = document.createElement("span");
				span.innerHTML = codeSpan;
				tutorial.appendChild(span);
				span.style.opacity = 0;
				span.style.transition = "opacity 0.2s";
				codeSpan = "";
				continue;
			}
			continue;
		}

		let letter = tutorialText[i];
		let span = document.createElement("span");
		span.textContent = letter;
		span.classList.add(addedClass);
		tutorial.appendChild(span);
		span.style.opacity = 0;
		span.style.transition = "opacity 0.2s";
	}

	for (let span of tutorial.children) {
		span.style.opacity = 1;
		await new Promise(resolve => setTimeout(resolve, 10));
	}
}