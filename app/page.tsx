import Editor from "@/components/home/editor/editor";
import { SITE_DESCRIPTION, SITE_NAME, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: `Workflow · ${SITE_NAME}`,
  description: SITE_DESCRIPTION,
  path: "/",
});

export default function Home() {
  return (
    <main className="min-h-screen max-w-full overflow-x-clip">
      <Editor />
    </main>
  );
}
