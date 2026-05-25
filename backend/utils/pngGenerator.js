const zlib = require('zlib');

/**
 * Calculates CRC32 checksum for a buffer.
 * @param {Buffer} buffer 
 * @returns {number}
 */
function crc32(buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buffer.length; i++) {
    c ^= buffer[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

/**
 * Writes a PNG chunk with correct length and CRC.
 * @param {string} type - 4-character chunk type
 * @param {Buffer} data - Chunk data
 * @returns {Buffer}
 */
function writeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const chunk = Buffer.concat([typeBuf, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(chunk), 0);

  return Buffer.concat([len, chunk, crc]);
}

/**
 * Generates a valid PNG Buffer with custom width, height, and color (RGBA).
 * Works on any environment with zero dependencies.
 * @param {number} width 
 * @param {number} height 
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @param {number} a - Alpha (0-255)
 * @returns {Buffer}
 */
function generatePng(width, height, r = 99, g = 102, b = 241, a = 255) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR details
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth: 8
  ihdrData[9] = 6; // color type: 6 (RGBA)
  ihdrData[10] = 0; // compression method
  ihdrData[11] = 0; // filter method
  ihdrData[12] = 0; // interlace method

  const ihdr = writeChunk('IHDR', ihdrData);

  // IDAT data: raw pixels with filter byte (0 for None) prefixing each scanline
  const rowSize = width * 4 + 1; // 4 bytes per pixel + 1 filter byte
  const pixels = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize;
    pixels[rowStart] = 0; // Filter type 0 (None)

    // Add a modern slight gradient from top-left to bottom-right
    for (let x = 0; x < width; x++) {
      const idx = rowStart + 1 + x * 4;
      
      // Calculate a gentle gradient multiplier
      const factor = 1 - 0.25 * ((x / width) + (y / height)) / 2;
      
      pixels[idx] = Math.max(0, Math.min(255, Math.round(r * factor)));
      pixels[idx + 1] = Math.max(0, Math.min(255, Math.round(g * factor)));
      pixels[idx + 2] = Math.max(0, Math.min(255, Math.round(b * factor)));
      pixels[idx + 3] = a;
    }
  }

  const idatData = zlib.deflateSync(pixels);
  const idat = writeChunk('IDAT', idatData);
  const iend = writeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

module.exports = { generatePng };
