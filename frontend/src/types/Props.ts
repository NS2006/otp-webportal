/** Properti untuk komponen FeedbackModal */
export type FeedbackModalProps = {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "error";
  title: string;
  message: string;
};

/** Properti untuk komponen ConfirmationModal*/
export type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
};

/** Properti untuk komponen AssignButton */
export type AssignButtonProps = {
  targetId: number;
  targetName: string;
  targetType: "user" | "store";
  onAssigned: () => void; // Callback untuk memuat ulang data tabel di komponen parent
};

/** Properti untuk komponen ViewResponsibilitiesModal*/
export type ViewResponsibilitiesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  targetType: "user" | "store";
  items: any[];
};

/** Struktur kolom untuk tabel manajemen generik */
type ManageEntityTableColumn<T> = {
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
  sortKey?: string;
};

/** Properti untuk komponen ManageEntityTable */
export type ManageEntityTableProps<T> = {
  entityTitle: string;
  items: T[];
  isLoading: boolean;
  onFetch: () => void;
  onCreate: (formData: any) => Promise<any>;
  filterFn: (item: T, query: string) => boolean;
  columns: ManageEntityTableColumn<T>[];
  formFields: {
    name: string;
    label: string;
    type: string;
    placeholder: string;
  }[];
  targetType: "user" | "store";
  renderActions?: (item: T) => React.ReactNode; 
};

/** Properti untuk komponen Sidebar */
export type SidebarProps = {
  isAdmin: boolean;
  activeSection: string;
  onScrollToTop: () => void;
  onScrollToSection: (sectionId: string, menuKey: string) => void;
  onLogout: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};