// src/pages/History/index.tsx
import { useState, useEffect, useRef } from "react";
import { useTimer } from "@/context/TimerContext";
import { startOfDay, endOfDay } from "date-fns";
import { HistoryHeader } from "./HistoryHeader";
import { StatsSummary } from "./StatsSummary";
import { EmptyState } from "./EmptyState";
import { HistoryTable } from "./HistoryTable";
import { formatDurationHuman, formatTimeLocale } from "@/lib/utils";

export function History() {
    const { entries, loading, fetchEntries } = useTimer();
    const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));

    const fetchingRef = useRef(false);
    const lastFetchDateRef = useRef<string>("");

    useEffect(() => {
        const start = startOfDay(selectedDate);
        const end = endOfDay(selectedDate);
        const dateKey = start.toISOString();

        if (fetchingRef.current && lastFetchDateRef.current === dateKey) {
            return;
        }

        fetchingRef.current = true;
        lastFetchDateRef.current = dateKey;

        fetchEntries(start, end).finally(() => {
            fetchingRef.current = false;
        });

        return () => {
            fetchingRef.current = false;
        };
    }, [selectedDate, fetchEntries]);

    const totalSessions = entries.length;
    const totalDuration = entries.reduce((sum, entry) => sum + (entry.elapsed_time || 0), 0);
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
                formatDuration={formatDurationHuman}
            />
            {entries.length === 0 ? (
                <EmptyState selectedDate={selectedDate} />
            ) : (
                <HistoryTable
                    entries={entries}
                    formatTime={formatTimeLocale}
                    formatDuration={formatDurationHuman}
                />
            )}
        </div>
    );
}