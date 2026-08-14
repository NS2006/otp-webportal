import { useState, useEffect } from "react";
import Modal from "./Modal";
import { useTranslation } from "react-i18next";
import type { FilterField } from "../types/Helper"; 

interface FilterModalProps {
  /** Status visibilitas modal */
  isOpen: boolean;
  /** Dijalankan saat modal ditutup atau dibatalkan */
  onClose: () => void;
  /** Mengirim data kumpulan filter yang dipilih ke komponen parent */
  onApply: (filters: Record<string, string>) => void;
  /** Judul modal */
  title?: string;
  /** Array konfigurasi untuk field input filter yang akan dirender*/
  fields: FilterField[];
  /** Nilai filter yang sedang aktif saat ini sebagai state awal */
  currentFilters: Record<string, string>;
}

/**
 * FilterModal Component
 * 
 * Modal untuk menyaring data berdasarkan kumpulan field 
 * yang dikonfigurasi (mendukung tipe text, date, dan select option).
 */
export default function FilterModal({
  isOpen,
  onClose,
  onApply,
  title,
  fields,
  currentFilters,
}: FilterModalProps) {
  const { t } = useTranslation();
  
  // State lokal untuk menampung nilai input filter sebelum diterapkan
  const [localFilters, setLocalFilters] = useState<Record<string, string>>({});

  const resolvedTitle = title || t("filterModal.defaultTitle", "Filter Data");

  // Sinkronisasi state filter lokal dengan filter aktif setiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(currentFilters);
    }
  }, [isOpen, currentFilters]);

  /**
   * Menangani perubahan nilai pada field filter tertentu secara dinamis.
   */
  const handleChange = (id: string, value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  /**
   * Menerapkan filter yang dipilih ke komponen induk dan menutup modal.
   */
  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(localFilters);
    onClose();
  };

  /**
   * Menghapus semua nilai filter (reset) dan menutup modal.
   */
  const handleReset = () => {
    setLocalFilters({});
    onApply({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={resolvedTitle}>
      <form onSubmit={handleApply} className="space-y-4">
        
        {/* Render Form Field secara Dinamis Berdasarkan Konfigurasi Fields */}
        {fields.map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>

            {/* Render Input Tipe Text */}
            {field.type === "text" && (
              <input
                type="text"
                value={localFilters[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            )}

            {/* Render Input Tipe Date */}
            {field.type === "date" && (
              <input
                type="date"
                value={localFilters[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            )}

            {/* Render Input Tipe Select (Dropdown) */}
            {field.type === "select" && (
              <select
                value={localFilters[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
              >
                <option value="">{t("filterModal.allPrefix", "Semua")} {field.label}</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}

        {/* Tombol Aksi Bawah (Reset, Batal, & Terapkan) */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm"
          >
            {t("filterModal.reset", "Reset Filter")}
          </button>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
            >
              {t("common.cancel", "Batal")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium text-sm"
            >
              {t("filterModal.apply", "Terapkan")}
            </button>
          </div>
        </div>

      </form>
    </Modal>
  );
}