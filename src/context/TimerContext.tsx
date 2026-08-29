import { createContext, useContext, useState, type ReactNode } from "react"

export type TimerEntry = {
    id: string
    startTime: Date   // when the timer started
    endTime: Date     // when it was saved
    duration: number  // in seconds
}

type TimerContextType = {
    entries: TimerEntry[]
    addEntry: (duration: number, startTime: Date, endTime: Date) => void
    clearEntries: () => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export const TimerProvider = ({ children }: { children: ReactNode }) => {
    const [entries, setEntries] = useState<TimerEntry[]>([])

    const addEntry = (duration: number, startTime: Date, endTime: Date) => {
        const newEntry: TimerEntry = {
            id: crypto.randomUUID(),
            startTime,
            endTime,
            duration,
        }
        setEntries((prev) => [newEntry, ...prev]) // newest first
    }

    const clearEntries = () => {
        setEntries([])
    }

    return (
        <TimerContext.Provider value={{ entries, addEntry, clearEntries }}>
            {children}
        </TimerContext.Provider>
    )
}

export const useTimer = () => {
    const context = useContext(TimerContext)
    if (!context) {
        throw new Error("useTimer must be used within a TimerProvider")
    }
    return context
}