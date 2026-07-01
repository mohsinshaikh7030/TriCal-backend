import { ApiError } from '@/utils/ApiError';
import { settingsRepository } from '@/repositories/SettingsRepository';
import { settingsSchema, type SettingsPayload } from '@/validation/SettingsValidation';

class SettingsService {
  async getSettings() {
    const records = await settingsRepository.getAll();
    const parsed = records.reduce<Record<string, unknown>>((acc, record) => {
      acc[record.key as string] = record.value;
      return acc;
    }, {});

    return parsed;
  }

  async updateSettings(payload: SettingsPayload) {
    const validated = settingsSchema.parse(payload);
    const flattened = this.flattenSettings(validated);
    const updates = flattened.map(([key, value]) => ({ key, value }));
    const data = await settingsRepository.upsertMany(updates);

    if (!data) {
      throw new ApiError(500, 'Failed to update settings.');
    }

    return data;
  }

  private flattenSettings(settings: SettingsPayload) {
    const entries: Array<[string, string | boolean | number]> = [];

    const visit = (value: unknown, prefix = '') => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
          const nextKey = prefix ? `${prefix}.${key}` : key;
          visit(child, nextKey);
        });
        return;
      }

      if (prefix) {
        entries.push([prefix, value as string | boolean | number]);
      }
    };

    visit(settings);
    return entries;
  }
}

export const settingsService = new SettingsService();
