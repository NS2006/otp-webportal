import { API_BASE_URL } from "../App";

export const OTPService = {
    /**
     * Mengambil data histori OTP secara paginasi berdasarkan parameter query, pencarian, filter lanjutan, dan urutan waktu (sorting).
     */
    getPaginatedOTPs: async (userId: number, page: number, limit: number, search: string, filters: Record<string, string> = {}, sortOrder: string = "desc") => {
        const url = new URL(`${API_BASE_URL}/api/user/${userId}/otps/paginated`);
        url.searchParams.append('page', page.toString());
        url.searchParams.append('limit', limit.toString());
        url.searchParams.append('sort', sortOrder);

        // Menambahkan parameter query pencarian jika tersedia
        if (search) url.searchParams.append('search', search);

        // Menambahkan parameter filter lanjutan ke query string
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                url.searchParams.append(key, value);
            }
        });

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error("Gagal mengambil OTP log");
        return response.json();
    }
};