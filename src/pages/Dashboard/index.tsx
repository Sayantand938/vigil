// src/pages/Dashboard/index.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTimer } from "@/context/TimerContext";
import { startOfDay, endOfDay } from "date-fns";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { TimerIcon, TrendingUp, Clock, CalendarDays } from "lucide-react";
import { formatDurationHuman, formatTimeLocale } from "@/lib/utils";

function GoalProgress({ achieved, goal }: { achieved: number; goal: number }) {
    const progress = goal > 0 ? Math.min((achieved / goal) * 100, 100) : 0;
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <Card className="border-0 bg-muted/20 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center p-4">
                <div className="relative size-28">
                    <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                            className="stroke-muted"
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            strokeWidth="6"
                        />
                        <circle
                            className="stroke-primary transition-all duration-700 ease-out"
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-semibold tabular-nums leading-none">
                            {achieved}m
                        </span>
                        <span className="text-xs text-muted-foreground">
                            / {goal}m
                        </span>
                    </div>
                </div>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                    Daily Goal
                </p>
                {progress >= 100 && (
                    <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                        🎉 Achieved!
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

export function Dashboard() {
    const navigate = useNavigate();
    const { entries, loading, fetchEntries, settings, fetchSettings } = useTimer();
    const [todayEntries, setTodayEntries] = useState<typeof entries>([]);

    useEffect(() => {
        const today = new Date();
        const start = startOfDay(today);
        const end = endOfDay(today);
        fetchEntries(start, end);
        fetchSettings();
    }, [fetchEntries, fetchSettings]);

    useEffect(() => {
        const today = new Date();
        const start = startOfDay(today);
        const end = endOfDay(today);
        const filtered = entries.filter((entry) => {
            const entryDate = new Date(entry.start_time);
            return entryDate >= start && entryDate <= end;
        });
        setTodayEntries(filtered);
    }, [entries]);

    const totalSessions = todayEntries.length;
    const totalDuration = todayEntries.reduce((sum, e) => sum + (e.elapsed_time || 0), 0);
    const avgDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;

    const todayMinutes = Math.round(totalDuration / 60);
    const dailyGoal = settings?.daily_goal_minutes || 0;

    const recentEntries = todayEntries.slice(0, 10);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-muted-foreground">Loading dashboard…</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header – without Start Timer button */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                    Here's your productivity overview for today.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Time</CardTitle>
                        <Clock className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatDurationHuman(totalDuration)}
                        </div>
                        <p className="text-xs text-muted-foreground">Today's focused time</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sessions</CardTitle>
                        <CalendarDays className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSessions}</div>
                        <p className="text-xs text-muted-foreground">
                            {totalSessions === 0 ? "No sessions yet" : "Completed today"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
                        <TrendingUp className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {avgDuration > 0 ? formatDurationHuman(avgDuration) : "—"}
                        </div>
                        <p className="text-xs text-muted-foreground">Per session</p>
                    </CardContent>
                </Card>
            </div>

            {dailyGoal > 0 && (
                <div className="flex justify-center">
                    <GoalProgress achieved={todayMinutes} goal={dailyGoal} />
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Recent Sessions</CardTitle>
                    <CardDescription>
                        {totalSessions === 0
                            ? "You haven't logged any sessions today. Start the timer to begin tracking."
                            : `Showing the most recent ${Math.min(recentEntries.length, 10)} session${recentEntries.length > 1 ? "s" : ""} today`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {totalSessions === 0 ? (
                        <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
                            <TimerIcon className="mb-2 size-8 opacity-40" />
                            <p className="text-sm">No sessions recorded today</p>
                            <Button
                                variant="link"
                                className="mt-2"
                                onClick={() => navigate("/timer")}
                            >
                                Start your first session
                            </Button>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Start Time</TableHead>
                                        <TableHead className="text-right">Duration</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentEntries.map((entry) => (
                                        <TableRow key={entry.id}>
                                            <TableCell>{formatTimeLocale(entry.start_time)}</TableCell>
                                            <TableCell className="text-right font-mono">
                                                {formatDurationHuman(entry.elapsed_time || 0)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}