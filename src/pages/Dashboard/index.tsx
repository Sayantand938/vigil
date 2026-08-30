// src/pages/Dashboard/index.tsx
import { useEffect, useMemo } from "react";
import { useTimer } from "@/context/TimerContext";
import { computeStats } from "./stats";
import { StatsCards } from "./StatsCards";
import { ProductivityCards } from "./ProductivityCards";
import { LastSessionCard } from "./LastSessionCard";
import { DashboardSkeleton } from "./DashboardSkeleton";

const DEFAULT_DAYS_LIMIT = 30;

export function Dashboard() {
    const { entries, loading, fetchEntries, settings, fetchSettings } = useTimer();

    const stats = useMemo(() => {
        const dailyGoal = settings?.daily_goal_minutes || 0;
        return computeStats(entries, dailyGoal);
    }, [entries, settings]);

    useEffect(() => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - DEFAULT_DAYS_LIMIT);
        fetchEntries(startDate);
        fetchSettings();
    }, [fetchEntries, fetchSettings]);

    if (loading) return <DashboardSkeleton />;

    const hasEntries = entries.length > 0;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                    Your productivity overview at a glance.
                </p>
            </div>
            <StatsCards stats={stats} hasEntries={hasEntries} />
            {hasEntries && <ProductivityCards stats={stats} />}
            <LastSessionCard entries={entries} />
        </div>
    );
}