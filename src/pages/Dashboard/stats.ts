// src/pages/Dashboard/stats.ts
import { format, parseISO } from "date-fns";
import type { TimerEntry } from "@/context/TimerContext";
import type { DashboardStats, DayData } from "./types";

export function computeStats(entries: TimerEntry[], dailyGoalMinutes: number): DashboardStats {
    if (!entries || entries.length === 0) {
        return {
            totalTime: 0,
            totalSessions: 0,
            avgSessionDuration: 0,
            daysUsed: 0,
            daysGoalAchieved: 0,
            goalAchievementRatio: 0,
            mostProductiveDay: null,
            leastProductiveDay: null,
            currentStreak: 0,
        };
    }

    // Group by date (based on start_time)
    const dayMap = new Map<string, { total: number; count: number }>();
    entries.forEach((entry) => {
        const date = format(parseISO(entry.start_time), "yyyy-MM-dd");
        const existing = dayMap.get(date);
        if (existing) {
            existing.total += entry.elapsed_time;
            existing.count += 1;
        } else {
            dayMap.set(date, { total: entry.elapsed_time, count: 1 });
        }
    });

    const days: DayData[] = Array.from(dayMap.entries()).map(([date, { total, count }]) => ({
        date,
        total,
        count,
    }));

    const totalTime = entries.reduce((sum, e) => sum + e.elapsed_time, 0);
    const totalSessions = entries.length;
    const avgSessionDuration = totalSessions > 0 ? Math.round(totalTime / totalSessions) : 0;

    const daysUsed = days.length;
    const goalSeconds = dailyGoalMinutes * 60;
    const daysGoalAchieved = days.filter((d) => d.total >= goalSeconds).length;
    const goalAchievementRatio = daysUsed > 0 ? (daysGoalAchieved / daysUsed) * 100 : 0;

    // Most and least productive days (by total time)
    const sortedDays = [...days].sort((a, b) => b.total - a.total);
    const mostProductiveDay = sortedDays.length > 0 ? sortedDays[0] : null;
    const leastProductiveDay = sortedDays.length > 0 ? sortedDays[sortedDays.length - 1] : null;

    // Current streak: consecutive days (ending today) where goal was achieved
    let streak = 0;
    if (daysGoalAchieved > 0) {
        const todayStr = format(new Date(), "yyyy-MM-dd");
        const yesterdayStr = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");

        const todayData = dayMap.get(todayStr);
        const todayAchieved = todayData ? todayData.total >= goalSeconds : false;

        let checkDate = todayAchieved ? todayStr : yesterdayStr;
        while (true) {
            const dayData = dayMap.get(checkDate);
            const achieved = dayData ? dayData.total >= goalSeconds : false;
            if (!achieved) break;
            streak++;
            const prevDate = format(new Date(parseISO(checkDate).getTime() - 86400000), "yyyy-MM-dd");
            checkDate = prevDate;
            if (streak > 365) break;
        }
    }

    return {
        totalTime,
        totalSessions,
        avgSessionDuration,
        daysUsed,
        daysGoalAchieved,
        goalAchievementRatio,
        mostProductiveDay,
        leastProductiveDay,
        currentStreak: streak,
    };
}