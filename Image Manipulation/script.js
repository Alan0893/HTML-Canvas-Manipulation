/**
 * Tutorial Link:
 * https://www.madebymike.com.au/writing/canvas-image-manipulation/
 */

const image = document.getElementById("image");

/**
 * Color Filters
 * R 0 0 0 0
 * 0 G 0 0 0
 * 0 0 B 0 0
 * 0 0 0 A 0
 */
var filters = {
	"No Filter": [
		1, 0, 0, 0, 0, 
		0, 1, 0, 0, 0, 
		0, 0, 1, 0, 0, 
		0, 0, 0, 1, 0 
	],"Grayscale": [
		1, 0, 0, 0, 0, 
		1, 0, 0, 0, 0,
		1, 0, 0, 0, 0,
		0, 0, 0, 1, 0
	], "Lighten": [
		1.5, 0, 0, 0, 0,
		0, 1.5, 0, 0, 0,
		0, 0, 1.5, 0, 0,
		0, 0, 0, 1, 0
	], "Darken": [
		0.5, 0, 0, 0, 0,
		0, 0.5, 0, 0, 0, 
		0, 0, 0.5, 0, 0,
		0, 0, 0, 1, 0
	], "Invert": [
		-1, 0, 0, 0, 1,
		0, -1, 0, 0, 1,
		0, 0, -1, 0, 1,
		0, 0, 0, 1, 0
	], "Sepia": [
		0.39, 0.769, 0.189, 0, 0,
		0.349, 0.686, 0.168, 0, 0,
		0.272, 0.534, 0.131, 0, 0, 
		0, 0, 0, 1, 0
	], "Red Monotone": [
		0.5, 0, 0, 0, 0.5,
		1, 0, 0, 0, 0,
		1, 0, 0, 0, 0,
		0, 0, 0, 1, 0
	], "Green Monotone": [
		1, 0, 0, 0, 0, 
		0.5, 0, 0, 0, 0.5,
		1, 0, 0, 0, 0,
		0, 0, 0, 1, 0
	], "Blue Monotone": [
		1, 0, 0, 0, 0,
		1, 0, 0, 0, 0,
		0.5, 0, 0, 0, 0.5,
		0, 0, 0, 1, 0
	], "Opaque": [
		1, 0, 0, 0, 0,
		0, 1, 0, 0, 0,
		0, 0, 1, 0, 0, 
		0, 0, 0, 0.5, 0
	]
}

/**
 * Checks if the image is fully data before accessing the image data
 * Once image is loaded, executes the following method
 */
