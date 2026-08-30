// src/pages/History/types.ts
import type { TimerEntry } from "@/store/timerStore"; // <-- CHANGED

export type HistoryProps = {
    entries: TimerEntry[];
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
};