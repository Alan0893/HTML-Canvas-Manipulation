const image = document.getElementById("image");

/**
 * Checks if the image is fully data before accessing the image data
 * Once image is loaded, executes the following method
 */
if (image.complete) {
	desaturateImage(image);
} else {
	image.addEventListener("load", function () {
		desaturateImage(image);
	});
}

/**
 * Desaturating Image
 * @param {*} img image that is being desaturated
 * @description desaturates an image using basic pixel manipulation
 */
function desaturateImage(img) {
	const canvas = document.createElement("canvas");
	img.parentNode.insertBefore(canvas, img);
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	img.parentNode.removeChild(img);

	var ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0);
	let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	let data = imgData.data;

	for (let i = 0; i < data.length; i += 4) {
		let gray = 0.2126 * data[i] + 
			0.7152 * data[i + 1] + 
			0.0722 * data[i + 2];
		data[i] = gray;
		data[i + 1] = gray;
		data[i + 2] = gray;
	}
	ctx.putImageData(imgData, 0, 0, 0, 0, canvas.width, canvas.height);
}

/**
 * Desaturating Image
 * @param {*} img image that is being desaturated
 * @description desaturates an image using 32bit pixel manipulation
 */
function desaturateImage32(img) {
	const canvas = document.createElement("canvas");
	img.parentNode.insertBefore(canvas, img);
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	img.parentNode.removeChild(img);

	const ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0);

	let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	let buffer = new ArrayBuffer(imgData.data.length);
	let buffer8 = new Uint8ClampedArray(buffer);
	let data = new Uint32Array(buffer);
	let j = 0;
	
	for(let i = 0; i < imgData.data.length; i += 4) {
		let gray = 0.2126 * imgData.data[i] +
			0.7152 * imgData.data[i + 1] + 
			0.0722 * imgData.data[i + 2];
		data[j] = (255 << 24) | 
			(gray << 16) | 
			(gray << 8) |
			gray;
		j++
	}

	imgData.data.set(buffer8);
	ctx.putImageData(imgData, 0, 0);
}