if (image.complete) {
	applyColor(image, filters["Blue Monotone"]);
} else {
	image.addEventListener("load", function () {
		applyColor(image, filters["No Filter"]);
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

/*************************************************************
 * WebGL Program
 ************************************************************/

/**
 * Helper Function to compile a WebGL Program
 * @param {*} ctx 
 * @param {*} vertexShaderSource 
 * @param {*} fragmentShaderSource 
 * @returns a program by linking the source code of the fragment and vertex shaders
 */
function createWebGLProgram(ctx, vertexShaderSource, fragmentShaderSource) {
	this.ctx = ctx;

	this.compileShader = function (shaderSource, shaderType) {
		let shader = this.ctx.createShader(shaderType);
		this.ctx.shaderSource(shader, shaderSource);
		this.ctx.compileShader(shader);
		return shader;
	};

	let program = this.ctx.createProgram();
	this.ctx.attachShader(
		program,
		this.compileShader(vertexShaderSource, this.ctx.VERTEX_SHADER)
	);
	this.ctx.attachShader(
		program,
		this.compileShader(fragmentShaderSource, this.ctx.FRAGMENT_SHADER)
	);
	this.ctx.linkProgram(program);
	this.ctx.useProgram(program);

	return program;
};

function desaturateImageWebGL(img) {
	const canvas = document.createElement("canvas");
	img.parentNode.insertBefore(canvas, img);
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	img.parentNode.removeChild(img);

	let ctx;
	try {
		ctx =
			canvas.getContext("webgl") ||
			canvas.getContext("experimental-webgl");
	} catch (e) { }

	if (!ctx) {
		alert("Sorry, it seems WebGL is not available.");
	}

	const fragmentShaderSource = document.getElementById("fragment-shader")
		.text;
	const vertexShaderSource = document.getElementById("vertex-shader").text;
	const program = createWebGLProgram(ctx, vertexShaderSource, fragmentShaderSource);

	let resolutionLocation = ctx.getUniformLocation(
		program,
		"u_resolution"
	);
	ctx.uniform2f(resolutionLocation, canvas.width, canvas.height);

	let positionLocation = ctx.getAttribLocation(program, "a_position");
	let buffer = ctx.createBuffer();
	ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer);
	ctx.bufferData(
		ctx.ARRAY_BUFFER,
		new Float32Array([
			0,
			0,
			img.width,
			0,
			0,
			img.height,
			0,
			img.height,
			img.width,
			0,
			img.width,
			img.height
		]),
		ctx.STATIC_DRAW
	);
	ctx.enableVertexAttribArray(positionLocation);
	ctx.vertexAttribPointer(positionLocation, 2, ctx.FLOAT, false, 0, 0);

	let texCoordLocation = ctx.getAttribLocation(program, "a_texCoord");
	let texCoordBuffer = ctx.createBuffer();
	ctx.bindBuffer(ctx.ARRAY_BUFFER, texCoordBuffer);
	ctx.bufferData(
		ctx.ARRAY_BUFFER,
		new Float32Array([
			0.0,
			0.0,
			1.0,
			0.0,
			0.0,
			1.0,
			0.0,
			1.0,
			1.0,
			0.0,
			1.0,
			1.0
		]),
		ctx.STATIC_DRAW
	);
	ctx.enableVertexAttribArray(texCoordLocation);
	ctx.vertexAttribPointer(texCoordLocation, 2, ctx.FLOAT, false, 0, 0);

	let texture = ctx.createTexture();
	ctx.bindTexture(ctx.TEXTURE_2D, texture);
	ctx.texParameteri(
		ctx.TEXTURE_2D,
		ctx.TEXTURE_WRAP_S,
		ctx.CLAMP_TO_EDGE
	);
	ctx.texParameteri(
		ctx.TEXTURE_2D,
		ctx.TEXTURE_WRAP_T,
		ctx.CLAMP_TO_EDGE
	);
	ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST);
	ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.NEAREST);
	ctx.texImage2D(
		ctx.TEXTURE_2D,
		0,
		ctx.RGBA,
		ctx.RGBA,
		ctx.UNSIGNED_BYTE,
		img
	);

	ctx.drawArrays(ctx.TRIANGLES, 0, 6);
}

/*************************************************************
 * Color Filters
 ************************************************************/
