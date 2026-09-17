"use client";

import type { ReactNode } from "react";
import { Tooltip } from "@heroui/react";

export function AdminIconTooltip({
  label,
  children,
  placement = "top",
}: {
  label: string;
  children: ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
}) {
  return (
    <Tooltip delay={0}>
      <Tooltip.Trigger aria-label={label}>{children}</Tooltip.Trigger>
      <Tooltip.Content showArrow placement={placement}>
        <Tooltip.Arrow />
        <p>{label}</p>
      </Tooltip.Content>
    </Tooltip>
  );
}
