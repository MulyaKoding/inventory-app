import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
})

function extractPublicId(input: string): string {
  if (!input) return ""

  // Already a publicId (no http), return as-is
  if (!input.startsWith("http")) return input

  try {
    const url = new URL(input)
    const parts = url.pathname.split("/").filter(Boolean)

    // Find the "upload" segment
    const uploadIdx = parts.indexOf("upload")
    if (uploadIdx === -1) return input

    // Skip version segment if present (e.g. v1234567890)
    let afterUpload = parts.slice(uploadIdx + 1)
    if (afterUpload[0]?.match(/^v\d+$/)) {
      afterUpload = afterUpload.slice(1)
    }

    // Join remaining parts (preserves folders like "inventory/abc123")
    const withExt = afterUpload.join("/")

    // Remove file extension
    const publicId = withExt.replace(/\.[^/.]+$/, "")

    return publicId
  } catch {
    return input
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const raw: string = body.publicId || body.imageUrl || ""

    console.log("🗑️ DELETE request body:", body)

    if (!raw) {
      return NextResponse.json(
        { error: "publicId or imageUrl required" },
        { status: 400 }
      )
    }

    const publicId = extractPublicId(raw)
    console.log("🗑️ Raw input:", raw)
    console.log("🗑️ Extracted publicId:", publicId)

    if (!publicId) {
      return NextResponse.json(
        { error: "Gagal mengekstrak publicId dari input yang diberikan" },
        { status: 400 }
      )
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true // also invalidate CDN cache
    })

    console.log("🗑️ Cloudinary result:", result)

    if (result.result === "not found") {
      // Asset sudah tidak ada di Cloudinary — anggap sukses
      console.warn(
        "⚠️ Asset not found in Cloudinary, treating as deleted:",
        publicId
      )
      return NextResponse.json({
        success: true,
        result,
        publicId,
        note: "not found in cloudinary"
      })
    }

    if (result.result !== "ok") {
      return NextResponse.json(
        { error: `Gagal hapus dari Cloudinary: ${result.result}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, result, publicId })
  } catch (err: unknown) {
    console.error("❌ Delete error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    )
  }
}
