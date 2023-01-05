# Image Manipulation
Manipulates images using canvas.

- Desaturates images through various methods
  -   Pixel Manipulation with Canvas
  -   32bit Pixel Manipulation
  -   Canvas WebGL
- Applied filters to images Canvas feColorMatrix through WebGL
  - Filters include: 
    - Grayscale - turns the image gray
    - Lighten - brightens the image
    - Darken - darkens the image
    - Invert - inverts the color samples in the image
    - Sepia - casts the image in a yellowish-brown light
    - Red Monotone  - casts the image in a reddish tone
    - Green Monotone  - casts the image in a greenish tone
    - Blue Monotone - casts the image in a bluish tone
    - Opaque - turns down the opacity by 0.5
  - Included helper methods for conversion:
    -  `rgbToMatrix(r, g, b, a)` - converts a rgba color format to a color matrix format.
    -  `hexToRgb(hex)` - converts a given hex code to rgb format, and returns a array [r, g, b].
    -  `hexToDec(hex)` - converts hexadecimal to decimal format
