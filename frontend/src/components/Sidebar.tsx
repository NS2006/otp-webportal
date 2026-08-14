import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LogOut, Users, Store, KeyRound, ShieldAlert, Settings, FileSpreadsheet, Globe } from 'lucide-react'; 
import { useTranslation } from 'react-i18next'; 
import i18n from '../locales/i18next';

import type { SidebarProps } from '../types/Props';

/**
 * Sidebar Component
 * 
 * Komponen sidebar navigasi utama yang menampilkan UI berdasarkan hak akses (Admin / User), scroll sections, menu, language switcher, serta logout.
 */
export default function Sidebar({ isAdmin, activeSection, onScrollToTop, onScrollToSection, onLogout }: SidebarProps) {
  const { t } = useTranslation(); 

  /**
   * Mengubah bahasa aktif pada aplikasi menggunakan i18next serta menyimpannya ke dalam localStorage.
   */
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("preferred_lang", lang);
  };
  
  /**
   * Untuk tombol menu yang menggunakan sistem scroll internal,
   * dengan menyesuaikan status aktif.
   */
  const getScrollMenuClasses = (isActive: boolean) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
      isActive
        ? "bg-slate-800 text-emerald-400 font-semibold shadow-sm"
        : "text-gray-400 hover:bg-slate-800 hover:text-white"
    }`;

  /**
   * Untuk tombol menu NavLink berbasis rute (router),
   * dengan mendeteksi status aktif.
   */
  const getNavMenuClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive
        ? "bg-slate-800 text-emerald-400 font-semibold shadow-sm"
        : "text-gray-400 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col overflow-y-auto custom-scrollbar">
      
      {/* Header Sidebar: Logo Aplikasi & Status Mode Pengguna */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-emerald-400">OTP Portal</h1>
        <p className="text-xs text-gray-400 mt-1">
          {isAdmin ? t("sidebar.adminMode") : t("sidebar.userMode")}
        </p>
      </div>

      {/* Konten Utama Navigasi (Menu User & Menu Admin Panel) */}
      <nav className="flex-1 px-4 space-y-6 pb-6">
        
        {/* Bagian User Section */}
        <div className="space-y-2">
          <button onClick={onScrollToTop} className={getScrollMenuClasses(activeSection === 'dashboard')}>
            <LayoutDashboard size={20} />
            <span>{t("sidebar.dashboard")}</span>
          </button>

          <button onClick={() => onScrollToSection('otps-section', 'otps')} className={getScrollMenuClasses(activeSection === 'otps')}>
            <KeyRound size={20} />
            <span>{t("sidebar.otpLogs")}</span>
          </button>

          <button onClick={() => onScrollToSection('stores-section', 'stores')} className={getScrollMenuClasses(activeSection === 'stores')}>
            <Store size={20} />
            <span>{t("sidebar.assignedStores")}</span>
          </button>
        </div>

        {/* Bagian Admin Section */}
        {isAdmin && (
          <div className="space-y-2 pt-4 border-t border-slate-800">
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <ShieldAlert size={14} /> {t("sidebar.adminPanel")}
            </p>

            <NavLink to="/admin/users" className={getNavMenuClasses}>
              <Users size={20} />
              <span>{t("sidebar.manageUsers")}</span>
            </NavLink>

            <NavLink to="/admin/stores" className={getNavMenuClasses}>
              <Store size={20} />
              <span>{t("sidebar.manageStores")}</span>
            </NavLink>

            <NavLink to="/admin/import-excel" className={getNavMenuClasses}>
              <FileSpreadsheet size={20} />
              <span>{t("sidebar.importExcel")}</span>
            </NavLink>

            <NavLink to="/admin/settings" className={getNavMenuClasses}>
              <Settings size={20} />
              <span>{t("sidebar.systemSettings")}</span>
            </NavLink>
          </div>
        )}
      </nav>

      {/* Footer / Utilities Section (Language Switcher & Logout */}
      <div className="p-4 border-t border-slate-800 shrink-0 space-y-3">
        
        {/* Tombol Language Switcher */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-800/60 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
            <Globe size={16} />
            <span>{t("sidebar.language")}</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg">
            <button
              onClick={() => changeLanguage('id')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded transition-all ${
                i18n.language === 'id' 
                  ? 'bg-emerald-500 text-white shadow-xs' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ID
            </button>
            <button
              onClick={() => changeLanguage('en')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded transition-all ${
                i18n.language === 'en' 
                  ? 'bg-emerald-500 text-white shadow-xs' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Tombol Logout */}
        <a
          href="#logout"
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut size={20} />
          <span>{t("sidebar.logout")}</span>
        </a>

      </div>
    </aside>
  );
}