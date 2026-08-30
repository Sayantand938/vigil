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

type HistoryTableProps = {
    entries: TimerEntry[];
    formatTime: (date: Date | string) => string;
    formatDuration: (seconds: number) => string;
};

export function HistoryTable({ entries, formatTime, formatDuration }: HistoryTableProps) {
    const { deleteEntry, updateEntry } = useTimer();
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimerEntry | null>(null);
    const [editDuration, setEditDuration] = useState("");

    const handleEdit = (entry: TimerEntry) => {
        setEditingEntry(entry);
        setEditDuration(String(entry.elapsed_time || 0));
        setEditDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this entry?")) {
            try {
                await deleteEntry(id);
                toast.success("Entry deleted");
            } catch (error) {
                toast.error("Failed to delete entry");
            }
        }
    };

    const handleSaveEdit = async () => {
        if (!editingEntry) return;
        const newDuration = parseInt(editDuration);
        if (isNaN(newDuration) || newDuration <= 0) {
            toast.error("Please enter a valid duration in seconds");
            return;
        }
        try {
            await updateEntry(editingEntry.id, { elapsed_time: newDuration });
            toast.success("Entry updated");
            setEditDialogOpen(false);
            setEditingEntry(null);
        } catch (error) {
            toast.error("Failed to update entry");
        }
    };

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
                                            >
                                                <MoreHorizontal className="size-4" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(entry)}>
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

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Duration</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="duration" className="text-right">
                                Duration (seconds)
                            </Label>
                            <Input
                                id="duration"
                                type="number"
                                value={editDuration}
                                onChange={(e) => setEditDuration(e.target.value)}
                                className="col-span-3"
                                min={1}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}