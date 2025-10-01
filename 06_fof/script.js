const TEXT_HOLDER = document.querySelector("#text-holder");

const TEXT_SOURCE = `
I have a theory about how the world works
`;

const sources = [
	"source2.md",
	"source5.md",
	"source3.md",
	"source4.md",
	"source.md"
]
const titles = [
	"rain by jorge luis borges",
	"oh the places you'll go by dr. seuss",
	"excerpt from the little prince by antoine de saint-exupéry",
	"setInterval() docs",
	"ramblings used for testing..."
]
let currentSource = 0;

let maxHeight = 0;

async function loadAndParseLines(source) {
    const response = await fetch(source);
    const rawText = await response.text();
    const normalizedText = rawText.replace(/\r\n|\r/g, "\n");
    const lines = normalizedText.split(/(?<=[.!?])|\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .flatMap(line => {
            // If line is longer than 120 chars, split it at spaces
            if (line.length <= 420) return [line];
            
            const chunks = [];
            let remaining = line;
            
            while (remaining.length > 120) {
                // Find the last space before or at position 120
                let splitPos = remaining.lastIndexOf(' ', 120);
                
                // If no space found, just split at 120
                if (splitPos === -1) splitPos = 120;
                
                chunks.push(remaining.slice(0, splitPos).trim());
                remaining = remaining.slice(splitPos).trim();
            }
            
            // Add the remaining part
            if (remaining.length > 0) {
                chunks.push(remaining);
            }
            
            return chunks;
        });
    // const lines = normalizedText.split("\n");
    // console.log(lines);
    return lines;
}

// function writeText(textSource, textHolder) {
// 	for (let ch of textSource) {

// 		const letter = document.createElement("div");
// 		letter.className = "textLetter"

// 		// textHolder.appendChild(letter);
// 		letter.textContent = ch;
// 		textHolder.appendChild(letter);
		
// 	}
// }

function createDivs(textSource, textHolder) {
	let maxLineLength = 0;

	for (let line of textSource) {
		if (line.length > maxLineLength) {
			maxLineLength = line.length;
		}
	}

	maxLineLength += 2;

	for (let i = 0; i < maxLineLength; i++) {
		const line = document.createElement("div");
		line.className = "textLine";
		textHolder.appendChild(line);
	}
	return maxLineLength;
}

function writeLines(textSource, textHolder, maxLineLength) {
	
	let lineNumber = 0;

	for (let sourceLine of textSource) {

		let line = sourceLine;

		let startIndex = Math.max(0, Math.floor((maxLineLength - line.length)/2)); // round down


		for (let i = startIndex; i < (line.length+startIndex); i++) {

			const char = line[i-startIndex];
			const letter = document.createElement("div");
			letter.className = "textLetter";
			letter.classList.add(`line${lineNumber}`);

			if (lineNumber % 2 === 0) {
				letter.classList.add("bolded");
			} else if ((lineNumber+1) % 4 === 0) {
				letter.classList.add("bolded2");
			}

			letter.textContent = char + " ";
			textHolder.children[i].appendChild(letter);

		}

		lineNumber++;
	}

	// let maxHeight = 0;
	// for (let line of textHolder.children) {
	// 	if (line.children.length > maxHeight) {
	// 		maxHeight = line.children.length;
	// 	}
	// }

	// for (let line of textHolder.children) {

	// 	let currentLineHeight = textHolder.children.length;
	// 	let blankHeightToTop = (currentLineHeight - maxHeight)/2;

	// 	let lineCounter = blankHeightToTop;

	// 	for (let letter of line.children) {
	// 		letter.classList.add(`line${lineCounter}`);
	// 		lineCounter++;
	// 	}
	// }

}

function adjustLines() {
	for (let line of TEXT_HOLDER.children) {
		if (line.children.length % 2 === 0) {
			const newLine = document.createElement("div");	
			newLine.className = "textLine";
			newLine.textContent = " ";
			line.appendChild(newLine);
		}
	}
}

// writeText(TEXT_SOURCE, TEXT_HOLDER);

async function main() {

	document.querySelector(".title").textContent = titles[currentSource];

	const TEXT_SEQUENCE = await loadAndParseLines(sources[currentSource]);

	const maxLineLength = createDivs(TEXT_SEQUENCE, TEXT_HOLDER);
	writeLines(TEXT_SEQUENCE, TEXT_HOLDER, maxLineLength);
	adjustLines();

	for (let line of TEXT_HOLDER.children) {
		if (line.children.length > maxHeight) {
			maxHeight = line.children.length;
		}
	}
}

main();

document.addEventListener("mousemove", (e) => {

	let hoveredLetter = document.querySelector(".textLetter:hover");
	if (!hoveredLetter) {
		for (let line of TEXT_HOLDER.children) {
			line.style.transform = `translateY(0px)`;
			for (let letter of line.children) {
				letter.classList.remove("readingLine");
				letter.classList.remove("readingLetter");
			}
		}
		return;
	}

	// grab current vertical trasnform of hovered line
	let hoveredLetterOffset = 0;
	let hoveredLine = hoveredLetter.parentElement;
	const style = window.getComputedStyle(hoveredLine);
	const transform = style.transform;
	if (transform !== 'none') {
	  const matrix = transform.match(/matrix.*\((.+)\)/)[1].split(', ');
	  const translateY = parseFloat(matrix[5]); // Y translation is at index 5
	  hoveredLetterOffset = translateY;
	}

	let hoveredClass = Array.from(hoveredLetter.classList)[1];

	for (let line of TEXT_HOLDER.children) {
		for (let letter of line.children) {
			if (letter.classList.contains(hoveredClass)) {
				letter.classList.add("readingLine");

				if (letter.matches(":hover")) {
					letter.classList.add("readingLetter");
				} else {
					letter.classList.remove("readingLetter");
				}
			} else {
				letter.classList.remove("readingLine");
				letter.classList.remove("readingLetter");
			}
		}
	}

	let lineHeightRelative = Array.from(hoveredLetter.parentElement.children).indexOf(hoveredLetter);
	let lineVerticalLength = Array.from(hoveredLetter.parentElement.children).length;
	let lineHeight = lineHeightRelative + (maxHeight - lineVerticalLength)/2;
	// console.log(lineHeight);

	for (let line of TEXT_HOLDER.children) {
		let importantLetter = Array.from(line.children).find(letter => letter.classList.contains(hoveredClass));
		if (!importantLetter) continue;

		let localHeighRelative = Array.from(line.children).indexOf(importantLetter);
		let localVerticalLength = Array.from(line.children).length;
		let localLineHeight = localHeighRelative + (maxHeight - localVerticalLength)/2;
		let lineHeightDifference = localLineHeight - lineHeight;

		line.style.transform = `translateY(${lineHeightDifference * -15 + hoveredLetterOffset}px)`;
		// line.style.transform = `translateY(${lineHeightDifference * -15}px)`;
		// trying not to overdo the offset becacuse then the player can move the creature off the page
	}

});

function highlightLine(lineNumber) {
	for (let line of TEXT_HOLDER.children) {
		for (let letter of line.children) {
			if (letter.classList.contains(`line${lineNumber}`)) {
				letter.classList.add("selectedLine");
				console.log("added");
			} else if (letter.classList.contains(`line${lineNumber+2}`) || letter.classList.contains(`line${lineNumber-2}`)) {
				letter.classList.remove("selectedLine");
				letter.classList.add("selectedLine2");
			} else {
				letter.classList.remove("selectedLine");
				letter.classList.remove("selectedLine2");
			}
		}
	}
}

document.addEventListener("click", () => {
	if (!document.querySelector(".next").matches(":hover")) {
		return;
	}

	currentSource++;
	if (currentSource >= sources.length) {
		currentSource = 0;
	}

	TEXT_HOLDER.innerHTML = "";

	document.querySelector(".title").textContent = titles[currentSource];

	let maxHeight = 0;

	main();

	
});