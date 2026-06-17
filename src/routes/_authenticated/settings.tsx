import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ForestBackdrop } from "@/components/ForestBackdrop";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDisplayName, useTheme } from "@/hooks/use-settings";
import { Sun, Moon, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Breadcrumb" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { name, setName } = useDisplayName();
  const { theme, setTheme } = useTheme();
  const [draft, setDraft] = useState(name);
  const [saved, setSaved] = useState(false);

  function save() {
    setName(draft.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <ForestBackdrop>
      <div className="mx-auto flex min-h-screen max-w-xl flex-col px-4 pt-10">
        <header className="mb-6">
          <h1 className="font-display text-3xl text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tend to the little corners of your trail
          </p>
        </header>

        <div className="soft-card rounded-3xl p-6">
          <label className="font-display text-lg text-foreground">
            What should the forest call you?
          </label>
          <p className="mt-1 text-xs text-muted-foreground">
            A name, a nickname, a feeling — whatever fits today.
          </p>
          <div className="mt-4 flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Your name"
              className="rounded-full"
              maxLength={40}
            />
            <Button
              onClick={save}
              disabled={draft.trim() === name}
              className="rounded-full bg-primary text-primary-foreground hover:opacity-90"
            >
              {saved ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Saved
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>

        <div className="soft-card mt-6 rounded-3xl p-6">
          <h2 className="font-display text-lg text-foreground">Time of day</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Walk the woods at dawn or at dusk.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => setTheme("dawn")}
              className={`flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-colors ${
                theme === "dawn"
                  ? "border-primary/60 bg-accent/60"
                  : "border-border/50 hover:bg-accent/30"
              }`}
            >
              <Sun className="h-5 w-5 text-[color:var(--glow)]" />
              <span className="font-display text-base text-foreground">Dawn</span>
              <span className="text-xs text-muted-foreground">Forest at morning light</span>
            </button>
            <button
              onClick={() => setTheme("dusk")}
              className={`flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-colors ${
                theme === "dusk"
                  ? "border-primary/60 bg-accent/60"
                  : "border-border/50 hover:bg-accent/30"
              }`}
            >
              <Moon className="h-5 w-5 text-[color:var(--glow)]" />
              <span className="font-display text-base text-foreground">Dusk</span>
              <span className="text-xs text-muted-foreground">Forest at last light</span>
            </button>
          </div>
        </div>

        <div className="flex-1" />
        <BottomNav />
      </div>
    </ForestBackdrop>
  );
}
