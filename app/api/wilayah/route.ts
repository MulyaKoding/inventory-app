import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "../../generated/prisma"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")

  try {
    if (type === "provinsi") {
      const data = await prisma.msProvinsi.findMany({
        select: { kdProvinsi: true, namaProvinsi: true },
        orderBy: { namaProvinsi: "asc" }
      })
      return NextResponse.json({
        data: data.map((d) => ({
          Kd_Provinsi: d.kdProvinsi,
          NamaProvinsi: d.namaProvinsi
        }))
      })
    }

    if (type === "kota") {
      const provinsi = searchParams.get("provinsi")
      if (!provinsi)
        return NextResponse.json(
          { error: "provinsi required" },
          { status: 400 }
        )

      const data = await prisma.msKota.findMany({
        where: { kdProvinsi: provinsi },
        select: { kdKota: true, namaKota: true },
        orderBy: { namaKota: "asc" }
      })
      return NextResponse.json({
        data: data.map((d) => ({
          Kd_Kota: d.kdKota,
          NamaKota: d.namaKota
        }))
      })
    }

    if (type === "kecamatan") {
      const kota = searchParams.get("kota")
      if (!kota)
        return NextResponse.json({ error: "kota required" }, { status: 400 })

      const data = await prisma.msKecamatan.findMany({
        where: { kdKota: kota },
        select: { kdKecamatan: true, namaKecamatan: true },
        orderBy: { namaKecamatan: "asc" }
      })
      return NextResponse.json({
        data: data.map((d) => ({
          Kd_Kecamatan: d.kdKecamatan,
          NamaKecamatan: d.namaKecamatan
        }))
      })
    }

    if (type === "kelurahan") {
      const kecamatan = searchParams.get("kecamatan")
      if (!kecamatan)
        return NextResponse.json(
          { error: "kecamatan required" },
          { status: 400 }
        )

      const data = await prisma.msKelurahan.findMany({
        where: { kdKecamatan: kecamatan },
        select: { kdKelurahan: true, namaKelurahan: true, kodePos: true },
        orderBy: { namaKelurahan: "asc" }
      })
      return NextResponse.json({
        data: data.map((d) => ({
          Kd_Kelurahan: d.kdKelurahan,
          NamaKelurahan: d.namaKelurahan,
          KodePos: d.kodePos ?? ""
        }))
      })
    }

    return NextResponse.json({ error: "type tidak valid" }, { status: 400 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
