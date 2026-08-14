import { useState, useEffect } from "react";
import { Trash2, Eye } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserService } from "../../services/UserService";
import ManageEntityTable from "../../components/ManageEntityTable";
import AssignButton from "../../components/AssignButton";
import ViewResponsibilitiesModal from "../../components/ViewResponsibilitiesModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import type { LayoutContextType } from "../../layouts/MainLayout";
import type { ManageContextType } from "../../layouts/ManageLayout";
import type { User } from "../../types/Model";

type CombinedContextType = ManageContextType & LayoutContextType;

/**
 * ManageUsers Page
 * 
 * Halaman untuk mengelola data pengguna (User),
 * mencakup fitur CRUD data user
 */
export default function ManageUsers() {
  const { t } = useTranslation();
  
  // State lokal untuk manajemen daftar user, status loading, modal view, dan modal delete
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedUserForView, setSelectedUserForView] = useState<any | null>(null);

  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mengambil modal feedback global dari parent layout
  const { showFeedbackModal } = useOutletContext<CombinedContextType>();

  // Mengambil informasi ID user yang sedang login saat ini dari localStorage
  const currentUserStr = localStorage.getItem("currentUser");
  const currentUserId = currentUserStr ? JSON.parse(currentUserStr).id : null;

  /**
   * Fetch seluruh data daftar user.
   */
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await UserService.getAll();
      setUsers(data);
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mengambil data user saat komponen pertama kali dimuat
  useEffect(() => {
    fetchUsers();
  }, []);

  /**
   * Menangani perubahan status aktif / non-aktif akun user.
   */
  const handleStatusChange = async (user: any, newStatus: boolean) => {
    if (user.isActive === newStatus) return;

    try {
      await UserService.toggleStatus(user.id, newStatus);
      fetchUsers();
      showFeedbackModal(
        "success",
        t("manageUsers.feedback.successTitle", "Berhasil!"),
        t("manageUsers.feedback.statusChanged", { name: user.name, status: newStatus ? t("manageUsers.active", "Active") : t("manageUsers.inactive", "Inactive") })
      );
    } catch (error: any) {
      console.error("Error changing user status:", error);
      showFeedbackModal("error", t("manageUsers.feedback.errorTitle", "Gagal!"), error.message || t("manageUsers.feedback.statusError", "Gagal mengubah status user."));
    }
  };

  /**
   * Menangani perubahan hak akses role (Admin / User) pada user.
   */
  const handleRoleChange = async (user: any, newIsAdmin: boolean) => {
    if (user.isAdmin === newIsAdmin) return;

    try {
      await UserService.toggleAdminStatus(user.id, newIsAdmin);
      fetchUsers();
      showFeedbackModal(
        "success",
        t("manageUsers.feedback.successTitle", "Berhasil!"),
        t("manageUsers.feedback.roleChanged", { name: user.name, role: newIsAdmin ? "Admin" : "User" })
      );
    } catch (error: any) {
      console.error("Error changing admin status:", error);
      showFeedbackModal("error", t("manageUsers.feedback.errorTitle", "Gagal!"), error.message || t("manageUsers.feedback.roleError", "Gagal mengubah role user."));
    }
  };

  /**
   * Menangani proses konfirmasi penghapusan user berdasarkan ID yang dipilih.
   */
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      await UserService.delete(userToDelete.id);
      fetchUsers();
      setUserToDelete(null);
      showFeedbackModal("success", t("manageUsers.feedback.successTitle", "Berhasil!"), t("manageUsers.feedback.deleted", { name: userToDelete.name }));
    } catch (error: any) {
      console.error("Error deleting user:", error);
      showFeedbackModal("error", t("manageUsers.feedback.errorTitle", "Gagal!"), error.message || t("manageUsers.feedback.deleteError", "Gagal menghapus user."));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Komponen Tabel Generik untuk Manajemen Entitas User */}
      <ManageEntityTable
        entityTitle={t("manageUsers.entityTitle", "User")}
        items={users}
        isLoading={isLoading}
        onFetch={fetchUsers}
        onCreate={(data) => UserService.create(data.name, data.email, data.phoneNumber)}
        filterFn={(user: any, query) =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
        }
        targetType="user"
        formFields={[
          { name: "name", label: t("manageUsers.form.name", "Name"), type: "text", placeholder: "e.g. John Doe" },
          { name: "email", label: t("manageUsers.form.email", "Email"), type: "email", placeholder: "e.g. john@example.com" },
          { name: "phoneNumber", label: t("manageUsers.form.phoneNumber", "Phone Number"), type: "tel", placeholder: "e.g. 081234567890" },
        ]}
        columns={[
          { header: t("manageUsers.columns.name", "NAME"), sortKey: "name", accessor: (u: any) => <span className="font-medium text-slate-800">{u.name}</span> },
          { header: t("manageUsers.columns.email", "EMAIL"), accessor: (u: any) => <span className="text-gray-500">{u.email}</span> },
          {
            header: t("manageUsers.columns.role", "ROLE"),
            sortKey: "isAdmin",
            accessor: (u: any) => {
              const isSelf = u.id === currentUserId;
              return (
                <select
                  value={u.isAdmin ? "admin" : "user"}
                  onChange={(e) => handleRoleChange(u, e.target.value === "admin")}
                  disabled={isSelf}
                  className={`outline-none px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide transition-colors ${isSelf ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    } ${u.isAdmin
                      ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  title={isSelf ? t("manageUsers.selfRoleWarning", "Anda tidak dapat merubah role akun sendiri") : t("manageUsers.changeRole", "Ubah Role")}
                >
                  <option value="admin" className="bg-white text-slate-800">Admin</option>
                  <option value="user" className="bg-white text-slate-800">User</option>
                </select>
              );
            }
          },
          {
            header: t("manageUsers.columns.status", "STATUS"),
            sortKey: "isActive",
            accessor: (u: any) => {
              const isSelf = u.id === currentUserId;
              return (
                <select
                  value={u.isActive ? "active" : "inactive"}
                  onChange={(e) => handleStatusChange(u, e.target.value === "active")}
                  disabled={isSelf}
                  className={`outline-none px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide transition-colors ${isSelf ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    } ${u.isActive
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                  title={isSelf ? t("manageUsers.selfStatusWarning", "Anda tidak dapat menonaktifkan akun sendiri") : t("manageUsers.changeStatus", "Ubah Status")}
                >
                  <option value="active" className="bg-white text-slate-800">{t("manageUsers.active", "Active")}</option>
                  <option value="inactive" className="bg-white text-slate-800">{t("manageUsers.inactive", "Inactive")}</option>
                </select>
              );
            }
          },
        ]}
        renderActions={(user: any) => {
          const isSelf = user.id === currentUserId;

          return (
            <div className="flex items-center justify-end gap-2">
              
              {/* Tombol Modal Lihat Detail Store yang Ditugaskan */}
              <button
                onClick={() => setSelectedUserForView(user)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-medium transition-all shadow-sm"
                title={t("manageUsers.actions.viewDetail", "View Assigned Stores")}
              >
                <Eye size={14} className="text-blue-500" />
                <span className="hidden xl:inline">{t("manageUsers.actions.detail", "Detail")}</span>
              </button>

              {/* Tombol Assign Store ke User Terkait */}
              <AssignButton
                targetId={user.id}
                targetName={user.name}
                targetType="user"
                onAssigned={fetchUsers}
              />

              {/* Tombol Modal Hapus User (Dinonaktifkan Jika Akun Sendiri) */}
              <button
                onClick={() => setUserToDelete(user)}
                disabled={isSelf}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium transition-all shadow-sm ${isSelf
                    ? "bg-gray-50 text-gray-400 border-gray-200 opacity-50 cursor-not-allowed!"
                    : "bg-white hover:bg-red-50 text-red-600 border-slate-200 hover:border-red-200"
                  }`}
                title={isSelf ? t("manageUsers.selfDeleteWarning", "Tidak dapat menghapus akun sendiri") : t("manageUsers.actions.delete", "Delete User")}
              >
                <Trash2 size={14} />
                <span className="hidden xl:inline">{t("manageUsers.actions.deleteLabel", "Hapus")}</span>
              </button>
            </div>
          );
        }}
      />

      {/* Modal Dialog Konfirmasi Penghapusan User */}
      {userToDelete && (
        <ConfirmationModal
          isOpen={Boolean(userToDelete)}
          onClose={() => setUserToDelete(null)}
          onConfirm={handleConfirmDelete}
          title={t("manageUsers.modal.deleteTitle", "Hapus User")}
          message={t("manageUsers.modal.deleteMessage", { name: userToDelete.name })}
          confirmText={t("manageUsers.modal.confirmDelete", "Ya, Hapus")}
          cancelText={t("manageUsers.modal.cancel", "Batal")}
          type="danger"
          isLoading={isDeleting}
        />
      )}

      {/* Modal Dialog Tampilan Daftar Store yang Terhubung */}
      {selectedUserForView && (
        <ViewResponsibilitiesModal
          isOpen={Boolean(selectedUserForView)}
          onClose={() => setSelectedUserForView(null)}
          targetName={selectedUserForView.name}
          targetType="user"
          items={selectedUserForView.userResponsibilities || []}
        />
      )}
    </>
  );
}