import { Button } from "@/components/ui/button";
import { Play, Square, Save, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type TimerControlsProps = {
    isIdle: boolean;
    isRunning: boolean;
    isPending: boolean;
    onStart: () => void;
    onStop: () => void;
    onSave: () => void;
    onReset: () => void;
};

export function TimerControls({
    isIdle,
    isRunning,
    isPending,
    onStart,
    onStop,
    onSave,
    onReset,
}: TimerControlsProps) {
    let primaryButton = null;
    let resetVariant: "ghost" | "destructive" = "ghost";
    let resetDisabled = false;

    if (isIdle) {
        primaryButton = (
            <Button
                onClick={onStart}
                variant="default"
                size="lg"
                className="gap-2 rounded-full px-8"
            >
                <Play className="size-4" /> Start
            </Button>
        );
        resetVariant = "ghost";
        resetDisabled = true;
    } else if (isRunning) {
        primaryButton = (
            <Button
                onClick={onStop}
                variant="default"
                size="lg"
                className="gap-2 rounded-full px-8"
            >
                <Square className="size-4" /> Stop
            </Button>
        );
        resetVariant = "ghost";
        resetDisabled = false;
    } else if (isPending) {
        primaryButton = (
            <Button
                onClick={onSave}
                variant="default"
                size="lg"
                className="gap-2 rounded-full px-8"
            >
                <Save className="size-4" /> Save
            </Button>
        );
        resetVariant = "destructive";
        resetDisabled = false;
    }

    return (
        <div className="flex items-center gap-4">
            {primaryButton}
            <Button
                onClick={onReset}
                variant={resetVariant}
                size="lg"
                className={cn(
                    "gap-2 rounded-full px-6 transition-all",
                    resetVariant === "ghost" && "text-muted-foreground hover:text-foreground",
                    resetVariant === "destructive" && "border-destructive/20 hover:bg-destructive/10"
                )}
                disabled={resetDisabled}
            >
                <RotateCcw className="size-4" />
                Reset
            </Button>
        </div>
    );
}