import Modal from "./Modal";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ConfirmationModalProps } from "../types/Props"; 

/**
 * ConfirmationModal Component
 * Komponen modal dialog konfirmasi yang mendukung berbagai tipe tema (danger, warning, info)
 */
export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = "danger",
  isLoading = false,
}: ConfirmationModalProps) {
  const { t } = useTranslation();

  // Teks fallback menggunakan i18n jika props tidak diberikan oleh komponen induk
  const resolvedTitle = title || t("confirmationModal.defaultTitle", "Konfirmasi");
  const resolvedConfirmText = confirmText || t("confirmationModal.defaultConfirm", "Ya, Lanjutkan");
  const resolvedCancelText = cancelText || t("common.cancel", "Batal");
  const resolvedLoadingText = t("confirmationModal.loading", "Memproses...");

  // Konfigurasi tema warna berdasarkan tipe modal (danger / warning / info)
  const theme = {
    danger: {
      iconBg: "bg-red-100 text-red-600",
      buttonBg: "bg-red-500 hover:bg-red-600 text-white",
    },
    warning: {
      iconBg: "bg-amber-100 text-amber-600",
      buttonBg: "bg-amber-500 hover:bg-amber-600 text-white",
    },
    info: {
      iconBg: "bg-emerald-100 text-emerald-600",
      buttonBg: "bg-emerald-500 hover:bg-emerald-600 text-white",
    },
  }[type];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={resolvedTitle} maxWidth="max-w-sm">
      <div className="flex flex-col items-center text-center py-2 space-y-4">
        
        {/* Ikon Peringatan dengan Warna Tema Dinamis */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${theme.iconBg}`}>
          <AlertTriangle size={28} />
        </div>

        {/* Pesan Detail Konfirmasi */}
        <p className="text-sm font-medium text-slate-600">
          {message}
        </p>

        {/* Tombol Aksi (Batal & Konfirmasi) */}
        <div className="flex justify-end gap-3 w-full mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
          >
            {resolvedCancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-sm disabled:opacity-50 ${theme.buttonBg}`}
          >
            {isLoading && <Loader2 className="animate-spin" size={16} />}
            {isLoading ? resolvedLoadingText : resolvedConfirmText}
          </button>
        </div>

      </div>
    </Modal>
  );
}