"use client";

import dynamic from "next/dynamic";

const Board = dynamic(() => import("@/components/Board"), { ssr: false });

export default function Home() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <header className="border-b-2 border-accent bg-navy px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight text-white">Kanban</h1>
      </header>
      <Board />
    </div>
  );
}
