import { useState } from "react";
import { ShieldPlus, Search, Loader2 } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Modal from "./Modal";
import type { FormEvent } from "react";
import type { LayoutContextType } from "../layouts/MainLayout";
import type { AssignButtonProps } from "../types/Props";

import { StoreService } from "../services/StoreService";
import { UserService } from "../services/UserService";
import { ResponsibilityService } from "../services/ResponsibilityService";

/**
 * AssignButton Component
 * 
 * Komponen reusable untuk membuka modal manajemen relasi/penugasan (responsibility).
 * Dapat digunakan secara dinamis untuk:
 * - Menugaskan beberapa Store ke seorang User (`targetType === "user"`)
 * - Menugaskan beberapa User ke sebuah Store (`targetType === "store"`)
 */
export default function AssignButton({ targetId, targetName, targetType, onAssigned }: AssignButtonProps) {
  const { t } = useTranslation();
  const { showFeedbackModal } = useOutletContext<LayoutContextType>() || { showFeedbackModal: null };

  // Local State Management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState<Array<{ id: number; name: string; subtitle?: string }>>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Menangani aksi pembukaan modal dan melakukan pengambilan data awal (fetching)
   * secara paralel berdasarkan apakah targetnya adalah User atau Store.
   */
  const handleOpenModal = async () => {
    setIsModalOpen(true);
    setIsLoading(true);
    setSearchQuery(""); 

    try {
      if (targetType === "user") {
        // Ambil semua daftar store dan store yang sudah di-assign ke user ini
        const [allStores, assignedData] = await Promise.all([
          StoreService.getAll(),
          ResponsibilityService.getUserResponsibilities(targetId)
        ]);

        setItems(allStores.map((s: any) => ({ id: s.id, name: s.name, subtitle: s.phoneNumber })));
        setSelectedIds(assignedData.map((item: any) => item.storeId));
        
      } else {
        // Ambil semua daftar user dan user yang sudah di-assign ke store ini
        const [allUsers, assignedData] = await Promise.all([
          UserService.getAll(),
          ResponsibilityService.getStoreResponsibilities(targetId)
        ]);

        setItems(allUsers.map((u: any) => ({ id: u.id, name: u.name, subtitle: u.email })));
        setSelectedIds(assignedData.map((item: any) => item.userId));
      }
    } catch (error) {
      console.error("Gagal memuat data assignment:", error);
      if (showFeedbackModal) {
        showFeedbackModal("error", t("assignButton.feedback.errorTitle", "Error"), t("assignButton.feedback.loadError", "Gagal memuat data penugasan."));
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Mengubah status centang (checkbox) pada item yang dipilih/dibatalkan.
   */
  const handleCheckboxChange = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  /**
   * Melakukan filter pada daftar item berdasarkan query pencarian (nama atau subtitle).
   */
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  /**
   * Menyimpan perubahan data penugasan ke backend melalui service yang sesuai.
   */
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (targetType === "user") {
        await ResponsibilityService.updateUserResponsibilities(targetId, selectedIds);
      } else {
        await ResponsibilityService.updateStoreResponsibilities(targetId, selectedIds);
      }

      setIsModalOpen(false);
      onAssigned(); // Callback untuk pembaruan data di komponen parent
      
      if (showFeedbackModal) {
        showFeedbackModal("success", t("assignButton.feedback.successTitle", "Berhasil!"), t("assignButton.feedback.saveSuccess", "Penugasan berhasil diperbarui."));
      }
    } catch (error: any) {
      console.error("Error saving assignment:", error);
      if (showFeedbackModal) {
        showFeedbackModal("error", t("assignButton.feedback.errorTitle", "Gagal!"), error.message || t("assignButton.feedback.saveError", "Gagal menyimpan penugasan."));
      } else {
        alert(t("assignButton.feedback.saveError", "Gagal menyimpan penugasan."));
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Tombol untuk Modal */}
      <button
        onClick={handleOpenModal}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-lg text-xs font-medium transition-colors"
        title={targetType === "user" ? t("assignButton.assignStores", "Assign Stores") : t("assignButton.assignUsers", "Assign Users")}
      >
        <ShieldPlus size={14} />
        {targetType === "user" ? t("assignButton.assignStores", "Assign Stores") : t("assignButton.assignUsers", "Assign Users")}
      </button>

      {/* Modal Dialog Management */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={targetType === "user" ? t("assignButton.modalTitleUser", { name: targetName }) : t("assignButton.modalTitleStore", { name: targetName })}
        maxWidth="max-w-xl" 
      >
        <form onSubmit={handleSave} className="space-y-4">
          <p className="text-sm text-gray-500 mb-2">
            {targetType === "user" 
              ? t("assignButton.descriptionUser", "Pilih store yang menjadi tanggung jawab user ini:") 
              : t("assignButton.descriptionStore", "Pilih user yang bertanggung jawab atas store ini:")}
          </p>

          {/* Kotak Pencarian (Hanya muncul jika data selesai dimuat dan ada item) */}
          {!isLoading && items.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={targetType === "user" ? t("assignButton.searchStorePlaceholder", "Cari nama store...") : t("assignButton.searchUserPlaceholder", "Cari nama user atau email...")}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* Kondisi Loading / Tampilan Daftar Item */}
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-sm text-emerald-500 gap-3">
              <Loader2 className="animate-spin" size={28} />
              <span>{t("assignButton.loading", "Memuat data...")}</span>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-100 rounded-lg p-3 bg-gray-50/50 custom-scrollbar">
              {filteredItems.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-400 italic">
                  {t("assignButton.noDataMatch", { query: searchQuery })}
                </div>
              ) : (
                filteredItems.map((item) => (
                  <label 
                    key={item.id} 
                    className="flex items-center justify-between gap-3 p-2.5 hover:bg-white rounded-md cursor-pointer transition-colors border border-transparent hover:border-gray-100 hover:shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleCheckboxChange(item.id)}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 shrink-0"
                      />
                      <span className="text-sm font-medium text-slate-700 truncate" title={item.name}>
                        {item.name}
                      </span>
                    </div>

                    {item.subtitle && (
                      <span className="text-xs text-gray-400 shrink-0 font-mono">
                        {item.subtitle}
                      </span>
                    )}
                  </label>
                ))
              )}
            </div>
          )}

          {/* Tombol Aksi Bawah (Cancel & Save) */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
            >
              {t("common.cancel", "Cancel")}
            </button>
            <button
              type="submit"
              disabled={isSaving || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
            >
              {isSaving && <Loader2 className="animate-spin" size={16} />}
              {isSaving ? t("assignButton.saving", "Saving...") : t("assignButton.save", "Save Assignments")}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}