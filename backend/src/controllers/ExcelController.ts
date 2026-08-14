import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

/**
 * importExcel Controller
 * 
 * Menangani proses sinkronisasi database secara massal (bulk sync)
 * berdasarkan data matriks Excel yang diimpor, mencakup pembaruan atau pembuatan data store,
 * pengguna (users), serta pemetaan ulang relasi penugasan (responsibilities)
 * menggunakan Prisma Transaction.
 */
export const importExcel = async (req: Request, res: Response) => {
    try {
        const { users, stores, responsibilities } = req.body;

        // Validasi awal untuk memastikan payload data utama tersedia
        if (!users || !stores) {
            return res.status(400).json({ error: 'Data users atau stores tidak valid.' });
        }

        // Menjalankan operasi database menggunakan Prisma Transaction
        await prisma.$transaction(async (tx) => {
            
            // UPSERT STORES (Memperbarui data toko jika sudah ada, atau membuat baru jika belum ada)
            const storeNameToIdMap = new Map<string, number>();

            for (const storeData of stores) {
                let store;

                // Memeriksa keberadaan store berdasarkan nomor telepon unik jika nomor telepon tersedia
                if (storeData.phoneNumber && storeData.phoneNumber.trim() !== '') {
                    store = await tx.store.findFirst({
                        where: { phoneNumber: storeData.phoneNumber }
                    });
                }

                if (store) {
                    // Jika toko dengan nomor telepon yang sama ditemukan, perbarui namanya
                    store = await tx.store.update({
                        where: { id: store.id },
                        data: { name: storeData.name || store.name }
                    });
                } else {
                    // Jika tidak ditemukan berdasarkan nomor telepon (atau nomor telepon kosong), buat entri store baru
                    store = await tx.store.create({
                        data: { 
                            name: storeData.name, 
                            phoneNumber: storeData.phoneNumber || '' 
                        },
                    });
                }
                
                // Memetakan nama store ke ID store untuk keperluan relasi penugasan (responsibilities)
                storeNameToIdMap.set(storeData.name, store.id);
            }

            // 2UPSERT USERS (Memperbarui data pengguna jika sudah ada, atau membuat baru jika belum terdaftar)
            const userEmailToIdMap = new Map<string, number>();

            for (const userData of users) {
                // Memeriksa keberadaan user berdasarkan alamat email unik
                let user = await tx.user.findFirst({
                    where: { email: userData.email }
                });

                if (user) {
                    // Memperbarui informasi nama dan nomor telepon pengguna yang sudah ada
                    user = await tx.user.update({
                        where: { id: user.id },
                        data: {
                            name: userData.name,
                            phoneNumber: userData.phoneNumber || user.phoneNumber
                        }
                    });
                } else {
                    // Membuat entri akun pengguna baru ke dalam database
                    user = await tx.user.create({
                        data: {
                            name: userData.name,
                            email: userData.email,
                            phoneNumber: userData.phoneNumber
                        },
                    });
                }
                userEmailToIdMap.set(user.email, user.id);
            }

            // Menyelaraskan matriks relasi penugasan store dan user
            const importedStoreIds = Array.from(storeNameToIdMap.values());
            const importedUserIds = Array.from(userEmailToIdMap.values());

            // Menghapus relasi penugasan lama secara spesifik hanya di antara daftar User dan Store yang diimpor dari Excel
            if (importedUserIds.length > 0 && importedStoreIds.length > 0) {
                await tx.userResponsibility.deleteMany({
                    where: {
                        userId: { in: importedUserIds },
                        storeId: { in: importedStoreIds }
                    }
                });
            }

            // Menyusun array rekam jejak relasi baru berdasarkan tanda "YES" di dalam matriks Excel
            const responsibilityRecords: Array<{ userId: number; storeId: number }> = [];

            for (const resp of responsibilities) {
                const userId = userEmailToIdMap.get(resp.userEmail);
                if (userId) {
                    for (const storeName of resp.storeNames) {
                        const storeId = storeNameToIdMap.get(storeName);
                        if (storeId) {
                            responsibilityRecords.push({ userId, storeId });
                        }
                    }
                }
            }

            // Memasukkan kumpulan data penugasan baru ("YES") secara massal ke dalam database
            if (responsibilityRecords.length > 0) {
                await tx.userResponsibility.createMany({
                    data: responsibilityRecords,
                    skipDuplicates: true,
                });
            }
        });

        // Mengirimkan respons sukses jika seluruh rangkaian transaksi database berhasil
        res.json({ 
            status: 'success', 
            message: 'Database berhasil disinkronkan. Data yang ada diperbarui dan data baru ditambahkan!' 
        });
    } catch (error: any) {
        console.error("Gagal import excel database:", error);
        res.status(500).json({ error: error.message || 'Gagal memproses sinkronisasi database di server.' });
    }
};