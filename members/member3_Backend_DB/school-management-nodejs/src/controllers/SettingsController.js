import { SettingsService } from '../services/SettingsService.js';

export const SettingsController = {
  async getPermissions(req, res) {
    try {
      const permissions = await SettingsService.getPermissions();
      return res.json({ success: true, data: permissions });
    } catch (err) {
      console.error('[SettingsController] getPermissions error:', err);
      return res.status(500).json({ success: false, message: err.message || 'Lỗi server' });
    }
  },

  async savePermissions(req, res) {
    try {
      const { matrix } = req.body;
      if (!matrix) {
        return res.status(400).json({ success: false, message: 'Thiếu trường matrix' });
      }
      const saved = await SettingsService.savePermissions(matrix);
      return res.json({ success: true, data: saved });
    } catch (err) {
      console.error('[SettingsController] savePermissions error:', err);
      return res.status(500).json({ success: false, message: err.message || 'Lỗi server' });
    }
  },
};
