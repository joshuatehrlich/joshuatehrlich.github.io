const migrations = document.querySelectorAll('.migrate');
//   const menu = document.querySelector('.menu');
//   const menuBg = document.querySelector('.menu-bg');
console.log("JFEIOWF")
migrations.forEach(function(migrate) {

    migrate.addEventListener('click', function () {
		migrate.classList.toggle('frozen');
    });
	
    migrate.addEventListener('mouseenter', function () {
		migrations.forEach(function(other) {
			if (other !== migrate) {
				if (!other.classList.contains('frozen')) {
				other.classList.add('blurred');
				}
				else {
					other.classList.add('subtleblur');
				}
			}
		});
    });
    migrate.addEventListener('mouseleave', function () {
		migrations.forEach(function(other) {
			if (other !== migrate) {
				other.classList.remove('blurred');
				other.classList.remove('subtleblur');
			}
		});
    });

	document.addEventListener('keydown', function(event) {
		if (event.key === "W" || event.key === "w") {
			migrations.forEach(function(other) {
				other.classList.remove('frozen');
			});
		}
		if (event.key === "E" || event.key === "e") {
			migrations.forEach(function(other) {
				other.classList.toggle('frozen');
			});
		}
	});
});