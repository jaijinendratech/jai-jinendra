"use client";

import { Toast } from "@heroui/react";

/** Global HeroUI toast host — mount once in the root layout. */
export function AppToastProvider() {
  return (
    <Toast.Provider
      placement="bottom end"
      /* Drive --toast-width; paired with globals.css for true auto-sizing. */
      width="auto"
      className="jj-toast-region"
    />
  );
}
