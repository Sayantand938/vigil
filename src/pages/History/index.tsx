import { useState, useEffect, useRef } from "react";
import { useTimer } from "@/context/TimerContext";
import { startOfDay, endOfDay } from "date-fns";
import { HistoryHeader } from "./HistoryHeader";
import { StatsSummary } from "./StatsSummary";
import { EmptyState } from "./EmptyState";
import { HistoryTable } from "./HistoryTable";

export function History() {
    const { entries, loading, fetchEntries } = useTimer();
    const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            console.log("⏳ History: First render, using initial fetch from provider");
            return;
        }
        const start = startOfDay(selectedDate);
        const end = endOfDay(selectedDate);
        console.log(`📅 History: Fetching entries for ${selectedDate.toDateString()}`);
        fetchEntries(start, end);
    }, [selectedDate, fetchEntries]);

    const totalSessions = entries.length;
    const totalDuration = entries.reduce((sum, entry) => sum + entry.duration, 0);
    const avgDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;

    const formatDuration = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        const parts = [];
        if (hrs > 0) parts.push(`${hrs}h`);
        if (mins > 0 || hrs > 0) parts.push(`${mins}m`);
        if (secs > 0 || (hrs === 0 && mins === 0)) parts.push(`${secs}s`);
        return parts.join(" ");
    };

    const formatTime = (date: Date | string) => {
        const d = typeof date === "string" ? new Date(date) : date;
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading history...</div>
            </div>
        );
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
            {entries.length === 0 ? (
                <EmptyState selectedDate={selectedDate} />
            ) : (
                <HistoryTable
                    entries={entries}
                    formatTime={formatTime}
                    formatDuration={formatDuration}
                />
            )}
        </div>
    );
}