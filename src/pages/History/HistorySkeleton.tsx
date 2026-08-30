// src/pages/History/HistorySkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

export function HistorySkeleton() {
    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="mt-1 h-4 w-48" />
                </div>
                <Skeleton className="h-9 w-32 rounded-full" />
            </div>

            {/* Stats Summary (3 pills) */}
            <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-xl bg-muted/50 p-4 text-center">
                        <Skeleton className="mx-auto h-7 w-16" />
                        <Skeleton className="mx-auto mt-1 h-3 w-20" />
                    </div>
                ))}
            </div>

            {/* Table skeleton */}
            <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableBody>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-16" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="ml-auto size-7 rounded-full" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}