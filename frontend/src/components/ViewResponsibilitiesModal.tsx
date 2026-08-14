import Modal from "./Modal";
import { Store, Users, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ViewResponsibilitiesModalProps } from "../types/Props";

/**
 * ViewResponsibilitiesModal Component
 * 
 * Komponen modal untuk menampilkan daftar lengkap entitas yang saling terhubung, seperti daftar store yang di-assign ke user tertentu atau sebaliknya, dan dengan fitur pencarian real-time.
 */
export default function ViewResponsibilitiesModal({
  isOpen,
  onClose,
  targetName,
  targetType,
  items,
}: ViewResponsibilitiesModalProps) {
  const { t } = useTranslation();
  
  // State lokal untuk menampung query pencarian entitas dalam modal
  const [searchQuery, setSearchQuery] = useState("");

  // Cek apakah target adalah user atau store
  const isUserTarget = targetType === "user";
  
  // Judul modal dan ikon representatif berdasarkan tipe target
  const title = isUserTarget 
    ? t("viewResponsibilitiesModal.titleUser", { name: targetName }) 
    : t("viewResponsibilitiesModal.titleStore", { name: targetName });
  const Icon = isUserTarget ? Store : Users;

  // Filter daftar item berdasarkan query pencarian
  const filteredItems = items.filter((item: any) => {
    const entity = isUserTarget ? item.store : item.user;
    const name = entity?.name || item.name || "";
    const secondary = entity?.phoneNumber || entity?.email || "";

    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      secondary.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-3 py-2">
        
        {/* Deskripsi */}
        <p className="text-sm text-gray-500 mb-3">
          {isUserTarget 
            ? t("viewResponsibilitiesModal.descUser", "Daftar lengkap store yang terhubung dengan entitas ini:") 
            : t("viewResponsibilitiesModal.descStore", "Daftar lengkap user yang terhubung dengan entitas ini:")}
        </p>

        {/* Kotak Pencarian */}
        {items.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isUserTarget ? t("viewResponsibilitiesModal.searchStore", "Cari nama store...") : t("viewResponsibilitiesModal.searchUser", "Cari nama user...")}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
            />
          </div>
        )}

        {/* Kondisi Konten: Kosong Total, Tidak Ada Hasil Filter, atau Daftar Item Terhubung */}
        {items.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400 italic">
            {isUserTarget 
              ? t("viewResponsibilitiesModal.emptyStore", "Belum ada store yang ditugaskan.") 
              : t("viewResponsibilitiesModal.emptyUser", "Belum ada user yang ditugaskan.")}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400 italic">
            {t("viewResponsibilitiesModal.noResult", { query: searchQuery })}
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto space-y-2 border border-gray-100 rounded-lg p-3 bg-gray-50/50">
            {filteredItems.map((item: any) => {
              const entity = isUserTarget ? item.store : item.user;
              return (
                <div 
                  key={entity?.id || item.id} 
                  className="flex items-center justify-between p-2.5 bg-white rounded-md border border-gray-100 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Icon size={14} />
                    </div>
                    <span className="text-sm font-medium text-slate-700 truncate">
                      {entity?.name || item.name}
                    </span>
                  </div>
                  
                  {/* Informasi Nomor Telepon atau Email */}
                  {(entity?.phoneNumber || entity?.email) && (
                    <span className="text-xs text-gray-400 font-mono shrink-0">
                      {entity.phoneNumber || entity.email}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tombol Close Modal */}
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium text-sm"
          >
            {t("common.close", "Close")}
          </button>
        </div>

      </div>
    </Modal>
  );
}