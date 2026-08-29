import { useState } from "react"
import { useTimer } from "@/context/TimerContext"
import { startOfDay, isSameDay } from "date-fns"
import { HistoryHeader } from "./HistoryHeader"
import { StatsSummary } from "./StatsSummary"
import { EmptyState } from "./EmptyState"
import { HistoryTable } from "./HistoryTable"

export function History() {
    const { entries } = useTimer()
    const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()))

    const filteredEntries = entries.filter((entry) =>
        isSameDay(entry.startTime, selectedDate)
    )

    const totalSessions = filteredEntries.length
    const totalDuration = filteredEntries.reduce((sum, entry) => sum + entry.duration, 0)
    const avgDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0

    const formatDuration = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        const parts = []
        if (hrs > 0) parts.push(`${hrs}h`)
        if (mins > 0 || hrs > 0) parts.push(`${mins}m`)
        if (secs > 0 || (hrs === 0 && mins === 0)) parts.push(`${secs}s`)
        return parts.join(" ")
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <HistoryHeader selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
            <StatsSummary
                totalSessions={totalSessions}
                totalDuration={totalDuration}
                avgDuration={avgDuration}
                formatDuration={formatDuration}
            />
            {filteredEntries.length === 0 ? (
                <EmptyState selectedDate={selectedDate} />
            ) : (
                <HistoryTable
                    entries={filteredEntries}
                    formatTime={formatTime}
                    formatDuration={formatDuration}
                />
            )}
        </div>
    )
}