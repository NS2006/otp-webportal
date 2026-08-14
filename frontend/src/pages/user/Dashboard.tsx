import { useEffect, useState } from "react";
import { User as UserIcon, Mail, Phone, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import StoreListSection from "../../components/StoreListSection"; 
import OtpListSection from "../../components/OTPListSection"; 

/**
 * DashboardUser Page
 * 
 * Halaman utama bagi user dashboard,
 * yang menampilkan informasi personal, daftar OTP masuk dan assigned stores
 */
export default function DashboardUser() {
  const { t } = useTranslation();

  // State lokal untuk menyimpan data informasi pengguna yang sedang login dan status loading
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Memuat data user  dari localStorage saat komponen dimuat.
   */
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false);
  }, []);

  // Tampilan loading UI
  if (isLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 text-gray-400 gap-3">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
        <span className="text-sm font-medium">{t("common.loading", "Memuat data dashboard...")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-4">
          
          {/* Avatar Inisial Nama Pengguna */}
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-2xl shadow-inner shrink-0">
            {user.name ? user.name.charAt(0).toUpperCase() : "G"}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {t("dashboard.welcome", { name: user.name || "Guest" })}
            </h1>
            <p className="text-sm text-gray-500">
              {t("dashboard.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Informasi Profil User */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Informasi Nama Lengkap */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserIcon size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-400 uppercase">{t("dashboard.fullName", "Full Name")}</p>
            <p className="text-sm font-semibold text-slate-700 truncate">{user.name}</p>
          </div>
        </div>
        
        {/* Informasi Email */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Mail size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-400 uppercase">{t("dashboard.emailAddress", "Email Address")}</p>
            <p className="text-sm font-semibold text-slate-700 truncate">{user.email || "-"}</p>
          </div>
        </div>

        {/* Informasi Nomor Telepon */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Phone size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-400 uppercase">{t("dashboard.phoneNumber", "Phone Number")}</p>
            <p className="text-sm font-semibold text-slate-700 truncate">{user.phoneNumber || "-"}</p>
          </div>
        </div>

      </div>

      {/* Section Daftar OTP Masuk */}
      <OtpListSection userId={user.id} />

      {/* Section Daftar Assigned Stores */}
      <StoreListSection userId={user.id} />

    </div>
  );
}