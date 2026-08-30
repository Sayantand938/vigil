// src/store/timerStore.ts
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { type Session } from "@supabase/supabase-js";

// ---- Types ----
export type TimerEntry = {
    id: string;
    start_time: string;
    end_time: string | null;
    stopped_at: string | null;
    elapsed_time: number;
    created_at: string;
};

export type UserSettings = {
    daily_goal_minutes: number;
};

export type LifetimeStats = {
    totalTime: number;
    totalSessions: number;
    avgDuration: number;
};

// ---- Store Interface ----
type TimerStore = {
    // State
    entries: TimerEntry[];
    loading: boolean;
    activeSession: TimerEntry | null;
    settings: UserSettings | null;
    loadingSettings: boolean;
    session: Session | null;

    // Actions
    init: () => (() => void); // <-- FIXED: always returns a cleanup function
    fetchEntries: (startDate?: Date, endDate?: Date) => Promise<void>;
    addEntry: (duration: number, startTime: Date, endTime: Date) => Promise<TimerEntry>;
    deleteEntry: (id: string) => Promise<void>;
    updateEntry: (id: string, updates: Partial<TimerEntry>) => Promise<TimerEntry>;
    clearEntries: () => void;
    createActiveSession: () => Promise<TimerEntry>;
    stopActiveSession: (sessionId: string, endTime: Date, elapsedTime: number) => Promise<TimerEntry>;
    checkActiveSession: () => Promise<TimerEntry | null>;
    loadActiveSession: () => Promise<TimerEntry | null>;
    clearActiveSession: () => void;
    fetchSettings: () => Promise<void>;
    updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
    fetchLifetimeStats: () => Promise<LifetimeStats>;
};

