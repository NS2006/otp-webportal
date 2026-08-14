// backend/src/jobs/otpCleanup.ts
import cron from 'node-cron';
import { prisma } from '../config/prisma.js'; 

export const startOtpCleanupJob = () => {
  // Jadwal: Berjalan setiap hari pada jam 00:00 (Tengah Malam)
  // Format Cron: 'Menit Jam Tanggal Bulan Hari'
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Memulai proses pembersihan OTP kedaluwarsa...');
    
    try {
      // Ambil setting dari database (atau gunakan 7 sebagai fallback)
      const setting = await prisma.systemSetting.findUnique({
        where: { id: 'default' }
      });
      const retentionDays = setting?.otpRetentionDays ?? 7;

      // Hitung tanggal kedaluwarsa
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() - retentionDays);

      // Hapus semua OTP yang receivedDate-nya lebih lama dari expiryDate
      const result = await prisma.otp.deleteMany({
        where: {
          receivedDate: {
            lt: expiryDate
          }
        }
      });

      console.log(`[CRON] Berhasil menghapus ${result.count} OTP yang berumur lebih dari ${retentionDays} hari.`);
    } catch (error) {
      console.error('[CRON] Gagal menjalankan pembersihan OTP:', error);
    }
  });
};