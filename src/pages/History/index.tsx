// src/pages/History/index.tsx
import { useState, useEffect, useRef } from "react";
import { useTimer } from "@/context/TimerContext";
import { startOfDay, endOfDay } from "date-fns";
import { HistoryHeader } from "./HistoryHeader";
import { StatsSummary } from "./StatsSummary";
import { EmptyState } from "./EmptyState";
import { HistoryTable } from "./HistoryTable";
import { formatDurationHuman, formatTimeLocale } from "@/lib/utils"; // ✅ imported

export function History() {
    const { entries, loading, fetchEntries } = useTimer();
    const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));

    // Prevent duplicate fetches caused by StrictMode or dependency changes
    const fetchingRef = useRef(false);
    const lastFetchDateRef = useRef<string>("");

    useEffect(() => {
        const start = startOfDay(selectedDate);
        const end = endOfDay(selectedDate);
        const dateKey = start.toISOString();

        // If we're already fetching this exact date, skip
        if (fetchingRef.current && lastFetchDateRef.current === dateKey) {
            console.log("⏭️ History: Skipping duplicate fetch for", dateKey);
            return;
        }

        console.log(`📅 History: Fetching entries for ${selectedDate.toDateString()}`);
        fetchingRef.current = true;
        lastFetchDateRef.current = dateKey;

        fetchEntries(start, end)
            .finally(() => {
                fetchingRef.current = false;
            });

        return () => {
            fetchingRef.current = false;
        };
    }, [selectedDate, fetchEntries]);

    const totalSessions = entries.length;
    const totalDuration = entries.reduce((sum, entry) => sum + entry.duration, 0);
    const avgDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;

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
                formatDuration={formatDurationHuman} // ✅ use imported
            />
            {entries.length === 0 ? (
                <EmptyState selectedDate={selectedDate} />
            ) : (
                <HistoryTable
                    entries={entries}
                    formatTime={formatTimeLocale} // ✅ use imported
                    formatDuration={formatDurationHuman}
                />
            )}
        </div>
    );
}