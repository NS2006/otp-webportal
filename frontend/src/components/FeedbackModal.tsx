import { useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import Modal from "./Modal";
import type { FeedbackModalProps } from "../types/Props"; 

/**
 * FeedbackModal Component
 * 
 * Modal untuk menampilkan feedback instan kepada pengguna
 * dengan indikator sukses atau gagal yang akan auto-close setelah 2 detik.
 */
export default function FeedbackModal({ isOpen, onClose, type, title, message }: FeedbackModalProps) {
  
  // Untuk menjalankan timer auto-close setelah 2 detik ketika modal terbuka
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      // Membersihkan timer jika modal ditutup lebih awal
      return () => clearTimeout(timer); 
    }
  }, [isOpen, onClose]);

  // Evaluasi tipe feedback (apakah bernilai sukses atau error)
  const isSuccess = type === "success";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center py-4 space-y-5">
        
        {/* Ikon Indikator Status dengan Warna Tema Dinamis */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
          isSuccess ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
        }`}>
          {isSuccess ? <CheckCircle2 size={38} /> : <XCircle size={38} />}
        </div>

        {/* Pesan Keterangan Umpan Balik */}
        <p className="text-base font-medium text-slate-700">
          {message}
        </p>

      </div>
    </Modal>
  );
}