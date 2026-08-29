import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause, Save, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { useTimer } from "@/context/TimerContext"

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
            // fresh start
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
        // If sessionStart is null (shouldn't happen), fallback to current time minus duration
        const start = sessionStart || new Date(endTime.getTime() - seconds * 1000)
        addEntry(seconds, start, endTime)
        toast.success(`Time saved: ${formatTime(seconds)}`)
        // Reset
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
            <Button onClick={handleStart} className="gap-2">
                <Play className="size-4" /> Start
            </Button>
        )
    } else if (isActive) {
        primaryButton = (
            <Button onClick={handleStop} variant="outline" className="gap-2">
                <Pause className="size-4" /> Stop
            </Button>
        )
    } else if (isPausedState) {
        primaryButton = (
            <Button onClick={handleSave} className="gap-2">
                <Save className="size-4" /> Save
            </Button>
        )
    }

    return (
        <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">Timer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center font-mono text-6xl font-bold tracking-wider">
                        {formatTime(seconds)}
                    </div>
                    <div className="flex justify-center gap-4">
                        {primaryButton}
                        <Button onClick={handleReset} variant="destructive" className="gap-2">
                            <RotateCcw className="size-4" /> Reset
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}