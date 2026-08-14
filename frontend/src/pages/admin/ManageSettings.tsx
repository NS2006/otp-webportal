import { useState, useEffect } from "react";
import { Settings, Save, Clock, ShieldAlert, Loader2 } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SettingsService } from "../../services/SettingsService";
import type { LayoutContextType } from "../../layouts/MainLayout";

/**
 * ManageSettings Page
 * 
 * Halaman untuk mengkonfigurasi pengaturan durasi penyimpanan log OTP yang berjalan secara otomatis.
 */
export default function ManageSettings() {
  const { t } = useTranslation();
  
  // State lokal untuk menyimpan konfigurasi jumlah hari retensi, status loading data, dan status proses penyimpanan
  const [retentionDays, setRetentionDays] = useState<number>(7);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Mengambil fungsi penampil modal feedback global dari parent layout
  const { showFeedbackModal } = useOutletContext<LayoutContextType>();

  /**
   * Mengambil data konfigurasi pengaturan sistem dari server saat komponen dimuat.
   */
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await SettingsService.getSettings();
        setRetentionDays(data.otpRetentionDays);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  /**
   * Menangani submit form untuk update konfigurasi.
   */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await SettingsService.updateSettings(retentionDays);
      showFeedbackModal("success", t("manageSettings.feedback.successTitle", "Tersimpan!"), t("manageSettings.feedback.successMessage", "Pengaturan sistem berhasil diperbarui."));
    } catch (error: any) {
      showFeedbackModal("error", t("manageSettings.feedback.errorTitle", "Gagal!"), error.message || t("manageSettings.feedback.errorMessage", "Gagal menyimpan pengaturan."));
    } finally {
      setIsSaving(false);
    }
  };

  // Tampilan loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-emerald-500">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header Judul & Deskripsi Halaman */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Settings size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{t("manageSettings.title", "System Settings")}</h2>
            <p className="text-sm text-gray-500">{t("manageSettings.subtitle", "Configure global parameters and automated jobs for the application.")}</p>
          </div>
        </div>
      </div>

      {/* Kontainer Utama Form Pengaturan */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header Bagian Pengaturan */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-slate-600" />
            <h3 className="font-semibold text-slate-800">{t("manageSettings.sectionTitle", "Auto-Cleanup & Retention")}</h3>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          
          {/* Banner Warning */}
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-3">
            <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-amber-800">
              <strong className="block mb-1">{t("manageSettings.warningTitle", "Peringatan Penghapusan Otomatis")}</strong>
              {t("manageSettings.warningText", "Sistem akan menjalankan pembersihan otomatis setiap tengah malam untuk menghapus log OTP secara permanen yang usianya melebihi batas waktu di bawah ini.")}
            </div>
          </div>

          {/* Input Pengaturan Durasi */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {t("manageSettings.labelRetention", "OTP Retention Period (Days)")}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="365"
                value={retentionDays}
                onChange={(e) => setRetentionDays(Number(e.target.value))}
                className="w-32 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-slate-800"
                required
              />
              <span className="text-sm text-gray-500 font-medium">{t("manageSettings.daysUnit", "Hari")}</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {t("manageSettings.recommendation", "Direkomendasikan: 7 - 14 Hari untuk menjaga performa database.")}
            </p>
          </div>

          {/* Tombol Save*/}
          <div className="pt-4 flex justify-end border-t border-gray-100">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              <span>{isSaving ? t("manageSettings.saving", "Menyimpan...") : t("manageSettings.saveButton", "Simpan Pengaturan")}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}