/**
 * QR code generator based on ISO/IEC 18004 specification
 * Generates QR codes as SVG strings
 */

// Galois Field GF(2^8) with primitive polynomial x^8 + x^4 + x^3 + x^2 + 1
const GF_EXP: number[] = new Array(512);
const GF_LOG: number[] = new Array(256);

// Initialize Galois Field tables
(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) {
      x ^= 0x11d; // Primitive polynomial
    }
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

/**
 * Multiply in GF(2^8).
 * @param {number} a - First operand.
 * @param {number} b - Second operand.
 * @returns {number} Product.
 */
function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

/**
 * Generate Reed-Solomon generator polynomial.
 * @param {number} numEcc - Number of error correction codewords.
 * @returns {number[]} Generator polynomial coefficients.
 */
function rsGeneratorPoly(numEcc: number): number[] {
  let poly: number[] = [1];
  for (let i = 0; i < numEcc; i++) {
    const newPoly: number[] = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      newPoly[j] ^= poly[j];
      newPoly[j + 1] ^= gfMul(poly[j], GF_EXP[i]);
    }
    poly = newPoly;
  }
  return poly;
}

/**
 * Compute Reed-Solomon error correction codewords.
 * @param {number[]} data - Data codewords.
 * @param {number} numEcc - Number of error correction codewords.
 * @returns {number[]} Error correction codewords.
 */
function rsEncode(data: number[], numEcc: number): number[] {
  const gen = rsGeneratorPoly(numEcc);
  const result: number[] = new Array(numEcc).fill(0);

  for (const byte of data) {
    const coef = byte ^ result[0];
    result.shift();
    result.push(0);
    for (let i = 0; i < numEcc; i++) {
      result[i] ^= gfMul(gen[i + 1], coef);
    }
  }

  return result;
}

interface VersionInfo {
  totalCodewords: number;
  ecL: number[];
}

// QR Code version information
// ecL format: [totalCW, totalDataCW, ecCWperBlock, numBlocks, dataCWperBlock, 0, 0]
const VERSION_INFO: (VersionInfo | null)[] = [
  null,
  // Version 1: 26 total, 19 data, 7 EC, 1 block
  { totalCodewords: 26, ecL: [26, 19, 7, 1, 19, 0, 0] },
  // Version 2: 44 total, 34 data, 10 EC, 1 block
  { totalCodewords: 44, ecL: [44, 34, 10, 1, 34, 0, 0] },
  // Version 3: 70 total, 55 data, 15 EC, 1 block
  { totalCodewords: 70, ecL: [70, 55, 15, 1, 55, 0, 0] },
  // Version 4: 100 total, 80 data, 20 EC, 1 block
  { totalCodewords: 100, ecL: [100, 80, 20, 1, 80, 0, 0] },
  // Version 5: 134 total, 108 data, 26 EC, 1 block
  { totalCodewords: 134, ecL: [134, 108, 26, 1, 108, 0, 0] },
  // Version 6: 172 total, 136 data, 36 EC total (18 per block), 2 blocks, 68 data/block
  { totalCodewords: 172, ecL: [172, 136, 18, 2, 68, 0, 0] },
];

// Pre-computed format info strings (L level, masks 0-7)
const FORMAT_INFO: number[] = [
  0x77c4, 0x72f3, 0x7daa, 0x789d, 0x662f, 0x6318, 0x6c41, 0x6976,
];

// Alignment pattern positions by version
const ALIGNMENT_POSITIONS: (number[] | null)[] = [
  null,
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
];

interface QROptions {
  dark?: boolean;
}

/**
 * Generate a QR-code SVG.
 * @param {string} text - The text to encode.
 * @param {{dark?:boolean}} [options] - Rendering options.
 * @returns {string} SVG markup.
 */
