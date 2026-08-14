import { useState } from "react";
import { Clock, MessageSquare, ExternalLink, Copy, Check, Store as StoreIcon, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

interface OtpCardProps {
  /** Objek data record OTP yang akan ditampilkan di dalam kartu */
  otp: any;
}

/**
 * OTPCard Component
 * 
 * Komponen kartu interaktif untuk merender informasi detail rekaman OTP masuk,
 * termasuk informasi store, pengirim, saluran penerimaan, pesan asli, serta fitur salin kode/tautan.
 */
export default function OTPCard({ otp }: OtpCardProps) {
  const { t, i18n } = useTranslation();
  
  // State lokal untuk menandai apakah kode/tautan berhasil disalin
  const [isCopied, setIsCopied] = useState(false);
  
  // Evaluasi apakah OTP berupa tautan (link) atau kode angka biasa
  const isLink = otp.code?.startsWith('http') || otp.type === 'link';

  /**
   * Menyalin teks kode atau tautan OTP ke clipboard perangkat pengguna
   * serta memicu feedback visual 'tersalin' selama 2 detik.
   */
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  /**
   * Merender badge keterangan channel penerimaan OTP secara dinamis (WhatsApp / SMS).
   */
  const renderChannelBadge = (via: string) => {
    const upperVia = via?.toUpperCase();
    if (upperVia === 'WA4B') return <span className="font-bold text-emerald-700">WhatsApp Business</span>;
    if (upperVia === 'WA') return <span className="font-bold text-emerald-700">WhatsApp</span>;
    return <span className="font-bold text-blue-700">SMS</span>;
  };

  // Format bahasa pada i18n ('id-ID' atau 'en-US')
  const localeLang = i18n.language === 'id' ? 'id-ID' : 'en-US';

  return (
    <div className="p-5 rounded-2xl border border-gray-100 bg-white hover:border-emerald-200 hover:shadow-md transition-all space-y-4">
      
      {/* Header: Informasi Store, Pengirim, Saluran, dan Waktu */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-gray-100 pb-4">
        <div className="space-y-1.5">
          
          {/* Informasi Nama Store */}
          <div className="flex items-center gap-2">
            <StoreIcon size={16} className="text-emerald-600" />
            <span className="text-md font-bold text-slate-800">{otp.storeName}</span>
          </div>

          {/* Informasi Pengirim & Saluran Penerimaan */}
          <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Send size={12} className="text-gray-400" />
              {t("otps.card.from", "Dari")}: <strong className="text-slate-700">{otp.senderName}</strong>
            </span>
            <span className="text-gray-300">•</span>
            <span>
              {t("otps.card.via", "Melalui")}: {renderChannelBadge(otp.receivedVia)}
            </span>
          </div>
        </div>
        
        {/* Timestamp Waktu Diterima */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono bg-gray-50 px-2.5 py-1.5 rounded-lg shrink-0 w-fit">
          <Clock size={12} className="text-gray-400" />
          {new Date(otp.receivedDate).toLocaleString(localeLang, { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
          })}
        </div>
      </div>

      {/* Area Pesan Asli */}
      {otp.message && (
        <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
            <MessageSquare size={13} className="text-emerald-500" />
            <span>{t("otps.originalMessage", "Pesan Asli")}</span>
          </div>
          <p className="text-xs text-gray-600 wrap-break-word leading-relaxed">{otp.message}</p>
        </div>
      )}

      {/* Kode / Tautan beserta Tombol Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
            {isLink ? t("otps.verificationLink", "Tautan Verifikasi") : t("otps.verificationCode", "Kode Verifikasi")}
          </span>
          
          {/* Kondisi Tampilan: Tautan vs Kode Angka */}
          {isLink ? (
            <a 
              href={otp.code} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 font-mono text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl border border-emerald-200 transition-colors break-all w-full sm:w-auto"
              title={t("otps.openLink", "Buka Tautan")}
            >
              <ExternalLink size={14} className="shrink-0 group-hover:scale-110 transition-transform" />
              <span className="underline truncate">{otp.code}</span>
            </a>
          ) : (
            <div className="inline-flex items-center gap-2 font-mono text-lg font-bold text-slate-800 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 tracking-[0.15em] break-all w-full sm:w-auto">
              {otp.code}
            </div>
          )}
        </div>

        {/* Tombol Aksi (Buka Tautan & Salin) */}
        <div className="flex items-center gap-2 sm:shrink-0 w-full sm:w-auto">
          {isLink && (
            <a
              href={otp.code}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white shadow-sm transition-colors"
            >
              {t("otps.openLink", "Buka Tautan")}
            </a>
          )}

          <button 
            onClick={() => handleCopyCode(otp.code)} 
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              isCopied 
                ? "bg-emerald-500 text-white shadow-sm border-emerald-500" 
                : "bg-white border border-gray-200 text-slate-700 hover:bg-slate-50 shadow-sm"
            }`}
          >
            {isCopied ? (
              <><Check size={14} className="text-white" /><span>{t("otps.copied", "Tersalin!")}</span></>
            ) : (
              <><Copy size={14} className="text-gray-500" /><span>{isLink ? t("otps.copyLink", "Salin Tautan") : t("otps.copyCode", "Salin Kode")}</span></>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}