import { PrismaClient } from "../app/generated/prisma"
import fs from "fs"
import path from "path"
import { parse } from "csv-parse/sync"

const prisma = new PrismaClient()

function readCsv(filename: string) {
  const filePath = path.join(__dirname, "data", filename)
  const content = fs.readFileSync(filePath, "utf-8")
  return parse(content, { columns: true, skip_empty_lines: true })
}

async function seedProvinsi() {
  console.log("⏳ Seeding ms_provinsi...")
  const rows = readCsv("ms_provinsi.csv")

  const data = rows.map((r: any) => ({
    kdProvinsi: String(r.Kd_Provinsi).trim(),
    namaProvinsi: String(r.NamaProvinsi).trim()
  }))

  // Hapus data lama dulu
  await prisma.msProvinsi.deleteMany()

  // Insert batch
  const BATCH = 100
  for (let i = 0; i < data.length; i += BATCH) {
    await prisma.msProvinsi.createMany({ data: data.slice(i, i + BATCH) })
  }

  console.log(`✅ ms_provinsi: ${data.length} records`)
}

async function seedKota() {
  console.log("⏳ Seeding ms_kota...")
  const rows = readCsv("ms_kota.csv")

  const data = rows.map((r: any) => ({
    kdKota: String(r.Kd_Kota).trim(),
    namaKota: String(r.NamaKota).trim(),
    kdProvinsi: String(r.Kd_Provinsi).trim()
  }))

  await prisma.msKota.deleteMany()

  const BATCH = 100
  for (let i = 0; i < data.length; i += BATCH) {
    await prisma.msKota.createMany({ data: data.slice(i, i + BATCH) })
  }

  console.log(`✅ ms_kota: ${data.length} records`)
}

async function seedKecamatan() {
  console.log("⏳ Seeding ms_kecamatan...")
  const rows = readCsv("ms_kecamatan.csv")

  const data = rows.map((r: any) => ({
    kdKecamatan: String(r.Kd_Kecamatan).trim(),
    namaKecamatan: String(r.NamaKecamatan).trim(),
    kdKota: String(r.Kd_Kota).trim()
  }))

  await prisma.msKecamatan.deleteMany()

  const BATCH = 500
  for (let i = 0; i < data.length; i += BATCH) {
    await prisma.msKecamatan.createMany({ data: data.slice(i, i + BATCH) })
    process.stdout.write(
      `\r  ${Math.min(i + BATCH, data.length)}/${data.length}`
    )
  }
  console.log(`\n✅ ms_kecamatan: ${data.length} records`)
}

async function seedKelurahan() {
  console.log("⏳ Seeding ms_kelurahan (80k+ rows, butuh beberapa menit)...")
  const rows = readCsv("ms_kelurahan.csv")

  const data = rows.map((r: any) => ({
    kdKelurahan: String(r.Kd_Kelurahan).trim(),
    namaKelurahan: String(r.NamaKelurahan).trim(),
    kdKecamatan: String(r.Kd_Kecamatan).trim(),
    kodePos: r.Kodepos ? String(r.Kodepos).trim() : null
  }))

  await prisma.msKelurahan.deleteMany()

  const BATCH = 1000
  for (let i = 0; i < data.length; i += BATCH) {
    await prisma.msKelurahan.createMany({ data: data.slice(i, i + BATCH) })
    process.stdout.write(
      `\r  ${Math.min(i + BATCH, data.length)}/${data.length}`
    )
  }
  console.log(`\n✅ ms_kelurahan: ${data.length} records`)
}

async function main() {
  console.log("🚀 Start seeding wilayah...\n")
  try {
    await seedProvinsi()
    await seedKota()
    await seedKecamatan()
    await seedKelurahan()
    console.log("\n🎉 Selesai! Semua data wilayah berhasil diimport.")
  } catch (e) {
    console.error("❌ Error:", e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
