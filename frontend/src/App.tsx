import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import MainLayout from './layouts/MainLayout';
import ManageLayout from './layouts/ManageLayout';

// Mengambil base URL dari environment variable frontend (Vite) dengan fallback localhost
export const API_BASE_URL = import.meta.env.VITE_SERVER_BACKEND_URL || 'http://localhost:3000';

// Halaman-halaman aplikasi yang dimuat secara dinamis menggunakan Lazy Imports
const Login = lazy(() => import('./pages/Login'));
const DashboardUser = lazy(() => import('./pages/user/Dashboard'));
const ManageStores = lazy(() => import('./pages/admin/ManageStores'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));
const ImportExcel = lazy(() => import('./pages/admin/ImportExcel'));
const ManageSettings = lazy(() => import('./pages/admin/ManageSettings'));

/**
 * PageLoader Component
 * 
 * Komponen UI fallback yang dirender selama proses pengunduhan chunk kode halaman aktif.
 */
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100 text-emerald-500">
    <Loader2 className="animate-spin" size={40} />
  </div>
);

/**
 * ProtectedRoute Component
 * 
 * Route Guard (Pelindung rute) untuk memastikan bahwa hanya pengguna yang sudah logged-in
 * dengan sesi localStorage `currentUser` di localStorage yang dapat mengakses area konten aplikasi.
 */
const ProtectedRoute = () => {
  const userStr = localStorage.getItem("currentUser");
  return userStr ? <Outlet /> : <Navigate to="/login" replace />;
};

/**
 * AdminRoute Component
 * 
 * Route Guard khusus untuk membatasi akses halaman administrator (admin-only routes) 
 * berdasarkan flag `isAdmin` pada data user.
 */
const AdminRoute = () => {
  const userStr = localStorage.getItem("currentUser");
  if (!userStr) return <Navigate to="/login" replace />;

  const context = useOutletContext();
  
  try {
    const user = JSON.parse(userStr);
    return user.isAdmin ? <Outlet context={context}/> : <Navigate to="/" replace />;
  } catch (e) {
    return <Navigate to="/login" replace />;
  }
};

/**
 * App Component
 * 
 * Root component aplikasi yang mengatur React Router
 */
function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Halaman Otentikasi */}
          <Route path="/login" element={<Login />} />

          {/* Grup Rute yang Dilindungi (Memerlukan Login) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              
              {/* Halaman utama Dashboard */}
              <Route path="/" element={<DashboardUser />} />

              {/* Grup Rute Khusus Administrator */}
              <Route element={<AdminRoute />}>
                <Route path="/admin/settings" element={<ManageSettings />} />
                <Route path="/admin/import-excel" element={<ImportExcel />} />
                
                {/* Grup Rute yang Menggunakan ManageLayout */}
                <Route element={<ManageLayout />}>
                  <Route path="/admin/stores" element={<ManageStores />} />
                  <Route path="/admin/users" element={<ManageUsers />} />
                </Route>
              </Route>

            </Route>
          </Route>

          {/* Rute Fallback untuk URL yang tidak terdaftar */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;