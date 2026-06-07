import { useCallback, useEffect, useState } from "react";
import type { Crumb } from "@/lib/breadcrumb-types";

function keyFor(userId: string | null | undefined) {
  return userId ? `breadcrumb:crumbs:${userId}` : null;
}

function read(userId: string | null | undefined): Crumb[] {
  if (typeof window === "undefined") return [];
  const k = keyFor(userId);
  if (!k) return [];
  try {
    const raw = window.localStorage.getItem(k);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Crumb[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useCrumbs(userId: string | null | undefined) {
  const [crumbs, setCrumbs] = useState<Crumb[]>(() => read(userId));

  useEffect(() => {
    setCrumbs(read(userId));
  }, [userId]);

  const persist = useCallback(
    (next: Crumb[]) => {
      const k = keyFor(userId);
      if (!k) return;
      window.localStorage.setItem(k, JSON.stringify(next));
      setCrumbs(next);
    },
    [userId],
  );

  const addCrumb = useCallback(
    (crumb: Crumb) => {
      const next = [crumb, ...read(userId)];
      persist(next);
    },
    [userId, persist],
  );

  return { crumbs, addCrumb };
}
