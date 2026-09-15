import { preconnect, preload } from "react-dom";
import rivePackage from "@rive-app/canvas/package.json";
import { runWhenIdle } from "./asset-activation";

const RIVE_ORIGIN = "https://unpkg.com";
const RIVE_WASM_URL = `${RIVE_ORIGIN}/@rive-app/canvas@${rivePackage.version}/rive.wasm`;
const MOUNT_IDLE_TIMEOUT_MS = 300;
const MOUNT_RELEASE_TIMEOUT_MS = 3000;

type Release = () => void;
type Mount = (release: Release) => void;

const files = new Map<string, Promise<ArrayBuffer>>();
const mountQueue: Mount[] = [];
let runtime: Promise<unknown> | null = null;
let mounting = false;

export function loadRiveFile(src: string, priority: RequestPriority = "auto") {
  const cached = files.get(src);
  if (cached) return cached;

  const pending = fetch(src, { priority }).then((response) => {
    if (!response.ok) throw new Error(`${response.status} ${src}`);
    return response.arrayBuffer();
  });
  pending.catch(() => files.delete(src));
  files.set(src, pending);
  return pending;
}

export function warmRiveRuntime() {
  if (!runtime) {
    preconnect(RIVE_ORIGIN, { crossOrigin: "anonymous" });
    preload(RIVE_WASM_URL, {
      as: "fetch",
      crossOrigin: "anonymous",
      fetchPriority: "high",
    });
    runtime = import("@rive-app/react-canvas")
      .then(({ RuntimeLoader }) => RuntimeLoader.awaitInstance())
      .catch(() => undefined);
  }
  return runtime;
}

function drainMounts() {
  if (mounting) return;
  const next = mountQueue.shift();
  if (!next) return;
  mounting = true;

  let released = false;
  let timer: number | undefined;
  const release = () => {
    if (released) return;
    released = true;
    window.clearTimeout(timer);
    mounting = false;
    drainMounts();
  };

  (runtime ?? Promise.resolve()).then(() =>
    runWhenIdle(() => {
      timer = window.setTimeout(release, MOUNT_RELEASE_TIMEOUT_MS);
      try {
        next(release);
      } catch {
        release();
      }
    }, MOUNT_IDLE_TIMEOUT_MS),
  );
}

export function scheduleRiveMount(mount: Mount) {
  mountQueue.push(mount);
  drainMounts();
  return () => {
    const index = mountQueue.indexOf(mount);
    if (index >= 0) mountQueue.splice(index, 1);
  };
}
