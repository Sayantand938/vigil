// src/pages/Dashboard/StatsCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, TrendingUp, Target, Flame } from "lucide-react";
import { formatDurationHuman } from "@/lib/utils";
import type { DashboardStats } from "./types";

type StatsCardsProps = {
    stats: DashboardStats;
    hasEntries: boolean;
};

export function StatsCards({ stats, hasEntries }: StatsCardsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Time</CardTitle>
                    <Clock className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {formatDurationHuman(stats.totalTime)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {stats.totalSessions} sessions
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
                    <TrendingUp className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {stats.avgSessionDuration > 0
                            ? formatDurationHuman(stats.avgSessionDuration)
                            : "—"}
                    </div>
                    <p className="text-xs text-muted-foreground">Per session</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Goal Achievement</CardTitle>
                    <Target className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {hasEntries ? `${Math.round(stats.goalAchievementRatio)}%` : "—"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {stats.daysGoalAchieved} / {stats.daysUsed} days
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                    <Flame className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {stats.currentStreak > 0 ? `${stats.currentStreak} days` : "—"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Consecutive days goal met
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}