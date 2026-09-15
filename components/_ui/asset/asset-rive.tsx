"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import AssetPoster from "./asset-poster";
import AssetRiveBoundary from "./asset-rive-boundary";
import { assetMediaClass } from "./asset-frame";
import {
  useAfterLcp,
  useHasScrolled,
  useIdleAfterLcp,
  useInViewport,
  useNearViewport,
  useOnScreen,
} from "./asset-activation";
import {
  loadRiveFile,
  scheduleRiveMount,
  warmRiveRuntime,
} from "./asset-rive-loader";
import type { AssetRiveProps } from "./asset-types";

const AssetRiveCanvas = dynamic(() => import("./asset-rive-canvas"), {
  ssr: false,
});

function AssetRive({
  src,
  poster,
  alt,
  fit,
  mediaClassName,
  artboard,
  animations,
  stateMachines,
  autoplay = true,
  priority = false,
}: AssetRiveProps) {
  const [loaded, setLoaded] = useState(false);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [mounted, setMounted] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const releaseRef = useRef<() => void>(() => {});
  const afterLcp = useAfterLcp();
  const idle = useIdleAfterLcp();
  const scrolled = useHasScrolled();
  const inView = useInViewport(sentinelRef);
  const near = useNearViewport(sentinelRef);
  const onScreen = useOnScreen(sentinelRef);
  const ready = priority || afterLcp;
  const urgent = priority || inView;
  const visible = priority || inView || (near && scrolled) || idle;

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const runtime = warmRiveRuntime();
    const load = (priority: RequestPriority) =>
      loadRiveFile(src, priority)
        .then((data) => {
          if (!cancelled) setBuffer(data);
        })
        .catch(() => {});
    if (urgent) load("auto");
    else runtime.then(() => load("low"));
    return () => {
      cancelled = true;
    };
  }, [ready, urgent, src]);

  useEffect(() => {
    if (!buffer || !visible) return;
    const cancel = scheduleRiveMount((release) => {
      releaseRef.current = release;
      setMounted(true);
    });
    return () => {
      cancel();
      releaseRef.current();
    };
  }, [buffer, visible]);

  return (
    <>
      <div ref={sentinelRef} className="pointer-events-none absolute inset-0" />
      <AssetPoster src={poster} alt={alt} fit={fit} visible={!loaded} />
      {mounted && buffer ? (
        <AssetRiveBoundary>
          <AssetRiveCanvas
            buffer={buffer}
            fit={fit}
            artboard={artboard}
            animations={animations}
            stateMachines={stateMachines}
            autoplay={autoplay}
            active={onScreen}
            onLoad={() => {
              setLoaded(true);
              releaseRef.current();
            }}
            className={assetMediaClass(fit, mediaClassName)}
          />
        </AssetRiveBoundary>
      ) : null}
    </>
  );
}

export default AssetRive;
