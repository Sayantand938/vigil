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
        deleteEntry,
        updateEntry,
    } = useTimer();

    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [stoppedSeconds, setStoppedSeconds] = useState(0);
    const intervalRef = useRef<number | null>(null);

    // ---- Check for active session on mount ----
    useEffect(() => {
        const loadSession = async () => {
            setIsLoading(true);
            try {
                const session = await loadActiveSession();
                if (session) {
                    const start = new Date(session.start_time);
                    const now = new Date();

                    if (session.stopped_at) {
                        const stoppedAt = new Date(session.stopped_at);
                        const elapsed = Math.floor((stoppedAt.getTime() - start.getTime()) / 1000);
                        setSeconds(elapsed);
                        setStoppedSeconds(elapsed);
                        setIsRunning(false);
                        setIsPending(true);
                        console.log(`⏱️ Loaded stopped session: ${session.id}, ${elapsed}s elapsed (pending save)`);
                        toast.info("Session loaded – choose Save or Reset", { duration: 2000 });
                    } else {
                        const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
                        setSeconds(elapsed);
                        setIsRunning(true);
                        setIsPending(false);
                        console.log(`⏱️ Loaded active session: ${session.id}, ${elapsed}s elapsed (resumed)`);
                        toast.info("Resumed active session", { duration: 1500 });
                    }
                } else {
                    setSeconds(0);
                    setIsRunning(false);
                    setIsPending(false);
                }
            } catch (error) {
                console.error("Error loading active session:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadSession();

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
        if (isRunning || isPending) return;

        try {
            const session = await createActiveSession();
            const start = new Date(session.start_time);
            const now = new Date();
            const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
            setSeconds(elapsed);
            setIsRunning(true);
            setIsPending(false);
            console.log(`⏱️ Session started: ${session.id}`);
            toast.success("Timer started", { duration: 1500 });
        } catch (error) {
            console.error("Error starting timer:", error);
            toast.error("Failed to start timer");
        }
    }, [isRunning, isPending, createActiveSession]);

    // ---- Stop (pause, pending save) ----
    const handleStop = useCallback(async () => {
        if (!isRunning || !activeSession) return;

        if (seconds === 0) {
            toast.error("Nothing to stop", { duration: 1500 });
            return;
        }

        setIsRunning(false);
        setIsPending(true);
        setStoppedSeconds(seconds);

        try {
            const stoppedAt = new Date().toISOString();
            await updateEntry(activeSession.id, { stopped_at: stoppedAt });
            console.log(`⏱️ Timer stopped at ${formatTimerDisplay(seconds)} (pending save)`);
            toast.info("Timer stopped – Save or Reset?", { duration: 2000 });
        } catch (error) {
            console.error("Error stopping timer:", error);
            toast.error("Failed to stop timer");
            setIsRunning(true);
            setIsPending(false);
        }
    }, [isRunning, activeSession, seconds, updateEntry]);

    // ---- Save (save to DB) ----
    const handleSave = useCallback(async () => {
        if (!isPending || !activeSession) {
            toast.error("No session to save");
            return;
        }

        if (stoppedSeconds === 0) {
            toast.error("Nothing to save – session is empty", { duration: 2000 });
            return;
        }

        try {
            const endTime = new Date();
            const stoppedSession = await stopActiveSession(
                activeSession.id,
                endTime,
                stoppedSeconds
            );
            console.log(`⏱️ Session saved: ${stoppedSession.id}, elapsed: ${stoppedSession.elapsed_time}s`);
            toast.success(`Time saved: ${formatTimerDisplay(stoppedSeconds)}`, { duration: 2000 });

            setIsRunning(false);
            setIsPending(false);
            setSeconds(0);
            setStoppedSeconds(0);
        } catch (error) {
            console.error("Error saving session:", error);
            toast.error("Failed to save timer");
        }
    }, [isPending, activeSession, stoppedSeconds, stopActiveSession]);

    // ---- Reset (discard) ----
    const handleReset = useCallback(async () => {
        if (!activeSession) {
            setIsRunning(false);
            setIsPending(false);
            setSeconds(0);
            setStoppedSeconds(0);
            return;
        }

        try {
            await deleteEntry(activeSession.id);
            console.log(`⏱️ Session discarded: ${activeSession.id}`);
            toast.info("Session discarded", { duration: 1500 });
        } catch (error) {
            console.error("Error discarding session:", error);
            toast.error("Failed to discard session");
        }

        setIsRunning(false);
        setIsPending(false);
        setSeconds(0);
        setStoppedSeconds(0);
        clearActiveSession();
    }, [activeSession, deleteEntry, clearActiveSession]);

    const isIdle = !isRunning && !isPending && seconds === 0 && !activeSession;

    if (isLoading) {
        return (
            <div className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center">
                <div className="text-muted-foreground">Loading timer…</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center space-y-8">
            <TimerDisplay seconds={seconds} isRunning={isRunning} formatTime={formatTimerDisplay} />
            <TimerControls
                isIdle={isIdle}
                isRunning={isRunning}
                isPending={isPending}
                onStart={handleStart}
                onStop={handleStop}
                onSave={handleSave}
                onReset={handleReset}
            />
            {/* All status text removed */}
        </div>
    );
}