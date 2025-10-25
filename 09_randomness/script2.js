
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

const caps = [["UPPERCASE",1], ["lowercase", 8], ["Contextual", 0]];
const mediums = [["Black", 10], ["Red",0]];
const nexts = [[``, 70], [",", 10], [".", 10], ["!", 5], ["?", 5]];
const newlines = [[``, 80], ["New Line", 15], ["New Stanza", 15], ["END", 5]];
const textHolder = document.getElementById("textholder");
const weights = [["italics", 1], ["bold", 1], ["normal", 8]];
let ended = false;
let just_entered = false;
var wordNumber = 0;

var typingAllCaps = false;
var typingAllLowercase = false;

var letters_typed = 0;

function _ready() {
	var text = document.createElement("h1");
	text.id = "currentLine";
	textHolder.appendChild(text);
	text.textContent = ` `;

	var span = document.createElement("span");
	span.id = "currentWord";
	text.appendChild(span);
	span.textContent = ` `;
}

_ready();
let newsentence = false;
let words_in_line = 0;
function generateWord() {
	// if the poem has ended, don't generate any more words

	// helpful to initialize within the whole function
	var text = document.getElementById("currentLine");
	var span = document.getElementById("currentWord");
	letters_typed = 0;

	// first determine choices and redefine elements based on them

	let next = determineChance(nexts);
	let newline = determineChance(newlines);
	let letter = determineChance(alphabet_weighted);
	let cap = determineChance(caps);
	let medium = determineChance(mediums);
	let weight = determineChance(weights);
	if (cap === "UPPERCASE") {
		// console.log("UPPERCASE");
		letter = letter.toUpperCase();
		typingAllCaps = true;
		typingAllLowercase = false;
		console.log("UPPERCASE");
		// text.style.textTransform = "uppercase";
	} else if (cap === "lowercase") {
		// console.log("lowercase");
		letter = letter.toLowerCase();
		typingAllLowercase = true;
		typingAllCaps = false;
		// text.style.textTransform = "lowercase";
	} else if (cap === "Contextual") {
		// console.log("Contextual");
		letter = letter.toUpperCase(); // eventually give user ability to choose
		typingAllCaps = false;
		typingAllLowercase = false;
	}

	///////////////// now dealing with DOM /////////////////

	if (wordNumber > 0) {

		if (newline == `New Line`) {
			next = determineChance([[",", 10], [".", 10], ["!", 5], ["?", 5], [":", 5]]);
		}
		else if (newline == `New Stanza`) {
			next = determineChance([[`.`, 30], [`!`, 5], [`?`, 5], ["...", 5], ["?!", 2]]);
		}
		else if (newline === `END`) {
			next = determineChance([[`,`, 10], [`.`, 100], [`!`, 5], [`?`, 5], ["...", 5], ["?!", 2]]);
		}
		span.textContent += `${next}`;

		if (next == `.` || next == `!` || next == `?` || next == `...` || next == `?!` || next == `:`) {
			newsentence = true;
		}

		span = document.createElement("span");
		text.appendChild(span);
		document.getElementById("currentWord").removeAttribute("id");
		span.id = "currentWord";

		span.textContent += ` `;
	}

	if (newline !== `` || wordNumber === 0) {

		words_in_line = 0;
		
		// console.log(letter, cap, medium, next);
		text = document.createElement("h1");
		document.getElementById("currentLine").removeAttribute("id");

		text.id = "currentLine";
		textHolder.appendChild(text);

		if (newline !== `New Line`) {

			text.textContent = ` `;

			console.log("new stanza");

			text = document.createElement("h1");
			document.getElementById("currentLine").removeAttribute("id");
			text.id = "currentLine";
			text.classList.add("stanza");
			textHolder.appendChild(text);

			if (newline === `END`) {
				ended = true;
				text.textContent = `END`;
				document.body.classList.add("ended");
				for (h1 of textHolder.children) {
					for (span of h1.children) {
						if (span.style.backgroundColor === "rgba(255, 0, 0, 0.14)") {
							span.style.backgroundColor = "transparent";
							span.style.color = "rgb(255, 161, 155)";
						}
					}
				}
				// generateTitleWord();
				return;
			}
		}
	}
	else {
		just_entered = false;
	}

	span = document.createElement("span");
	text.appendChild(span);
	document.getElementById("currentWord").removeAttribute("id");
	span.id = "currentWord";

	if (words_in_line < 1 || newsentence === true) {
		letter = letter.toUpperCase();
		console.log("first word of line");
		newsentence = false;
	}
	span.textContent += `${letter}`;

	words_in_line++;

	if (weight === "italics") {
		span.style.fontStyle = "italic";
	} else if (weight === "bold") {
		span.style.fontWeight = "900";
	} else if (weight === "normal") {
		span.style.fontWeight = "normal";
	}

	if (medium === "Red") {
		span.style.backgroundColor = "rgba(255, 0, 0, 0.14)";
	}
	// else if (medium === "Blue") {
	// 	span.style.backgroundColor = "rgba(87, 87, 255, 0.41)";
	// }

	wordNumber++;

	document.getElementById("tutorial").style.opacity = 0;
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

function updateCursorPosition() {
	const cursor = document.getElementById("cursor");
	const lastspan = document.getElementById("currentLine").lastElementChild;

	if (lastspan) {
		cursor.style.left = `${lastspan.offsetLeft + lastspan.offsetWidth}px`;
		cursor.style.top = `${lastspan.offsetTop}px`;
	}
	else {
		cursor.style.left = `${document.getElementById("currentLine").offsetLeft}px`;
		cursor.style.top = `${document.getElementById("currentLine").offsetTop}px`;
	}
	requestAnimationFrame(updateCursorPosition);
}
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('ontouchstart' in window) ||
           (window.innerWidth <= 768);
}
document.addEventListener("keydown", (e) => {
	// if (ended) return;
	if (ended) return;

	e.preventDefault();
	if (!isMobileDevice()) {
		// console.log("not mobile");

	    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    	});

	}

    if (
		e.key === " " && wordNumber > 0 &&
		(currentWord.textContent.length > 1 || (currentWord.textContent.toLowerCase() == "i" || currentWord.textContent.toLowerCase() == "a"))) {
		generateWord();
    }
	else if (e.key === " " && wordNumber === 0) {
		generateWord();
		document.getElementById("cursor").style.display = "block";
	}
	
	if (wordNumber < 1) return;

	const letterss = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	if (letterss.includes(e.key) && e.key != " ") {

		let key = e.key;
		if (typingAllCaps) {
			key = key.toUpperCase();
		} else if (typingAllLowercase) {
			key = key.toLowerCase();
		}
		document.getElementById("currentWord").textContent += key;
		letters_typed++;
	}
	else if (e.key === "Backspace") {
		if (letters_typed > 0) {
			document.getElementById("currentWord").textContent = document.getElementById("currentWord").textContent.slice(0, -1);
			letters_typed--;
		}
	}
});

