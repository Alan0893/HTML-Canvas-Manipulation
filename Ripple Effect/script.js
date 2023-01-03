const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const sizing = 1;
canvas.width = w = Math.floor(innerWidth/sizing);
canvas.height = h = Math.floor(innerHeight/sizing);
canvas.style.width = '100%';
canvas.style.height = '100%';

let buffer1 = Array(w).fill().map(_=>Array(h).fill(0));
let buffer2 = Array(w).fill().map(_=>Array(h).fill(0));

const damping = 0.999;
let temp;

function animate() {
	for(let i = 1; i < w-1; i++) {
		for(let j = 1; j < h-1; j++) {
			buffer2[i][j] = ((buffer1[i-1][j] +
				buffer1[i+1][j] + 
				buffer1[i][j-1] + 
				buffer1[i][j+1]) /2 -
				buffer2[i][j]) * damping;
		}
	}

	let img = new ImageData(w, h);

	for(let i = 0; i < buffer1.length; i++) {
		for(let j = 0; j < buffer1[0].length; j++) {
			let index = (j * buffer1.length + i) * 4;
			img.data[index] = buffer2[i][j];
			img.data[index+1] = buffer2[i][j];
			img.data[index+2] = buffer2[i][j];
			img.data[index+3] = 255; 
		}
	}
	
	ctx.putImageData(img, 0, 0);
	temp = buffer2;
	buffer2 = buffer1;
	buffer1 = temp;

	requestAnimationFrame(animate)
}
animate();

function ripple(e) {
	let x = Math.floor(e.clientX/sizing);
	let y = Math.floor(e.clientY/sizing);
	buffer1[x][y] = 500;
}

function random() {
	let x = Math.floor(Math.random()*w);
	let y = Math.floor(Math.random()*h);
	buffer1[x][y] = 500;
}

document.addEventListener("click", ripple);
document.addEventListener("mousemove", ripple);
setInterval(random, 1250)

window.addEventListener("resize", function() {
	location.reload();
})