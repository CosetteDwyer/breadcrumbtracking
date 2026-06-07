import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { parseCrumb } from "@/lib/breadcrumb.functions";
import { useCrumbs } from "@/hooks/use-crumbs";
import { ForestBackdrop } from "@/components/ForestBackdrop";
import { BottomNav } from "@/components/BottomNav";
import { CrumbCard } from "@/components/CrumbCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Crumb } from "@/lib/breadcrumb-types";

export const Route = createFileRoute("/_authenticated/journal")({
  head: () => ({ meta: [{ title: "Journal — Breadcrumb" }] }),
  component: JournalPage,
});

function isToday(iso: string) {
  const d = new Date(iso);
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
}

function JournalPage() {
  const { user } = useRouteContext({ from: "/_authenticated" });
  const { crumbs, addCrumb } = useCrumbs(user.id);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const parse = useServerFn(parseCrumb);

  const todaysCrumbs = crumbs.filter((c) => isToday(c.created_at));

  async function drop() {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    setPending(true);
    try {
      const events = await parse({ data: { text: trimmed } });
      const crumb: Crumb = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        raw_text: trimmed,
        events,
      };
      addCrumb(crumb);
      setText("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lost in the woods for a moment — try again");
    } finally {
      setPending(false);
    }
  }

  return (
    <ForestBackdrop>
      <div className="mx-auto flex min-h-screen max-w-xl flex-col px-4 pt-10">
        <header className="mb-6">
          <h1 className="font-display text-3xl text-foreground">today</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </header>

        <div className="soft-card rounded-3xl p-5">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Just type what happened — messy is fine."
            rows={5}
            className="resize-none border-0 bg-transparent p-0 text-base leading-relaxed shadow-none focus-visible:ring-0"
          />
          <div className="mt-4 flex justify-end">
            <Button
              onClick={drop}
              disabled={pending || !text.trim()}
              className="rounded-full bg-primary px-5 text-primary-foreground hover:opacity-90"
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  following the crumbs...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  drop a crumb
                </>
              )}
            </Button>
          </div>
        </div>

        <section className="mt-8 flex-1 space-y-3 pb-6">
          {todaysCrumbs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/50 p-8 text-center">
              <p className="text-sm italic text-muted-foreground">
                you haven't dropped any crumbs today
              </p>
            </div>
          ) : (
            todaysCrumbs.flatMap((c) =>
              c.events.map((ev, i) => <CrumbCard key={`${c.id}-${i}`} event={ev} />),
            )
          )}
        </section>

        <BottomNav />
      </div>
    </ForestBackdrop>
  );
}
