import { X } from 'lucide-react';

interface ModalProps {
  /** Status visibilitas modal */
  isOpen: boolean;
  /** Dijalankan saat modal ditutup */
  onClose: () => void;
  /** Judul teks di bagian header modal */
  title: string;
  /** Komponen children yang akan dirender di dalam modal */
  children: React.ReactNode;
  /** Lebar maksimum kontainer modal */
  maxWidth?: string;
}

/**
 * Modal Component
 * 
 * Komponen pembungkus (wrapper) dialog modal universal yang menyediakan efek latar belakang 
 * gelap blur, penutupan otomatis saat klik di luar kotak (backdrop), serta header dengan tombol close.
 */
export default function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-md" }: ModalProps) {
  // Jika status modal tidak aktif (tertutup), hentikan render dan kembalikan nilai null
  if (!isOpen) return null;

  /**
   * Menangani deteksi klik pada area latar belakang (backdrop) di luar kotak konten modal.
   * Modal akan tertutup hanya jika target klik tepat pada elemen container luar (backdrop).
   */
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 cursor-pointer"
    >
      <div className={`bg-white rounded-xl shadow-lg w-full ${maxWidth} overflow-hidden transition-all cursor-default`}>
        
        {/* Header Modal (Judul & Tombol Tutup) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Konten Modal */}
        <div className="p-6">
          {children}
        </div>
        
      </div>
    </div>
  );
}