import { inlineAsset } from "@/lib/inline-asset";
import EditorApp from "./editor-app";

export default function Editor() {
  return (
    <section
      id="editor"
      className="relative z-0 flex h-dvh min-h-[560px] bg-[#0c0c0f]"
    >
      <EditorApp
        avatarSrc={inlineAsset("/assets/images/_common/avatar.avif")}
        textureSrc="/assets/images/home/editor/overview/card-texture.avif"
      />
    </section>
  );
}