export function generateQR(
  text: string,
  { dark = false }: QROptions = {},
): string {
  if (text === null || text === undefined) {
    throw new Error("QR text cannot be null or undefined");
  }

  const str = String(text).trim();
  if (str.length === 0) {
    throw new Error("QR text cannot be empty");
  }

  const matrix = createQRCode(str);

  const moduleSize = 8;
  const margin = 4 * moduleSize;
  const size = matrix.length * moduleSize + 2 * margin;
  const darkColor = dark ? "#fff" : "#000";
  const lightColor = dark ? "#00000000" : "#fff";

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
    `<rect width="100%" height="100%" fill="${lightColor}"/>`,
  ];

  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (matrix[y][x]) {
        const xPos = margin + x * moduleSize;
        const yPos = margin + y * moduleSize;
        parts.push(
          `<rect x="${xPos}" y="${yPos}" width="${moduleSize}" height="${moduleSize}" fill="${darkColor}"/>`,
        );
      }
    }
  }

  parts.push("</svg>");
  return parts.join("");
}

/**
 * Create a complete QR code matrix.
 * @param {string} data - The data to encode.
 * @returns {number[][]} QR code matrix.
 */
function createQRCode(data: string): number[][] {
  // Use byte mode for simplicity and full character support
  const dataBytes = encodeByteMode(data);
  const version = getMinVersion(dataBytes.length);

  if (!version) {
    throw new Error("Data too long for QR code");
  }

  const vInfo = VERSION_INFO[version];
  if (!vInfo) {
    throw new Error("Invalid QR version");
  }

  const ecInfo = vInfo.ecL;
  const totalDataCodewords = ecInfo[1];
  const ecCodewordsPerBlock = ecInfo[2];
  const numBlocks = ecInfo[3];
  const dataCodewordsPerBlock = ecInfo[4];

  // Build data stream with mode indicator and length
  const bits: number[] = [];

  // Byte mode indicator: 0100
  bits.push(0, 1, 0, 0);

  // Character count (8 bits for version 1-9 in byte mode)
  // Note: In byte mode, character count is the number of bytes, not characters
  const charCountBits = version < 10 ? 8 : 16;
  for (let i = charCountBits - 1; i >= 0; i--) {
    bits.push((dataBytes.length >> i) & 1);
  }

  // Data bytes
  for (const byte of dataBytes) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1);
    }
  }

  // Terminator (up to 4 bits)
  const maxBits = totalDataCodewords * 8;
  for (let i = 0; i < 4 && bits.length < maxBits; i++) {
    bits.push(0);
  }

  // Pad to byte boundary
  while (bits.length % 8 !== 0 && bits.length < maxBits) {
    bits.push(0);
  }

  // Pad codewords
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < maxBits) {
    for (let i = 7; i >= 0; i--) {
      bits.push((padBytes[padIdx] >> i) & 1);
    }
    padIdx = (padIdx + 1) % 2;
  }

  // Convert to codewords
  const dataCodewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let cw = 0;
    for (let j = 0; j < 8; j++) {
      cw = (cw << 1) | bits[i + j];
    }
    dataCodewords.push(cw);
  }

  // Split into blocks and generate EC
  const blocks: number[][] = [];
  const ecBlocks: number[][] = [];
  let cwIdx = 0;

  for (let b = 0; b < numBlocks; b++) {
    const blockData = dataCodewords.slice(cwIdx, cwIdx + dataCodewordsPerBlock);
    cwIdx += dataCodewordsPerBlock;
    blocks.push(blockData);
    ecBlocks.push(rsEncode(blockData, ecCodewordsPerBlock));
  }

  // Interleave data codewords
  const interleaved: number[] = [];
  const maxDataLen = Math.max(...blocks.map((b) => b.length));
  for (let i = 0; i < maxDataLen; i++) {
    for (const block of blocks) {
      if (i < block.length) {
        interleaved.push(block[i]);
      }
    }
  }

  // Interleave EC codewords
  for (let i = 0; i < ecCodewordsPerBlock; i++) {
    for (const ec of ecBlocks) {
      interleaved.push(ec[i]);
    }
  }

  // Create matrix
  const size = version * 4 + 17;
  const matrix = createEmptyMatrix(size);
  const reserved = createEmptyMatrix(size);

  // Add function patterns
  addFinderPatterns(matrix, reserved, size);
  addAlignmentPatterns(matrix, reserved, version, size);
  addTimingPatterns(matrix, reserved, size);
  addDarkModule(matrix, reserved, version);
  reserveFormatAreas(reserved, size);

  // Place data
  placeDataBits(matrix, reserved, interleaved, size);

  // Find best mask
  let bestMask = 0;
  let bestScore = Infinity;

  for (let mask = 0; mask < 8; mask++) {
    const testMatrix = matrix.map((row) => [...row]);
    applyMask(testMatrix, reserved, mask, size);
    const score = evaluatePenalty(testMatrix, size);
    if (score < bestScore) {
      bestScore = score;
      bestMask = mask;
    }
  }

  // Apply best mask
  applyMask(matrix, reserved, bestMask, size);

  // Add format info
  addFormatInfo(matrix, bestMask, size);

  return matrix;
}

