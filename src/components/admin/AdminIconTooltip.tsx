"use client";

import type { ReactElement, ReactNode } from "react";
import { Tooltip } from "@heroui/react";

/**
 * HeroUI Tooltip expects the trigger as a direct child (not Tooltip.Trigger wrapping
 * another pressable), otherwise React Aria logs PressResponder warnings.
 */
export function AdminIconTooltip({
  label,
  children,
  placement = "top",
}: {
  label: string;
  children: ReactElement;
  placement?: "top" | "bottom" | "left" | "right";
}) {
  return (
    <Tooltip delay={0}>
      {children}
      <Tooltip.Content showArrow placement={placement}>
        <Tooltip.Arrow />
        <p>{label}</p>
      </Tooltip.Content>
    </Tooltip>
  );
}

/** Prefer this when the child cannot be a Tooltip trigger (forms, selects, etc.). */
export function AdminNativeTitle({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <span title={label} className="inline-flex">
      {children}
    </span>
  );
}
