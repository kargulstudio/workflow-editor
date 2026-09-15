import AssetFrame from "./asset-frame";
import AssetImage from "./asset-image";
import AssetLottie from "./asset-lottie";
import AssetRive from "./asset-rive";
import AssetVideo from "./asset-video";
import type { AssetProps } from "./asset-types";

function AssetMedia(props: AssetProps) {
  switch (props.type) {
    case "video":
      return <AssetVideo {...props} />;
    case "rive":
      return <AssetRive {...props} />;
    case "lottie":
      return <AssetLottie {...props} />;
    default:
      return <AssetImage {...props} />;
  }
}

function Asset(props: AssetProps) {
  return (
    <AssetFrame
      width={props.width}
      height={props.height}
      className={props.className}
    >
      <AssetMedia {...props} />
    </AssetFrame>
  );
}

export default Asset;
