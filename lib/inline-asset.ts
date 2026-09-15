import { readFileSync } from "node:fs";
import path from "node:path";

const MIME_TYPES: Record<string, string> = {
  avif: "image/avif",
  webp: "image/webp",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
};

const WARN_BYTES = 24 * 1024;

const cache = new Map<string, string>();

export function inlineAsset(publicPath: string) {
  const key = publicPath.startsWith("/") ? publicPath : `/${publicPath}`;

  const cached = cache.get(key);
  if (cached) return cached;

  const extension = path.extname(key).slice(1).toLowerCase();
  const mimeType = MIME_TYPES[extension];

  if (!mimeType) {
    throw new Error(
      `inlineAsset: unsupported file type ".${extension}" (${key})`,
    );
  }

  const file = readFileSync(path.join(process.cwd(), "public", key));

  if (file.byteLength > WARN_BYTES) {
    console.warn(
      `inlineAsset: ${key} is ${Math.round(file.byteLength / 1024)}KB before base64 — inline above-the-fold assets only`,
    );
  }

  const dataUri = `data:${mimeType};base64,${file.toString("base64")}`;
  cache.set(key, dataUri);

  return dataUri;
}
