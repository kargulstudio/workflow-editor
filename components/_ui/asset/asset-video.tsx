import Video from "@/components/_ui/video";
import { assetMediaClass } from "./asset-frame";
import type { AssetVideoProps } from "./asset-types";

function AssetVideo({
  src,
  mobileSrc,
  poster,
  stillPoster,
  fit,
  mediaClassName,
}: AssetVideoProps) {
  return (
    <Video
      src={src}
      mobileSrc={mobileSrc}
      poster={poster}
      stillPoster={stillPoster}
      className={assetMediaClass(fit, mediaClassName)}
    />
  );
}

export default AssetVideo;