/**
 * Encode string to byte array.
 * @param {string} str - Input string.
 * @returns {number[]} Byte array.
 */
function encodeByteMode(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 128) {
      bytes.push(code);
    } else if (code < 2048) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else {
      bytes.push(
        0xe0 | (code >> 12),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    }
  }
  return bytes;
}

/**
 * Get minimum version for byte count.
 * @param {number} byteCount - Number of bytes.
 * @returns {number|null} Version or null.
 */
function getMinVersion(byteCount: number): number | null {
  // Byte mode capacities for L level
  const capacities = [0, 17, 32, 53, 78, 106, 134];
  for (let v = 1; v < capacities.length; v++) {
    if (capacities[v] >= byteCount) return v;
  }
  return null;
}

/**
 * Create empty matrix.
 * @param {number} size - Matrix size.
 * @returns {number[][]} Empty matrix.
 */
function createEmptyMatrix(size: number): number[][] {
  return Array(size)
    .fill(null)
    .map(() => Array(size).fill(0));
}

/**
 * Add finder patterns.
 * @param {number[][]} matrix - QR matrix.
 * @param {number[][]} reserved - Reserved areas.
 * @param {number} size - Matrix size.
 */
function addFinderPatterns(
  matrix: number[][],
  reserved: number[][],
  size: number,
): void {
  const positions: [number, number][] = [
    [0, 0],
    [0, size - 7],
    [size - 7, 0],
  ];

  for (const [row, col] of positions) {
    // 7x7 finder pattern
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isEdge = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[row + r][col + c] = isEdge || isInner ? 1 : 0;
        reserved[row + r][col + c] = 1;
      }
    }

    // Separator (white border)
    for (let i = 0; i < 8; i++) {
      // Horizontal
      if (row === 0 && col + i < size) {
        if (row + 7 < size) {
          matrix[row + 7][col + i] = 0;
          reserved[row + 7][col + i] = 1;
        }
      } else if (row === size - 7) {
        if (row - 1 >= 0 && col + i < size) {
          matrix[row - 1][col + i] = 0;
          reserved[row - 1][col + i] = 1;
        }
      }

      // Vertical
      if (col === 0 && row + i < size) {
        if (col + 7 < size) {
          matrix[row + i][col + 7] = 0;
          reserved[row + i][col + 7] = 1;
        }
      } else if (col === size - 7) {
        if (col - 1 >= 0 && row + i < size) {
          matrix[row + i][col - 1] = 0;
          reserved[row + i][col - 1] = 1;
        }
      }
    }
  }
}

/**
 * Add alignment patterns.
 * @param {number[][]} matrix - QR matrix.
 * @param {number[][]} reserved - Reserved areas.
 * @param {number} version - QR version.
 * @param {number} size - Matrix size.
 */
function addAlignmentPatterns(
  matrix: number[][],
  reserved: number[][],
  version: number,
  size: number,
): void {
  if (version < 2) return;

  const positions = ALIGNMENT_POSITIONS[version];
  if (!positions) return;

  for (const row of positions) {
    for (const col of positions) {
      // Skip if overlaps finder pattern
      if (
        (row < 9 && col < 9) ||
        (row < 9 && col > size - 10) ||
        (row > size - 10 && col < 9)
      ) {
        continue;
      }

      // 5x5 alignment pattern
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const isEdge = Math.abs(r) === 2 || Math.abs(c) === 2;
          const isCenter = r === 0 && c === 0;
          matrix[row + r][col + c] = isEdge || isCenter ? 1 : 0;
          reserved[row + r][col + c] = 1;
        }
      }
    }
  }
}

