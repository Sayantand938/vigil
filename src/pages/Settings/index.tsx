// src/pages/Settings/index.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "./ThemeToggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTimer } from "@/context/TimerContext";
import { toast } from "sonner";
import { Target, Save, Clock } from "lucide-react";

export function Settings() {
    const { settings, loadingSettings, fetchSettings, updateSettings } = useTimer();
    const [dailyGoal, setDailyGoal] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    useEffect(() => {
        if (settings) {
            setDailyGoal(String(settings.daily_goal_minutes || 0));
        }
    }, [settings]);

    const handleSave = async () => {
        const daily = parseInt(dailyGoal);
        if (isNaN(daily) || daily < 0) {
            toast.error("Please enter a valid number (0 or more)");
            return;
        }
        setSaving(true);
        try {
            await updateSettings({ daily_goal_minutes: daily });
            toast.success("Daily goal saved successfully!");
        } catch (error) {
            toast.error("Failed to save goal");
        } finally {
            setSaving(false);
        }
    };

    if (loadingSettings) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-muted-foreground">Loading settings…</div>
            </div>
        );
    }

    const currentGoal = parseInt(dailyGoal) || 0;

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground">
                    Customize your experience and set your daily focus target.
                </p>
            </div>

            {/* Appearance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="size-4 text-muted-foreground" />
                        Appearance
                    </CardTitle>
                    <CardDescription>Choose your preferred theme.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ThemeToggle />
                </CardContent>
            </Card>

            {/* Daily Goal – Redesigned */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="size-4 text-muted-foreground" />
                        Daily Goal
                    </CardTitle>
                    <CardDescription>
                        Set a daily focused time target to track your progress.
                        {currentGoal > 0
                            ? ` Currently set to ${currentGoal} minutes.`
                            : " Set to 0 to disable."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-end gap-4">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="daily-goal">Minutes per day</Label>
                            <Input
                                id="daily-goal"
                                type="number"
                                min="0"
                                placeholder="e.g. 120"
                                value={dailyGoal}
                                onChange={(e) => setDailyGoal(e.target.value)}
                                className="h-10 text-base"
                            />
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="h-10 gap-2 px-6"
                        >
                            <Save className="size-4" />
                            {saving ? "Saving…" : "Save"}
                        </Button>
                    </div>

                    {/* Preview of what the goal looks like */}
                    {currentGoal > 0 && (
                        <div className="rounded-lg border border-dashed border-muted-foreground/20 bg-muted/30 p-4">
                            <p className="text-xs font-medium text-muted-foreground">Preview</p>
                            <div className="mt-2 flex items-center gap-3">
                                <div className="relative size-12">
                                    <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                                        <circle
                                            className="stroke-muted"
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            strokeWidth="6"
                                        />
                                        <circle
                                            className="stroke-primary transition-all duration-700 ease-out"
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            strokeWidth="6"
                                            strokeLinecap="round"
                                            strokeDasharray={251.2}
                                            strokeDashoffset={251.2 * 0.3} // 70% example
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center text-center">
                                        <span className="text-[10px] font-semibold leading-none">
                                            0m
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{currentGoal}m target</p>
                                    <p className="text-xs text-muted-foreground">
                                        You'll see your progress on the dashboard
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}