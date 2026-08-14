export type FilterField = {
  /** Pengenal unik (identifier) */
  id: string;
  /** Label teks deskriptif yang ditampilkan di samping atau atas input filter */
  label: string;
  /** Jenis tipe kontrol input form yang akan dirender */
  type: "text" | "select" | "date";
  /** Daftar opsi pilihan dropdown (hanya digunakan jika type bernilai "select") */
  options?: { label: string; value: string }[];
  /** Teks placeholder panduan untuk kotak input */
  placeholder?: string;
};