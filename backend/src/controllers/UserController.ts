import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

/**
 * getUsers
 * 
 * Mengambil daftar seluruh data user dari database, diurutkan berdasarkan ID ascending, beserta userResponsibilities dan detail informasi store-nya.
 */
export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { id: 'asc' },
            include: {
                userResponsibilities: {
                    include: {
                        store: true
                    },
                },
            },
        });
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: 'Gagal mengambil data user' });
    }
};

/**
 * createUser
 * 
 * Add entitas data user baru setelah memvalidasi parameter name dan email.
 */
export const createUser = async (req: Request, res: Response) => {
    try {
        const { name, email, phoneNumber } = req.body;

        // Validasi parameter wajib payload
        if (!name || !email) {
            return res.status(400).json({ error: 'Name dan email wajib diisi' });
        }

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                phoneNumber
            },
        });

        res.status(201).json(newUser);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: 'Gagal menambahkan user' });
    }
};

/**
 * deleteUser 
 * 
 * Delete entitas data user tertentu berdasarkan ID yang diberikan.
 */
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.user.delete({
            where: { id: Number(id) },
        });

        res.status(200).json({ message: 'User berhasil dihapus' });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: 'Gagal menghapus user' });
    }
};

/**
 * toggleUserStatus 
 * 
 * Update status keatifan user (aktif / non-aktif)
 */
export const toggleUserStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ error: 'Nilai isActive harus berupa boolean' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data: { isActive },
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error toggling user status:", error);
        res.status(500).json({ error: 'Gagal mengubah status user' });
    }
};

/**
 * toggleAdminStatus
 * 
 * Mengubah hak akses user (user biasa / admin) berdasarkan ID yang dikirimkan.
 */
export const toggleAdminStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isAdmin } = req.body;

        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { isAdmin },
        });

        return res.status(200).json(user);
    } catch (error) {
        console.error("Error toggling admin status:", error);
        return res.status(500).json({ error: "Gagal mengubah role admin user" });
    }
};