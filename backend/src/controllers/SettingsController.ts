import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js'; 

/**
 * getSettings 
 * 
 * Mengambil konfigurasi pengaturan sistem global aplikasi (seperti masa retensi OTP)
 * berdasarkan pengenal unik default ('default').
 */
export const getSettings = async (req: Request, res: Response) => {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { id: 'default' }
    });

    // Jika belum ada di database, kirimkan nilai fallback default 7 hari
    return res.status(200).json(setting || { otpRetentionDays: 7 });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return res.status(500).json({ message: "Failed to fetch settings" });
  }
}

/**
 * updateSettings
 * 
 * Update atau membuat konfigurasi parameter pengaturan sistem global 
 * (seperti masa retensi OTP).
 */
export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { otpRetentionDays } = req.body;

    // Validasi input masa retensi agar bernilai valid dan berupa angka
    if (!otpRetentionDays || isNaN(Number(otpRetentionDays))) {
      return res.status(400).json({ message: "Invalid retention days" });
    }

    // Upsert: Memperbarui data jika ID 'default' sudah ada, atau membuat baru jika belum ada
    const updatedSetting = await prisma.systemSetting.upsert({
      where: { id: 'default' },
      update: { otpRetentionDays: Number(otpRetentionDays) },
      create: { id: 'default', otpRetentionDays: Number(otpRetentionDays) }
    });

    return res.status(200).json(updatedSetting);
  } catch (error) {
    console.error("Error updating settings:", error);
    return res.status(500).json({ message: "Failed to update settings" });
  }
}