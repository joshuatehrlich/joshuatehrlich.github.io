let vertices = [];

function setup() {
	createCanvas(windowWidth, windowHeight);
}

let a;
function draw() {
	background(0);
	// background(a);
	// console.log(a);

	beginShape();
	fill(a);
	stroke(255-a, 100);
	for (let i = 0; i < vertices.length; i++) {
		// if (vertices.length > 0 && i > 0){
		// 	fill((i/vertices.length)*255);
		// }
		vertex(vertices[i].x, vertices[i].y);
	}
	endShape(CLOSE);
}

let movecount = 0;
function mouseMoved() {
	a = (((sin(movecount/20)) * 255)+255)/2;
	vertices.push(createVector(mouseX, mouseY));
	movecount++;

	for (let i = 0; i < vertices.length; i++) {

		vertices[i].y += (vertices[i].y - mouseY) * 0.01;
		vertices[i].x += (vertices[i].x - mouseX) * 0.01;
		// console.log(mouseX, mouseY);

		let randomness = 1.0;
		vertices[i].x += random(-randomness, randomness);
		vertices[i].y += random(-randomness, randomness);
	}
	// if (vertices.length > 100) {
	// 	vertices.pop(vertices[0]);
	// }
}


function keyPressed() {
	if (key === "s") {
		// Save the current canvas with a unique name based on frameCount
		saveCanvas('motion_' + frameCount, 'png');
	}
	console.log("saved");
}