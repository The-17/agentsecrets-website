import { Suspense } from "react";
import Nav from "@/components/nav";
import DocsPage from "@/components/docs/docs-page";

export default function DocsRoutePage() {
  return (
    <>
      <div className="grid-bg" style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }} />
      <Nav page="docs" />
      <Suspense>
        <DocsPage />
      </Suspense>
    </>
  );
}
