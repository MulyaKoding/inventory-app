import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/app/generated/prisma"

const prisma = new PrismaClient()

function generateStoreId(): string {
  const prefix = "STR"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `${prefix}-${timestamp}-${random}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      storeName,
      storeType,
      storePhone,
      storeEmail,
      storeAddress,
      storeCity,
      storeProvince,
      storePostalCode,
      owner
    } = body

    if (
      !storeName ||
      !storeType ||
      !storePhone ||
      !storeAddress ||
      !storeCity ||
      !storeProvince
    ) {
      return NextResponse.json(
        { error: "Data toko tidak lengkap" },
        { status: 400 }
      )
    }

    if (
      !owner ||
      !owner.nik ||
      !owner.fullName ||
      !owner.birthDate ||
      !owner.address ||
      !owner.gender
    ) {
      return NextResponse.json(
        { error: "Data pemilik tidak lengkap" },
        { status: 400 }
      )
    }

    if (owner.nik.length !== 16 || !/^\d+$/.test(owner.nik)) {
      return NextResponse.json(
        { error: "NIK harus 16 digit angka" },
        { status: 400 }
      )
    }

    const storeId = generateStoreId()

    const store = await prisma.store.create({
      data: {
        storeId,
        storeName,
        storeType,
        storePhone,
        storeEmail: storeEmail || null,
        storeAddress,
        storeCity,
        storeProvince,
        storePostalCode: storePostalCode || null,
        status: "active",
        owner: {
          nik: owner.nik,
          fullName: owner.fullName,
          birthDate: owner.birthDate,
          address: owner.address,
          gender: owner.gender,
          ktpImageUrl: owner.ktpImageUrl || null,
          inputMethod: owner.inputMethod || "manual"
        }
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: "Toko berhasil didaftarkan",
        data: store
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error("Error creating store:", error)
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan server"
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ success: true, data: stores })
  } catch (error) {
    console.error("Error fetching stores:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
