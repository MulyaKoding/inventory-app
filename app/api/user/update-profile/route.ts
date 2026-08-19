import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/app/generated/prisma"

const prisma = new PrismaClient()

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, name, email, phone, urlPhotoUser } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId wajib diisi" },
        { status: 400 }
      )
    }

    if (!name && !email && !phone && !urlPhotoUser) {
      return NextResponse.json(
        { success: false, message: "Minimal isi salah satu field" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 404 }
      )
    }

    // Cek email unik kalau email diubah
    if (email && email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } })
      if (emailTaken) {
        return NextResponse.json(
          { success: false, message: "Email sudah digunakan" },
          { status: 409 }
        )
      }
    }

    const updateData: {
      name?: string
      email?: string
      phone?: string
      urlPhotoUser?: string
    } = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (phone) updateData.phone = phone
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