// update cursor position every 10ms
requestAnimationFrame(updateCursorPosition);

// const titleBox = document.getElementById("title-box");
// let titleInitialised = false;
// let titleWordCount = 0;
// let titleEndCount;
// function generateTitleWord() {
// 	if (titleWordCount > 0) currentWord.textContent += ` `;
// 	letters_typed = 0;

// 	if (!titleInitialised) {
// 		titleEndCount = Math.floor(Math.random() * 10) + 1;
// 		titleInitialised = true;
// 		titleLine = document.createElement("h1");
// 		document.getElementById("currentLine").removeAttribute("id");
// 		titleLine.id = "currentLine";
// 		titleBox.appendChild(titleLine);
// 	}

// 	titleSpan = document.createElement("span");
// 	document.getElementById("currentWord").removeAttribute("id");
// 	titleSpan.id = "currentWord";
// 	titleLine.appendChild(titleSpan);

// 	let letter = determineChance(alphabet_weighted);
// 	let cap = determineChance(caps);

// 	if (cap === "UPPERCASE") {
// 		letter = letter.toUpperCase();
// 		typingAllCaps = true;
// 		typingAllLowercase = false;
// 	} else if (cap === "lowercase") {
// 		letter = letter.toLowerCase();
// 		typingAllLowercase = true;
// 		typingAllCaps = false;
// 	}
// 	titleSpan.textContent += letter;
// 	titleWordCount++;
// 	if (titleWordCount >= titleEndCount) {
// 		titled = true;
// 	}
// }

// let signing_initialised = false;
// let signatureWords = 0;
// function signPoem() {
// 	typingAllCaps = false;
// 	typingAllLowercase = false;
// 	let signatureSpan = document.createElement("span");
// 	if (signatureWords > 0) signatureSpan.textContent += ``;
// 	if (!signing_initialised) {
// 		wordNumber = 0;
// 		signatureLine = document.createElement("h1");
// 		document.getElementById("currentLine").removeAttribute("id");
// 		signatureLine.id = "currentLine";
// 		titleBox.appendChild(signatureLine);
// 	}
// 	document.getElementById("currentWord").removeAttribute("id");
// 	signatureSpan.id = "currentWord";
// 	signatureLine.appendChild(signatureSpan);
// 	if (!signing_initialised) {
// 		signatureSpan.textContent = "By ";
// 	}
// 	signatureWords++;
// 	wordNumber++;
// }

// Focus the hidden input to open mobile keyboard
function openMobileKeyboard() {
    const mobileInput = document.getElementById('mobileKeyboard');
    if (mobileInput) {
        mobileInput.focus();
    }
}

// Call it when you want to open the keyboard
// For example, when the page loads or when user taps something
document.addEventListener('DOMContentLoaded', openMobileKeyboard);

// Automatically focus when page loads
window.addEventListener('load', function() {
    const mobileInput = document.getElementById('mobileKeyboard');
    mobileInput.focus();
});

// Open keyboard when user taps anywhere
document.addEventListener('touchstart', function() {
    const mobileInput = document.getElementById('mobileKeyboard');
    mobileInput.focus();
});

// Or on click
document.addEventListener('click', function() {
    const mobileInput = document.getElementById('mobileKeyboard');
    mobileInput.focus();
});