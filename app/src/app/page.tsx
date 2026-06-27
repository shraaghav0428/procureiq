"use client";

import { Header } from "@/components/header/header";
import { LeftPanel } from "@/components/left-panel/left-panel";
import { CenterPanel } from "@/components/center-panel/center-panel";
import { RightPanel } from "@/components/right-panel/right-panel";

export default function Home() {
  return (
    <div className="h-full flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <LeftPanel />
        <CenterPanel />
        <RightPanel />
      </div>
    </div>
  );
}