function applyColor(img, colorMatrix) {
	const canvas = document.createElement("canvas");
	img.parentNode.insertBefore(canvas, img);
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	img.parentNode.removeChild(img);

	let ctx;
	try {
		ctx = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	} catch (e) { }
	if (!ctx) {
		alert("Sorry, it seems WebGL is not available.");
	}
	const fragmentShaderSource = document.getElementById("fragment-shader2").text;
	const vertexShaderSource = document.getElementById("vertex-shader2").text;
	const program = createWebGLProgram(ctx, vertexShaderSource, fragmentShaderSource);

	let resolutionLocation = ctx.getUniformLocation(program, "u_resolution");
	ctx.uniform2f(resolutionLocation, canvas.width, canvas.height);

	var feMultiplier = [];
	feMultiplier.push(colorMatrix.splice(3, 1)[0]);
	feMultiplier.push(colorMatrix.splice(8, 1)[0]);
	feMultiplier.push(colorMatrix.splice(12, 1)[0]);
	feMultiplier.push(colorMatrix.splice(16, 1)[0]);

	let matrixTransform = ctx.getUniformLocation(program, "u_matrix");
	ctx.uniformMatrix4fv(matrixTransform, false, new Float32Array(colorMatrix));

	let multiplier = ctx.getUniformLocation(program, "u_multiplier");
	ctx.uniform4f(multiplier, feMultiplier[0], feMultiplier[1], feMultiplier[2], feMultiplier[3]);

	let positionLocation = ctx.getAttribLocation(program, "a_position");
	let buffer = ctx.createBuffer();
	ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer);
	ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([
		0,
		0,
		img.width,
		0,
		0,
		img.height,
		0,
		img.height,
		img.width,
		0,
		img.width,
		img.height
	]), ctx.STATIC_DRAW);
	ctx.enableVertexAttribArray(positionLocation);
	ctx.vertexAttribPointer(positionLocation, 2, ctx.FLOAT, false, 0, 0);

	let texCoordLocation = ctx.getAttribLocation(program, "a_texCoord");
	let texCoordBuffer = ctx.createBuffer();
	ctx.bindBuffer(ctx.ARRAY_BUFFER, texCoordBuffer);
	ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([
		0.0,
		0.0,
		1.0,
		0.0,
		0.0,
		1.0,
		0.0,
		1.0,
		1.0,
		0.0,
		1.0,
		1.0
	]), ctx.STATIC_DRAW);
	ctx.enableVertexAttribArray(texCoordLocation);
	ctx.vertexAttribPointer(texCoordLocation, 2, ctx.FLOAT, false, 0, 0);

	let texture = ctx.createTexture();
	ctx.bindTexture(ctx.TEXTURE_2D, texture);
	ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
	ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
	ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST);
	ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.NEAREST);
	ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, img);

	ctx.drawArrays(ctx.TRIANGLES, 0, 6);
}

/*************************************************************
 * Color Conversion
 ************************************************************/
/**
 * RGBA to Color Matrix
 * @param {Number} r 
 * @param {Number} g 
 * @param {Number} b 
 * @param {Number} a 
 * @description Converts a rgba color format to a color matrix
 * @returns an array for a color matrix
 */
function rgbToMatrix(r, g, b, a) {
	try {
		r = +(r/255).toFixed(2);
		g = +(g/255).toFixed(2);
		b = +(b/255).toFixed(2);

		return [
			r, 0, 0, 0, 0,
			0, g, 0, 0, 0,
			0, 0, b, 0, 0, 
			0, 0, 0, a, 0,
		];
	} catch { 
		throw new Error("Parameters must be a number.")
	}
}
/**
 * Hex Code to RGB
 * @param {String} hex 
 * @returns an array of red, green, blue decimal values of the given hex code.
 */
function hexToRgb(hex) {
	try {
		hex.replace("#", "");

		let r = hexToDec(hex.slice(0, 2));
		let g = hexToDec(hex.slice(2, 4));
		let b = hexToDec(hex.slice(4, 6));
		console.log(r)

		return [r, g, b]
	} catch {
		throw new Error("Error, while trying to convert the hex code to rgb format.")
	}
}
/**
 * Hexadecimal to Decimal
 * @param {String} hex 
 * @returns the decimal format of the given hexadecimal
 */
function hexToDec(hex) {
	try {
		let hTod = {
			'0': 0, '1': 1, '2': 2, '3': 3,
			'4': 4, '5': 5, '6': 6, '7': 7,
			'8': 8, '9': 9, 'A': 10, 'B': 11,
			'C': 12, 'D': 13, 'E': 14, 'F': 15
		}
		let total = 0;
		let x = 0;
		for(let i = hex.length; i > 0; i--) {
			let toUpper = hex.slice(i-1, i).toUpperCase();
			total += hTod[toUpper] * Math.pow(16, x);
			x++;
		}
		return total;
	} catch {
		throw new Error("Error, while converting hexadecimal to decimal format.")
	}
}