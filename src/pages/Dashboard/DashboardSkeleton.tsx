// src/pages/Dashboard/DashboardSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="mt-1 h-4 w-64" />
            </div>

            {/* Stats Cards (4) */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="size-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-7 w-20" />
                            <Skeleton className="mt-1 h-3 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Productivity Cards (2) */}
            <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="size-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-6 w-28" />
                            <Skeleton className="mt-1 h-3 w-36" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Last Session Card */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3">
                        <Skeleton className="size-10 rounded-full" />
                        <div>
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="mt-1 h-3 w-28" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}