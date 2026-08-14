import { API_BASE_URL } from "../App";

export const SettingsService = {
  /**
   * Mengambil data konfigurasi pengaturan sistem global dari server.
   */
  getSettings: async () => {
    const response = await fetch(`${API_BASE_URL}/api/settings`);
    if (!response.ok) throw new Error("Gagal mengambil pengaturan");
    return response.json();
  },

  /**
   * Memperbarui parameter konfigurasi pengaturan sistem global (masa retensi OTP).
   */
  updateSettings: async (otpRetentionDays: number) => {
    const response = await fetch(`${API_BASE_URL}/api/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otpRetentionDays }),
    });
    if (!response.ok) throw new Error("Gagal menyimpan pengaturan");
    return response.json();
  }
};