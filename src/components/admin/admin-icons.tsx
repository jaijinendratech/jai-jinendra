"use client";

import type { IconType } from "react-icons";
import {
  LuArrowLeft,
  LuCheck,
  LuCopy,
  LuEye,
  LuEyeOff,
  LuPencil,
  LuPlus,
  LuRefreshCw,
  LuSave,
  LuTrash2,
  LuX,
} from "react-icons/lu";

export const adminIconMap = {
  plus: LuPlus,
  save: LuSave,
  x: LuX,
  check: LuCheck,
  refresh: LuRefreshCw,
  "arrow-left": LuArrowLeft,
  trash: LuTrash2,
  pencil: LuPencil,
  copy: LuCopy,
  eye: LuEye,
  "eye-off": LuEyeOff,
} as const satisfies Record<string, IconType>;

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
