export type HabitStatus = "done" | "partial" | "unsure" | "missed";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "unknown";

export type HabitEvent = {
  habit: string;
  status: HabitStatus;
  confidence: number;
  time_of_day: TimeOfDay;
  notes: string;
};

export type Crumb = {
  id: string;
  created_at: string;
  raw_text: string;
  events: HabitEvent[];
};
