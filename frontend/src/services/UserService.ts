import { API_BASE_URL } from "../App";
import type { User } from "../types/Model";

export const UserService = {
  /**
   * Mengambil daftar seluruh data user dari server.
   */
  getAll: async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/api/user`);
    if (!response.ok) {
      throw new Error("Gagal mengambil data user");
    }
    return response.json();
  },

  /**
   * Menambahkan data user baru ke dalam sistem.
   */
  create: async (name: string, email: string, phoneNumber: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/api/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, phoneNumber }),
    });
    
    if (!response.ok) {
      throw new Error("Gagal menambahkan user");
    }
    return response.json();
  },

  /**
   * Menghapus data user tertentu dari sistem berdasarkan ID.
   */
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/user/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Gagal menghapus user");
    }
  },

  /**
   * Memperbarui status aktif atau non-aktif akun user.
   */
  toggleStatus: async (id: number, isActive: boolean): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/api/user/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isActive }),
    });

    if (!response.ok) {
      throw new Error("Gagal mengubah status user");
    }
    return response.json();
  },

  /**
   * Memperbarui status hak akses Admin / User biasa pada user.
   */
  toggleAdminStatus: async (id: number, isAdmin: boolean): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/api/user/${id}/admin`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isAdmin }),
    });

    if (!response.ok) {
      throw new Error("Gagal mengubah role admin user");
    }
    return response.json();
  },
};