/**
 * Add timing patterns.
 * @param {number[][]} matrix - QR matrix.
 * @param {number[][]} reserved - Reserved areas.
 * @param {number} size - Matrix size.
 */
function addTimingPatterns(
  matrix: number[][],
  reserved: number[][],
  size: number,
): void {
  for (let i = 8; i < size - 8; i++) {
    const val = (i + 1) % 2;
    matrix[6][i] = val;
    matrix[i][6] = val;
    reserved[6][i] = 1;
    reserved[i][6] = 1;
  }
}

/**
 * Add dark module.
 * @param {number[][]} matrix - QR matrix.
 * @param {number[][]} reserved - Reserved areas.
 * @param {number} version - QR version.
 */
function addDarkModule(
  matrix: number[][],
  reserved: number[][],
  version: number,
): void {
  const row = 4 * version + 9;
  matrix[row][8] = 1;
  reserved[row][8] = 1;
}

/**
 * Reserve format information areas.
 * @param {number[][]} reserved - Reserved areas.
 * @param {number} size - Matrix size.
 */
function reserveFormatAreas(reserved: number[][], size: number): void {
  // Around top-left finder
  for (let i = 0; i < 9; i++) {
    reserved[8][i] = 1;
    reserved[i][8] = 1;
  }

  // Around top-right finder
  for (let i = 0; i < 8; i++) {
    reserved[8][size - 1 - i] = 1;
  }

  // Around bottom-left finder
  for (let i = 0; i < 8; i++) {
    reserved[size - 1 - i][8] = 1;
  }
}

/**
 * Place data bits in matrix.
 * @param {number[][]} matrix - QR matrix.
 * @param {number[][]} reserved - Reserved areas.
 * @param {number[]} codewords - Data codewords.
 * @param {number} size - Matrix size.
 */
function placeDataBits(
  matrix: number[][],
  reserved: number[][],
  codewords: number[],
  size: number,
): void {
  // Convert to bits
  const bits: number[] = [];
  for (const cw of codewords) {
    for (let i = 7; i >= 0; i--) {
      bits.push((cw >> i) & 1);
    }
  }

  let bitIdx = 0;
  let right = size - 1;
  let upward = true;

  while (right >= 1) {
    if (right === 6) right--; // Skip timing column

    for (let i = 0; i < size; i++) {
      const row = upward ? size - 1 - i : i;

      for (let j = 0; j < 2; j++) {
        const col = right - j;
        if (!reserved[row][col]) {
          matrix[row][col] = bitIdx < bits.length ? bits[bitIdx++] : 0;
        }
      }
    }

    right -= 2;
    upward = !upward;
  }
}

/**
 * Apply mask pattern.
 * @param {number[][]} matrix - QR matrix.
 * @param {number[][]} reserved - Reserved areas.
 * @param {number} mask - Mask pattern (0-7).
 * @param {number} size - Matrix size.
 */
function applyMask(
  matrix: number[][],
  reserved: number[][],
  mask: number,
  size: number,
): void {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (reserved[row][col]) continue;

      let invert = false;
      switch (mask) {
        case 0:
          invert = (row + col) % 2 === 0;
          break;
        case 1:
          invert = row % 2 === 0;
          break;
        case 2:
          invert = col % 3 === 0;
          break;
        case 3:
          invert = (row + col) % 3 === 0;
          break;
        case 4:
          invert = (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0;
          break;
        case 5:
          invert = ((row * col) % 2) + ((row * col) % 3) === 0;
          break;
        case 6:
          invert = (((row * col) % 2) + ((row * col) % 3)) % 2 === 0;
          break;
        case 7:
          invert = (((row + col) % 2) + ((row * col) % 3)) % 2 === 0;
          break;
      }

      if (invert) {
        matrix[row][col] ^= 1;
      }
    }
  }
}

/**
 * Evaluate mask penalty score.
 * @param {number[][]} matrix - QR matrix.
 * @param {number} size - Matrix size.
 * @returns {number} Penalty score.
 */
