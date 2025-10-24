document.addEventListener("keydown", (e) => {
    if (e.key === " ") {
		generateWord();
    }
});

const alphabet = "abcdefghijklmnopqrstuvwxyz";
const alphabet_weighted = [["a", 10], ["b", 1], ["c", 1], ["d", 1], ["e", 1], ["f", 1], ["g", 1], ["h", 1], ["i", 10], ["j", 1], ["k", 1], ["l", 1], ["m", 1], ["n", 1], ["o", 1], ["p", 1], ["q", 1], ["r", 1], ["s", 1], ["t", 10], ["u", 1], ["v", 1], ["w", 1], ["x", 0.1], ["y", 4], ["z", 0.2]];
const caps = [["UPPERCASE",1], ["lowercase", 1], ["Contextual", 4]];
const mediums = [["Black", 5], ["Red",3], ["Blue", 1]];
const nexts = [[`_`, 70], [",", 10], [".", 10], ["!", 5], ["?", 5]];
const newlines = [[``, 80], ["New Line", 15], ["New Stanza", 15], ["END", 5]];
const textHolder = document.getElementById("textholder");

function generateWord() {
	document.getElementById("tutorial").style.opacity = 0;

	let letter = determineChance(alphabet_weighted);
	let cap = determineChance(caps);
	let medium = determineChance(mediums);
	let next = determineChance(nexts);
	let newline = determineChance(newlines);

	// console.log(letter, cap, medium, next);
	let text = document.createElement("h1");

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


	if (newline === ``) {
		text.textContent = `${medium} : ${letter} ${next} ${newline}`;
	}
	else if (newline === `New Line`) {
		text.textContent = `New Line`;
	}
	else if (newline === `New Stanza`) {
		text.textContent = `New Stanza`;
	}
	else if (newline === `END`) {
		text.textContent = `END`;
	}



	textHolder.appendChild(text);
	textHolder.style.transform = `translateY(-${textHolder.children.length * 3}rem)`;
	return text;
}

	textHolder.style.transform = `translateY(-${textHolder.children.length * 3}rem)`;
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