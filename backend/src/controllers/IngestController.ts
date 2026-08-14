import type { Request, Response } from 'express';
import { handleNotification } from '../jobs/NotificationHandler.js';
import type { NotificationPayload } from '../jobs/NotificationHandler.js';

const INGEST_TOKEN = process.env.INGEST_TOKEN;

/**
 * handleIngest Controller
 * 
 * Endpoint untuk menerima data webhook notifikasi masuk (dari perangkat Android/Emulator),
 * melakukan validasi ingest token, memberikan respons cepat (ACK), 
 * serta memicu proses penanganan latar belakang secara asinkron.
 */
export async function handleIngest(req: Request, res: Response) {
  // Validasi token otentikasi header jika INGEST_TOKEN diaktifkan pada lingkungan server
  if (INGEST_TOKEN) {
    const auth = req.header('x-ingest-token');
    if (auth !== INGEST_TOKEN) {
      return res.status(401).json({ error: 'invalid token' });
    }
  }

  // Validasi payload data masuk untuk memastikan field wajib (phone dan text) tersedia
  const payload = req.body as NotificationPayload;
  if (!payload?.phone || !payload?.text) {
    return res.status(400).json({ error: 'phone and text are required' });
  }

  // Mengirimkan konfirmasi penerimaan cepat (ACK) ke perangkat pengirim sebelum proses asinkron selesai
  res.json({ ok: true });

  // Menjalankan pemrosesan notifikasi di latar belakang secara asinkron
  try {
    await handleNotification(payload);
  } catch (err: any) {
    console.error('❌ Ingest processing error:', err.message);
  }
}

// Tipe hasil ekstraksi pesan OTP (berupa kode angka verifikasi atau URL tautan)
export type OtpResult =
  | { type: 'code'; value: string }
  | { type: 'link'; value: string };


/**
* extractOtp Utility Function
* 
* Menganalisis teks pesan masuk (SMS/WhatsApp) menggunakan pola regex ekspresif
* untuk mendeteksi serta mengekstrak informasi tautan verifikasi (link) atau kode OTP numerik.
*/
export function extractOtp(messageBody: string): OtpResult | null {
  if (!messageBody) return null;

  // Pattern 1: OTP link — shortlink atau URL verifikasi
  // Contoh: "id.shp.ee/dlink/we42bd0", "https://shopee.co.id/verify/xxx"
  const linkPattern =
    /https?:\/\/[^\s]+|(?:[a-z0-9-]+\.)+[a-z]{2,}\/[^\s]+/gi;
  const linkMatches = messageBody.match(linkPattern);
  if (linkMatches) {
    return { type: 'link', value: linkMatches[0] };
  }

  // Normalisasi: hapus pemisah seperti dash atau spasi di tengah angka
  // "123-456" → "123456", "123 456" → "123456"
  const normalized = messageBody.replace(/(\d)[-\s](\d)/g, '$1$2');

  // Pattern 2: keyword + digit
  const keywordPattern =
    /(?:otp|kode|code|verifikasi|verification|pin|password)[^\d]{0,20}(\d{4,8})/i;
  const keywordMatch = normalized.match(keywordPattern);
  if (keywordMatch && keywordMatch[1]) return { type: 'code', value: keywordMatch[1] };

  // Pattern 3: standalone 4-8 digit (fallback)
  const standalonePattern = /\b(\d{4,8})\b/;
  const standaloneMatch = normalized.match(standalonePattern);
  if (standaloneMatch && standaloneMatch[1]) return { type: 'code', value: standaloneMatch[1] };

  return null;
}
