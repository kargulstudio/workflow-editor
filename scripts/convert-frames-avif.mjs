#!/usr/bin/env node
/*
  Recursively find all *-frame.png files under public/, convert to .avif,
  then delete the original .png.
  - Preserves transparency
  - Keeps same dimensions and writes sibling file with .avif extension
*/

import fs from "node:fs";
import { promises as fsp } from "node:fs";
import path from "node:path";

async function fileExists(p) {
  try {
    await fsp.access(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function* walk(dir) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else {
      yield fullPath;
    }
  }
}

function getAvifOptionsFromEnv() {
  const losslessEnv = process.env.AVIF_LOSSLESS;
  const qualityEnv = process.env.AVIF_QUALITY;
  const effortEnv = process.env.AVIF_EFFORT;
  const subsampleEnv = process.env.AVIF_SUBSAMPLE;

  const lossless =
    typeof losslessEnv === "string" ? /^(1|true)$/i.test(losslessEnv) : false;
  const quality = Number.isFinite(Number(qualityEnv)) ? Number(qualityEnv) : 55;
  const effort = Number.isFinite(Number(effortEnv)) ? Number(effortEnv) : 9;
  const chromaSubsampling =
    typeof subsampleEnv === "string" && subsampleEnv.trim()
      ? subsampleEnv
      : "4:2:0";

  return { lossless, quality, effort, chromaSubsampling };
}

async function convertOne(sharp, pngPath) {
  const dir = path.dirname(pngPath);
  const base = path.basename(pngPath, path.extname(pngPath));
  const avifPath = path.join(dir, base + ".avif");

  const options = getAvifOptionsFromEnv();
  await sharp(pngPath).avif(options).toFile(avifPath);

  // Delete the original .png after successful conversion
  await fsp.unlink(pngPath);

  return { pngPath, avifPath };
}

async function main() {
  const projectRoot = process.cwd();
  const publicDir = path.join(projectRoot, "public");

  let sharp;
  try {
    // dynamic import to show friendly error if missing
    ({ default: sharp } = await import("sharp"));
  } catch (error) {
    console.error("Missing dependency: sharp. Install it with:");
    console.error("  npm i -S sharp");
    console.error(error);
    process.exit(1);
  }

  if (!(await fileExists(publicDir))) {
    console.error("Could not find public directory at:", publicDir);
    process.exit(1);
  }

  let converted = 0;
  let deleted = 0;
  const errors = [];

  const opts = getAvifOptionsFromEnv();
  console.log(
    `Using AVIF options => lossless: ${opts.lossless}, quality: ${opts.quality}, effort: ${opts.effort}, chromaSubsampling: ${opts.chromaSubsampling}`,
  );

  for await (const filePath of walk(publicDir)) {
    // Only process files matching *-frame.png
    if (!/-frame\.png$/i.test(filePath)) continue;
    try {
      const { avifPath } = await convertOne(sharp, filePath);
      converted += 1;
      deleted += 1;
      console.log(`  ✓ ${filePath} → ${avifPath} (png deleted)`);
    } catch (e) {
      errors.push({ filePath, error: e });
      console.error(`  ✗ Failed: ${filePath}`);
    }
  }

  console.log(
    `\n-frame.png → AVIF complete. Converted: ${converted}, Deleted PNGs: ${deleted}${errors.length ? `, Errors: ${errors.length}` : ""}`,
  );
  if (errors.length) {
    for (const { filePath, error } of errors) {
      console.error("Failed:", filePath, "\n", error?.message || error);
    }
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
