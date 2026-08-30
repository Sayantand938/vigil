// src/pages/Dashboard/ProductivityCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, CalendarRange } from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatDurationHuman } from "@/lib/utils";
import type { DashboardStats } from "./types";

type ProductivityCardsProps = {
    stats: DashboardStats;
};

export function ProductivityCards({ stats }: ProductivityCardsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Most Productive Day</CardTitle>
                    <Award className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {stats.mostProductiveDay ? (
                        <>
                            <div className="text-lg font-semibold">
                                {format(parseISO(stats.mostProductiveDay.date), "MMM d, yyyy")}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {formatDurationHuman(stats.mostProductiveDay.total)} over {stats.mostProductiveDay.count} sessions
                            </p>
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">No data</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Least Productive Day</CardTitle>
                    <CalendarRange className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {stats.leastProductiveDay ? (
                        <>
                            <div className="text-lg font-semibold">
                                {format(parseISO(stats.leastProductiveDay.date), "MMM d, yyyy")}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {formatDurationHuman(stats.leastProductiveDay.total)} over {stats.leastProductiveDay.count} sessions
                            </p>
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">No data</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}