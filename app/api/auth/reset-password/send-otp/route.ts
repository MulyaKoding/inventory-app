import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()

    if (!phone) {
      return NextResponse.json(
        { error: "Nomor WhatsApp wajib diisi" },
        { status: 400 }
      )
    }

    const cleanPhone = phone.replace(/\D/g, "").replace(/^0/, "62")

    // Cek apakah nomor terdaftar
    const user = await prisma.user.findUnique({
      where: { phone: cleanPhone }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Nomor WhatsApp tidak terdaftar" },
        { status: 404 }
      )
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 menit

    // Hapus OTP lama untuk nomor ini
    await prisma.otpVerification.deleteMany({
      where: { phone: cleanPhone }
    })

    // Simpan OTP baru
    await prisma.otpVerification.create({
      data: {
        phone: cleanPhone,
        otp: otpCode,
        expiresAt,
        verified: false
      }
    })

    // Kirim via WhatsApp (ganti dengan provider kamu, misal: Fonnte, Wablas, dll)
    await sendWhatsAppOTP(cleanPhone, otpCode)

    return NextResponse.json(
      { message: "OTP berhasil dikirim" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Reset password send-otp error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// ── Ganti fungsi ini sesuai provider WhatsApp kamu ──
async function sendWhatsAppOTP(phone: string, otp: string) {
  const message = `🔐 *STOCKR - Reset Password*\n\nKode OTP kamu adalah:\n\n*${otp}*\n\nBerlaku 5 menit. Jangan bagikan kode ini kepada siapapun.\n\n_Jika kamu tidak merasa meminta reset password, abaikan pesan ini._`

  // Contoh: Fonnte
  // await fetch("https://api.fonnte.com/send", {
  //   method: "POST",
  //   headers: { Authorization: process.env.FONNTE_TOKEN! },
  //   body: new URLSearchParams({ target: phone, message })
  // })

  // Contoh: Wablas
  // await fetch(`${process.env.WABLAS_URL}/api/send-message`, {
  //   method: "POST",
  //   headers: { Authorization: process.env.WABLAS_TOKEN!, "Content-Type": "application/json" },
  //   body: JSON.stringify({ phone, message })
  // })

  console.log(`[DEV] OTP for ${phone}: ${otp}`) // hapus di production
}
