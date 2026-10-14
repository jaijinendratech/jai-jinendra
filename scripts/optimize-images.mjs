#!/usr/bin/env node
/**
 * Re-encode raster images in public/ in place (same path and format), so
 * references in code, the database, emails, and the invoice PDF stay valid.
 *
 *   npm run optimize-images            # write changes
 *   npm run optimize-images -- --dry   # report only
 *
 * A file is only replaced when the result is at least MIN_SAVING smaller.
 * PNGs are palette-quantised (like pngquant/TinyPNG); JPEGs use mozjpeg.
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// sharp's file cache keeps inputs open, which blocks in-place writes on Windows.
sharp.cache(false);

const ROOT = path.resolve("public");
const DRY = process.argv.includes("--dry");
const MIN_SAVING = 0.1;

/** Largest rendered size (incl. 2x DPR) is far below the source for these. */
const MAX_WIDTH = {
  "brand/logo.png": 1200,
  "brand/logo-namkeens.png": 1200,
  "brand/logo-mark.png": 256,
  "brand/product-placeholder.png": 800,
  "brand/swiggy-zomato-rating.png": 1040,
};
const DEFAULT_MAX_WIDTH = 2048;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((e) => {
      const full = path.join(dir, e.name);
      return e.isDirectory() ? walk(full) : [full];
    }),
  );
  return files.flat();
}

async function encode(file, rel) {
  const ext = path.extname(file).toLowerCase();
  const meta = await sharp(file).metadata();
  const maxWidth = MAX_WIDTH[rel] ?? DEFAULT_MAX_WIDTH;
  const needsResize = (meta.width ?? 0) > maxWidth;
  // Re-quantising an already-palette PNG only compounds loss on every run.
  if (ext === ".png" && meta.isPalette && !needsResize) return null;
  let pipeline = sharp(file);
  if (needsResize) {
    pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
  }
  if (ext === ".png") {
    return pipeline
      .png({ palette: true, quality: 82, effort: 10, compressionLevel: 9 })
      .toBuffer({ resolveWithObject: true });
  }
  return pipeline
    .jpeg({ quality: 80, mozjpeg: true, progressive: true })
    .toBuffer({ resolveWithObject: true });
}

const files = (await walk(ROOT)).filter((f) => /\.(png|jpe?g)$/i.test(f));
let before = 0;
let after = 0;

for (const file of files) {
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  const original = (await fs.stat(file)).size;
  before += original;
  const result = await encode(file, rel);
  if (!result) {
    after += original;
    continue;
  }
  const { data, info } = result;
  const saving = 1 - data.length / original;
  if (saving < MIN_SAVING) {
    after += original;
    continue;
  }
  after += data.length;
  console.log(
    `${rel}: ${(original / 1024).toFixed(0)} KB -> ${(data.length / 1024).toFixed(0)} KB` +
      ` (${info.width}x${info.height}, -${Math.round(saving * 100)}%)`,
  );
  if (!DRY) await fs.writeFile(file, data);
}

console.log(
  `\nTotal: ${(before / 1048576).toFixed(2)} MB -> ${(after / 1048576).toFixed(2)} MB${DRY ? " (dry run)" : ""}`,
);
