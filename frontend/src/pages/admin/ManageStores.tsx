import { useEffect, useState } from 'react';
import { Trash2, Eye } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { StoreService } from '../../services/StoreService';
import ManageEntityTable from '../../components/ManageEntityTable';
import AssignButton from '../../components/AssignButton';
import ViewResponsibilitiesModal from '../../components/ViewResponsibilitiesModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import type { LayoutContextType } from '../../layouts/MainLayout'; 
import type { ManageContextType } from '../../layouts/ManageLayout';
import type { Store } from '../../types/Model';

type CombinedContextType = ManageContextType & LayoutContextType;

/**
 * ManageStores Page
 * 
 * Halaman untuk handle data Store,
 * mencakup CRUD terhadap data store
 */
export default function ManageStores() {
  const { t } = useTranslation();
  
  // State lokal untuk manajemen daftar store, status loading, modal view, dan modal delete
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedStoreForView, setSelectedStoreForView] = useState<any | null>(null);

  const [storeToDelete, setStoreToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mengambil fungsi penampil modal feedback global dari parent layout
  const { showFeedbackModal } = useOutletContext<CombinedContextType>();

  /**
   * Fetch seluruh data daftar store dari layanan StoreService.
   */
  const fetchStores = async () => {
    try {
      setIsLoading(true);
      const data = await StoreService.getAll();
      setStores(data);
    } catch (error) {
      console.error("Gagal mengambil data store:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mengambil data store saat komponen pertama kali dimuat
  useEffect(() => {
    fetchStores();
  }, []);

  /**
   * Menangani proses konfirmasi penghapusan store berdasarkan ID yang dipilih.
   */
  const handleConfirmDelete = async () => {
    if (!storeToDelete) return;

    setIsDeleting(true);
    try {
      await StoreService.delete(storeToDelete.id);
      fetchStores();
      setStoreToDelete(null); 
      showFeedbackModal(
        "success", 
        t("manageStores.feedback.successTitle", "Berhasil!"), 
        t("manageStores.feedback.deleted", { name: storeToDelete.name })
      );
    } catch (error: any) {
      console.error("Error deleting store:", error);
      showFeedbackModal(
        "error", 
        t("manageStores.feedback.errorTitle", "Gagal!"), 
        error.message || t("manageStores.feedback.deleteError", "Gagal menghapus store.")
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Komponen Tabel Generik untuk Manajemen Entitas Store */}
      <ManageEntityTable
        entityTitle={t("manageStores.entityTitle", "Store")}
        items={stores}
        isLoading={isLoading}
        onFetch={fetchStores}
        onCreate={(data) => StoreService.create(data.name, data.phoneNumber)}
        filterFn={(store: any, query) =>
          store.name.toLowerCase().includes(query.toLowerCase()) ||
          store.phoneNumber.toLowerCase().includes(query.toLowerCase())
        }
        targetType="store"
        formFields={[
          { name: "name", label: t("manageStores.form.name", "Name"), type: "text", placeholder: "e.g. Blibli Mart" },
          { name: "phoneNumber", label: t("manageStores.form.phoneNumber", "Phone Number"), type: "tel", placeholder: "e.g. 081234567890" },
        ]}
        columns={[
          { header: t("manageStores.columns.name", "NAME"), sortKey: "name", accessor: (s: any) => <span className="font-medium text-slate-800">{s.name}</span> },
          { header: t("manageStores.columns.phoneNumber", "PHONE NUMBER"), accessor: (s: any) => <span className="text-gray-500">{s.phoneNumber}</span> },
        ]}
        renderActions={(store: any) => (
          <div className="flex items-center justify-end gap-2">
            
            {/* Tombol Modal Lihat Detail User yang Ditugaskan */}
            <button
              onClick={() => setSelectedStoreForView(store)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-medium transition-all shadow-sm"
              title={t("manageStores.actions.viewDetail", "View Assigned Users")}
            >
              <Eye size={14} className="text-blue-500" />
              <span className="hidden xl:inline">{t("manageStores.actions.detail", "Detail")}</span>
            </button>

            {/* Tombol Assign User */}
            <AssignButton
              targetId={store.id}
              targetName={store.name}
              targetType="store"
              onAssigned={fetchStores}
            />

            {/* Tombol Hapus Store */}
            <button
              onClick={() => setStoreToDelete(store)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-200 rounded-lg text-xs font-medium transition-all shadow-sm"
              title={t("manageStores.actions.delete", "Delete Store")}
            >
              <Trash2 size={14} />
              <span className="hidden xl:inline">{t("manageStores.actions.deleteLabel", "Hapus")}</span>
            </button>
            
          </div>
        )}
      />

      {/* Modal yang menampilkan Daftar User yang Terhubung  */}
      {selectedStoreForView && (
        <ViewResponsibilitiesModal
          isOpen={Boolean(selectedStoreForView)}
          onClose={() => setSelectedStoreForView(null)}
          targetName={selectedStoreForView.name}
          targetType="store"
          items={selectedStoreForView.userResponsibilities || []}
        />
      )}

      {/* Confirmation Modal */}
      {storeToDelete && (
        <ConfirmationModal
          isOpen={Boolean(storeToDelete)}
          onClose={() => setStoreToDelete(null)}
          onConfirm={handleConfirmDelete}
          title={t("manageStores.modal.deleteTitle", "Hapus Store")}
          message={t("manageStores.modal.deleteMessage", { name: storeToDelete.name })}
          confirmText={t("manageStores.modal.confirmDelete", "Ya, Hapus")}
          cancelText={t("manageStores.modal.cancel", "Batal")}
          type="danger"
          isLoading={isDeleting}
        />
      )}
    </>
  );
}