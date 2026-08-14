import { useEffect, useState } from 'react';
import { Outlet, useLocation, useOutletContext } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { LayoutContextType } from './MainLayout'; 

/**
 * Tipe data untuk context yang dibagikan oleh ManageLayout ke komponen halaman manajemen turunan.
 */
export type ManageContextType = {
  /** Status visibilitas modal */
  isAddModalOpen: boolean;
  /** Fungsi untuk mengubah status visibilitas modal tambah data */
  setIsAddModalOpen: (isOpen: boolean) => void;
  /** Nilai teks query pencarian yang sedang diketikkan pengguna */
  searchQuery: string;
  /** Fungsi untuk memperbarui nilai teks query pencarian */
  setSearchQuery: (query: string) => void;
};

/**
 * ManageLayout Component
 * 
 * Komponen layout pembungkus untuk halaman administrasi pengelolaan entitas.
 * Menyediakan toolbar header global yang mencakup kotak pencarian interaktif (search bar) dan tombol aksi 
 */
export default function ManageLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  
  // State Lokal untuk Mengontrol Modal Tambah Data & Query Pencarian
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mengambil context dari MainLayout untuk mengakses fungsi feedback modal
  const parentContext = useOutletContext<LayoutContextType>();
  
  // Mengecek halaman aktif saat ini
  const isUsersPage = location.pathname.includes('users');
  const entityKey = isUsersPage ? 'user' : 'store';

  /**
   * Mereset query pencarian menjadi kosong setiap kali rute URL berubah.
   */
  useEffect(() => {
    setSearchQuery('');
  }, [location.pathname]);

  return (
    <div className="space-y-6">
      
      {/* Search & Action Bar Header Section */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        
        {/* Kotak Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(`manageLayout.search_${entityKey}`, { defaultValue: `Search ${entityKey}s...` })} 
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow text-sm"
            />
          </div>
        </div>

        {/* Tombol Modal Tambah Entitas Baru */}
        <button 
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors font-semibold shadow-sm ml-4 text-sm shrink-0"
        >
          <Plus size={20} />
          <span>{t(`manageLayout.add_${entityKey}`, { defaultValue: `Add ${entityKey}` })}</span>
        </button>
        
      </div>

      {/* Konten Utama (Komponen ManageUsers atau ManageStores via Outlet) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-125">
        <Outlet context={{ 
          isAddModalOpen, 
          setIsAddModalOpen, 
          searchQuery, 
          showFeedbackModal: parentContext?.showFeedbackModal 
        }} />
      </div>

    </div>
  );
}