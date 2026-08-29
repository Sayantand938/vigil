import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, Save, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { useTimer } from "@/context/TimerContext"
import { cn } from "@/lib/utils"

export function Timer() {
    const [seconds, setSeconds] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [sessionStart, setSessionStart] = useState<Date | null>(null)
    const { addEntry } = useTimer()

    useEffect(() => {
        let interval: number | null = null
        if (isRunning) {
            interval = window.setInterval(() => {
                setSeconds((prev) => prev + 1)
            }, 1000)
        } else if (!isRunning && interval !== null) {
            clearInterval(interval)
        }
        return () => {
            if (interval !== null) clearInterval(interval)
        }
    }, [isRunning])

    const handleStart = () => {
        if (!isRunning && seconds === 0) {
            setSessionStart(new Date())
        }
        setIsRunning(true)
        setIsPaused(false)
    }

    const handleStop = () => {
        setIsRunning(false)
        setIsPaused(true)
    }

    const handleReset = () => {
        setIsRunning(false)
        setIsPaused(false)
        setSeconds(0)
        setSessionStart(null)
    }

    const handleSave = () => {
        if (seconds === 0) {
            toast.error("Timer is empty – nothing to save")
            return
        }
        const endTime = new Date()
        const start = sessionStart || new Date(endTime.getTime() - seconds * 1000)
        addEntry(seconds, start, endTime)
        toast.success(`Time saved: ${formatTime(seconds)}`)
        setSeconds(0)
        setIsRunning(false)
        setIsPaused(false)
        setSessionStart(null)
    }

    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600)
        const mins = Math.floor((totalSeconds % 3600) / 60)
        const secs = totalSeconds % 60
        return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    }

    const isIdle = !isRunning && !isPaused && seconds === 0
    const isActive = isRunning
    const isPausedState = !isRunning && isPaused && seconds > 0

    let primaryButton = null
    if (isIdle) {
        primaryButton = (
            <Button onClick={handleStart} variant="default" size="lg" className="gap-2 rounded-full px-6">
                <Play className="size-4" /> Start
            </Button>
        )
    } else if (isActive) {
        primaryButton = (
            <Button onClick={handleStop} variant="outline" size="lg" className="gap-2 rounded-full px-6">
                <Pause className="size-4" /> Stop
            </Button>
        )
    } else if (isPausedState) {
        primaryButton = (
            <Button onClick={handleSave} variant="default" size="lg" className="gap-2 rounded-full px-6">
                <Save className="size-4" /> Save
            </Button>
        )
    }

    return (
        <div className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center space-y-8">
            {/* Timer Display */}
            <div
                className={cn(
                    "font-mono text-7xl font-light tracking-wider transition-colors duration-300 md:text-8xl lg:text-9xl",
                    isRunning && "text-primary"
                )}
            >
                {formatTime(seconds)}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-4">
                {primaryButton}
                <Button
                    onClick={handleReset}
                    variant="ghost"
                    size="lg"
                    className="gap-2 rounded-full px-6 text-muted-foreground hover:text-foreground"
                >
                    <RotateCcw className="size-4" />
                    Reset
                </Button>
            </div>
        </div>
    )
}