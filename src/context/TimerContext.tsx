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
    const [loading, setLoading] = useState(true); // start as true to show loader
    const [session, setSession] = useState<Session | null>(null);

    // ---- Debug logs (can be removed later) ----
    useEffect(() => {
        console.log("🔍 [TimerContext] loading changed to:", loading);
    }, [loading]);
    useEffect(() => {
        console.log("🔍 [TimerContext] entries count changed to:", entries.length);
    }, [entries]);
    useEffect(() => {
        console.log("🔍 [TimerContext] session changed:", session?.user?.email || "null");
    }, [session]);

    // ---- DRY helper for authenticated operations ----
    const requireAuth = useCallback(() => {
        if (!session?.user) {
            console.error("❌ [TimerContext] Not authenticated");
            throw new Error("Not authenticated");
        }
        return session.user;
    }, [session]);

    // ---- Auth listener ----
    useEffect(() => {
        console.log("🔐 [TimerContext] Auth listener mounting...");
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                console.log("🔐 [TimerContext] Initial session found for:", session.user.email);
            } else {
                console.log("🔐 [TimerContext] No active session");
                // Keep loading true – we'll wait for session
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            console.log(`🔐 [TimerContext] Auth event: ${event}`, session?.user?.email || "No user");
            setSession(session);
            if (event === "SIGNED_OUT") {
                setEntries([]);
                setLoading(false); // no user, no data
                console.log("🧹 [TimerContext] Cleared entries on sign-out");
            }
        });

        return () => {
            console.log("🔐 [TimerContext] Auth listener unmounting");
            subscription.unsubscribe();
        };
    }, []);

    // ---- fetchEntries with proper auth check ----
    const fetchEntries = useCallback(
        async (startDate?: Date, endDate?: Date) => {
            console.log("🔷 [TimerContext] fetchEntries called", {
                startDate: startDate?.toISOString(),
                endDate: endDate?.toISOString(),
            });

            // If no session, skip fetching – keep loading as is (likely true)
            if (!session?.user) {
                console.warn("⏳ [TimerContext] fetchEntries: No authenticated user, skipping");
                // Do NOT set loading false; we want loader to stay until session appears
                return;
            }

            console.log(`🔄 [TimerContext] Fetching entries for user: ${session.user.email}`);
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
                console.error("❌ [TimerContext] Error fetching entries:", error);
                setEntries([]);
                setLoading(false);
                console.log("❌ [TimerContext] setLoading(false) after error");
                throw error;
            }

            console.log(`✅ [TimerContext] Fetched ${data?.length || 0} entries`);
            setEntries(data || []);
            setLoading(false);
            console.log("✅ [TimerContext] setLoading(false) after success");
        },
        [session] // depends on session – when session changes, function changes
    );

    // ---- addEntry (requires auth) ----
    const addEntry = useCallback(
        async (duration: number, startTime: Date, endTime: Date) => {
            const user = requireAuth();
            console.log(
                `🔄 [TimerContext] Adding entry: ${duration}s, user: ${user.email}`
            );
            const newEntry = {
                user_id: user.id,
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
                console.error("❌ [TimerContext] Error adding entry:", error);
                throw error;
            }
            console.log(`✅ [TimerContext] Entry added with ID: ${data.id}`);
            setEntries((prev) => [data, ...prev]);
        },
        [requireAuth]
    );

    // ---- deleteEntry (requires auth) ----
    const deleteEntry = useCallback(
        async (id: string) => {
            const user = requireAuth();
            console.log(`🔄 [TimerContext] Deleting entry: ${id}`);
            const { error } = await supabase
                .from("timer_entries")
                .delete()
                .eq("id", id)
                .eq("user_id", user.id);
            if (error) {
                console.error("❌ [TimerContext] Error deleting entry:", error);
                throw error;
            }
            console.log(`✅ [TimerContext] Entry ${id} deleted`);
            setEntries((prev) => prev.filter((e) => e.id !== id));
        },
        [requireAuth]
    );

    // ---- updateEntry (requires auth) ----
    const updateEntry = useCallback(
        async (id: string, updates: Partial<TimerEntry>) => {
            const user = requireAuth();
            console.log(`🔄 [TimerContext] Updating entry: ${id}`);
            const { data, error } = await supabase
                .from("timer_entries")
                .update(updates)
                .eq("id", id)
                .eq("user_id", user.id)
                .select()
                .single();
            if (error) {
                console.error("❌ [TimerContext] Error updating entry:", error);
                throw error;
            }
            console.log(`✅ [TimerContext] Entry ${id} updated`);
            setEntries((prev) => prev.map((e) => (e.id === id ? data : e)));
        },
        [requireAuth]
    );

    // ---- clearEntries ----
    const clearEntries = useCallback(() => {
        console.log("🧹 [TimerContext] Clearing entries locally");
        setEntries([]);
    }, []);

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
        }),
        [
            entries,
            loading,
            addEntry,
            deleteEntry,
            updateEntry,
            fetchEntries,
            clearEntries,
        ]
    );

    return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};

export const useTimer = () => {
    const context = useContext(TimerContext);
    if (!context) throw new Error("useTimer must be used within a TimerProvider");
    return context;
};