// ---- Zustand Store ----
export const useTimerStore = create<TimerStore>((set, get) => ({
    // Initial state
    entries: [],
    loading: true,
    activeSession: null,
    settings: null,
    loadingSettings: false,
    session: null,

    // ---- init ----
    init: () => {
        // Get current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            set({ session });
            if (session?.user) {
                get().fetchSettings();
                // fetchEntries will be called by each page as needed (Dashboard, History)
            } else {
                set({ loading: false });
            }
        });

        // Set up auth listener
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            set({ session });
            if (event === "SIGNED_OUT") {
                set({
                    entries: [],
                    activeSession: null,
                    settings: null,
                    loading: false,
                });
            } else if (event === "SIGNED_IN" && session?.user) {
                get().fetchSettings();
            }
        });

        // Return the unsubscribe function
        return () => subscription.unsubscribe();
    },

    // ---- fetchEntries ----
    fetchEntries: async (startDate?: Date, endDate?: Date) => {
        const { session } = get();
        if (!session?.user) {
            set({ loading: false });
            return;
        }
        set({ loading: true });
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
            set({ entries: [], loading: false });
        } else {
            set({ entries: data || [], loading: false });
        }
    },

    // ---- addEntry ----
    addEntry: async (duration: number, startTime: Date, endTime: Date) => {
        const { session } = get();
        if (!session?.user) throw new Error("Not authenticated");
        const newEntry = {
            user_id: session.user.id,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            stopped_at: null,
            elapsed_time: duration,
        };
        const { data, error } = await supabase
            .from("timer_entries")
            .insert(newEntry)
            .select()
            .single();
        if (error) throw error;
        set((state) => ({ entries: [data, ...state.entries] }));
        return data;
    },

    // ---- deleteEntry ----
    deleteEntry: async (id: string) => {
        const { session } = get();
        if (!session?.user) throw new Error("Not authenticated");
        const { error } = await supabase
            .from("timer_entries")
            .delete()
            .eq("id", id)
            .eq("user_id", session.user.id);
        if (error) throw error;
        set((state) => ({
            entries: state.entries.filter((e) => e.id !== id),
            activeSession: state.activeSession?.id === id ? null : state.activeSession,
        }));
    },

    // ---- updateEntry ----
    updateEntry: async (id: string, updates: Partial<TimerEntry>) => {
        const { session } = get();
        if (!session?.user) throw new Error("Not authenticated");
        const { data, error } = await supabase
            .from("timer_entries")
            .update(updates)
            .eq("id", id)
            .eq("user_id", session.user.id)
            .select()
            .single();
        if (error) throw error;
        set((state) => ({
            entries: state.entries.map((e) => (e.id === id ? data : e)),
            activeSession: state.activeSession?.id === id ? data : state.activeSession,
        }));
        return data;
    },

    // ---- clearEntries ----
    clearEntries: () => set({ entries: [] }),

    // ---- Active Session Management ----
    checkActiveSession: async () => {
        const { session } = get();
        if (!session?.user) return null;
        const { data, error } = await supabase
            .from("timer_entries")
            .select("*")
            .eq("user_id", session.user.id)
            .is("end_time", null)
            .order("start_time", { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error) {
            console.error("Error checking active session:", error);
            return null;
        }
        return data || null;
    },

    loadActiveSession: async () => {
        const active = await get().checkActiveSession();
        if (active) {
            set({ activeSession: active });
            return active;
        }
        set({ activeSession: null });
        return null;
    },

    createActiveSession: async () => {
        const { session } = get();
        if (!session?.user) throw new Error("Not authenticated");

        const existing = await get().checkActiveSession();
        if (existing) {
            set({ activeSession: existing });
            return existing;
        }

        const now = new Date().toISOString();
        const newEntry = {
            user_id: session.user.id,
            start_time: now,
            end_time: null,
            stopped_at: null,
            elapsed_time: 0,
        };

        const { data, error } = await supabase
            .from("timer_entries")
            .insert(newEntry)
            .select()
            .single();
        if (error) throw error;
        set((state) => ({
            activeSession: data,
            entries: [data, ...state.entries],
        }));
        return data;
    },

    stopActiveSession: async (sessionId: string, endTime: Date, elapsedTime: number) => {
        const { session } = get();
        if (!session?.user) throw new Error("Not authenticated");
        const { data, error } = await supabase
            .from("timer_entries")
            .update({
                end_time: endTime.toISOString(),
                elapsed_time: elapsedTime,
            })
            .eq("id", sessionId)
            .eq("user_id", session.user.id)
            .select()
            .single();
        if (error) throw error;
        set((state) => ({
            activeSession: null,
            entries: state.entries.map((e) => (e.id === sessionId ? data : e)),
        }));
        return data;
    },

    clearActiveSession: () => set({ activeSession: null }),

    // ---- Settings ----
    fetchSettings: async () => {
        const { session } = get();
        if (!session?.user) return;
        set({ loadingSettings: true });
        const { data, error } = await supabase
            .from("user_settings")
            .select("*")
            .eq("user_id", session.user.id)
            .maybeSingle();
        if (error) {
            console.error("Error fetching settings:", error);
        } else {
            set({ settings: data || { daily_goal_minutes: 0 } });
        }
        set({ loadingSettings: false });
    },

    updateSettings: async (newSettings: Partial<UserSettings>) => {
        const { session, settings } = get();
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
        set({ settings: data });
        return data;
    },

    // ---- Lifetime Stats ----
    fetchLifetimeStats: async () => {
        const { session } = get();
        if (!session?.user) throw new Error("Not authenticated");
        const { data, error } = await supabase.rpc("get_lifetime_stats", {
            user_id: session.user.id,
        });
        if (error) {
            console.error("Error fetching lifetime stats:", error);
            return { totalTime: 0, totalSessions: 0, avgDuration: 0 };
        }
        const stats = data?.[0] || { total_time: 0, total_sessions: 0, avg_duration: 0 };
        return {
            totalTime: stats.total_time,
            totalSessions: stats.total_sessions,
            avgDuration: stats.avg_duration,
        };
    },
}));