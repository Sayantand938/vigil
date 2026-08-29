import { useState } from "react"
import { useTimer } from "@/context/TimerContext"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Clock, CalendarIcon } from "lucide-react"
import { format, isSameDay, startOfDay } from "date-fns"

export function History() {
    const { entries } = useTimer()
    const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()))

    const filteredEntries = entries.filter((entry) =>
        isSameDay(entry.startTime, selectedDate)
    )

    const totalSessions = filteredEntries.length
    const totalDuration = filteredEntries.reduce((sum, entry) => sum + entry.duration, 0)

    const formatDuration = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        const parts = []
        if (hrs > 0) parts.push(`${hrs}h`)
        if (mins > 0 || hrs > 0) parts.push(`${mins}m`)
        if (secs > 0 || (hrs === 0 && mins === 0)) parts.push(`${secs}s`)
        return parts.join(" ")
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    const isToday = isSameDay(selectedDate, new Date())

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header with Date Picker */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">History</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {isToday ? "Today's sessions" : format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </p>
                </div>
                <Popover>
                    <PopoverTrigger>
                        <Button variant="outline" className="gap-2 rounded-full px-4">
                            <CalendarIcon className="size-4" />
                            {format(selectedDate, "MMM d, yyyy")}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(startOfDay(date))}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Stats Summary */}
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
                    <div className="text-2xl font-semibold tracking-tight">
                        {totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0}s
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">Avg. Duration</div>
                </div>
            </div>

            {/* Table */}
            {filteredEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
                    <Clock className="size-10 text-muted-foreground/40" />
                    <p className="mt-4 text-sm text-muted-foreground">
                        No timer entries for {format(selectedDate, "MMMM d, yyyy")}
                    </p>
                </div>
            ) : (
                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {filteredEntries.length} session{filteredEntries.length > 1 ? "s" : ""}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">#</TableHead>
                                    <TableHead>Start</TableHead>
                                    <TableHead>End</TableHead>
                                    <TableHead className="text-right">Duration</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEntries.map((entry, index) => (
                                    <TableRow key={entry.id}>
                                        <TableCell className="font-mono text-sm text-muted-foreground">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell>{formatTime(entry.startTime)}</TableCell>
                                        <TableCell>{formatTime(entry.endTime)}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatDuration(entry.duration)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}