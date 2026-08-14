import * as XLSX from 'xlsx';
import { API_BASE_URL } from '../App';

export type ParsedExcelData = {
  users: Array<{ name: string; email: string; phoneNumber?: string }>;
  stores: Array<{ name: string; phoneNumber: string }>;
  responsibilities: Array<{ userEmail: string; storeNames: string[] }>;
};

export const ExcelService = {
  // Baca dan Validasi Excel Matrix
  parseAndValidate: async (file: File): Promise<ParsedExcelData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });

          // Validasi keberadaan sheet di dalam workbook
          if (workbook.SheetNames.length === 0) {
            throw new Error("File Excel kosong atau tidak valid.");
          }

          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Konversi worksheet menjadi array dua dimensi (baris dan kolom)
          const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

          // Validasi minimum jumlah baris data
          if (rows.length < 2) {
            throw new Error("File Excel tidak memiliki cukup baris data.");
          }

          // Baris ke-0 -> Header kolom (Name, Email, Phone Number, dan Nama-nama Store)
          const headerRow = rows[0];
          
          // Baris ke-1 -> Nomor telepon store masing-masing kolom
          const storePhoneRow = rows[1];

          // Validasi kolom
          const nameIdx = headerRow.findIndex((h: any) => h && h.toString().toLowerCase() === 'name');
          const emailIdx = headerRow.findIndex((h: any) => h && h.toString().toLowerCase() === 'email');

          if (nameIdx === -1 || emailIdx === -1) {
            throw new Error("Kolom 'Name' atau 'Email' tidak ditemukan pada file Excel.");
          }

          const storesMap: Map<string, string> = new Map();
          const storeColumns: Array<{ index: number; name: string }> = [];

          for (let col = 3; col < headerRow.length; col++) {
            const storeName = headerRow[col];
            if (storeName && storeName.toString().trim() !== '') {
              const storePhone = storePhoneRow[col] ? storePhoneRow[col].toString() : '';
              storesMap.set(storeName, storePhone);
              storeColumns.push({ index: col, name: storeName });
            }
          }

          const users: Array<{ name: string; email: string; phoneNumber?: string }> = [];
          const stores: Array<{ name: string; phoneNumber: string }> = [];
          const responsibilities: Array<{ userEmail: string; storeNames: string[] }> = [];

          // Data Store
          storesMap.forEach((phoneNumber, name) => {
            stores.push({ name, phoneNumber });
          });

          // Data User
          for (let r = 2; r < rows.length; r++) {
            const row = rows[r];
            if (!row || row.length === 0) continue;

            const name = row[nameIdx];
            const email = row[emailIdx];
            const userPhone = row[2] ? row[2].toString() : '';

            if (name && email) {
              users.push({
                name: name.toString().trim(),
                email: email.toString().trim(),
                phoneNumber: userPhone,
              });

              // Cek store apa saja yang di-checklist "YES" oleh user ini
              const assignedStores: string[] = [];
              storeColumns.forEach((storeCol) => {
                const cellValue = row[storeCol.index];
                if (cellValue && cellValue.toString().toUpperCase() === 'YES') {
                  assignedStores.push(storeCol.name);
                }
              });

              responsibilities.push({
                userEmail: email.toString().trim(),
                storeNames: assignedStores,
              });
            }
          }

          resolve({ users, stores, responsibilities });
        } catch (error: any) {
          reject(new Error(error.message || "Gagal memproses file Excel."));
        }
      };

      reader.onerror = () => {
        reject(new Error("Gagal membaca file."));
      };

      reader.readAsArrayBuffer(file);
    });
  },

  // Mengirim parse data ke backend API
  syncDatabase: async (parsedData: ParsedExcelData) => {
    const response = await fetch(`${API_BASE_URL}/api/excel/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsedData),
    });

    if (!response.ok) {
      const errRes = await response.json();
      throw new Error(errRes.error || "Gagal melakukan sinkronisasi database.");
    }

    return response.json();
  }
};