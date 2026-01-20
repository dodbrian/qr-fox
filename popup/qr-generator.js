/**
 * QR code generator based on QR code specification
 * Generates QR codes as SVG strings
 */

/**
 * Generate a QR-code SVG.
 * @param {string} text - The text to encode.
 * @param {{dark?:boolean}} [options] - Rendering options.
 * @returns {string} SVG markup.
 */
export function generateQR(text, { dark = false } = {}) {
  // Input validation
  if (text === null || text === undefined) {
    throw new Error("QR text cannot be null or undefined");
  }

  const str = String(text).trim();
  if (str.length === 0) {
    throw new Error("QR text cannot be empty");
  }

  // Sanitize input to prevent XSS
  const sanitized = sanitizeInput(str);

  // Create QR matrix
  const matrix = createQRMatrix(sanitized);

  // Render SVG
  const moduleSize = 4;
  const margin = 4 * moduleSize;
  const size = matrix.length * moduleSize + 2 * margin;
  const darkColor = dark ? "#fff" : "#000";
  const lightColor = dark ? "#000" : "#fff";

  // Build SVG more efficiently with array join
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
    `<rect width="100%" height="100%" fill="${lightColor}"/>`,
  ];

  const rects = [];
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (matrix[y][x]) {
        const xPos = margin + x * moduleSize;
        const yPos = margin + y * moduleSize;
        rects.push(
          `<rect x="${xPos}" y="${yPos}" width="${moduleSize}" height="${moduleSize}" fill="${darkColor}"/>`,
        );
      }
    }
  }

  parts.push(...rects, "</svg>");
  return parts.join("");
}

/**
 * Sanitize input to prevent XSS attacks.
 * @param {string} text - Raw input text.
 * @returns {string} Sanitized text.
 */
function sanitizeInput(text) {
  // Remove potentially dangerous characters while preserving URL-safe content
  return text.replace(/[<>\"']/g, "");
}

/**
 * Create QR matrix for the given text using QR encoding algorithm.
 * @param {string} text - The text to encode.
 * @returns {number[][]} QR code matrix.
 */
function createQRMatrix(text) {
  // Calculate version based on text length
  let version = 1;
  let capacity = getCapacity(version);

  while (capacity < text.length && version < 40) {
    version++;
    capacity = getCapacity(version);
  }

  // Create matrix with appropriate size
  const size = 17 + version * 4;
  const matrix = Array(size)
    .fill()
    .map(() => Array(size).fill(0));

  // Add positioning patterns (finder patterns)
  addFinderPattern(matrix, 0, 0);
  addFinderPattern(matrix, size - 7, 0);
  addFinderPattern(matrix, 0, size - 7);

  // Add timing patterns
  addTimingPatterns(matrix, size);

  // Add format information area
  addFormatInformation(matrix, size);

  // Encode data
  const encoded = encodeData(text, version);
  addDataToMatrix(matrix, encoded, size);

  return matrix;
}

/**
 * Get capacity of a QR version for alphanumeric data.
 * @param {number} version - QR version (1-40).
 * @returns {number} Capacity in characters.
 */
function getCapacity(version) {
  // Simplified capacity table for alphanumeric mode
  const capacities = [
    41, 77, 127, 187, 255, 322, 370, 461, 552, 652, 772, 883, 1022, 1101, 1250,
    1408, 1548, 1725, 1903, 2061, 2232, 2409, 2620, 2812, 3057, 3283, 3517,
    3669, 3909, 4158, 4417, 4686, 4965, 5253, 5769, 6093, 6441, 6859, 7336,
    7852,
  ];
  return capacities[Math.min(version - 1, 39)];
}

/**
 * Add finder pattern to the matrix.
 * @param {number[][]} matrix - QR matrix.
 * @param {number} x - X coordinate.
 * @param {number} y - Y coordinate.
 */
function addFinderPattern(matrix, x, y) {
  const pattern = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ];

  for (let row = 0; row < pattern.length; row++) {
    for (let col = 0; col < pattern[row].length; col++) {
      if (y + row < matrix.length && x + col < matrix[0].length) {
        matrix[y + row][x + col] = pattern[row][col];
      }
    }
  }
}

/**
 * Add timing patterns to the matrix.
 * @param {number[][]} matrix - QR matrix.
 * @param {number} size - Matrix size.
 */
function addTimingPatterns(matrix, size) {
  for (let i = 8; i < size - 8; i++) {
    const pattern = i % 2 === 0 ? 1 : 0;
    matrix[6][i] = pattern;
    matrix[i][6] = pattern;
  }
}

/**
 * Add format information to the matrix.
 * @param {number[][]} matrix - QR matrix.
 * @param {number} size - Matrix size.
 */
function addFormatInformation(matrix, size) {
  // Placeholder for format info - marks reserved areas
  for (let i = 0; i < 9; i++) {
    matrix[8][i] = 0;
    matrix[i][8] = 0;
  }
  for (let i = size - 8; i < size; i++) {
    matrix[8][i] = 0;
    matrix[i][8] = 0;
  }
}

/**
 * Encode data using alphanumeric mode.
 * @param {string} text - Text to encode.
 * @param {number} version - QR version.
 * @returns {number[]} Encoded data bits.
 */
function encodeData(text, version) {
  const bits = [];

  // Mode indicator (alphanumeric = 0010)
  bits.push(0, 0, 1, 0);

  // Character count indicator (10 bits for version 1-9)
  const countBits = version < 10 ? 9 : 11;
  const count = text.length;
  for (let i = countBits - 1; i >= 0; i--) {
    bits.push((count >> i) & 1);
  }

  // Data encoding (simplified)
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    for (let j = 7; j >= 0; j--) {
      bits.push((code >> j) & 1);
    }
  }

  return bits;
}

/**
 * Add encoded data to the matrix.
 * @param {number[][]} matrix - QR matrix.
 * @param {number[]} data - Encoded data bits.
 * @param {number} size - Matrix size.
 */
function addDataToMatrix(matrix, data, size) {
  let bitIndex = 0;
  const reserved = new Set();

  // Mark reserved areas
  for (let i = 0; i < 9; i++) {
    reserved.add(`${8},${i}`);
    reserved.add(`${i},${8}`);
  }
  for (let i = size - 8; i < size; i++) {
    reserved.add(`${8},${i}`);
    reserved.add(`${i},${8}`);
  }

  // Add timing patterns to reserved
  for (let i = 8; i < size - 8; i++) {
    reserved.add(`${6},${i}`);
    reserved.add(`${i},${6}`);
  }

  // Fill matrix with data, skipping reserved areas
  for (let x = size - 1; x > 0; x -= 2) {
    if (x === 6) x--;

    for (let y = 0; y < size; y++) {
      for (let dx = 0; dx < 2; dx++) {
        const px = x - dx;
        const key = `${y},${px}`;

        if (!reserved.has(key) && bitIndex < data.length) {
          matrix[y][px] = data[bitIndex++];
        }
      }
    }
  }
}
