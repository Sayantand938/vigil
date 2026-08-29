import { Button } from "@/components/ui/button"
import { Play, Pause, Save, RotateCcw } from "lucide-react"

type TimerControlsProps = {
    isIdle: boolean
    isActive: boolean
    isPausedState: boolean
    onStart: () => void
    onStop: () => void
    onSave: () => void
    onReset: () => void
}

export function TimerControls({
    isIdle,
    isActive,
    isPausedState,
    onStart,
    onStop,
    onSave,
    onReset,
}: TimerControlsProps) {
    let primaryButton = null
    if (isIdle) {
        primaryButton = (
            <Button onClick={onStart} variant="default" size="lg" className="gap-2 rounded-full px-6">
                <Play className="size-4" /> Start
            </Button>
        )
    } else if (isActive) {
        primaryButton = (
            <Button onClick={onStop} variant="outline" size="lg" className="gap-2 rounded-full px-6">
                <Pause className="size-4" /> Stop
            </Button>
        )
    } else if (isPausedState) {
        primaryButton = (
            <Button onClick={onSave} variant="default" size="lg" className="gap-2 rounded-full px-6">
                <Save className="size-4" /> Save
            </Button>
        )
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
    )
}