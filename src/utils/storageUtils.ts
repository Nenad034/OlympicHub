import { supabase } from '../supabaseClient';

export const saveToCloud = async (tableName: string, data: any[]) => {
    try {
        // We use upsert to insert or update existing records based on 'id'
        const { error } = await supabase
            .from(tableName)
            .upsert(data, { onConflict: 'id' });

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error(`Error saving to ${tableName}:`, error.message);
        return { success: false, error: error.message };
    }
};

export const loadFromCloud = async (tableName: string) => {
    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('*');

        if (error) throw error;
        return { success: true, data };
    } catch (error: any) {
        console.error(`Error loading from ${tableName}:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Generic sync hook logic (simplified for immediate use in components)
 */
export const syncAppStates = async (datasets: { table: string, data: any[] }[]) => {
    const promises = datasets.map(d => saveToCloud(d.table, d.data));
    return Promise.all(promises);
};
