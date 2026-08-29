export type TimerState = {
    seconds: number
    isRunning: boolean
    isPaused: boolean
    sessionStart: Date | null
}