let rotateZ = 0;
let rotateX = 1;
let rotateY = 0;
let translateY = 100;
let translateX = 100;

async function build() {
    for (let i = 0; i < 100; i++) {
        await new Promise(resolve => setTimeout(resolve, 10));
        let circle = document.createElement("div");
        circle.classList.add("circle");
        document.body.appendChild(circle);
        circle.style.transform = `perspective(100px) translateX(${Math.sin(i)*translateX}px) translateY(${Math.cos(i)*translateY}px) rotateX(${i*rotateX}deg) rotateY(${i*rotateY}deg) rotateZ(${i*rotateZ}deg)`;
        circle.dataset.translateX = Math.sin(i)*translateX;
        circle.dataset.translateY = Math.cos(i)*translateY;
        circle.dataset.rotateX = i*1;
		circle.dataset.opacity = 1	
		// animate();
    }
}

function animate() {
    for (let circle of document.querySelectorAll(".circle")) {
		if (circle.dataset.opacity < 0) {
			circle.remove();
			continue;
		}
        // circle.dataset.opacity = parseFloat(circle.dataset.opacity) - 0.001;
        circle.dataset.translateX = parseFloat(circle.dataset.translateX);
        // circle.dataset.translateY = parseFloat(circle.dataset.translateY) + 0.2;
        circle.dataset.rotateX = parseFloat(circle.dataset.rotateX);
        circle.style.transform = `perspective(100px) translateX(${circle.dataset.translateX}px) translateY(${circle.dataset.translateY}px) rotateX(${circle.dataset.rotateX}deg)`;
        circle.style.opacity = circle.dataset.opacity;
    }
    
    requestAnimationFrame(animate); // Continue loop
}

async function main() {
    build();
    // requestAnimationFrame(animate); // Start animation loop
}

main();

