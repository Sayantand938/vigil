type StatsSummaryProps = {
    totalSessions: number
    totalDuration: number
    avgDuration: number
    formatDuration: (seconds: number) => string
}

export function StatsSummary({
    totalSessions,
    totalDuration,
    avgDuration,
    formatDuration,
}: StatsSummaryProps) {
    return (
        <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-muted/50 p-4 text-center">
                <div className="text-2xl font-semibold tracking-tight">{totalSessions}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Sessions</div>
            </div>
            <div className="rounded-xl bg-muted/50 p-4 text-center">
                <div className="text-2xl font-semibold tracking-tight">{formatDuration(totalDuration)}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Total Time</div>
            </div>
            <div className="rounded-xl bg-muted/50 p-4 text-center">
                <div className="text-2xl font-semibold tracking-tight">{avgDuration}s</div>
                <div className="text-xs text-muted-foreground mt-0.5">Avg. Duration</div>
            </div>
        </div>
    )
}