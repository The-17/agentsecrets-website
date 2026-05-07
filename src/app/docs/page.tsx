import { Suspense } from "react";
import Nav from "@/components/nav";
import DocsPage from "@/components/docs/docs-page";

export default function DocsRoutePage() {
  return (
    <>
      <div className="grid-bg" style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }} />
      <div className="blob" style={{ position: "absolute", width: 500, height: 500, top: -80, left: "20%", background: "rgba(0,255,135,0.04)", borderRadius: "50%", filter: "blur(80px)", zIndex: 0, pointerEvents: "none" }} />
      <div className="blob" style={{ position: "absolute", width: 380, height: 380, top: "40%", right: -80, background: "rgba(255,184,0,0.03)", borderRadius: "50%", filter: "blur(60px)", zIndex: 0, pointerEvents: "none" }} />
      <Nav page="docs" />
      <Suspense>
        <DocsPage />
      </Suspense>
    </>
  );
}
