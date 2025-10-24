document.addEventListener("keydown", (e) => {
    if (e.key === " ") {
		generateWord();
    }
});

const alphabet_weighted = [
	["a", 11.7],
	["b", 4.4],
	["c", 5.2],
	["d", 3.2],
	["e", 2.8],
	["f", 4],
	["g", 1.6],
	["h", 4.2],
	["i", 7.3],
	["j", 0.51],
	["k", 0.86],
	["l", 2.4],
	["m", 3.8],
	["n", 2.3],
	["o", 7.6],
	["p", 4.3],
	["q", 0.22],
	["r", 2.8],
	["s", 6.7],
	["t", 16],
	["u", 1.2],
	["v", 0.82],
	["w", 5.5],
	["x", 0.045],
	["y", 0.76],
	["z", 0.045]
];

const caps = [["UPPERCASE",1], ["lowercase", 1], ["Contextual", 4]];
const mediums = [["Black", 5], ["Red",3], ["Blue", 1]];
const nexts = [[``, 70], [",", 10], [".", 10], ["!", 5], ["?", 5]];
const newlines = [[``, 80], ["New Line", 15], ["New Stanza", 15], ["END", 5]];
const textHolder = document.getElementById("textholder");
let ended = false;
let just_entered = false;
var lineNumber = 0;

var typingAllCaps = false;
var typingAllLowercase = false;

function generateWord() {
	if (ended) return;

	document.getElementById("tutorial").style.opacity = 0;

	let letter = determineChance(alphabet_weighted);
	let cap = determineChance(caps);
	let medium = determineChance(mediums);
	let next = determineChance(nexts);
	let newline = determineChance(newlines);

	// console.log(letter, cap, medium, next);
	let text = document.createElement("h1");
	if (lineNumber > 0) {
		document.getElementById("currentLine").removeAttribute("id");
	}
	text.id = "currentLine";
	lineNumber++;

	if (cap === "UPPERCASE") {
		console.log("UPPERCASE");
		letter = letter.toUpperCase();
		// text.style.textTransform = "uppercase";
	} else if (cap === "lowercase") {
		console.log("lowercase");
		letter = letter.toLowerCase();
		// text.style.textTransform = "lowercase";
	} else if (cap === "Contextual") {
		console.log("Contextual");
		letter = letter.toUpperCase() + letter.toLowerCase();
	}

	if (medium === "Black") {
		text.style.color = "black";
	} else if (medium === "Red") {
		text.style.color = "red";
	} else if (medium === "Blue") {
		text.style.color = "blue";
	}


	if (newline === `` || just_entered) {
		text.textContent = `${letter}-${next}`;
		just_entered = false;
	}
	else if (newline === `New Line`) {
		text.textContent = `New Line`;
		just_entered = true
	}
	else if (newline === `New Stanza`) {
		text.textContent = `New Stanza`;
		just_entered = true
	}
	else if (newline === `END`) {
		text.textContent = `END`;
		ended = true;
		document.body.classList.add("ended");
		for (child of textHolder.children) {
			child.style.color = "white";
		}
		text.style.color = "white";
	}



	textHolder.appendChild(text);
	textHolder.style.transform = `translateY(-${textHolder.children.length * 3}rem)`;
	return text;
}

function determineChance(array) {
	let total_weight = array.reduce((acc, option) => acc + option[1], 0);
	let random = Math.random() * total_weight;

	let cumulative_weight = 0;

	for (let option of array) {
		cumulative_weight += option[1];
		if (random <= cumulative_weight) {
			return option[0];
		}
	}

}

document.addEventListener("keydown", (e) => {
	if (e.key.length === 1) {
		document.getElementById("currentLine").textContent += e.key;
	}
});