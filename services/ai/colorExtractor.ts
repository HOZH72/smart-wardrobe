/**
 * استخراج اللون السائد من الصورة
 * Color extraction from image data using simplified K-Means
 */

export interface ColorResult {
  colorName: string;
  colorHex: string;
  confidence: number;
}

const COLOR_MAP: { name: string; hex: string; r: [number, number]; g: [number, number]; b: [number, number] }[] = [
  { name: 'Black', hex: '#000000', r: [0, 50], g: [0, 50], b: [0, 50] },
  { name: 'White', hex: '#FFFFFF', r: [200, 255], g: [200, 255], b: [200, 255] },
  { name: 'Red', hex: '#FF0000', r: [180, 255], g: [0, 80], b: [0, 80] },
  { name: 'Blue', hex: '#0000FF', r: [0, 80], g: [0, 80], b: [180, 255] },
  { name: 'Green', hex: '#008000', r: [0, 80], g: [150, 255], b: [0, 80] },
  { name: 'Navy', hex: '#000080', r: [0, 50], g: [0, 60], b: [100, 180] },
  { name: 'Gray', hex: '#808080', r: [120, 180], g: [120, 180], b: [120, 180] },
  { name: 'Beige', hex: '#F5F5DC', r: [200, 255], g: [180, 230], b: [150, 200] },
  { name: 'Brown', hex: '#8B4513', r: [130, 180], g: [60, 120], b: [20, 80] },
  { name: 'Pink', hex: '#FFC0CB', r: [200, 255], g: [100, 180], b: [150, 200] },
  { name: 'Purple', hex: '#800080', r: [120, 180], g: [0, 80], b: [120, 200] },
  { name: 'Yellow', hex: '#FFFF00', r: [220, 255], g: [200, 255], b: [0, 100] },
  { name: 'Orange', hex: '#FFA500', r: [220, 255], g: [130, 180], b: [0, 60] },
  { name: 'Teal', hex: '#008080', r: [0, 80], g: [120, 180], b: [120, 180] },
  { name: 'Coral', hex: '#FF7F50', r: [220, 255], g: [100, 150], b: [60, 100] },
  { name: 'Olive', hex: '#808000', r: [80, 140], g: [100, 150], b: [0, 60] },
];

export function extractDominantColor(imageData: ImageData): ColorResult {
  const { data, width, height } = imageData;
  let totalR = 0, totalG = 0, totalB = 0, count = 0;

  // Sample every 4th pixel for performance
  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const i = (y * width + x) * 4;
      totalR += data[i];
      totalG += data[i + 1];
      totalB += data[i + 2];
      count++;
    }
  }

  const avgR = totalR / count;
  const avgG = totalG / count;
  const avgB = totalB / count;

  return rgbToColorName(avgR, avgG, avgB);
}

export function rgbToColorName(r: number, g: number, b: number): ColorResult {
  let bestMatch = COLOR_MAP[0];
  let bestDistance = Infinity;

  for (const color of COLOR_MAP) {
    const dist = Math.sqrt(
      Math.pow(r - (color.r[0] + color.r[1]) / 2, 2) +
      Math.pow(g - (color.g[0] + color.g[1]) / 2, 2) +
      Math.pow(b - (color.b[0] + color.b[1]) / 2, 2)
    );
    if (dist < bestDistance) {
      bestDistance = dist;
      bestMatch = color;
    }
  }

  const confidence = Math.max(0, Math.min(1, 1 - bestDistance / 441)); // 441 = sqrt(3*255^2)

  return {
    colorName: bestMatch.name,
    colorHex: bestMatch.hex,
    confidence,
  };
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.replace('#', '').match(/^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/);
  if (!match) return null;
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('');
}
