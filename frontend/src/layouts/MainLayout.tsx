import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import FeedbackModal from '../components/FeedbackModal';
import Sidebar from '../components/Sidebar';
import { useScrollSpy } from '../hooks/useScrollSpy';

/**
 * Context yang dibagikan oleh layout utama ke nested routes via Outlet.
 */
export type LayoutContextType = {
  showFeedbackModal: (type: "success" | "error", title: string, message: string) => void;
};

/**
 * MainLayout Component
 * 
 * Komponen layout utama aplikasi yang membungkus struktur halaman dengan Sidebar di sisi kiri, area konten utama di kanan, serta menyediakan state global
 */
export default function MainLayout() {
  const navigate = useNavigate();
  
  // Memanggil custom hook
  const { activeSection, scrollToTop, scrollToSection } = useScrollSpy();

  // State Manajemen Data Logged-in User
  const [currentUser, setCurrentUser] = useState<any>(null);
  const isAdmin = currentUser?.isAdmin === true;

  // State Global untuk Mengontrol Tampilan FeedbackModal
  const [feedbackState, setFeedbackState] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  /**
   * Memeriksa data sesi user di localStorage saat komponen dimuat.
   * Jika data tidak ditemukan, arahkan pengguna kembali ke halaman login.
   */
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Gagal parsing data user:", e);
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  /**
   * Handler global untuk memicu modal feedback dari komponen children.
   */
  const showFeedbackModal = (type: "success" | "error", title: string, message: string) => {
    setFeedbackState({ isOpen: true, type, title, message });
  };

  /**
   * Menangani logout pengguna, menghapus sesi dari localStorage,
   * serta mengalihkan rute kembali ke halaman login.
   */
  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    localStorage.removeItem("currentUser");
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* Komponen Sidebar */}
      <Sidebar 
        isAdmin={isAdmin}
        activeSection={activeSection}
        onScrollToTop={scrollToTop}
        onScrollToSection={scrollToSection}
        onLogout={handleLogout}
      />

      {/* Area Konten Utama Halaman */}
      <main className="flex-1 overflow-auto p-8 relative">
        <Outlet context={{ showFeedbackModal }} />
      </main>

      {/* Komponen Global Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackState.isOpen}
        onClose={() => setFeedbackState((prev) => ({ ...prev, isOpen: false }))}
        type={feedbackState.type}
        title={feedbackState.title}
        message={feedbackState.message}
      />

    </div>
  );
}