import { Users, Store as StoreIcon, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Modal from "./Modal";
import type { LayoutContextType } from "../layouts/MainLayout";
import type { ManageContextType } from "../layouts/ManageLayout";
import type { ManageEntityTableProps } from "../types/Props";

type CombinedContextType = ManageContextType & LayoutContextType;

/**
 * ManageEntityTable Component
 * 
 * Komponen tabel generik yang dapat digunakan kembali untuk mengelola entitas (seperti User atau Store),
 * Terdapat fitur pencarian, pengurutan (sorting), penomoran halaman (pagination), serta modal form tambah data.
 */
export default function ManageEntityTable<T extends { id: number; name: string }>({
  entityTitle,
  items,
  isLoading,
  onFetch,
  onCreate,
  filterFn,
  columns,
  formFields,
  targetType,
  renderActions,
}: ManageEntityTableProps<T>) {
  const { isAddModalOpen, setIsAddModalOpen, searchQuery, showFeedbackModal } =
    useOutletContext<CombinedContextType>();

  // State lokal untuk form penambahan entitas baru dan status pengiriman
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk pengaturan pengurutan tabel (sorting)
  const [sortField, setSortField] = useState<string>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // State untuk manajemen pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /**
   * Mengatur ulang halaman aktif ke halaman 1 setiap kali query pencarian berubah.
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  /**
   * Menangani perubahan nilai input pada form tambah entitas.
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Menangani proses pengiriman (submit) form untuk membuat entitas baru.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onCreate(formData);
      setFormData({});
      setIsAddModalOpen(false);
      onFetch();
      showFeedbackModal("success", "Berhasil!", `${entityTitle} baru berhasil ditambahkan.`);
    } catch (error: any) {
      console.error(`Error adding ${entityTitle.toLowerCase()}:`, error);
      showFeedbackModal("error", "Gagal!", error.message || "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Menyaring data item berdasarkan fungsi filter dan query pencarian
  const filteredItems = items.filter((item) => filterFn(item, searchQuery));

  // Mengurutkan data item berdasarkan kolom dan urutan (asc/desc) yang dipilih
  const sortedItems = [...filteredItems].sort((a: any, b: any) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Perhitungan data untuk memotong (slice) item sesuai halaman aktif (Pagination Slicing)
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedItems.slice(indexOfFirstItem, indexOfLastItem);

  /**
   * Mengatur kolom dan arah pengurutan saat header tabel diklik.
   */
  const handleSort = (sortKey?: string) => {
    if (!sortKey) return;
    if (sortField === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(sortKey);
      setSortOrder("asc");
    }
    setCurrentPage(1); // Reset kembali ke halaman 1 saat pengurutan berubah
  };

  return (
    <>
      {/* Modal Dialog Form Tambah Entitas Baru */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Add New ${entityTitle}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formFields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                value={formData[field.name] || ""}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                placeholder={field.placeholder}
              />
            </div>
          ))}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : `Save ${entityTitle}`}
            </button>
          </div>
        </form>
      </Modal>

      {/* Tampilan Kondisional Jika Data Kosong */}
      {sortedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full min-h-100 text-gray-400">
          {targetType === "user" ? <Users size={64} className="mb-4 text-gray-300" /> : <StoreIcon size={64} className="mb-4 text-gray-300" />}
          <h2 className="text-xl font-semibold text-slate-700 mb-2">
            No {entityTitle}s Found
          </h2>
          <p className="text-sm">
            {items.length === 0
              ? `There are no ${entityTitle.toLowerCase()}s registered in the system yet.`
              : `Tidak ada hasil yang cocok dengan "${searchQuery}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top Bar: Informasi jumlah data & Kontrol Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <p className="text-xs text-gray-500">
              Menampilkan <span className="font-semibold text-slate-700">{sortedItems.length > 0 ? indexOfFirstItem + 1 : 0}</span> sampai{" "}
              <span className="font-semibold text-slate-700">{Math.min(indexOfLastItem, sortedItems.length)}</span> dari{" "}
              <span className="font-semibold text-slate-700">{sortedItems.length}</span> data
            </p>

            <div className={`flex items-center gap-2 shrink-0 bg-white border border-gray-200 rounded-lg p-1 shadow-2xs transition-opacity ${totalPages <= 1 ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-medium text-slate-700 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Tabel Data Utama */}
          <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-sm text-gray-400 font-medium">
                  {columns.map((col, idx) => {
                    const isSortable = Boolean(col.sortKey);
                    const isCurrentSort = sortField === col.sortKey;

                    return (
                      <th 
                        key={idx} 
                        onClick={() => handleSort(col.sortKey)}
                        className={`py-3 px-4 ${col.className || ""} ${isSortable ? "cursor-pointer select-none hover:text-slate-600 transition-colors" : ""}`}
                      >
                        <div className="inline-flex items-center gap-1.5">
                          <span>{col.header}</span>
                          {isSortable && (
                            <span className="text-gray-400">
                              {isCurrentSort ? (
                                sortOrder === "asc" ? <ArrowUp size={14} className="text-emerald-600" /> : <ArrowDown size={14} className="text-emerald-600" />
                              ) : (
                                <ArrowUpDown size={14} className="opacity-50 hover:opacity-100" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-slate-700 text-sm">
                {currentItems.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    {columns.map((col, idx) => (
                      <td key={idx} className={`py-3 px-4 ${col.className || ""}`}>
                        {col.accessor(item)}
                      </td>
                    ))}
                    <td className="py-3 px-4 text-right">
                      {renderActions ? renderActions(item) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}