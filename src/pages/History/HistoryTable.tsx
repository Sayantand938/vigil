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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { TimerEntry } from "@/context/TimerContext"

type HistoryTableProps = {
    entries: TimerEntry[]
    formatTime: (date: Date) => string
    formatDuration: (seconds: number) => string
}

export function HistoryTable({ entries, formatTime, formatDuration }: HistoryTableProps) {
    const handleEdit = (id: string) => {
        toast.info(`Edit session ${id} (coming soon)`)
    }

    const handleDelete = (id: string) => {
        toast.warning(`Delete session ${id} (coming soon)`)
    }

    return (
        <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {entries.length} session{entries.length > 1 ? "s" : ""}
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
                            <TableHead className="w-10 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {entries.map((entry, index) => (
                            <TableRow key={entry.id}>
                                <TableCell className="font-mono text-sm text-muted-foreground">
                                    {index + 1}
                                </TableCell>
                                <TableCell>{formatTime(entry.startTime)}</TableCell>
                                <TableCell>{formatTime(entry.endTime)}</TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatDuration(entry.duration)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <Button variant="ghost" size="icon" className="size-8">
                                                <MoreHorizontal className="size-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(entry.id)}>
                                                <Pencil className="mr-2 size-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(entry.id)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="mr-2 size-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}