// src/pages/Dashboard/index.tsx
import { useEffect, useMemo } from "react";
import { useTimer } from "@/context/TimerContext";
import { computeStats } from "./stats";
import { StatsCards } from "./StatsCards";
import { ProductivityCards } from "./ProductivityCards";
import { LastSessionCard } from "./LastSessionCard";

export function Dashboard() {
    const { entries, loading, fetchEntries, settings, fetchSettings } = useTimer();

    const stats = useMemo(() => {
        const dailyGoal = settings?.daily_goal_minutes || 0;
        return computeStats(entries, dailyGoal);
    }, [entries, settings]);

    useEffect(() => {
        fetchEntries(); // all entries
        fetchSettings();
    }, [fetchEntries, fetchSettings]);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-muted-foreground">Loading dashboard…</div>
            </div>
        );
    }

    const hasEntries = entries.length > 0;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                    Your productivity overview at a glance.
                </p>
            </div>

            {/* Stats Cards */}
            <StatsCards stats={stats} hasEntries={hasEntries} />

            {/* Productivity Cards */}
            {hasEntries && <ProductivityCards stats={stats} />}

            {/* Last Session Card – replaces Today's Sessions */}
            <LastSessionCard entries={entries} />
        </div>
    );
}