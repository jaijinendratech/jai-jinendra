import sharp from "sharp";

const path = "public/images/thali-plate.png";
const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;

const get = (x, y) => {
  const i = (Math.round(y) * width + Math.round(x)) * 4;
  return { r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] };
};

const isWhite = (p) => p.a > 200 && p.r > 235 && p.g > 235 && p.b > 235;
const isBowlInterior = (p) => {
  if (p.a < 128) return false;
  const { r, g, b } = p;
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  return lum > 140 && lum < 235 && r > g && g > b * 0.85;
};

const quadrants = [
  { name: "slot1", x0: 0, x1: width / 2, y0: 0, y1: height / 2 },
  { name: "slot2", x0: width / 2, x1: width, y0: 0, y1: height / 2 },
  { name: "slot3", x0: 0, x1: width / 2, y0: height / 2, y1: height },
  { name: "slot4", x0: width / 2, x1: width, y0: height / 2, y1: height },
];

for (const q of quadrants) {
  let sumX = 0;
  let sumY = 0;
  let count = 0;
  for (let y = Math.floor(q.y0); y < Math.floor(q.y1); y++) {
    for (let x = Math.floor(q.x0); x < Math.floor(q.x1); x++) {
      if (isWhite(get(x, y))) {
        sumX += x;
        sumY += y;
        count++;
      }
    }
  }
  const cx = sumX / count;
  const cy = sumY / count;

  let maxRWhite = 0;
  let maxRInterior = 0;
  for (let a = 0; a < 360; a += 2) {
    const rad = (a * Math.PI) / 180;
    for (let r = 1; r < 120; r++) {
      const x = cx + r * Math.cos(rad);
      const y = cy + r * Math.sin(rad);
      if (x < 0 || x >= width || y < 0 || y >= height) break;
      const p = get(x, y);
      if (isWhite(p)) maxRWhite = Math.max(maxRWhite, r);
      if (isBowlInterior(p) || isWhite(p)) maxRInterior = Math.max(maxRInterior, r);
      else if (maxRInterior > 20) break;
    }
  }

  const diamWhite = maxRWhite * 2;
  const diamInterior = maxRInterior * 2;

  console.log(
    JSON.stringify({
      slot: q.name,
      centerPct: {
        x: Math.round((cx / width) * 1000) / 10,
        y: Math.round((cy / height) * 1000) / 10,
      },
      diamWhitePx: Math.round(diamWhite),
      diamWhitePct: Math.round((diamWhite / width) * 1000) / 10,
      diamInteriorPx: Math.round(diamInterior),
      diamInteriorPct: Math.round((diamInterior / width) * 1000) / 10,
    })
  );
}
