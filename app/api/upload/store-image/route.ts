import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File terlalu besar (maks 5MB)" },
        { status: 400 }
      )
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung" },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString("base64")
    const dataUri = `data:${file.type};base64,${base64}`

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "Images", // folder Images di Cloudinary
      resource_type: "image",
      transformation: [
        { width: 1200, height: 800, crop: "limit", quality: "auto:good" }
      ]
    })

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Upload gagal"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
