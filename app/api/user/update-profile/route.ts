import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/app/generated/prisma"

const prisma = new PrismaClient()

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, name, urlPhotoUser } = body

    // Validasi dasar
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId wajib diisi" },
        { status: 400 }
      )
    }

    if (!name && !urlPhotoUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Minimal isi salah satu: name atau urlPhotoUser"
        },
        { status: 400 }
      )
    }

    // Cek user ada atau tidak
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 404 }
      )
    }

    // Build data yang mau diupdate (biar field yang tidak dikirim tidak ikut ke-update)
    const updateData: { name?: string; urlPhotoUser?: string } = {}
    if (name) updateData.name = name
    if (urlPhotoUser) updateData.urlPhotoUser = urlPhotoUser

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        urlPhotoUser: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: "Profil berhasil diperbarui",
      data: updatedUser
    })
  } catch (error) {
    console.error("Error update profile:", error)
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
