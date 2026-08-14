import { FileSpreadsheet, Upload, AlertTriangle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExcelService } from "../../services/ExcelService";
import type { LayoutContextType } from "../../layouts/MainLayout";

/**
 * ImportExcel Page
 * 
 * Halaman untuk upload file spreadsheet Excel/CSV
 * untuk sinkronisasi dan update massal pada data User, Store, dan Responsibilities.
 */
export default function ImportExcel() {
    const { t } = useTranslation();

    // State lokal untuk manajemen file yang dipilih, status drag-and-drop, serta status proses
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Mengambil modal feedback global dari parent layout
    const { showFeedbackModal } = useOutletContext<LayoutContextType>();

    /**
   * Menangani pemilihan file melalui elemen input file standar.
   */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    /**
   * Mencegah perilaku default browser dan menandai status area saat file diseret ke zona drop.
   */
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    /**
   * Menghilangkan penanda visual saat file keluar dari area zona drop.
   */
    const handleDragLeave = () => {
        setIsDragging(false);
    };

    /**
   * Menangani drop file ke drag and drop area.
   */
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    };

    /**
   * Handle submit form untuk melakukan validasi file, 
   * parsing data, serta sinkronisasi database.
   */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        setIsLoading(true);

        try {
            const parsedData = await ExcelService.parseAndValidate(selectedFile);
            await ExcelService.syncDatabase(parsedData);

            setSelectedFile(null);

            showFeedbackModal(
                "success",
                t("importExcel.feedback.successTitle", "Sinkronisasi Berhasil!"),
                t("importExcel.feedback.successMessage", "Database berhasil diupdate sesuai dengan file Excel yang diunggah.")
            );
        } catch (error: any) {
            console.error("Error syncing excel:", error);
            showFeedbackModal(
                "error",
                t("importExcel.feedback.errorTitle", "Sinkronisasi Gagal!"),
                error.message || t("importExcel.feedback.errorMessage", "Terjadi kesalahan saat memproses file Excel.")
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">

            {/* Header Judul & Deskripsi Halaman */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">{t("importExcel.title", "Import Excel Database")}</h1>
                <p className="text-sm text-gray-500 mt-1">
                    {t("importExcel.subtitle", "Upload your master spreadsheet to sync and update the database records.")}
                </p>
            </div>

            {/* Warning Banner */}
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-start gap-3 text-sky-800">
                <AlertTriangle className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                    <span className="font-semibold block mb-0.5">{t("importExcel.warningTitle", "Informasi Sinkronisasi")}</span>
                    {t("importExcel.warningText", "Tindakan ini akan memperbarui data User/Store yang sudah ada dan menambahkan data baru. Penugasan (Responsibilities) untuk User dan Store yang ada di file Excel akan diganti sesuai matriks (YES/Kosong). Data lama di database yang tidak ada di Excel tidak akan terhapus.")}
                </div>
            </div>

            {/* Kontainer Utama Upload File */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Drag and Drop Zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${isDragging
                            ? "border-emerald-500 bg-emerald-50/50"
                            : "border-gray-200 hover:border-emerald-400 bg-slate-50/50"
                            }`}
                    >
                        <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileChange}
                            id="excel-upload"
                            className="hidden"
                        />
                        <label htmlFor="excel-upload" className="cursor-pointer flex flex-col items-center">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                                <FileSpreadsheet size={24} />
                            </div>
                            <span className="text-sm font-medium text-slate-700">
                                {selectedFile ? selectedFile.name : t("importExcel.dropzoneText", "Klik untuk pilih file atau seret file Excel ke sini")}
                            </span>
                            <span className="text-xs text-gray-400 mt-1">
                                {t("importExcel.supportedFormats", "Mendukung format .xlsx, .xls, atau .csv")}
                            </span>
                        </label>
                    </div>

                    {/* Informasi Detail File yang Dipilih */}
                    {selectedFile && (
                        <div className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                                <FileSpreadsheet className="text-emerald-600" size={18} />
                                <span className="font-medium">{selectedFile.name}</span>
                                <span className="text-xs text-gray-400">
                                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedFile(null)}
                                className="text-xs text-red-500 hover:text-red-700 font-medium"
                            >
                                {t("importExcel.removeFile", "Hapus")}
                            </button>
                        </div>
                    )}

                    {/* Tombol Upload */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={!selectedFile || isLoading}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <RefreshCw className="animate-spin" size={16} />
                                    <span>{t("importExcel.processing", "Memproses Database...")}</span>
                                </>
                            ) : (
                                <>
                                    <Upload size={16} />
                                    <span>{t("importExcel.uploadButton", "Upload & Sinkronisasi Database")}</span>
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}