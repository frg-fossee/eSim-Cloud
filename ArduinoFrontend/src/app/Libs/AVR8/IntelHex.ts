/**
 * PART OF AVR8js (Minimal Hex Parser)
 * To Understand Proper Working visit
 * https://en.wikipedia.org/wiki/Intel_HEX
 * @param source String Hex
 * @param target Program memory
 */
export function parseHex(source: string, target: Uint8Array) {
  // Split By Lines
  for (const line of source.split('\n')) {
    if (line[0] === ':' && line.substr(7, 2) === '00') {
      const bytes = parseInt(line.substr(1, 2), 16);
      const addr = parseInt(line.substr(3, 4), 16);
      for (let i = 0; i < bytes; i++) {
        target[addr + i] = parseInt(line.substr(9 + i * 2, 2), 16);
      }
    }
  }
}
