import { useTimer } from "@/context/TimerContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function History() {
    const { entries } = useTimer()

    // Filter for today's entries
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayEntries = entries.filter((entry) => {
        const entryDate = new Date(entry.startTime)
        entryDate.setHours(0, 0, 0, 0)
        return entryDate.getTime() === today.getTime()
    })

    const formatDuration = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        const parts = []
        if (hrs > 0) parts.push(`${hrs}h`)
        if (mins > 0 || hrs > 0) parts.push(`${mins}m`)
        parts.push(`${secs}s`)
        return parts.join(" ")
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">History</h1>
                <Badge variant="outline">Today</Badge>
            </div>

            {todayEntries.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        No timer entries for today.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {todayEntries.map((entry, index) => {
                        const sl = index + 1
                        return (
                            <Card key={entry.id}>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Session #{sl}
                                    </CardTitle>
                                    <Badge variant="secondary">{formatDuration(entry.duration)}</Badge>
                                </CardHeader>
                                <CardContent className="grid grid-cols-3 gap-2 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Start</span>
                                        <p className="font-mono">{formatTime(entry.startTime)}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">End</span>
                                        <p className="font-mono">{formatTime(entry.endTime)}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Duration</span>
                                        <p className="font-mono">{formatDuration(entry.duration)}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}