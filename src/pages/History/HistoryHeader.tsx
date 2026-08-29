import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format, isSameDay, startOfDay } from "date-fns"

type HistoryHeaderProps = {
    selectedDate: Date
    setSelectedDate: (date: Date) => void
}

export function HistoryHeader({ selectedDate, setSelectedDate }: HistoryHeaderProps) {
    const isToday = isSameDay(selectedDate, new Date())

    return (
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
    )
}