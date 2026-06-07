import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { readTrail } from "@/lib/breadcrumb.functions";
import { useCrumbs } from "@/hooks/use-crumbs";
import { ForestBackdrop } from "@/components/ForestBackdrop";
import { BottomNav } from "@/components/BottomNav";
import { CrumbCard } from "@/components/CrumbCard";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/trail")({
  head: () => ({ meta: [{ title: "Trail — Breadcrumb" }] }),
  component: TrailPage,
});

function dayLabel(iso: string) {
  const d = new Date(iso);
  const n = new Date();
  const diff = Math.floor((n.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

function TrailPage() {
  const { user } = useRouteContext({ from: "/_authenticated" });
  const { crumbs } = useCrumbs(user.id);
  const [insight, setInsight] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const ask = useServerFn(readTrail);

  // group by day
  const byDay = crumbs.reduce<Record<string, typeof crumbs>>((acc, c) => {
    const key = new Date(c.created_at).toDateString();
    (acc[key] ||= []).push(c);
    return acc;
  }, {});
  const days = Object.entries(byDay).sort(
    ([a], [b]) => new Date(b).getTime() - new Date(a).getTime(),
  );

  async function checkTrail() {
    if (pending) return;
    const cutoff = Date.now() - 14 * 86400000;
    const recent = crumbs
      .filter((c) => new Date(c.created_at).getTime() >= cutoff)
      .map((c) => ({ created_at: c.created_at, events: c.events }));

    if (recent.length === 0) {
      setInsight("The trail is just beginning — keep dropping crumbs");
      return;
    }

    setPending(true);
    try {
      const text = await ask({ data: { crumbs: recent } });
      setInsight(text);
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
          <h1 className="font-display text-3xl text-foreground">The trail</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every crumb you've dropped so far
          </p>
        </header>

        <Button
          onClick={checkTrail}
          disabled={pending}
          className="h-11 rounded-full bg-primary text-primary-foreground hover:opacity-90"
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Following the crumbs...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              What does my trail look like?
            </>
          )}
        </Button>

        {insight ? (
          <div className="soft-card ember-glow mt-6 rounded-3xl p-6">
            <h2 className="font-display text-lg text-[color:var(--glow)]">
              what the forest is telling you
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {insight}
            </p>
          </div>
        ) : null}

        <section className="mt-8 flex-1 space-y-8 pb-6">
          {days.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/50 p-10 text-center">
              <p className="text-sm italic text-muted-foreground">
                the trail is just beginning — keep dropping crumbs
              </p>
            </div>
          ) : (
            days.map(([day, dayCrumbs]) => (
              <div key={day}>
                <h3 className="mb-3 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
                  <span>{dayLabel(dayCrumbs[0].created_at)}</span>
                  <span className="h-px flex-1 bg-border/40" />
                </h3>
                <div className="space-y-3">
                  {dayCrumbs.flatMap((c) =>
                    c.events.map((ev, i) => <CrumbCard key={`${c.id}-${i}`} event={ev} />),
                  )}
                </div>
              </div>
            ))
          )}
        </section>

        <BottomNav />
      </div>
    </ForestBackdrop>
  );
}
