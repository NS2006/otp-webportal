import { useState, useEffect } from "react";
import { KeyRound, Search, ChevronLeft, ChevronRight, Clock, Loader2, RefreshCw, Filter, ArrowDown, ArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { OTPService } from "../services/OTPService";
import FilterModal from "./FilterModal";
import OTPCard from "./OTPCard";

/**
 * OtpListSection Component
 * 
 * Komponen section daftar OTP untuk menampilkan rekaman pesan OTP masuk berdasarkan user tertentu,
 * lengkap dengan fitur pencarian (debounced search), pagination, filter lanjutan, dan pengurutan (sorting).
 */
export default function OtpListSection({ userId }: { userId: number }) {
  const { t } = useTranslation();

  // Konfigurasi field form filter lanjutan untuk modal pencarian
  const FILTER_FIELDS = [
    {
      id: "receivedVia",
      label: t("otps.filterFields.receivedVia"),
      type: "select" as const,
      options: [
        { label: "WhatsApp (WA)", value: "WA" },
        { label: "WhatsApp Business (WA4B)", value: "WA4B" },
        { label: "SMS", value: "SMS" },
      ],
    },
    {
      id: "type",
      label: t("otps.filterFields.type"),
      type: "select" as const,
      options: [
        { label: t("otps.filterOptions.code", "Kode Angka (Code)"), value: "code" },
        { label: t("otps.filterOptions.link", "Tautan (Link)"), value: "link" },
      ],
    },
    {
      id: "startDate",
      label: t("otps.filterFields.startDate"),
      type: "date" as const,
    },
    {
      id: "endDate",
      label: t("otps.filterFields.endDate"),
      type: "date" as const,
    },
  ];

  // State Manajemen Data & Status Loading
  const [otps, setOtps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Manajemen Pencarian, Pagination, & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // State untuk Kontrol Modal Filter, Pengurutan (Sorting), & Refresh Manual
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Menerapkan penundaan (debouncing) 500ms pada input pencarian
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset ke halaman 1 saat pencarian berubah
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch data OTP dari API setiap kali parameter berubah
  useEffect(() => {
    if (!userId) return;

    const fetchOTPs = async () => {
      setIsLoading(true);
      try {
        const response = await OTPService.getPaginatedOTPs(userId, currentPage, 5, debouncedSearch, filters, sortOrder);
        setOtps(response.data);
        setTotalPages(response.totalPages);
        setTotalItems(response.totalItems);
      } catch (error) {
        console.error("Gagal memuat OTP:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOTPs();
  }, [userId, currentPage, debouncedSearch, filters, sortOrder, refreshTrigger]);

  /**
   * Menerapkan filter baru
   */
  const handleApplyFilter = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset ke halaman 1 saat filter diterapkan
  };

  /**
   * Mengganti urutan pengurutan timestamp
   */
  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    setCurrentPage(1); // Reset ke halaman 1 saat urutan sorting berubah
  };

  // Mengecek apakah ada filter aktif
  const isFilterActive = Object.values(filters).some((val) => val !== "");

  return (
    <div id="otps-section" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      
      {/* Top Header Section: Judul, Total Counter, & Kontrol Tombol Aksi */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">

        {/* Judul & Total Counter OTP */}
        <div className="flex items-center gap-2">
          <KeyRound size={20} className="text-emerald-500" />
          <h2 className="text-lg font-bold text-slate-800">{t("otps.title")}</h2>
          <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full ml-2">
            {totalItems} {t("otps.total")}
          </span>
        </div>

        {/* Kontrol Toolbar: Refresh, Sort, Filter, Search, & Pagination */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">

          {/* Tombol Refresh Manual */}
          <button
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            disabled={isLoading}
            className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 border border-gray-200 bg-white transition-colors disabled:opacity-50 shadow-sm"
            title={t("otps.refreshTitle")}
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin text-emerald-500" : ""} />
          </button>

          {/* Tombol Sort Order */}
          <button
            onClick={toggleSortOrder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all border bg-white text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 border-gray-200 text-sm font-medium shadow-sm"
            title={t("otps.sortTitle")}
          >
            <Clock size={14} className={sortOrder === "desc" ? "text-emerald-500" : "text-gray-400"} />
            <span>{sortOrder === "desc" ? t("otps.latest") : t("otps.oldest")}</span>
            {sortOrder === "desc" ? (
              <ArrowDown size={14} className="text-gray-400" />
            ) : (
              <ArrowUp size={14} className="text-gray-400" />
            )}
          </button>

          {/* Tombol Modal Filter */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all border text-sm font-medium shadow-sm ${
              isFilterActive
                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                : "bg-white text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 border-gray-200 hover:border-emerald-200"
            }`}
            title={t("otps.filterTooltip")}
          >
            <Filter size={14} className={isFilterActive ? "text-emerald-600" : "text-gray-400"} />
            <span className="hidden xl:inline">{t("otps.filter")}</span>
            {isFilterActive && (
              <span className="flex items-center justify-center w-4 h-4 ml-1 text-[10px] text-white bg-emerald-500 rounded-full">
                !
              </span>
            )}
          </button>

          {/* Search Bar */}
          <div className="relative w-full sm:w-50">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("otps.search")}
              className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
          </div>

          {/* Navigasi Pagination */}
          <div className={`flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-1 ${totalPages <= 1 ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1 || isLoading} className="p-1 rounded text-gray-600 hover:bg-white disabled:opacity-30 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-medium text-slate-700 px-2">{currentPage}/{totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || isLoading} className="p-1 rounded text-gray-600 hover:bg-white disabled:opacity-30 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Area Konten: Kondisi Loading, Kosong, atau Daftar Kartu OTP */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center text-emerald-500 gap-2">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-sm font-medium text-gray-500">{t("otps.loading")}</span>
        </div>
      ) : otps.length === 0 ? (
        <div className="py-12 text-center text-gray-400 italic text-sm">{t("otps.empty")}</div>
      ) : (
        <div className="space-y-4">
          {otps.map((otp: any) => (
            <OTPCard key={otp.id} otp={otp} />
          ))}
        </div>
      )}

      {/* Modal Dialog Pengaturan Filter Lanjutan */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleApplyFilter}
        title={t("otps.filterTitle")}
        fields={FILTER_FIELDS}
        currentFilters={filters}
      />
    </div>
  );
}