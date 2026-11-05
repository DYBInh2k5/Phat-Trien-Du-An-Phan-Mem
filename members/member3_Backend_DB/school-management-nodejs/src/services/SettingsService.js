import { SettingsRepository } from '../repositories/SettingsRepository.js';

const DEFAULT_PERMISSIONS = {
  gradebook:  { GV: true,  GVCN: true,  BGH: true,  PH: false, HS: false },
  attendance: { GV: true,  GVCN: true,  BGH: true,  PH: false, HS: false },
  schedule:   { GV: true,  GVCN: true,  BGH: true,  PH: true,  HS: true  },
  reports:    { GV: false, GVCN: false, BGH: true,  PH: false, HS: false },
  settings:   { GV: false, GVCN: false, BGH: true,  PH: false, HS: false },
};

export const SettingsService = {
  async getPermissions() {
    try {
      const stored = await SettingsRepository.getByKey('permissions');
      if (stored && typeof stored === 'object') return stored;
    } catch (err) {
      console.warn('[SettingsService] Could not load permissions from DB, using defaults:', err.message);
    }
    return DEFAULT_PERMISSIONS;
  },

  async savePermissions(matrix) {
    if (!matrix || typeof matrix !== 'object') {
      throw new Error('Invalid permissions matrix');
    }
    // Ensure BGH always has settings access
    if (matrix.settings) matrix.settings.BGH = true;
    await SettingsRepository.upsert('permissions', matrix);
    return matrix;
  },
};
