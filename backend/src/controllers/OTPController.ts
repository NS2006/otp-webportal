import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendOtpEmail } from '../jobs/Mailer.js';

/**
 * getPaginatedOTPs 
 * 
 * Mengambil daftar histori pesan OTP secara paginasi berdasarkan user ID dengan parameter penyaringan (filtering), pencarian (searching) yang dioptimalkan,
 * serta pengurutan waktu (sorting).
 */
export const getPaginatedOTPs = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.userId || req.params.id;
    const userId = Number(idParam);

    // Validasi format ID user pada parameter rute
    if (!idParam || isNaN(userId)) {
      return res.status(400).json({ error: "Invalid User ID format" });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const search = req.query.search as string || '';

    const receivedVia = req.query.receivedVia as string;
    const type = req.query.type as string;
    const startDate = req.query.startDate as string; 
    const endDate = req.query.endDate as string;     
    const sort = req.query.sort === 'asc' ? 'asc' : 'desc';

    // Ambil daftar store yang menjadi tanggung jawab dari user tersebut
    const responsibilities = await prisma.userResponsibility.findMany({
      where: { userId: userId },
      select: { storeId: true }
    });

    const storeIds = responsibilities.map(r => r.storeId);

    // Jika user tidak memiliki penugasan toko, kembalikan data kosong secara langsung
    if (storeIds.length === 0) {
      return res.json({ data: [], totalItems: 0, totalPages: 0, currentPage: page });
    }

    // Buat kondisi dasar berdasarkan daftar store 
    const whereClause: any = {
      storeId: { in: storeIds },
    };

    // Melakukan Filter
    if (receivedVia) whereClause.receivedVia = receivedVia;
    if (type) whereClause.type = type;

    if (startDate || endDate) {
      whereClause.receivedDate = {};
      if (startDate) whereClause.receivedDate.gte = new Date(`${startDate}T00:00:00.000Z`);
      if (endDate) whereClause.receivedDate.lte = new Date(`${endDate}T23:59:59.999Z`);
    }

    // Searching
    if (search) {
      // Cari ID Store yang namanya cocok
      const matchingStores = await prisma.store.findMany({
        where: { id: { in: storeIds }, name: { contains: search } },
        select: { id: true }
      });
      const searchedStoreIds = matchingStores.map(s => s.id);

      // Cari ID Sender yang namanya cocok
      const matchingSenders = await prisma.sender.findMany({
        where: { name: { contains: search } },
        select: { id: true }
      });
      const searchedSenderIds = matchingSenders.map(s => s.id);

      // Gunakan pencarian langsung ke Foreign Key untuk performa yang optimal
      whereClause.OR = [
        { code: { contains: search } },
        { message: { contains: search } },
        { storeId: { in: searchedStoreIds } },
        { senderId: { in: searchedSenderIds } },
      ];
    }

    // Menjalankan query hitung total item dan pencarian data secara paralel menggunakan Prisma Transaction
    const [totalItems, otps] = await prisma.$transaction([
      prisma.otp.count({ where: whereClause }), 
      prisma.otp.findMany({
        where: whereClause,
        orderBy: { receivedDate: sort },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          store: { select: { name: true } },
          sender: { select: { name: true } }
        }
      })
    ]);

    // Memetakan struktur hasil data OTP dengan tambahan informasi nama store dan sender
    const formattedOtps = otps.map((otp: any) => ({
      ...otp,
      storeName: otp.store?.name,
      senderName: otp.sender?.name || "Unknown Sender"
    }));

    return res.json({
      data: formattedOtps,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page
    });

  } catch (error) {
    console.error("Error fetching paginated OTPs:", error);
    return res.status(500).json({ error: "Gagal mengambil data OTP" });
  }
};

/**
 * insertNewOTP
 */
