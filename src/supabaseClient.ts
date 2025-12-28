import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Safe client creation to prevent crash if env vars are missing
let client: any;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("⚠️ OlympicHub: Supabase Cloud credentials missing. App running in OFFLINE/DEMO mode.");
    // specific mock implementation to prevent white screen
    client = {
        from: () => ({
            select: () => ({
                limit: () => ({
                    single: () => Promise.resolve({ data: null, error: null })
                }),
                order: () => Promise.resolve({ data: [] }),
                eq: () => Promise.resolve({ data: [] })
            }),
            upsert: () => Promise.resolve({ error: null }),
            insert: () => ({ select: () => Promise.resolve({ data: [] }) }),
            update: () => Promise.resolve({ error: null }),
            delete: () => Promise.resolve({ error: null })
        }),
        auth: {
            getSession: () => Promise.resolve({ data: { session: null } }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } })
        }
    };
} else {
    client = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = client;
