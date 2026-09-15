#!/usr/bin/env node
import { promises as fsp } from "node:fs";
import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import os from "node:os";

const USAGE = `Usage: node scripts/rive-frame.mjs <file.riv...> [--width N] [--quality N] [--state-machine NAME] [--artboard NAME] [--png]

Renders the first frame of a .riv file with the Rive runtime in headless Chrome
and writes <name>-frame.avif next to the source.

  --width N           output width in px, default 2400 (height from the artboard)
  --quality N         AVIF quality 1-100, default 45
  --state-machine S   state machine to instance (kept paused on frame 0)
  --artboard A        artboard name, default the file's default artboard
  --png               also keep the intermediate PNG`;

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9411;
const DEBUG_PORT = 9412;

function parseArgs(argv) {
  const files = [];
  const options = {
    width: 2400,
    quality: 45,
    stateMachine: null,
    artboard: null,
    png: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") return null;
    if (arg === "--png") {
      options.png = true;
      continue;
    }
    if (arg === "--width" || arg === "--quality") {
      options[arg.slice(2)] = Number(argv[(i += 1)]);
      continue;
    }
    if (arg === "--state-machine") {
      options.stateMachine = argv[(i += 1)];
      continue;
    }
    if (arg === "--artboard") {
      options.artboard = argv[(i += 1)];
      continue;
    }
    files.push(arg);
  }
  return { files, options };
}

const MIME = {
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".wasm": "application/wasm",
  ".riv": "application/octet-stream",
  ".html": "text/html",
};

function serve(root) {
  const server = http.createServer(async (req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    const filePath = path.join(root, url);
    if (!filePath.startsWith(root)) {
      res.writeHead(403).end();
      return;
    }
    try {
      const body = await fsp.readFile(filePath);
      res.writeHead(200, {
        "content-type": MIME[path.extname(filePath)] ?? "application/octet-stream",
      });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

async function launchChrome(profileDir) {
  const chrome = spawn(CHROME, [
    "--headless=new",
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${profileDir}`,
    "--window-size=1024,1024",
    "--no-first-run",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "about:blank",
  ]);
  chrome.stdout.resume();
  chrome.stderr.resume();

  for (let i = 0; i < 100; i += 1) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`)).json();
      const page = targets.find((t) => t.type === "page");
      if (page) return { chrome, wsUrl: page.webSocketDebuggerUrl };
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("Chrome did not expose a debugging target");
}

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  const pending = new Map();
  let id = 0;
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    const entry = pending.get(message.id);
    if (!entry) return;
    pending.delete(message.id);
    if (message.error) entry.reject(new Error(message.error.message));
    else entry.resolve(message.result);
  });
  const ready = new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve);
    ws.addEventListener("error", reject);
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      id += 1;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  return { ready, send, close: () => ws.close() };
}

const PAGE_SCRIPT = (config) => `(async () => {
  const config = ${JSON.stringify(config)};
  document.body.style.margin = "0";
  const canvas = document.createElement("canvas");
  canvas.width = config.width;
  canvas.height = config.height;
  document.body.appendChild(canvas);

  rive.RuntimeLoader.setWasmUrl(config.wasmUrl);

  const dataUrl = await new Promise((resolve, reject) => {
    const instance = new rive.Rive({
      src: config.src,
      canvas,
      autoplay: false,
      artboard: config.artboard ?? undefined,
      stateMachines: config.stateMachine ?? undefined,
      layout: new rive.Layout({ fit: rive.Fit.Contain, alignment: rive.Alignment.Center }),
      onLoad: () => {
        instance.stop();
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve(canvas.toDataURL("image/png")));
        });
      },
      onLoadError: (error) => reject(new Error(String(error))),
    });
  });

  return dataUrl;
})()`;

async function riveBounds(send, config) {
  const { result } = await send("Runtime.evaluate", {
    expression: `(async () => {
      rive.RuntimeLoader.setWasmUrl(${JSON.stringify(config.wasmUrl)});
      const canvas = document.createElement("canvas");
      canvas.width = 8; canvas.height = 8;
      return await new Promise((resolve, reject) => {
        const instance = new rive.Rive({
          src: ${JSON.stringify(config.src)},
          canvas,
          autoplay: false,
          artboard: ${JSON.stringify(config.artboard)} ?? undefined,
          onLoad: () => resolve({ width: instance.bounds.maxX, height: instance.bounds.maxY }),
          onLoadError: (error) => reject(new Error(String(error))),
        });
      });
    })()`,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.subtype === "error") throw new Error(result.description);
  return result.value;
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (!parsed || parsed.files.length === 0) {
    console.log(USAGE);
    process.exit(parsed ? 1 : 0);
  }
  const { files, options } = parsed;
  const { default: sharp } = await import("sharp");

  const root = process.cwd();
  const server = await serve(root);
  const profileDir = await fsp.mkdtemp(path.join(os.tmpdir(), "rive-frame-"));
  const { chrome, wsUrl } = await launchChrome(profileDir);
  const cdp = connect(wsUrl);
  await cdp.ready;
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");

  try {
    for (const file of files) {
      const inputPath = path.resolve(root, file);
      const src = `http://127.0.0.1:${PORT}/${path.relative(root, inputPath)}`;
      const wasmUrl = `http://127.0.0.1:${PORT}/node_modules/@rive-app/canvas/rive.wasm`;

      await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/scripts/rive-frame.html` });
      await new Promise((r) => setTimeout(r, 400));

      const bounds = await riveBounds(cdp.send, { src, wasmUrl, artboard: options.artboard });
      const width = Math.round(options.width);
      const height = Math.round((options.width * bounds.height) / bounds.width);

      const { result } = await cdp.send("Runtime.evaluate", {
        expression: PAGE_SCRIPT({
          src,
          wasmUrl,
          width,
          height,
          artboard: options.artboard,
          stateMachine: options.stateMachine,
        }),
        awaitPromise: true,
        returnByValue: true,
      });
      if (result.subtype === "error") throw new Error(result.description);

      const png = Buffer.from(result.value.split(",")[1], "base64");
      const base = path.basename(inputPath, path.extname(inputPath));
      const avifPath = path.join(path.dirname(inputPath), `${base}-frame.avif`);
      if (options.png) {
        await fsp.writeFile(path.join(path.dirname(inputPath), `${base}-frame.png`), png);
      }
      await sharp(png)
        .avif({ quality: options.quality, effort: 6, chromaSubsampling: "4:4:4" })
        .toFile(avifPath);
      const { size } = await fsp.stat(avifPath);
      console.log(
        `${path.relative(root, avifPath)}  ${width}x${height}  ${(size / 1024).toFixed(1)}KB`,
      );
    }
  } finally {
    cdp.close();
    chrome.kill();
    server.close();
    await fsp.rm(profileDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
