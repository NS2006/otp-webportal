import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../services/UserService';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import type { User } from '../types/Model';

/**
 * Login Page
 * 
 * Halaman autentikasi mock login aplikasi, yang menampilkan daftar akun
 * pengguna aktif yang tersedia untuk dipilih dan masuk ke dalam portal.
 */
export default function Login() {
  const navigate = useNavigate();
  
  // State lokal untuk daftar user aktif dan status loading pengambilan data
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Mengambil daftar user dari UserService saat halaman login dimuat
   */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await UserService.getAll();

        // Hanya tampilkan user yang statusnya aktif 
        const activeUsers = data.filter((user: any) => user.isActive !== false);
        setUsers(activeUsers);
      } catch (error) {
        console.error("Gagal memuat daftar user untuk mock login:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  /**
   * Handle proses pemilihan akun untuk masuk (login), menyimpan sesi ke localStorage,
   * serta mengalihkan rute menuju halaman utama root portal.
   */
  const handleUserLogin = (user: User) => {
    // Simpan data user
    localStorage.setItem("currentUser", JSON.stringify(user));
    
    // Bersihkan sesi data lama jika ada
    localStorage.removeItem("adminUser"); 
    
    // Arahkan ke rute utama
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
      <div className="w-full max-w-lg p-8 bg-white rounded-xl shadow-xl space-y-6">
        
        {/* Header Judul & Keterangan Halaman Login */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Mock Login
          </h1>
          <p className="text-gray-500 text-sm">
            Select an account to sign in to the portal
          </p>
        </div>

        {/* Daftar Pilihan Akun Mock Login */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
            Available Accounts:
          </label>

          {/* Kondisi Tampilan: Loading, Kosong, atau Daftar Tombol User */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-gray-400 gap-2 text-sm">
              <Loader2 className="animate-spin" size={18} />
              <span>Memuat daftar user...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-6 text-sm text-gray-400 italic bg-gray-50 rounded-lg border border-gray-100">
              Tidak ada user aktif yang tersedia.
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1 border border-gray-100 rounded-lg p-2 bg-gray-50/50 custom-scrollbar">
              {users.map((user: any) => {
                const isAdmin = user.isAdmin === true;

                return (
                  <button
                    key={user.id}
                    onClick={() => handleUserLogin(user)}
                    className={`w-full flex items-center justify-between p-3 bg-white border rounded-lg transition-all group text-left shadow-2xs ${
                      isAdmin 
                        ? "border-slate-200 hover:bg-slate-50 hover:border-slate-400" 
                        : "border-gray-100 hover:bg-emerald-50 hover:border-emerald-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      
                      {/* Avatar Inisial */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${
                        isAdmin 
                          ? "bg-slate-900 text-emerald-400" 
                          : "bg-emerald-100 text-emerald-600"
                      }`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      
                      {/* Informasi Nama & Email Akun */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-semibold truncate ${
                            isAdmin ? "text-slate-900" : "text-slate-800 group-hover:text-emerald-700"
                          }`}>
                            {user.name}
                          </p>
                          
                          {/* Badge Label Status Admin */}
                          {isAdmin && (
                            <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded shadow-sm shrink-0">
                              <ShieldCheck size={10} /> Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    
                    {/* Navigasi Icon */}
                    <ArrowRight 
                      size={16} 
                      className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${
                        isAdmin ? "text-gray-300 group-hover:text-slate-600" : "text-gray-300 group-hover:text-emerald-600"
                      }`} 
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}