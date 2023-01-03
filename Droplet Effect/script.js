(async () => {
	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");

	canvas.width = width = Math.floor(innerWidth);
	canvas.height = height = Math.floor(innerHeight);
	const halfWidth =  width >> 1;
	const halfHeight = height >> 1;
	const size = width * (height + 2) * 2;

	const delay = 30;

	let oldIndex = width;
	let newIndex = width * (height + 3);

	let dropletRad = 3;
	let droplet;
	let texture;

	let dropletMap = [];
	let lastMap = [];
	let mapIndex;
	
	await new Promise(r => {
		var background = new Image();
		background.crossOrigin = "Anonymous";
		background.src = "background.jpg";

		background.onload = function() {
			ctx.drawImage(background, 0, 0, width, height);
			r();
		}
	})

	texture = ctx.getImageData(0, 0, width, height);
	droplet = ctx.getImageData(0, 0, width, height);

	for(let i = 0; i < size; i++) {
		lastMap[i] = 0;
		dropletMap[i] = 0;
	}

	function dropAt(x, y) {
		x <<= 0;
		y <<= 0;

		for(let j = y - dropletRad; j < y + dropletRad; j++) {
			for(let i = x - dropletRad; i < x + dropletRad; i++) {
				dropletMap[oldIndex + (j * width) + i] += 512;
			}
		}
	}

	function newFrame() {
		let i;
		let a, b;
		let data, oldData;
		let currPixel, newPixel;

		i = oldIndex;
		oldIndex = newIndex;
		newIndex = i;

		i = 0;
		mapIndex = oldIndex;

		for(let y = 0; y < height; y++) {
			for(let x = 0; x < width; x++) {
				data = ( 
					dropletMap[mapIndex - width] + 
					dropletMap[mapIndex + width] + 
					dropletMap[mapIndex - 1] + 
					dropletMap[mapIndex + 1]
				) >> 1;

				data -= dropletMap[newIndex + i];
				data -= data >> 5;
				dropletMap[newIndex + i] = data;
				data = 1024 - data;

				oldData = lastMap[i];
				lastMap[i] = data;

				if(oldData != data) {
					a = (((x - halfWidth) * data / 1024) << 0) + halfWidth;
					b = (((y - halfHeight) * data / 1024) << 0) +  halfHeight;
					
					if(a >= width) a = width - 1;
					if(a < 0) a = 0;
					if(b >= height) b = height - 1;
					if(b < 0) b = 0;
					
					newPixel = (a + (b * width)) * 4;
					currPixel = i * 4;

					droplet.data[currPixel] = texture.data[newPixel];
					droplet.data[currPixel + 1] = texture.data[newPixel + 1];
					droplet.data[currPixel + 2] = texture.data[newPixel + 2];
				}
				mapIndex++;
				i++;
			}
		}
	}

	function randomDrop() {
		if(Math.random() > 0.3) {
			dropAt(Math.random() * width, Math.random() * height);
		}
	}

	function run() {
		newFrame();
		ctx.putImageData(droplet, 0, 0);
	}

	function getMousePos(canvas, e) {
		let rect = canvas.getBoundingClientRect();
		return {
			x: Math.round((e.clientX - rect.left) / (rect.right - rect.left) * canvas.width),
			y: Math.round((e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height)
		};
	}

	canvas.onmousemove = function(e) {
		let mousePos = getMousePos(canvas, e);
		let mX = mousePos.x;
		let mY = mousePos.y;
		dropAt(mX, mY);
	}

	setInterval(run, delay);
	setInterval(randomDrop, 1250)
})()