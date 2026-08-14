import { API_BASE_URL } from "../App";

export const ResponsibilityService = {
  /**
   * Mengambil daftar store yang ditugaskan kepada user tertentu berdasarkan ID user.
   */
  getUserResponsibilities: async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/user/${userId}/responsibilities`);
    if (!response.ok) throw new Error("Gagal mengambil daftar tugas store");
    return response.json();
  },

  /**
   * Mengambil daftar user ditugaskan kepada toko tertentu berdasarkan ID store.
   */
  getStoreResponsibilities: async (storeId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/store/${storeId}/responsibilities`);
    if (!response.ok) throw new Error("Gagal mengambil daftar PIC store");
    return response.json();
  },

  /**
   * Memperbarui daftar penugasan store untuk user tertentu.
   */
  updateUserResponsibilities: async (userId: number, storeIds: number[]) => {
    const response = await fetch(`${API_BASE_URL}/api/user/${userId}/responsibilities`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeIds }),
    });
    if (!response.ok) throw new Error("Gagal menyimpan penugasan user");
    return response.json();
  },

  /**
   * Memperbarui daftar penugasan user untuk toko tertentu.
   */
  updateStoreResponsibilities: async (storeId: number, userIds: number[]) => {
    const response = await fetch(`${API_BASE_URL}/api/store/${storeId}/responsibilities`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds }),
    });
    if (!response.ok) throw new Error("Gagal menyimpan penugasan store");
    return response.json();
  }
};