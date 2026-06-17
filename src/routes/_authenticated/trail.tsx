import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { readTrail } from "@/lib/breadcrumb.functions";
import { useCrumbs } from "@/hooks/use-crumbs";
import { ForestBackdrop } from "@/components/ForestBackdrop";
import { BottomNav } from "@/components/BottomNav";
import { CrumbCard } from "@/components/CrumbCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Wand2, Leaf, Search, X } from "lucide-react";
import { toast } from "sonner";
import type { Crumb, HabitEvent } from "@/lib/breadcrumb-types";

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

function weekRecapText(events: HabitEvent[], uniqueDays: number) {
  if (events.length === 0) {
    return "Not enough crumbs yet to look back on — give it a few more days.";
  }

  const timeCounts: Record<HabitEvent["time_of_day"], number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    unknown: 0,
  };
  for (const ev of events) {
    timeCounts[ev.time_of_day]++;
  }

  const timeParts = [
    timeCounts.morning > 0
      ? `${timeCounts.morning} morning${timeCounts.morning === 1 ? "" : "s"}`
      : null,
    timeCounts.afternoon > 0
      ? `${timeCounts.afternoon} afternoon${timeCounts.afternoon === 1 ? "" : "s"}`
      : null,
    timeCounts.evening > 0
      ? `${timeCounts.evening} evening${timeCounts.evening === 1 ? "" : "s"}`
      : null,
  ].filter(Boolean);

  const crumbWord = events.length === 1 ? "crumb" : "crumbs";
  const dayWord = uniqueDays === 1 ? "day" : "days";

  if (timeParts.length > 0) {
    return `You dropped ${events.length} ${crumbWord} across ${uniqueDays} ${dayWord} this week — ${timeParts.join(", ")}. A good stretch of trail-leaving.`;
  }

  return `You dropped ${events.length} ${crumbWord} across ${uniqueDays} ${dayWord} this week. A good stretch of trail-leaving.`;
}

function WeekRecap({ events, uniqueDays }: { events: HabitEvent[]; uniqueDays: number }) {
  return (
    <div className="soft-card rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--ember)]/10">
          <Leaf className="h-4 w-4 text-[color:var(--glow)]" />
        </div>
        <div>
          <h2 className="font-display text-base text-[color:var(--glow)]">
            This week on the trail
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-foreground/80">
            {weekRecapText(events, uniqueDays)}
          </p>
        </div>
      </div>
    </div>
  );
}
function matchesQuery(crumb: Crumb, event: HabitEvent, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    event.habit.toLowerCase().includes(q) ||
    event.notes.toLowerCase().includes(q) ||
    crumb.raw_text.toLowerCase().includes(q)
  );
}

function TrailPage() {
  const { user } = useRouteContext({ from: "/_authenticated" });
  const { crumbs } = useCrumbs(user.id);
  const [insight, setInsight] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [query, setQuery] = useState("");
  const ask = useServerFn(readTrail);
  const isSearching = query.trim().length > 0;

  // Past 7 days recap
  const weekEvents = useMemo(() => {
    const cutoff = Date.now() - 7 * 86400000;
    const recent = crumbs.filter((c) => new Date(c.created_at).getTime() >= cutoff);
    const events = recent.flatMap((c) => c.events);
    const uniqueDays = new Set(recent.map((c) => new Date(c.created_at).toDateString())).size;
    return { events, uniqueDays };
  }, [crumbs]);

  // group by day, filtering down to matching events when searching
  const byDay = crumbs.reduce<Record<string, { crumb: Crumb; events: HabitEvent[] }[]>>(
    (acc, c) => {
      const matchingEvents = isSearching
        ? c.events.filter((ev) => matchesQuery(c, ev, query))
        : c.events;
      if (matchingEvents.length === 0) return acc;
      const key = new Date(c.created_at).toDateString();
      (acc[key] ||= []).push({ crumb: c, events: matchingEvents });
      return acc;
    },
    {},
  );
  const days = Object.entries(byDay).sort(
    ([a], [b]) => new Date(b).getTime() - new Date(a).getTime(),
  );
  const totalMatches = days.reduce(
    (sum, [, entries]) => sum + entries.reduce((s, e) => s + e.events.length, 0),
    0,
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
      toast.error(
        err instanceof Error ? err.message : "Lost in the woods for a moment — try again",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <ForestBackdrop>
      <div className="mx-auto flex min-h-screen max-w-xl flex-col px-4 pt-10">
        <header className="mb-6">
          <h1 className="font-display text-3xl text-foreground">The trail</h1>
          <p className="mt-1 text-sm text-muted-foreground">Every crumb you've dropped so far</p>
        </header>

        <div className="relative mb-6">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your crumbs… try “breakfast”"
            className="rounded-full pl-9 pr-9"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {isSearching ? (
          <p className="-mt-4 mb-4 text-xs text-muted-foreground">
            {totalMatches === 0
              ? `No crumbs match "${query.trim()}"`
              : `${totalMatches} crumb${totalMatches === 1 ? "" : "s"} match "${query.trim()}"`}
          </p>
        ) : null}

        {!isSearching ? (
          <WeekRecap events={weekEvents.events} uniqueDays={weekEvents.uniqueDays} />
        ) : null}

        {!isSearching ? (
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
        ) : null}

        {!isSearching && insight ? (
          <div className="soft-card ember-glow mt-6 rounded-3xl p-6">
            <h2 className="font-display text-lg text-[color:var(--glow)]">
              What the forest is telling you
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
                {isSearching
                  ? "No crumbs match that search — try a different word"
                  : "The trail is just beginning — keep dropping crumbs"}
              </p>
            </div>
          ) : (
            days.map(([day, dayEntries]) => (
              <div key={day}>
                <h3 className="mb-3 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
                  <span>{dayLabel(dayEntries[0].crumb.created_at)}</span>
                  <span className="h-px flex-1 bg-border/40" />
                </h3>
                <div className="space-y-3">
                  {dayEntries.flatMap(({ crumb, events }) =>
                    events.map((ev, i) => <CrumbCard key={`${crumb.id}-${i}`} event={ev} />),
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
