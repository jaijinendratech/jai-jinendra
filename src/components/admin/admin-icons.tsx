"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Check,
  Copy,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Truck,
  X,
} from "lucide-react";

export const adminIconMap = {
  plus: Plus,
  save: Save,
  x: X,
  check: Check,
  refresh: RefreshCw,
  "arrow-left": ArrowLeft,
  trash: Trash2,
  pencil: Pencil,
  copy: Copy,
  eye: Eye,
  "eye-off": EyeOff,
  truck: Truck,
} as const satisfies Record<string, LucideIcon>;

export type AdminIconName = keyof typeof adminIconMap;

export function AdminIcon({
  name,
  className = "h-4 w-4",
}: {
  name: AdminIconName;
  className?: string;
}) {
  const Icon = adminIconMap[name];
  return <Icon className={className} aria-hidden />;
}
