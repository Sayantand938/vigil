// src/pages/Dashboard/LastSessionCard.tsx
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Play } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { formatDurationHuman } from "@/lib/utils";
import type { TimerEntry } from "@/context/TimerContext";

type LastSessionCardProps = {
    entries: TimerEntry[];
};

export function LastSessionCard({ entries }: LastSessionCardProps) {
    const navigate = useNavigate();

    // No entries at all
    if (entries.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Last Session</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex h-20 flex-col items-center justify-center text-muted-foreground">
                        <Clock className="mb-2 size-6 opacity-40" />
                        <p className="text-sm">No sessions yet</p>
                        <Button
                            variant="link"
                            className="mt-1 text-xs"
                            onClick={() => navigate("/timer")}
                        >
                            Start your first session
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Check for a currently running session (end_time = null and stopped_at = null)
    const runningSession = entries.find(
        (e) => e.end_time === null && e.stopped_at === null
    );

    if (runningSession) {
        // User is currently studying
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-green-500/20 p-2">
                            <Play className="size-4 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Currently studying</p>
                            <p className="text-xs text-muted-foreground">
                                Started {formatDistanceToNow(new Date(runningSession.start_time), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // No running session – find the latest completed session
    const completedEntries = entries.filter((e) => e.end_time !== null);
    if (completedEntries.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Last Session</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex h-20 flex-col items-center justify-center text-muted-foreground">
                        <Clock className="mb-2 size-6 opacity-40" />
                        <p className="text-sm">No completed sessions yet</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const latest = completedEntries.reduce((a, b) =>
        a.end_time! > b.end_time! ? a : b
    );
    const endTime = new Date(latest.end_time!);
    const timeAgo = formatDistanceToNow(endTime, { addSuffix: true });
    const duration = latest.elapsed_time;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Last Session</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-muted p-2">
                        <Clock className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">Ended {timeAgo}</p>
                        <p className="text-xs text-muted-foreground">
                            Duration: {formatDurationHuman(duration)}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}