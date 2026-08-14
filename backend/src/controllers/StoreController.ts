import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

/**
 * getStores Controller
 * 
 * Mengambil daftar seluruh data store dari database,
 * diurutkan berdasarkan ID secara ascending beserta userResponsibilities dan detail informasi usernya.
 */
export const getStores = async (req: Request, res: Response) => {
    try {
        const stores = await prisma.store.findMany({
            orderBy: { id: 'asc' },
            include: {
                userResponsibilities: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        res.json(stores);
    } catch (error) {
        console.error("Error fetching stores:", error);
        res.status(500).json({ error: 'Gagal mengambil data store' });
    }
};

/**
 * createStore Controller
 * 
 * Add data store baru ke dalam sistem
 * setelah memvalidasi parameter wajib nama (name) dan nomor telepon (phoneNumber).
 */
export const createStore = async (req: Request, res: Response) => {
    try {
        const { name, phoneNumber } = req.body;

        // Validasi parameter wajib payload
        if (!name || !phoneNumber) {
            return res.status(400).json({ error: 'Name dan phoneNumber wajib diisi' });
        }

        const newStore = await prisma.store.create({
            data: {
                name,
                phoneNumber,
            },
        });

        res.status(201).json(newStore);
    } catch (error) {
        console.error("Error creating store:", error);
        res.status(500).json({ error: 'Gagal menambahkan store' });
    }
};

/**
 * deleteStore 
 * 
 * Delete entitas data store tertentu secara permanen berdasarkan ID yang diberikan pada parameter rute.
 */
export const deleteStore = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.store.delete({
            where: { id: Number(id) },
        });

        res.status(200).json({ message: 'Store berhasil dihapus' });
    } catch (error) {
        console.error("Error deleting store:", error);
        res.status(500).json({ error: 'Gagal menghapus store' });
    }
};