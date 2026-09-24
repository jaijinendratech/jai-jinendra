"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

const STORAGE_KEY = "jj-wishlist";

type Listener = () => void;

let memoryIds: string[] = [];
const listeners = new Set<Listener>();

function readStorage(): string[] {
  if (typeof window === "undefined") return memoryIds;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function writeStorage(ids: string[]) {
  memoryIds = ids;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return memoryIds;
}

/** Stable empty array — React requires getServerSnapshot to return a cached value. */
const EMPTY_IDS: string[] = [];

function getServerSnapshot() {
  return EMPTY_IDS;
}

function ensureHydrated() {
  if (typeof window === "undefined") return;
  memoryIds = readStorage();
}

export function useWishlist() {
  const [hydrated, setHydrated] = useState(false);
  const ids = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    ensureHydrated();
    memoryIds = readStorage();
    listeners.forEach((l) => l());
    setHydrated(true);
  }, []);

  const has = useCallback(
    (productId: string) => ids.includes(productId),
    [ids],
  );

  const toggle = useCallback((productId: string) => {
    ensureHydrated();
    const current = readStorage();
    const next = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];
    writeStorage(next);
    return next.includes(productId);
  }, []);

  return { ids, has, toggle, hydrated };
}
