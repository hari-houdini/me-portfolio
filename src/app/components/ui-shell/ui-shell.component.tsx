"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const FluidCursor = dynamic(
  () =>
    import("@/app/ui/cursor/fluid/fluid.component").then((m) => ({
      default: m.default,
    })),
  { ssr: false },
);

export default function UIShell() {
  return (
    <Suspense fallback={null}>
      <FluidCursor />
    </Suspense>
  );
}
