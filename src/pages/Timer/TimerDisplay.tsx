import { cn } from "@/lib/utils"

type TimerDisplayProps = {
    seconds: number
    isRunning: boolean
    formatTime: (seconds: number) => string
}

export function TimerDisplay({ seconds, isRunning, formatTime }: TimerDisplayProps) {
    return (
        <div
            className={cn(
                "font-mono text-7xl font-light tracking-wider transition-colors duration-300 md:text-8xl lg:text-9xl",
                isRunning && "text-primary"
            )}
        >
            {formatTime(seconds)}
        </div>
    )
}