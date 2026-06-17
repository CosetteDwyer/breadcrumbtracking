import { useCallback, useEffect, useState } from "react";

export type Theme = "dawn" | "dusk";

const NAME_KEY = "breadcrumb:name";
const THEME_KEY = "breadcrumb:theme";

function readName(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(NAME_KEY) ?? "";
}

function readTheme(): Theme {
  if (typeof window === "undefined") return "dusk";
  const v = window.localStorage.getItem(THEME_KEY);
  return v === "dawn" ? "dawn" : "dusk";
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dawn") root.classList.add("dawn");
  else root.classList.remove("dawn");
}

export function useDisplayName() {
  const [name, setName] = useState<string>(() => readName());
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === NAME_KEY) setName(readName());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const save = useCallback((next: string) => {
    window.localStorage.setItem(NAME_KEY, next);
    setName(next);
  }, []);
  return { name, setName: save };
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => readTheme());
  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);
  return { theme, setTheme: setThemeState };
}
