function Vec2(x, y) {
	this.x = x;
	this.y = y;
}

function Location(tag, description, interior = "it's too dark to see") {
	this.tag = tag;
	this.description = description;
	this.interior = interior;
	Location.all.push(this);
}

Location.all = [];

const well = new Location("w", "a dark, damp well",
	"before you can think, you reach out with<br>your hands and drink, greedily.<br><br>the water hurts your throat<br>you feel dizzy"
);
const hole = new Location("h", "a hole in the ground",
	"what appeared to be empty is<br>in fact, emptier still.<br><br>you take a step, and nearly<br>spill over the edge. dirt crusts<br>your nails after the close call."
);
const coal_mine = new Location("c", "an abandoned coal mine",
	`
XXXXXXXX||                       <br>
                XXXXX  XXX XX||                      <br>
              XX^^^  XXX XXXXX|||                    <br>
              X^^^^          XXX|||                  <br>
            |X^^^^^======     XXX||                  <br>
            |X^^====XXXX=XXXX  XX||                  <br>
            ||XX  XXXXXX== ==XX  ||^                 <br>
             ||XXXXXXXXXXXXX===X X  ^^               <br>
              XX=XXXXXXXXXXXX =X X^^^  X^^^          <br>
               X====X XXXXXXXXXX^^^ =X^^^XX          <br>
        X^^     XX==XXXXXXXXXXX^^^^==XXXXX^  ^XX||   <br>
XX^^    ||^^     XXXXXXXXX========= XXXXXX  ^^XX|||||<br>
<br><br>the entrance has collapsed.
	`
);
const empty = new Location("_", "nothing in sight");

const textbar = document.querySelector("#textbar");
const game = document.querySelector("#game");
const inside = document.querySelector("#inside");
const insidebar = document.querySelector("#insidebar");

const map =
	["_____________",
	 "_____________",
	 "_________H___",
	 "_____________",
	 "___________C_",
	 "___W_________",
	 "_____________"];

let player_location = new Vec2(1, 2);
let map_size = new Vec2(0, 0);

function draw_map() {

	while (document.querySelector("#gamewindow").firstChild) {
		document.querySelector("#gamewindow").removeChild(document.querySelector("#gamewindow").firstChild);
	}

	let writing_location = new Vec2(0, 0);

	for (let row of map) {

		writing_location.x = 0;

		const loc_row = document.createElement("div");
		loc_row.className = "loc_row";
		document.querySelector("#gamewindow").appendChild(loc_row);

		for (let ch of row) {
			const loc = document.createElement("div");
			loc.textContent = ch;
			loc.className = "location";
			loc_row.appendChild(loc);

			if (ch == "_") {
				loc.textContent = "";
			}

			if (writing_location.x == player_location.x && writing_location.y == player_location.y) {
				// loc.textContent = "";
				loc.classList.add("player");
			}
			console.log(writing_location == player_location);

			writing_location.x += 1;
		}
		writing_location.y += 1;
	}
	map_size.x = writing_location.x;
	map_size.y = writing_location.y;
}

function redraw_map() {
	const gamewindow = document.querySelector("#gamewindow");
	const rows = gamewindow.children;
	let reading_location = new Vec2(0, 0);

	for (const row of rows) {

		const locations = row.children;
		reading_location.x = 0;

		for (const loc of locations) {

			const loc_char = map[reading_location.y][reading_location.x];

			if (reading_location.x == player_location.x && reading_location.y == player_location.y) {
				// console.log(loc_char);
				// loc.textContent = "";
				loc.classList.add("player");
				const location_type = getLocationByChar(loc_char);
				// textbar.textContent = `${location_type.description}.`;
				newText(location_type.description);
				insidebar.innerHTML = location_type.interior;
			}
			else {
				loc.classList.remove("player");
				if (loc_char == "_") {
					loc.textContent = "";
				}
				else {
					loc.textContent = map[reading_location.y][reading_location.x];
				}
			}
			reading_location.x += 1;
		}

		reading_location.y += 1;
	}

}

function getLocationByChar(char) {
	for (const location of Location.all) {
		if (location.tag.toLowerCase() == char.toLowerCase()) {
			// console.log(location);
			return location;
		}
	}
	return empty;
}

let index = 0;
let typingtimeout;
let currentline;

function newText(text, _textbar = textbar) {
	if (text == currentline) {
		return;
	}
	currentline = text;
	_textbar.textContent = "";
	index = 0;

	if (typingtimeout) {
		clearTimeout(typingtimeout);
	}

	typeText(text, 50, _textbar);
}
function typeText(text, speed=50, _textbar = textbar) {
	if (index < text.length) {
		_textbar.textContent += text[index];
		index++;
		typingtimeout = setTimeout(() => typeText(text, speed), speed);
	}
}













draw_map();
newText("you wake up in a strange place. everything hurts.");

document.addEventListener("keydown", function (event) {
	if (event.key == "ArrowUp" && player_location.y > 0) {
		player_location.y -= 1;
	} else if (event.key == "ArrowDown" && player_location.y < map_size.y - 1) {
		player_location.y += 1;
	} else if (event.key == "ArrowLeft" && player_location.x > 0) {
		player_location.x -= 1;
	}	else if (event.key == "ArrowRight" && player_location.x < map_size.x - 1) {
		player_location.x += 1;
	} else if (event.key == "Enter") {
		game.classList.toggle("entered");
		inside.classList.toggle("entered");
		document.querySelector("html").classList.toggle("entered");
		gamewindow.classList.toggle("entered");
	}
		

	redraw_map();

	// console.log(player_location)
	// console.log(map_size);
});