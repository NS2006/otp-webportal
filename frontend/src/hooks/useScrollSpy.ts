import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * useScrollSpy Custom Hook
 * 
 * Untuk memantau scroll position halaman dan mendeteksi section mana yang sedang aktif
 */
export function useScrollSpy() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State untuk menyimpan kunci menu/section yang sedang aktif saat ini
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  
  // Mencegah konflik status observer saat program sedang melakukan programmatic scroll
  const isScrollingRef = useRef(false);

  /**
   * Mengarahkan halaman ke bagian paling atas (dashboard) dan menyesuaikan rute URL jika sedang berada di luar halaman utama.
   */
  const scrollToTop = () => {
    setActiveSection('dashboard');
    isScrollingRef.current = true;

    if (location.pathname !== '/') {
      navigate('/');
    } else {
      document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Membuka kembali kunci scroll setelah animasi selesai (600ms)
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 600);
  };

  /**
   * Mengarahkan halaman menuju ID section tertentu, serta handle navigasi otomatis jika pengguna sedang berada di halaman rute lain.
   */
  const scrollToSection = (sectionId: string, menuKey: string) => {
    setActiveSection(menuKey);
    isScrollingRef.current = true;

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }

    // Membuka kembali kunci scroll setelah animasi selesai (600ms)
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 600);
  };

  /**
   * Mengatur IntersectionObserver dan listener scroll utama untuk mendeteksi perpindahan section secara otomatis.
   */
  useEffect(() => {
    // Jika tidak berada di halaman utama (root), kosongkan status activeSection
    if (location.pathname !== '/') {
      setActiveSection('');
      return;
    }

    /**
     * Handler callback untuk IntersectionObserver saat elemen section memasuki viewport.
     */
    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      if (isScrollingRef.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.id === 'stores-section') {
            setActiveSection('stores');
          } else if (entry.target.id === 'otps-section') {
            setActiveSection('otps');
          }
        }
      });
    };

    // Konfigurasi IntersectionObserver dengan kontainer utama sebagai root
    const observer = new IntersectionObserver(handleObserver, {
      root: document.querySelector('main'),
      threshold: 0.3,
    });

    const storesEl = document.getElementById('stores-section');
    const otpsEl = document.getElementById('otps-section');

    if (storesEl) observer.observe(storesEl);
    if (otpsEl) observer.observe(otpsEl);

    // Event listener tambahan untuk mendeteksi posisi scroll paling atas pada container utama
    const mainContainer = document.querySelector('main');
    const handleScroll = () => {
      if (isScrollingRef.current) return;
      if (mainContainer && mainContainer.scrollTop < 100) {
        setActiveSection('dashboard');
      }
    };

    mainContainer?.addEventListener('scroll', handleScroll);

    // Membersihkan observer dan event listener saat rute berubah
    return () => {
      observer.disconnect();
      mainContainer?.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

  return { activeSection, scrollToTop, scrollToSection };
}