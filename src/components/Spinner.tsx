// src/components/Spinner.tsx
import { Loader2 } from "lucide-react";

export function Spinner({ size = "default" }: { size?: "default" | "lg" }) {
    const className =
        size === "lg" ? "size-8" : "size-6";
    return (
        <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 className={`${className} animate-spin text-muted-foreground`} />
        </div>
    );
}