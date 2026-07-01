import supabase from '@/config/supabaseClient';

export interface SettingsRecord {
  key: string;
  value: string | boolean | number | null;
}

class SettingsRepository {
  async getAll() {
    const { data, error } = await supabase.from('settings').select('key, value');
    if (error) {
      throw error;
    }
    return data ?? [];
  }

  async upsertMany(records: SettingsRecord[]) {
    const { data, error } = await supabase.from('settings').upsert(records, { onConflict: 'key' }).select();
    if (error) {
      throw error;
    }
    return data ?? [];
  }
}

export const settingsRepository = new SettingsRepository();
