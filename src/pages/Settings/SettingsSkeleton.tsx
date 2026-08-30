// src/pages/Settings/SettingsSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function SettingsSkeleton() {
    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <Skeleton className="h-8 w-32" />
                <Skeleton className="mt-1 h-4 w-64" />
            </div>

            {/* Appearance Card */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-9 w-48 rounded-lg" />
                </CardContent>
            </Card>

            {/* Daily Goal Card */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-end gap-4">
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-10 w-24" />
                    </div>
                    {/* Preview box */}
                    <Skeleton className="h-24 w-full rounded-lg" />
                </CardContent>
            </Card>
        </div>
    );
}