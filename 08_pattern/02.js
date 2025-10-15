let cover = document.querySelector(".cover");
const ROWS = Math.round(window.innerWidth/100)*2;
const COLS = Math.round(window.innerHeight/100)*2;


let map = [];
for (let i = 0; i < ROWS; i++) {
    map[i] = new Array(COLS).fill(0);
}

for (let i = 0; i < ROWS; i++) {
	let row = document.createElement("div");
	row.classList.add("row");
	cover.appendChild(row);
	for (let j = 0; j < COLS; j++) {
		let num = Math.floor(Math.random()*50);
		let cell = document.createElement("div");
		cell.classList.add("cell");
		let cellText = document.createElement("h4");
		cell.appendChild(cellText);
		cellText.textContent = num;
		// cellText.style.color = "white";
		formatCell(cell);
		row.appendChild(cell);
		// cell.style.height = window.innerHeight/ROWS*3 + "px";
		// cell.style.width = window.innerHeight/COLS + "px";
		map[i][j] = cell;
	}
}
let going = true;
while (going) {
	await new Promise(resolve => setTimeout(resolve, 0.01));
	for (let i = 0; i < 1; i++) {
		randomTheif();
	}
}

async function randomTheif() {
	let _i = 0;
	let _j = 0;
	let foundValid = false;
	while (!foundValid) {
		_i = Math.floor(Math.random()*ROWS);
		_j = Math.floor(Math.random()*COLS);
		if (map[_i][_j].children[0].textContent > 0 && map[_i][_j].children[0].textContent < 100) {
			foundValid = true;
			break;
		} else {
			map[_i][_j].classList.remove("thief");
		}
	}
	
	if (_j>0) {
		compare_neighbors(map[_i][_j], map[_i][_j-1]);
	}
	else if (_i>0) {
		compare_neighbors(map[_i][_j], map[_i-1][_j]);
	}
	else if (_j<COLS-1) {
		compare_neighbors(map[_i][_j], map[_i][_j+1]);
	}
	else if (_i<ROWS-1) {
		compare_neighbors(map[_i][_j], map[_i+1][_j]);
	}
}


// check if spacebar is pressed
window.addEventListener("keydown", (e) => {
	if (e.key === " ") {
		going = false;
		console.log("stopping");
	}
});

// async function compare_neighbors(a, b) {

// 	if (a.children[0].textContent > b.children[0].textContent && a.children[0].textContent < 100 && b.children[0].textContent > 0) {
// 		a.children[0].textContent -= 1;
// 		b.children[0].textContent += 1;
// 		a.classList.add("thief");
// 		a.classList.add("stole");
// 		b.classList.remove("thief");
// 	}
// 	else if (b.children[0].textContent > a.children[0].textContent && b.children[0].textContent < 100 && a.children[0].textContent > 0) {
// 		a.children[0].textContent += 1;
// 		b.children[0].textContent -= 1;
// 		b.classList.add("thief");
// 		b.classList.add("stole");
// 		a.classList.remove("thief");
// 	}
// 	else {
// 		a.classList.remove("thief");
// 		b.classList.remove("thief");
// 	}
// 	formatCell(a);
// 	formatCell(b);
// 	await new Promise(resolve => setTimeout(resolve, 100));
// 	a.classList.remove("stole");
// 	b.classList.remove("stole");
// }

async function compare_neighbors(a, b) {
    // Convert to numbers first
    const aValue = parseInt(a.children[0].textContent) || 0;
    const bValue = parseInt(b.children[0].textContent) || 0;
    
    // Only transfer if there's a meaningful difference and bounds allow it
    if (aValue > bValue && aValue < 100 && bValue > 0) {
        a.children[0].textContent = aValue + 20;
        b.children[0].textContent = bValue - 20;
        a.classList.add("thief");
        a.classList.add("stole");
        b.classList.remove("thief");
    }
    else if (bValue > aValue && bValue < 100 && aValue > 0) {
        a.children[0].textContent = aValue - 20;
        b.children[0].textContent = bValue + 20;
        b.classList.add("thief");
        b.classList.add("stole");
        a.classList.remove("thief");
    }
    else {
        a.classList.remove("thief");
        b.classList.remove("thief");
    }
    
    formatCell(a);
    formatCell(b);
    await new Promise(resolve => setTimeout(resolve, 100));
    a.classList.remove("stole");
    b.classList.remove("stole");
}

function formatCell(cell) {
	cell.style.backgroundColor = `rgb(0, 0, 0, ${cell.children[0].textContent/100})`;
}