import { useState, useEffect } from "react";
import { Store as StoreIcon, Search, ChevronLeft, ChevronRight, Phone, ShieldCheck, Loader2, RefreshCw } from "lucide-react"; 
import { useTranslation } from "react-i18next";
import { ResponsibilityService } from "../services/ResponsibilityService";

/**
 * StoreListSection Component
 * 
 * Menampilkan daftar store yang ditugaskan kepada user tertentu dengan fitur pencarian real-time, tombol refresh manual, dan kontrol pagination data.
 */
export default function StoreListSection({ userId }: { userId: number }) {
  const { t } = useTranslation();

  // State Manajemen Data & Status Loading
  const [stores, setStores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State Manajemen Pencarian & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // State Refresh Manual
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /**
   * Efek samping untuk mengambil data store yang di-assign berdasarkan userId
   * setiap kali terjadi perubahan pada userId atau ketika tombol refresh ditekan.
   */
  useEffect(() => {
    if (!userId) return;

    const fetchStores = async () => {
      setIsLoading(true);
      try {
        const responsibilities = await ResponsibilityService.getUserResponsibilities(userId);
        
        // Ekstraksi data store dari objek relasi responsibility
        const fetchedStores = responsibilities
          .map((item: any) => item.store)
          .filter(Boolean);
          
        setStores(fetchedStores);
      } catch (error) {
        console.error("Gagal memuat store:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, [userId, refreshTrigger]);

  // Mengatur ulang halaman aktif ke halaman 1 setiap kali query pencarian berubah
  useEffect(() => setCurrentPage(1), [searchQuery]);

  // Filter daftar store berdasarkan nama atau nomor telepon serta mengurutkannya berdasarkan ID
  const filteredStores = stores.filter((store: any) => {
    const storeName = store?.name?.toLowerCase() || "";
    const storePhone = store?.phoneNumber?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return storeName.includes(query) || storePhone.includes(query);
  }).sort((a: any, b: any) => a.id - b.id);

  // Total halaman dan slicing untuk pagination
  const totalPages = Math.max(1, Math.ceil(filteredStores.length / itemsPerPage));
  const currentStores = filteredStores.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div id="stores-section" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      
      {/* Top Header Section: Judul, Total Counter, & Toolbar Kontrol */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        
        {/* Judul & Badge Total Store Terkait */}
        <div className="flex items-center gap-2">
          <StoreIcon size={20} className="text-emerald-500" />
          <h2 className="text-lg font-bold text-slate-800">{t("stores.title")}</h2>
          <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full ml-2">
            {filteredStores.length} {t("stores.total")}
          </span>
        </div>

        {/* Toolbar Kontrol: Refresh Button, Search Input, & Navigasi Pagination */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          
          {/* Tombol Refresh Manual */}
          <button
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            disabled={isLoading}
            className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 border border-gray-200 bg-white transition-colors disabled:opacity-50 shadow-sm"
            title="Refresh Stores"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin text-emerald-500" : ""} />
          </button>

          {/* Kotak Input Pencarian */}
          {stores.length > 0 && (
            <div className="relative w-full sm:w-50">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("stores.search")}
                className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
            </div>
          )}

          {/* Kontrol Navigasi Pagination */}
          <div className={`flex items-center gap-1 shrink-0 bg-gray-50 border border-gray-200 rounded-lg p-1 transition-opacity ${totalPages <= 1 || isLoading ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-1 rounded text-gray-600 hover:bg-white disabled:opacity-30 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-medium text-slate-700 px-2">{currentPage}/{totalPages}</span>
            <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-1 rounded text-gray-600 hover:bg-white disabled:opacity-30 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Kondisi Konten: Loading, Kosong Total, Tidak Cocok Pencarian, atau Grid Data Store */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center text-emerald-500 gap-2">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-sm font-medium text-gray-500">{t("common.loading", "Memuat assigned stores...")}</span>
        </div>
      ) : stores.length === 0 ? (
        <div className="py-8 text-center text-gray-400 italic text-sm">{t("stores.empty")}</div>
      ) : filteredStores.length === 0 ? (
        <div className="py-8 text-center text-gray-400 italic text-sm">
          {t("stores.notFound", { query: searchQuery })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentStores.map((store: any) => (
            <div key={store.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-800 truncate">{store.name}</h3>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1.5 font-mono">
                  <Phone size={12} className="text-gray-400" />
                  {store.phoneNumber || "No phone number"}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-md shrink-0">
                <ShieldCheck size={12} /> {t("stores.assignedBadge")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}