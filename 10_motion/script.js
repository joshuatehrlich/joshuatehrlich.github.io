let vertices = [];

function setup() {
	createCanvas(windowWidth, windowHeight);
	background(0);
}

function draw() {
	// let a = (((sin(frameCount/200)) * 255)+255)/2;
	// background(a);
	// console.log(a);

	beginShape();
	fill(255);
	stroke(0, 100);
	for (let i = 0; i < vertices.length; i++) {
		vertex(vertices[i].x, vertices[i].y);
	}
	endShape(CLOSE);
}

// function mousePressed() {
// 	vertices.push(createVector(mouseX, mouseY));
// }

function mouseMoved() {
	vertices.push(createVector(mouseX, mouseY));

	for (let i = 0; i < vertices.length; i++) {

		vertices[i].y += (vertices[i].y - mouseY) * 0.01;
		// console.log(mouseX, mouseY);

		vertices[i].x += random(-1, 1);
		vertices[i].y += random(-1, 1);
	}
}

function keyPressed() {
	circle1.hide();
}