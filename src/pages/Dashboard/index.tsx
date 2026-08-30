// src/pages/Dashboard/index.tsx
import { useEffect, useMemo, useState } from "react";
import { useTimer } from "@/context/TimerContext";
import { computeStats } from "./stats";
import { StatsCards } from "./StatsCards";
import { ProductivityCards } from "./ProductivityCards";
import { LastSessionCard } from "./LastSessionCard";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDurationHuman } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const DEFAULT_DAYS_LIMIT = 30;

export function Dashboard() {
    const { entries, loading, fetchEntries, settings, fetchSettings, fetchLifetimeStats } = useTimer();
    const [lifetimeStats, setLifetimeStats] = useState<{
        totalTime: number;
        totalSessions: number;
        avgDuration: number;
    } | null>(null);
    const [loadingLifetime, setLoadingLifetime] = useState(true);
    const [lifetimeError, setLifetimeError] = useState<string | null>(null);

    const stats = useMemo(() => {
        const dailyGoal = settings?.daily_goal_minutes || 0;
        return computeStats(entries, dailyGoal);
    }, [entries, settings]);

    useEffect(() => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - DEFAULT_DAYS_LIMIT);
        fetchEntries(startDate);
        fetchSettings();

        // Fetch lifetime stats
        setLoadingLifetime(true);
        setLifetimeError(null);
        fetchLifetimeStats()
            .then(setLifetimeStats)
            .catch((err) => {
                console.error("Failed to fetch lifetime stats:", err);
                setLifetimeError("Unable to load lifetime stats. Please try again later.");
                setLifetimeStats({ totalTime: 0, totalSessions: 0, avgDuration: 0 });
            })
            .finally(() => setLoadingLifetime(false));
    }, [fetchEntries, fetchSettings, fetchLifetimeStats]);

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

            {/* Stats Cards (last 30 days) */}
            <StatsCards stats={stats} hasEntries={hasEntries} />
            {hasEntries && <ProductivityCards stats={stats} />}
            <LastSessionCard entries={entries} />

            {/* Lifetime Stats */}
            <div>
                <h2 className="text-lg font-semibold tracking-tight mb-2">Lifetime</h2>
                {lifetimeError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{lifetimeError}</AlertDescription>
                    </Alert>
                )}
                <div className="grid gap-4 sm:grid-cols-3">
                    {loadingLifetime ? (
                        // Skeleton loading
                        <>
                            <Card>
                                <CardHeader className="pb-2">
                                    <Skeleton className="h-4 w-24" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-8 w-24" />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <Skeleton className="h-4 w-24" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-8 w-16" />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <Skeleton className="h-4 w-24" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-8 w-24" />
                                </CardContent>
                            </Card>
                        </>
                    ) : lifetimeStats && lifetimeStats.totalSessions > 0 ? (
                        // Show data
                        <>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Total Time
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {formatDurationHuman(lifetimeStats.totalTime)}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Total Sessions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {lifetimeStats.totalSessions}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Avg Duration
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {formatDurationHuman(Math.round(lifetimeStats.avgDuration))}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        // No sessions yet
                        <Card className="col-span-3">
                            <CardContent className="pt-6 text-center text-muted-foreground">
                                <p>No sessions recorded yet – start your first timer!</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}