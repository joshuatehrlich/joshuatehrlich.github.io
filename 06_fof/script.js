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

// Global lookup tables - completely redesigned for performance
let columnData = []; // Array of column metadata: [{element, chars: [{char, lineNum, boldClass}]}]
let lineToColumns = new Map(); // Maps lineNum to array of {columnIndex, charIndex}

function writeLines(textSource, textHolder, maxLineLength) {
	
	// Clear previous data
	columnData = [];
	lineToColumns.clear();
	
	// Initialize column data structures
	for (let i = 0; i < maxLineLength; i++) {
		const columnEl = textHolder.children[i];
		columnData.push({
			element: columnEl,
			chars: [], // Will store {char, lineNum, boldClass}
			originalText: ''
		});
	}
	
	let lineNumber = 0;

	for (let sourceLine of textSource) {
		let line = sourceLine;
		let startIndex = Math.max(0, Math.floor((maxLineLength - line.length)/2));
		
		// Track which columns have characters from this line
		const columnsInLine = [];

		for (let i = startIndex; i < (line.length + startIndex); i++) {
			const char = line[i - startIndex];
			
			// Determine bold class
			let boldClass = '';
			if (lineNumber % 2 === 0) {
				boldClass = 'bolded';
			} else if ((lineNumber + 1) % 4 === 0) {
				boldClass = 'bolded2';
			}
			
			// Store character metadata
			const charIndex = columnData[i].chars.length;
			columnData[i].chars.push({
				char: char + ' ',
				lineNum: lineNumber,
				boldClass: boldClass
			});
			
			columnsInLine.push({ columnIndex: i, charIndex: charIndex });
		}
		
		// Map line number to its column positions
		lineToColumns.set(lineNumber, columnsInLine);
		lineNumber++;
	}
	
	// Add column class and event listeners (text will be built in adjustLines)
	for (let i = 0; i < columnData.length; i++) {
		const col = columnData[i];
		col.element.classList.add('textColumn');
		
		// Add single hover listener per column instead of per letter
		col.element.addEventListener('mouseenter', handleColumnHover, { passive: true });
		col.element.addEventListener('mousemove', handleColumnMove, { passive: true });
		col.element.addEventListener('mouseleave', handleColumnLeave, { passive: true });
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
	// Ensure each column has an odd number of characters for proper centering
	for (let col of columnData) {
		if (col.chars.length % 2 === 0) {
			// Add a blank character at the end
			col.chars.push({
				char: ' ',
				lineNum: -1, // Special marker for padding
				boldClass: ''
			});
		}
	}
}

function centerColumns() {
	// Add vertical padding to center each column
	for (let col of columnData) {
		const blankLinesToAdd = Math.floor((maxHeight - col.chars.length) / 2);
		
		// Store the offset for later use in hover calculations
		col.topOffset = blankLinesToAdd;
		
		// Add blank lines at the top
		const topPadding = new Array(blankLinesToAdd).fill({
			char: ' ',
			lineNum: -1,
			boldClass: ''
		});
		
		// Add blank lines at the bottom  
		const bottomPadding = new Array(maxHeight - col.chars.length - blankLinesToAdd).fill({
			char: ' ',
			lineNum: -1,
			boldClass: ''
		});
		
		// Combine: top padding + actual content + bottom padding
		col.chars = [...topPadding, ...col.chars, ...bottomPadding];
		
		// Build plain text for default state (better performance)
		const plainText = col.chars.map(c => c.char).join('\n');
		col.originalText = plainText;
		col.element.textContent = plainText;
	}
}

// writeText(TEXT_SOURCE, TEXT_HOLDER);

async function main() {

	document.querySelector(".title").textContent = titles[currentSource];

	const TEXT_SEQUENCE = await loadAndParseLines(sources[currentSource]);

	const maxLineLength = createDivs(TEXT_SEQUENCE, TEXT_HOLDER);
	writeLines(TEXT_SEQUENCE, TEXT_HOLDER, maxLineLength);
	adjustLines();

	// Calculate max height from column data
	for (let col of columnData) {
		if (col.chars.length > maxHeight) {
			maxHeight = col.chars.length;
		}
	}
	
	// Now vertically center each column
	centerColumns();
}

main();

// Hover state tracking
let currentHoveredLine = null;
let hoveredColumnIndex = null;
let leaveTimeout = null;
let activeSpans = []; // Track created spans for cleanup

// Handle column hover - detect which line we're over
function handleColumnHover(e) {
	const column = e.currentTarget;
	hoveredColumnIndex = columnData.findIndex(c => c.element === column);
	handleColumnMove(e); // Process immediately
}

// Handle mouse movement within column to detect row
// Throttled to reduce overhead
let lastMoveTime = 0;
function handleColumnMove(e) {
	if (hoveredColumnIndex === null) return;
	
	// Throttle to ~60fps
	const now = performance.now();
	if (now - lastMoveTime < 16) return;
	lastMoveTime = now;
	
	const column = columnData[hoveredColumnIndex];
	const rect = column.element.getBoundingClientRect();
	const relativeY = e.clientY - rect.top;
	
	// Calculate which character/line we're hovering over
	const charHeight = rect.height / column.chars.length;
	const charIndex = Math.floor(relativeY / charHeight);
	
	if (charIndex < 0 || charIndex >= column.chars.length) return;
	
	const hoveredChar = column.chars[charIndex];
	const lineNum = hoveredChar.lineNum;
	
	// Only update if we moved to a different line
	if (lineNum !== currentHoveredLine) {
		clearLeaveTimeout();
		updateHoveredLine(lineNum, hoveredColumnIndex, charIndex);
	}
}

// Handle leaving a column
function handleColumnLeave(e) {
	hoveredColumnIndex = null;
	
	// Delay before clearing to allow moving between columns
	leaveTimeout = setTimeout(() => {
		if (hoveredColumnIndex === null) {
			clearHoveredLine();
		}
	}, 50);
}

function clearLeaveTimeout() {
	if (leaveTimeout) {
		clearTimeout(leaveTimeout);
		leaveTimeout = null;
	}
}

// Update which line is highlighted - THIS IS THE KEY FUNCTION
function updateHoveredLine(lineNum, columnIndex, charIndex) {
	// Clear previous highlighting
	clearHoveredLine();
	
	currentHoveredLine = lineNum;
	
	// Get all columns that have characters in this line
	const columnsInLine = lineToColumns.get(lineNum);
	if (!columnsInLine) return;
	
	// Calculate the height offset for transforms
	const hoveredCol = columnData[columnIndex];
	const lineHeight = charIndex; // charIndex is already in absolute coordinates (includes padding)
	
	// For each column, split out the character at this line into a span
	for (let {columnIndex: colIdx, charIndex: chIdx} of columnsInLine) {
		const col = columnData[colIdx];
		
		// Build HTML with span for highlighted character
		let html = '';
		for (let i = 0; i < col.chars.length; i++) {
			const charData = col.chars[i];
			if (charData.lineNum === lineNum) {
				// This is the highlighted character - wrap in span
				const isHovered = colIdx === columnIndex;
				const classes = ['textLetter', 'readingLine', charData.boldClass];
				if (isHovered) classes.push('readingLetter');
				html += `<span class="${classes.filter(c => c).join(' ')}">${charData.char}</span>`;
			} else {
				// Normal character (including padding)
				if (charData.lineNum === -1) {
					// Padding - no special styling
					html += `<span class="textLetter">${charData.char}</span>`;
				} else {
					const classes = ['textLetter', charData.boldClass];
					html += `<span class="${classes.filter(c => c).join(' ')}">${charData.char}</span>`;
				}
			}
			if (i < col.chars.length - 1) html += '\n';
		}
		
		col.element.innerHTML = html;
		
		// Calculate and apply transform - find the absolute position of this line's character
		const absoluteCharIndex = col.topOffset + chIdx;
		const lineHeightDifference = absoluteCharIndex - lineHeight;
		const translateValue = lineHeightDifference * -15;
		col.element.style.transform = `translate3d(0, ${translateValue}px, 0)`;
	}
}

// Clear all highlighting and revert to plain text
function clearHoveredLine() {
	if (currentHoveredLine === null) return;
	
	currentHoveredLine = null;
	
	// Revert all columns back to plain text for performance
	for (let col of columnData) {
		col.element.textContent = col.originalText;
		col.element.style.transform = `translate3d(0, 0, 0)`;
	}
}

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
	
	// Reset state
	currentHoveredLine = null;
	hoveredColumnIndex = null;
	columnData = [];
	lineToColumns.clear();
	if (leaveTimeout) {
		clearTimeout(leaveTimeout);
		leaveTimeout = null;
	}

	document.querySelector(".title").textContent = titles[currentSource];

	maxHeight = 0;

	main();

	
});