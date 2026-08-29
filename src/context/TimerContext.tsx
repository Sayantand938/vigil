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

type TimerContextType = {
    entries: TimerEntry[];
    loading: boolean;
    addEntry: (duration: number, startTime: Date, endTime: Date) => Promise<void>;
    deleteEntry: (id: string) => Promise<void>;
    updateEntry: (id: string, updates: Partial<TimerEntry>) => Promise<void>;
    fetchEntries: (startDate?: Date, endDate?: Date) => Promise<void>;
    clearEntries: () => void;
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: ReactNode }) => {
    const [entries, setEntries] = useState<TimerEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<Session | null>(null);

    // Auth listener
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                console.log("🔐 Initial session found for:", session.user.email);
            } else {
                console.log("🔐 No active session");
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            console.log(`🔐 Auth event: ${event}`, session?.user?.email || "No user");
            setSession(session);
            // 🧹 Immediately clear entries on sign-out to prevent stale data
            if (event === "SIGNED_OUT") {
                setEntries([]);
                setLoading(false);
                console.log("🧹 Cleared entries on sign-out");
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Fetch entries when session changes (but skip if we just cleared on sign-out)
    useEffect(() => {
        if (session?.user) {
            fetchEntries();
        } else {
            // If there's no session, we already cleared entries in the auth listener,
            // but this is a safety net.
            setEntries([]);
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);

    const fetchEntries = useCallback(
        async (startDate?: Date, endDate?: Date) => {
            if (!session?.user) {
                console.warn("⏳ fetchEntries: No authenticated user");
                return;
            }
            console.log(
                `🔄 Fetching entries for user: ${session.user.email}`,
                startDate ? `from ${startDate.toISOString()}` : "",
                endDate ? `to ${endDate.toISOString()}` : ""
            );
            setLoading(true);
            let query = supabase
                .from("timer_entries")
                .select("*")
                .eq("user_id", session.user.id)
                .order("start_time", { ascending: false });

            if (startDate) {
                query = query.gte("start_time", startDate.toISOString());
            }
            if (endDate) {
                query = query.lte("end_time", endDate.toISOString());
            }

            const { data, error } = await query;
            if (error) {
                console.error("❌ Error fetching entries:", error);
                setEntries([]);
            } else {
                console.log(`✅ Fetched ${data?.length || 0} entries`);
                setEntries(data || []);
            }
            setLoading(false);
        },
        [session]
    );

    const addEntry = useCallback(
        async (duration: number, startTime: Date, endTime: Date) => {
            if (!session?.user) {
                console.error("❌ addEntry: Not authenticated");
                throw new Error("Not authenticated");
            }
            console.log(
                `🔄 Adding entry: ${duration}s, user: ${session.user.email}`,
                "start:",
                startTime.toISOString(),
                "end:",
                endTime.toISOString()
            );
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
            if (error) {
                console.error("❌ Error adding entry:", error);
                throw error;
            }
            console.log(`✅ Entry added with ID: ${data.id}`);
            setEntries((prev) => [data, ...prev]);
        },
        [session]
    );

    const deleteEntry = useCallback(
        async (id: string) => {
            if (!session?.user) {
                console.error("❌ deleteEntry: Not authenticated");
                throw new Error("Not authenticated");
            }
            console.log(`🔄 Deleting entry: ${id} for user ${session.user.email}`);
            const { error } = await supabase
                .from("timer_entries")
                .delete()
                .eq("id", id)
                .eq("user_id", session.user.id);
            if (error) {
                console.error("❌ Error deleting entry:", error);
                throw error;
            }
            console.log(`✅ Entry ${id} deleted`);
            setEntries((prev) => prev.filter((e) => e.id !== id));
        },
        [session]
    );

    const updateEntry = useCallback(
        async (id: string, updates: Partial<TimerEntry>) => {
            if (!session?.user) {
                console.error("❌ updateEntry: Not authenticated");
                throw new Error("Not authenticated");
            }
            console.log(`🔄 Updating entry: ${id} with`, updates);
            const { data, error } = await supabase
                .from("timer_entries")
                .update(updates)
                .eq("id", id)
                .eq("user_id", session.user.id)
                .select()
                .single();
            if (error) {
                console.error("❌ Error updating entry:", error);
                throw error;
            }
            console.log(`✅ Entry ${id} updated`);
            setEntries((prev) => prev.map((e) => (e.id === id ? data : e)));
        },
        [session]
    );

    const clearEntries = useCallback(() => {
        console.log("🧹 Clearing entries locally");
        setEntries([]);
    }, []);

    const value = useMemo(
        () => ({
            entries,
            loading,
            addEntry,
            deleteEntry,
            updateEntry,
            fetchEntries,
            clearEntries,
        }),
        [entries, loading, addEntry, deleteEntry, updateEntry, fetchEntries, clearEntries]
    );

    return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};

export const useTimer = () => {
    const context = useContext(TimerContext);
    if (!context) throw new Error("useTimer must be used within a TimerProvider");
    return context;
};