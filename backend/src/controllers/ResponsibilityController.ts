import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js'; 

/**
 * getUserResponsibilities
 * 
 * Mengambil daftar relasi penugasan store yang dikelola 
 * oleh seorang user berdasarkan ID user.
 */
export const getUserResponsibilities = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.params.id);

        const responsibilities = await prisma.userResponsibility.findMany({
            where: { userId },
            include: { store: true }
        });

        return res.status(200).json(responsibilities);
    } catch (error) {
        console.error("Error fetching user responsibilities:", error);
        return res.status(500).json({ error: "Gagal mengambil daftar tugas user" });
    }
}

/**
 * updateUserResponsibilities
 * 
 * Update daftar penugasan store secara massal untuk user
 * menggunakan transaksi database
 */
export const updateUserResponsibilities = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.params.id);
        const { storeIds } = req.body

        await prisma.$transaction(async (tx) => {
            // Hapus semua relasi yang ada sebelumnya untuk user ini
            await tx.userResponsibility.deleteMany({
                where: { userId }
            });

            // Jika ada store yang dipilih, insert yang baru
            if (storeIds && storeIds.length > 0) {
                const dataToInsert = storeIds.map((storeId: number) => ({
                    userId,
                    storeId: Number(storeId)
                }));

                await tx.userResponsibility.createMany({
                    data: dataToInsert
                });
            }
        });

        return res.status(200).json({ message: "Tugas berhasil diperbarui" });
    } catch (error) {
        console.error("Error updating user responsibilities:", error);
        return res.status(500).json({ error: "Gagal menyimpan tugas user" });
    }
}

/**
 * getStoreResponsibilities
 * 
 * Mengambil daftar users yang ditugaskan 
 * untuk mengelola sebuah store tertentu berdasarkan store ID (storeId).
 */
export const getStoreResponsibilities = async (req: Request, res: Response) => {
    try {
        const storeId = Number(req.params.id);

        const responsibilities = await prisma.userResponsibility.findMany({
            where: { storeId },
            include: { user: true }
        });

        return res.status(200).json(responsibilities);
    } catch (error) {
        console.error("Error fetching store responsibilities:", error);
        return res.status(500).json({ error: "Gagal mengambil daftar PIC store" });
    }
}

/**
 * updateStoreResponsibilities 
 * 
 * Update daftar users yang bertanggung jawab atas sebuah store tertentu
 * menggunakan transaksi database 
 */
export const updateStoreResponsibilities = async (req: Request, res: Response) => {
    try {
        const storeId = Number(req.params.id);
        const { userIds } = req.body;

        await prisma.$transaction(async (tx) => {
            // Hapus semua PIC yang ada sebelumnya untuk store ini
            await tx.userResponsibility.deleteMany({
                where: { storeId }
            });

            // Jika ada user yang dipilih, insert yang baru
            if (userIds && userIds.length > 0) {
                const dataToInsert = userIds.map((userId: number) => ({
                    storeId,
                    userId: Number(userId)
                }));

                await tx.userResponsibility.createMany({
                    data: dataToInsert
                });
            }
        });

        return res.status(200).json({ message: "PIC Store berhasil diperbarui" });
    } catch (error) {
        console.error("Error updating store responsibilities:", error);
        return res.status(500).json({ error: "Gagal menyimpan PIC store" });
    }
}