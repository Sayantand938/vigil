// src/pages/Timer/index.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useTimer } from "@/context/TimerContext";
import { TimerDisplay } from "./TimerDisplay";
import { TimerControls } from "./TimerControls";
import { formatTimerDisplay } from "@/lib/utils";

export function Timer() {
    const {
        activeSession,
        createActiveSession,
        stopActiveSession,
        loadActiveSession,
        clearActiveSession,
    } = useTimer();

    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const intervalRef = useRef<number | null>(null);

    // ---- Check for active session on mount ----
    useEffect(() => {
        const loadSession = async () => {
            setIsLoading(true);
            try {
                const session = await loadActiveSession();
                if (session) {
                    // Calculate elapsed time from start_time to now
                    const start = new Date(session.start_time);
                    const now = new Date();
                    const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
                    setSeconds(elapsed);
                    setIsRunning(true);
                    setIsPaused(false);
                    console.log(`⏱️ Loaded active session: ${session.id}, ${elapsed}s elapsed`);
                    toast.info("Resumed active session", { duration: 1500 });
                } else {
                    setSeconds(0);
                    setIsRunning(false);
                    setIsPaused(false);
                }
            } catch (error) {
                console.error("Error loading active session:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadSession();

        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [loadActiveSession]);

    // ---- Timer interval ----
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = window.setInterval(() => {
                setSeconds((prev) => prev + 1);
            }, 1000);
        } else if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        return () => {
            if (intervalRef.current !== null) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isRunning]);

    // ---- Start ----
    const handleStart = useCallback(async () => {
        if (isRunning || isPaused) return;

        try {
            const session = await createActiveSession();
            const start = new Date(session.start_time);
            const now = new Date();
            const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
            setSeconds(elapsed);
            setIsRunning(true);
            setIsPaused(false);
            console.log(`⏱️ Session started: ${session.id}`);
            toast.success("Timer started", { duration: 1500 });
        } catch (error) {
            console.error("Error starting timer:", error);
            toast.error("Failed to start timer");
        }
    }, [isRunning, isPaused, createActiveSession]);

    // ---- Pause ----
    const handlePause = useCallback(() => {
        if (!isRunning) return;
        setIsRunning(false);
        setIsPaused(true);
        console.log(`⏱️ Timer paused at ${formatTimerDisplay(seconds)}`);
        toast.info("Timer paused", { duration: 1500 });
    }, [isRunning, seconds]);

    // ---- Resume ----
    const handleResume = useCallback(() => {
        if (!isPaused || !activeSession) return;
        setIsRunning(true);
        setIsPaused(false);
        console.log(`⏱️ Timer resumed from ${formatTimerDisplay(seconds)}`);
        toast.info("Timer resumed", { duration: 1500 });
    }, [isPaused, activeSession, seconds]);

    // ---- Stop (end session) ----
    const handleStop = useCallback(async () => {
        if (!activeSession) {
            toast.error("No active session to stop");
            return;
        }

        if (seconds === 0) {
            toast.error("Timer is empty – nothing to save", { duration: 2000 });
            return;
        }

        setIsRunning(false);
        setIsPaused(false);

        try {
            const endTime = new Date();
            const stoppedSession = await stopActiveSession(activeSession.id, endTime);
            console.log(`⏱️ Session stopped: ${stoppedSession.id}, elapsed: ${stoppedSession.elapsed_time}s`);
            toast.success(`Time saved: ${formatTimerDisplay(seconds)}`, { duration: 2000 });
            setSeconds(0);
        } catch (error) {
            console.error("Error stopping timer:", error);
            toast.error("Failed to save timer");
            // Restore running state if failed
            setIsRunning(true);
            setIsPaused(false);
        }
    }, [activeSession, seconds, stopActiveSession]);

    // ---- Reset (cancel session) ----
    const handleReset = useCallback(async () => {
        if (activeSession) {
            try {
                await stopActiveSession(activeSession.id, new Date());
                toast.info("Session cancelled", { duration: 1500 });
            } catch (error) {
                console.error("Error cancelling session:", error);
            }
        }
        setIsRunning(false);
        setIsPaused(false);
        setSeconds(0);
        clearActiveSession();
        console.log("⏱️ Timer reset");
    }, [activeSession, stopActiveSession, clearActiveSession]);

    const isIdle = !isRunning && !isPaused && seconds === 0 && !activeSession;
    const isActive = isRunning;
    const isPausedState = isPaused && seconds > 0;

    if (isLoading) {
        return (
            <div className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center">
                <div className="text-muted-foreground">Loading timer…</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center space-y-8">
            <TimerDisplay
                seconds={seconds}
                isRunning={isRunning}
                formatTime={formatTimerDisplay}
            />
            <TimerControls
                isIdle={isIdle}
                isActive={isActive}
                isPausedState={isPausedState}
                onStart={handleStart}
                onPause={handlePause}
                onResume={handleResume}
                onStop={handleStop}
                onReset={handleReset}
            />
            {/* Show active session indicator */}
            {activeSession && !isIdle && (
                <p className="text-xs text-muted-foreground">
                    Session active since {new Date(activeSession.start_time).toLocaleTimeString()}
                </p>
            )}
        </div>
    );
}