export async function insertNewOTP(req: Request, res: Response) {
  try {
    const newOtpRecord = await processOtpLogic(req.body);

    return res.status(201).json({
      success: true,
      message: 'OTP berhasil disimpan dan email notifikasi telah dikirim ke assigned users.',
      data: newOtpRecord,
    });
  } catch (error: any) {
    console.error('Error in insertNewOTP:', error);
    const statusCode = error.message.includes('tidak ditemukan') ? 404 : 400;
    return res.status(statusCode).json({ error: error.message || 'Internal server error' });
  }
}

// Interface untuk payload data OTP
interface OtpPayload {
  storePhoneNumber: string;
  senderName?: string;
  senderPhone?: string;
  receivedVia?: string;
  type?: string;
  code: string;
  message?: string;
  receivedDate?: string | Date;
}

/**
 * Core Logic untuk memproses, menyimpan OTP, dan mengirim email notifikasi.
 */
export async function processOtpLogic(data: OtpPayload) {
  const { storePhoneNumber, senderName, senderPhone, receivedVia, type, code, message, receivedDate } = data;

  if (!storePhoneNumber || !code) {
    throw new Error('storePhoneNumber and code are required');
  }

  // Normalisasi format nomor telepon store
  let normalizedPhone = storePhoneNumber.trim();
  if (normalizedPhone.startsWith('+62')) {
    normalizedPhone = '0' + normalizedPhone.slice(3);
  } else if (normalizedPhone.startsWith('62')) {
    normalizedPhone = '0' + normalizedPhone.slice(2);
  }

  // Cari data store berdasarkan nomor telepon unik
  const store = await prisma.store.findFirst({
    where: { phoneNumber: normalizedPhone },
  });

  if (!store) {
    throw new Error(`Store dengan nomor telepon ${storePhoneNumber} tidak ditemukan di database.`);
  }

  // Menangani data Sender
  const finalSenderName = senderName || 'Unknown';
  const finalSenderPhone = senderPhone || 'Unknown';

  let sender = await prisma.sender.findFirst({
    where: { phoneNumber: finalSenderPhone },
  });

  if (!sender) {
    sender = await prisma.sender.create({
      data: {
        name: finalSenderName,
        phoneNumber: finalSenderPhone,
      },
    });
  }

  // Simpan OTP baru ke dalam database
  const newOtpRecord = await prisma.otp.create({
    data: {
      storeId: store.id,
      senderId: sender.id,
      receivedVia: receivedVia || 'WA',
      type: type || 'code',
      code: code,
      message: message || '',
      receivedDate: receivedDate ? new Date(receivedDate) : new Date(),
    },
    include: {
      store: true,
      sender: true,
    },
  });

  // Ambil daftar user yang di-assign ke store 
  const responsibilities = await prisma.userResponsibility.findMany({
    where: { storeId: store.id },
    include: { user: true },
  });

  if (responsibilities && responsibilities.length > 0) {
    const recipientEmails = responsibilities
      .filter((item) => item.user && item.user.isActive !== false)
      .map((item) => item.user?.email)
      .filter(Boolean) as string[];

    if (recipientEmails.length > 0) {
      const formattedTimestamp = new Date(newOtpRecord.receivedDate).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'medium',
        hour12: false,
      });

      const combinedEmails = recipientEmails.join(', ');
      try {
        await sendOtpEmail({
          toEmail: combinedEmails, 
          otp: newOtpRecord.code,
          otpType: newOtpRecord.type as 'code' | 'link',
          otpFrom: newOtpRecord.receivedVia === 'SMS' ? 'SMS' : 'Whatsapp',
          senderPhone: newOtpRecord.sender.phoneNumber,
          senderName: newOtpRecord.sender.name,
          receiverPhone: store.phoneNumber,
          messageBody: newOtpRecord.message || '',
          timestamp: formattedTimestamp,
        });
        console.log(`Berhasil mengirim 1 email notifikasi ke: ${combinedEmails}`);
      } catch (err: any) {
        console.error(`Gagal mengirim email notifikasi massal:`, err.message);
      }
    }
  }

  return newOtpRecord;
}