import { cn } from "@/lib/utils";
import type { HabitEvent } from "@/lib/breadcrumb-types";

const STATUS_LABEL: Record<HabitEvent["status"], string> = {
  done: "done",
  partial: "a little",
  unsure: "not sure",
  missed: "didn't happen",
};

const STATUS_STYLES: Record<HabitEvent["status"], string> = {
  done: "bg-[color:var(--ember)]/15 text-[color:var(--glow)] border-[color:var(--ember)]/30",
  partial: "bg-[color:var(--ember)]/8 text-[color:var(--glow)]/80 border-[color:var(--ember)]/20",
  unsure: "bg-[color:var(--moss)]/10 text-[color:var(--moss)] border-[color:var(--moss)]/25",
  missed: "bg-muted text-muted-foreground border-border",
};

const TIME_LABEL: Record<HabitEvent["time_of_day"], string> = {
  morning: "morning",
  afternoon: "afternoon",
  evening: "evening",
  unknown: "sometime",
};

export function CrumbCard({ event }: { event: HabitEvent }) {
  return (
    <div className="soft-card rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg leading-snug text-foreground">{event.habit}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {TIME_LABEL[event.time_of_day]} · {event.confidence}% sure
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-3 py-1 text-xs font-medium",
            STATUS_STYLES[event.status],
          )}
        >
          {STATUS_LABEL[event.status]}
        </span>
      </div>
      {event.notes ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{event.notes}</p>
      ) : null}
    </div>
  );
}
