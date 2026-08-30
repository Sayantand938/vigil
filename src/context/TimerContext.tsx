// src/context/TimerContext.tsx
import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
    type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { type Session } from "@supabase/supabase-js";

export type TimerEntry = {
    id: string;
    start_time: string;
    end_time: string;
    duration: number;
};

export type UserSettings = {
    daily_goal_minutes: number;
};

type TimerContextType = {
    entries: TimerEntry[];
    loading: boolean;
    addEntry: (duration: number, startTime: Date, endTime: Date) => Promise<void>;
    deleteEntry: (id: string) => Promise<void>;
    updateEntry: (id: string, updates: Partial<TimerEntry>) => Promise<void>;
    fetchEntries: (startDate?: Date, endDate?: Date) => Promise<void>;
    clearEntries: () => void;
    settings: UserSettings | null;
    loadingSettings: boolean;
    fetchSettings: () => Promise<void>;
    updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: ReactNode }) => {
    const [entries, setEntries] = useState<TimerEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<Session | null>(null);
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [loadingSettings, setLoadingSettings] = useState(false);

    // ---- Auth listener ----
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                fetchSettings();
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            if (event === "SIGNED_OUT") {
                setEntries([]);
                setSettings(null);
                setLoading(false);
            } else if (event === "SIGNED_IN" && session?.user) {
                fetchSettings();
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // ---- fetchEntries ----
    const fetchEntries = useCallback(
        async (startDate?: Date, endDate?: Date) => {
            if (!session?.user) return;
            setLoading(true);
            let query = supabase
                .from("timer_entries")
                .select("*")
                .eq("user_id", session.user.id)
                .order("start_time", { ascending: false });

            if (startDate) query = query.gte("start_time", startDate.toISOString());
            if (endDate) query = query.lte("end_time", endDate.toISOString());

            const { data, error } = await query;
            if (error) {
                console.error("Error fetching entries:", error);
                setEntries([]);
            } else {
                setEntries(data || []);
            }
            setLoading(false);
        },
        [session]
    );

    // ---- addEntry ----
    const addEntry = useCallback(
        async (duration: number, startTime: Date, endTime: Date) => {
            if (!session?.user) throw new Error("Not authenticated");
            const newEntry = {
                user_id: session.user.id,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                duration,
            };
            const { data, error } = await supabase
                .from("timer_entries")
                .insert(newEntry)
                .select()
                .single();
            if (error) throw error;
            setEntries((prev) => [data, ...prev]);
        },
        [session]
    );

    // ---- deleteEntry ----
    const deleteEntry = useCallback(
        async (id: string) => {
            if (!session?.user) throw new Error("Not authenticated");
            const { error } = await supabase
                .from("timer_entries")
                .delete()
                .eq("id", id)
                .eq("user_id", session.user.id);
            if (error) throw error;
            setEntries((prev) => prev.filter((e) => e.id !== id));
        },
        [session]
    );

    // ---- updateEntry ----
    const updateEntry = useCallback(
        async (id: string, updates: Partial<TimerEntry>) => {
            if (!session?.user) throw new Error("Not authenticated");
            const { data, error } = await supabase
                .from("timer_entries")
                .update(updates)
                .eq("id", id)
                .eq("user_id", session.user.id)
                .select()
                .single();
            if (error) throw error;
            setEntries((prev) => prev.map((e) => (e.id === id ? data : e)));
        },
        [session]
    );

    // ---- clearEntries ----
    const clearEntries = useCallback(() => setEntries([]), []);

    // ---- Settings ----
    const fetchSettings = useCallback(async () => {
        if (!session?.user) return;
        setLoadingSettings(true);
        const { data, error } = await supabase
            .from("user_settings")
            .select("*")
            .eq("user_id", session.user.id)
            .maybeSingle();
        if (error) {
            console.error("Error fetching settings:", error);
        } else {
            setSettings(data || { daily_goal_minutes: 0 });
        }
        setLoadingSettings(false);
    }, [session]);

    const updateSettings = useCallback(
        async (newSettings: Partial<UserSettings>) => {
            if (!session?.user) throw new Error("Not authenticated");
            const updated = { ...settings, ...newSettings };
            const { data, error } = await supabase
                .from("user_settings")
                .upsert({
                    user_id: session.user.id,
                    daily_goal_minutes: updated.daily_goal_minutes,
                    updated_at: new Date().toISOString(),
                })
                .select()
                .single();
            if (error) throw error;
            setSettings(data);
            return data;
        },
        [session, settings]
    );

    // ---- Context value ----
    const value = useMemo(
        () => ({
            entries,
            loading,
            addEntry,
            deleteEntry,
            updateEntry,
            fetchEntries,
            clearEntries,
            settings,
            loadingSettings,
            fetchSettings,
            updateSettings,
        }),
        [
            entries,
            loading,
            addEntry,
            deleteEntry,
            updateEntry,
            fetchEntries,
            clearEntries,
            settings,
            loadingSettings,
            fetchSettings,
            updateSettings,
        ]
    );

    return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};

export const useTimer = () => {
    const context = useContext(TimerContext);
    if (!context) throw new Error("useTimer must be used within a TimerProvider");
    return context;
};