#!/usr/bin/env node
import { promises as fsp } from "node:fs";
import path from "node:path";

const USAGE = `Usage: node scripts/to-avif.mjs <file...> [--width N] [--quality N] [--effort N] [--keep]

Converts hero/above-the-fold images to AVIF next to the source file and reports
the size they would add to the HTML once base64-encoded for inlining.

  --width N     resize down to N px wide (aspect kept), default: no resize
  --quality N   AVIF quality 1-100, default 50
  --effort N    encoder effort 0-9, default 9
  --keep        keep the source file (default: keep)`;

function parseArgs(argv) {
  const files = [];
  const options = { quality: 50, effort: 9, width: null };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") return null;
    if (arg === "--keep") continue;
    if (arg === "--width" || arg === "--quality" || arg === "--effort") {
      const value = Number(argv[i + 1]);
      if (!Number.isFinite(value)) {
        throw new Error(`${arg} needs a number`);
      }
      options[arg.slice(2)] = value;
      i += 1;
      continue;
    }
    files.push(arg);
  }

  return { files, options };
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)}KB`;
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));

  if (!parsed || parsed.files.length === 0) {
    console.log(USAGE);
    process.exit(parsed ? 1 : 0);
  }

  const { files, options } = parsed;

  let sharp;
  try {
    ({ default: sharp } = await import("sharp"));
  } catch (error) {
    console.error(
      "Missing dependency: sharp. Install it with:\n  npm i -S sharp",
    );
    console.error(error);
    process.exit(1);
  }

  let failures = 0;

  for (const file of files) {
    const inputPath = path.resolve(process.cwd(), file);
    const outputPath = path.join(
      path.dirname(inputPath),
      `${path.basename(inputPath, path.extname(inputPath))}.avif`,
    );

    try {
      const source = await fsp.stat(inputPath);

      let pipeline = sharp(inputPath);
      if (options.width) {
        pipeline = pipeline.resize({
          width: options.width,
          withoutEnlargement: true,
        });
      }

      await pipeline
        .avif({ quality: options.quality, effort: options.effort })
        .toFile(outputPath);

      const output = await fsp.stat(outputPath);
      const base64Bytes = Math.ceil(output.size / 3) * 4;

      console.log(
        `${path.relative(process.cwd(), inputPath)} ${formatKb(source.size)}` +
          ` → ${path.relative(process.cwd(), outputPath)} ${formatKb(output.size)}` +
          ` (inlined as base64: ${formatKb(base64Bytes)})`,
      );

      if (base64Bytes > 32 * 1024) {
        console.warn(
          `  ! ${formatKb(base64Bytes)} of HTML — lower --quality or --width before inlining this one`,
        );
      }
    } catch (error) {
      failures += 1;
      console.error(`Failed: ${file}\n  ${error?.message || error}`);
    }
  }

  if (failures) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
