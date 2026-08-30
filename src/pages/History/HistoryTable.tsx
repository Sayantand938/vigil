// src/pages/History/HistoryTable.tsx
import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { TimerEntry } from "@/context/TimerContext";
import { useTimer } from "@/context/TimerContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type HistoryTableProps = {
    entries: TimerEntry[];
    formatTime: (date: Date | string) => string;
    formatDuration: (seconds: number) => string;
};

export function HistoryTable({ entries, formatTime, formatDuration }: HistoryTableProps) {
    const { deleteEntry, updateEntry } = useTimer();
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimerEntry | null>(null);
    const [editStart, setEditStart] = useState("");
    const [editEnd, setEditEnd] = useState("");
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleEdit = (entry: TimerEntry) => {
        setEditingEntry(entry);
        const startTime = entry.start_time;
        const endTime = entry.end_time;
        const startStr = format(new Date(startTime), "yyyy-MM-dd'T'HH:mm");
        const endStr = endTime ? format(new Date(endTime), "yyyy-MM-dd'T'HH:mm") : "";
        setEditStart(startStr);
        setEditEnd(endStr);
        setEditDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this entry?")) {
            setIsDeleting(id);
            try {
                await deleteEntry(id);
                toast.success("Entry deleted");
            } catch (error) {
                toast.error("Failed to delete entry");
            } finally {
                setIsDeleting(null);
            }
        }
    };

    const handleSaveEdit = async () => {
        if (!editingEntry) return;

        const startDate = new Date(editStart);
        const endDate = new Date(editEnd);

        // Basic validation
        if (isNaN(startDate.getTime())) {
            toast.error("Invalid start time");
            return;
        }
        if (isNaN(endDate.getTime())) {
            toast.error("Invalid end time");
            return;
        }
        if (endDate <= startDate) {
            toast.error("End time must be after start time");
            return;
        }

        // Duration
        const duration = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
        if (duration <= 0) {
            toast.error("Duration must be positive");
            return;
        }

        // ---- Overlap check ----
        const overlapping = entries.some((e) => {
            // Skip the session we're editing
            if (e.id === editingEntry.id) return false;
            // Only consider completed sessions (with end_time)
            if (!e.end_time) return false;
            const eStart = new Date(e.start_time);
            const eEnd = new Date(e.end_time);
            // Overlap if the new interval intersects the existing one
            return startDate < eEnd && endDate > eStart;
        });

        if (overlapping) {
            toast.error("This session overlaps with another existing session. Please adjust the times.");
            return;
        }

        // ---- Proceed with update ----
        setIsUpdating(true);
        try {
            await updateEntry(editingEntry.id, {
                start_time: startDate.toISOString(),
                end_time: endDate.toISOString(),
                elapsed_time: duration,
            });
            toast.success("Entry updated");
            setEditDialogOpen(false);
            setEditingEntry(null);
        } catch (error) {
            toast.error("Failed to update entry");
        } finally {
            setIsUpdating(false);
        }
    };

    const computedDuration = (() => {
        if (!editStart || !editEnd) return null;
        const start = new Date(editStart);
        const end = new Date(editEnd);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
        const diff = Math.floor((end.getTime() - start.getTime()) / 1000);
        if (diff <= 0) return null;
        return formatDuration(diff);
    })();

    return (
        <>
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
                                    <TableCell>{formatTime(entry.start_time)}</TableCell>
                                    <TableCell>
                                        {entry.end_time ? formatTime(entry.end_time) : "—"}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatDuration(entry.elapsed_time || 0)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger
                                                className={cn(
                                                    buttonVariants({ variant: "ghost", size: "icon" }),
                                                    "size-8"
                                                )}
                                                aria-label="Open actions menu"
                                            >
                                                <MoreHorizontal className="size-4" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(entry)} disabled={isUpdating}>
                                                    <Pencil className="mr-2 size-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(entry.id)}
                                                    className="text-destructive focus:text-destructive"
                                                    disabled={isDeleting === entry.id}
                                                >
                                                    <Trash2 className="mr-2 size-4" />
                                                    {isDeleting === entry.id ? "Deleting..." : "Delete"}
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

            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Session</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-start" className="text-right">
                                Start
                            </Label>
                            <Input
                                id="edit-start"
                                type="datetime-local"
                                value={editStart}
                                onChange={(e) => setEditStart(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-end" className="text-right">
                                End
                            </Label>
                            <Input
                                id="edit-end"
                                type="datetime-local"
                                value={editEnd}
                                onChange={(e) => setEditEnd(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        {computedDuration && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right text-muted-foreground">
                                    Duration
                                </Label>
                                <div className="col-span-3 text-sm font-mono">
                                    {computedDuration}
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isUpdating}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit} disabled={isUpdating}>
                            {isUpdating ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}