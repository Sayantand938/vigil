import { Button } from "@/components/ui/button";
import { Play, Pause, Square, RotateCcw } from "lucide-react";

type TimerControlsProps = {
    isIdle: boolean;
    isActive: boolean;
    isPausedState: boolean;
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onStop: () => void;
    onReset: () => void;
};

export function TimerControls({
    isIdle,
    isActive,
    isPausedState,
    onStart,
    onPause,
    onResume,
    onStop,
    onReset,
}: TimerControlsProps) {
    let primaryButton = null;

    if (isIdle) {
        primaryButton = (
            <Button
                onClick={onStart}
                variant="default"
                size="lg"
                className="gap-2 rounded-full px-6"
            >
                <Play className="size-4" /> Start
            </Button>
        );
    } else if (isActive) {
        primaryButton = (
            <Button
                onClick={onPause}
                variant="outline"
                size="lg"
                className="gap-2 rounded-full px-6"
            >
                <Pause className="size-4" /> Pause
            </Button>
        );
    } else if (isPausedState) {
        primaryButton = (
            <div className="flex gap-3">
                <Button
                    onClick={onResume}
                    variant="default"
                    size="lg"
                    className="gap-2 rounded-full px-6"
                >
                    <Play className="size-4" /> Resume
                </Button>
                <Button
                    onClick={onStop}
                    variant="destructive"
                    size="lg"
                    className="gap-2 rounded-full px-6"
                >
                    <Square className="size-4" /> Stop
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            {primaryButton}
            <Button
                onClick={onReset}
                variant="ghost"
                size="lg"
                className="gap-2 rounded-full px-6 text-muted-foreground hover:text-foreground"
            >
                <RotateCcw className="size-4" />
                Reset
            </Button>
        </div>
    );
}