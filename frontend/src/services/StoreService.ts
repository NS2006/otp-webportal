import { API_BASE_URL } from "../App";
import type { Store } from "../types/Model";

export const StoreService = {
  /**
   * Mengambil daftar seluruh data store dari server.
   */
  getAll: async (): Promise<Store[]> => {
    const response = await fetch(`${API_BASE_URL}/api/store`);
    if (!response.ok) {
      throw new Error("Gagal mengambil data store");
    }
    return response.json();
  },

  /**
   * Menambahkan data store baru ke dalam sistem.
   */
  create: async (name: string, phoneNumber: string): Promise<Store> => {
    const response = await fetch(`${API_BASE_URL}/api/store`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, phoneNumber }),
    });
    
    if (!response.ok) {
      throw new Error("Gagal menambahkan store");
    }
    return response.json();
  },

  /**
   * Menghapus data store tertentu dari sistem berdasarkan ID.
   */
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/store/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Gagal menghapus store");
    }
  },
};