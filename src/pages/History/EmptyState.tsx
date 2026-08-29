import { Clock } from "lucide-react"
import { format } from "date-fns"

type EmptyStateProps = {
    selectedDate: Date
}

export function EmptyState({ selectedDate }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
            <Clock className="size-10 text-muted-foreground/40" />
            <p className="mt-4 text-sm text-muted-foreground">
                No timer entries for {format(selectedDate, "MMMM d, yyyy")}
            </p>
        </div>
    )
}