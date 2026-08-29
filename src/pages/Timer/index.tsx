import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTimer } from "@/context/TimerContext";
import { TimerDisplay } from "./TimerDisplay";
import { TimerControls } from "./TimerControls";

export function Timer() {
    const { addEntry } = useTimer();
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [sessionStart, setSessionStart] = useState<Date | null>(null);

    useEffect(() => {
        let interval: number | null = null;
        if (isRunning) {
            interval = window.setInterval(() => {
                setSeconds((prev) => prev + 1);
            }, 1000);
        } else if (!isRunning && interval !== null) {
            clearInterval(interval);
        }
        return () => {
            if (interval !== null) clearInterval(interval);
        };
    }, [isRunning]);

    const handleStart = () => {
        if (!isRunning && seconds === 0) {
            setSessionStart(new Date());
            console.log("⏱️ Timer: Started new session at", new Date().toISOString());
        }
        setIsRunning(true);
        setIsPaused(false);
    };

    const handleStop = () => {
        setIsRunning(false);
        setIsPaused(true);
        console.log(`⏱️ Timer: Stopped at ${formatTime(seconds)}`);
    };

    const handleReset = () => {
        setIsRunning(false);
        setIsPaused(false);
        setSeconds(0);
        setSessionStart(null);
        console.log("⏱️ Timer: Reset to 0");
    };

    const handleSave = () => {
        if (seconds === 0) {
            toast.error("Timer is empty – nothing to save", { duration: 2000 });
            console.warn("⏱️ Timer: Attempted to save with 0 seconds");
            return;
        }
        const endTime = new Date();
        const start = sessionStart || new Date(endTime.getTime() - seconds * 1000);
        console.log(`⏱️ Timer: Saving ${formatTime(seconds)} (${seconds}s)`);
        addEntry(seconds, start, endTime)
            .then(() => {
                toast.success(`Time saved: ${formatTime(seconds)}`, { duration: 2000 });
                console.log("✅ Timer saved successfully");
            })
            .catch((err) => {
                console.error("❌ Timer save failed:", err);
                toast.error("Failed to save timer");
            });
        // Reset after saving (even if it fails, we reset the local state)
        setSeconds(0);
        setIsRunning(false);
        setIsPaused(false);
        setSessionStart(null);
    };

    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    const isIdle = !isRunning && !isPaused && seconds === 0;
    const isActive = isRunning;
    const isPausedState = !isRunning && isPaused && seconds > 0;

    return (
        <div className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center space-y-8">
            <TimerDisplay seconds={seconds} isRunning={isRunning} formatTime={formatTime} />
            <TimerControls
                isIdle={isIdle}
                isActive={isActive}
                isPausedState={isPausedState}
                onStart={handleStart}
                onStop={handleStop}
                onSave={handleSave}
                onReset={handleReset}
            />
        </div>
    );
}