function evaluatePenalty(matrix: number[][], size: number): number {
  let penalty = 0;

  // Rule 1: 5+ consecutive same-color modules
  for (let row = 0; row < size; row++) {
    let count = 1;
    for (let col = 1; col < size; col++) {
      if (matrix[row][col] === matrix[row][col - 1]) {
        count++;
      } else {
        if (count >= 5) penalty += 3 + (count - 5);
        count = 1;
      }
    }
    if (count >= 5) penalty += 3 + (count - 5);
  }

  for (let col = 0; col < size; col++) {
    let count = 1;
    for (let row = 1; row < size; row++) {
      if (matrix[row][col] === matrix[row - 1][col]) {
        count++;
      } else {
        if (count >= 5) penalty += 3 + (count - 5);
        count = 1;
      }
    }
    if (count >= 5) penalty += 3 + (count - 5);
  }

  // Rule 2: 2x2 same-color blocks
  for (let row = 0; row < size - 1; row++) {
    for (let col = 0; col < size - 1; col++) {
      const val = matrix[row][col];
      if (
        val === matrix[row][col + 1] &&
        val === matrix[row + 1][col] &&
        val === matrix[row + 1][col + 1]
      ) {
        penalty += 3;
      }
    }
  }

  // Rule 3: Finder-like patterns
  const pattern1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
  const pattern2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col <= size - 11; col++) {
      let match1 = true;
      let match2 = true;
      for (let i = 0; i < 11; i++) {
        if (matrix[row][col + i] !== pattern1[i]) match1 = false;
        if (matrix[row][col + i] !== pattern2[i]) match2 = false;
      }
      if (match1 || match2) penalty += 40;
    }
  }

  for (let col = 0; col < size; col++) {
    for (let row = 0; row <= size - 11; row++) {
      let match1 = true;
      let match2 = true;
      for (let i = 0; i < 11; i++) {
        if (matrix[row + i][col] !== pattern1[i]) match1 = false;
        if (matrix[row + i][col] !== pattern2[i]) match2 = false;
      }
      if (match1 || match2) penalty += 40;
    }
  }

  // Rule 4: Proportion of dark modules
  let darkCount = 0;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (matrix[row][col]) darkCount++;
    }
  }
  const percent = (darkCount * 100) / (size * size);
  const prevFive = Math.floor(percent / 5) * 5;
  const nextFive = prevFive + 5;
  penalty +=
    Math.min(Math.abs(prevFive - 50) / 5, Math.abs(nextFive - 50) / 5) * 10;

  return penalty;
}

/**
 * Add format information.
 * @param {number[][]} matrix - QR matrix.
 * @param {number} mask - Mask pattern.
 * @param {number} size - Matrix size.
 */
function addFormatInfo(matrix: number[][], mask: number, size: number): void {
  const formatInfo = FORMAT_INFO[mask];

  // Format info bit positions around top-left finder
  const bits: number[] = [];
  for (let i = 14; i >= 0; i--) {
    bits.push((formatInfo >> i) & 1);
  }

  // Top-left horizontal (left to right, skipping timing at col 6)
  const topLeftH: [number, number][] = [
    [8, 0],
    [8, 1],
    [8, 2],
    [8, 3],
    [8, 4],
    [8, 5],
    [8, 7],
    [8, 8],
  ];
  // Top-left vertical (bottom to top, skipping timing at row 6)
  const topLeftV: [number, number][] = [
    [7, 8],
    [5, 8],
    [4, 8],
    [3, 8],
    [2, 8],
    [1, 8],
    [0, 8],
  ];

  for (let i = 0; i < 8; i++) {
    matrix[topLeftH[i][0]][topLeftH[i][1]] = bits[i];
  }
  for (let i = 0; i < 7; i++) {
    matrix[topLeftV[i][0]][topLeftV[i][1]] = bits[8 + i];
  }

  // Top-right horizontal (right to left)
  for (let i = 0; i < 8; i++) {
    matrix[8][size - 1 - i] = bits[i];
  }

  // Bottom-left vertical (top to bottom)
  for (let i = 0; i < 7; i++) {
    matrix[size - 7 + i][8] = bits[8 + i];
  }
}
