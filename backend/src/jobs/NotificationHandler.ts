import { extractOtp } from "../controllers/IngestController.js";
import { insertNewOTP, processOtpLogic } from "../controllers/OTPController.js";

/**
 * Payload yang dikirim OTP Forwarder App (Android NotificationListenerService)
 * setiap kali WhatsApp memunculkan notifikasi.
 */
export interface NotificationPayload {
  /** Nomor penerima (nomor emulator yang jadi primary device) */
  phone: string;
  /** Judul notifikasi WhatsApp (biasanya nama pengirim, mis. "Shopee Security") */
  title?: string;
  /** Isi teks notifikasi (di sinilah OTP berada) */
  text: string;
  /** Nama package sumber notif (filter: hanya com.whatsapp / com.whatsapp.w4b) */
  packageName?: string;
  /** Epoch ms saat notif muncul (opsional) */
  postedAt?: number;
}

const TARGET_PACKAGES = [
  // --- WhatsApp ---
  'com.whatsapp', 
  'com.whatsapp.w4b',
  
  // --- SMS --- Tambah package lain jika package dibawah tidak mengcover tipe HP lainnya
  'com.android.mms',
  'com.google.android.apps.messaging',  
  'com.samsung.android.messaging'
];

export interface IngestResult {
  status: 'sent' | 'no_otp' | 'ignored';
  otp?: string;
  otpType?: 'code' | 'link';
}

/**
 * Proses satu notifikasi WhatsApp dari primary device.
 * Reuse pipeline yang sama: extractOtp() + sendOtpEmail().
 */
export async function handleNotification(
  payload: NotificationPayload,
): Promise<IngestResult> {
  const { phone, title, text, packageName, postedAt } = payload;

  console.log(`\nDEBUG: Received notification from Package: ${packageName}`);
  console.log(`Text: ${text}`);

  // Mengabaikan notifikasi jika paket aplikasi tidak termasuk ke dalam target yang diizinkan
  if (packageName && !TARGET_PACKAGES.includes(packageName)) {
    console.log(`⏭️  Ignored notif from ${packageName}`);
    return { status: 'ignored' };
  }

  const timestamp = postedAt ?? Date.now();
  const formattedTimestamp = new Date(timestamp).toLocaleString('id-ID');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if(packageName?.startsWith("com.whatsapp")){  
    console.log(`📩 [Ingest] WhatsApp notification`);
  } else {
    console.log(`📩 [Ingest] SMS notification`);
  }

  console.log(`   Phone       : ${phone}`);
  console.log(`   Title       : ${title ?? '-'}`);
  console.log(`   Text        : ${text}`);
  console.log(`   Timestamp   : ${formattedTimestamp}`);

  // Melakukan ekstraksi pola OTP (kode angka atau tautan) dari isi teks pesan
  const otpResult = extractOtp(text);
  if (!otpResult) {
    console.log(`   ℹ️  No OTP pattern detected`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return { status: 'no_otp' };
  }

  // Menentukan asal platform penerimaan pesan (WhatsApp, WhatsApp Business, atau SMS)
  const otpFrom = packageName === "com.whatsapp.w4b" ? "WA4B" : packageName === "com.whatsapp" ? "WA" : "SMS";
  const label = otpResult.type === 'link' ? 'OTP LINK' : 'OTP CODE';
  
  console.log(`   🔐 ${label} DETECTED FROM ${otpFrom}: ${otpResult.value}`);
  console.log(`   🌐 Sending POST request to Web Backend...`);

  try {
    await processOtpLogic({
      storePhoneNumber: phone,
      senderName: title ?? 'Unknown',
      senderPhone: title ?? 'Unknown',
      receivedVia: otpFrom,
      type: otpResult.type,
      code: otpResult.value,
      message: text,
      receivedDate: new Date(timestamp).toISOString(),
    });

    console.log(`   ✅ Successfully processed and stored OTP internally`);
  } catch (err: any) {
    console.error(`   ❌ Failed to process OTP internally:`, err.message);
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return { status: 'sent', otp: otpResult.value, otpType: otpResult.type };
}