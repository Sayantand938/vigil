// src/pages/Dashboard/types.ts
import type { TimerEntry } from "@/context/TimerContext";

export type DayData = {
    date: string;
    total: number;
    count: number;
};

export type DashboardStats = {
    totalTime: number;
    totalSessions: number;
    avgSessionDuration: number;
    daysUsed: number;
    daysGoalAchieved: number;
    goalAchievementRatio: number;
    mostProductiveDay: DayData | null;
    leastProductiveDay: DayData | null;
    currentStreak: number;
};