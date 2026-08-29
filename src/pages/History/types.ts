import type { TimerEntry } from "@/context/TimerContext"

export type HistoryProps = {
    entries: TimerEntry[]
    selectedDate: Date
    setSelectedDate: (date: Date) => void
}