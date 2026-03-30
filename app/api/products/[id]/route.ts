import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"

// PUT - Update produk
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params // ← await params
    const body = await req.json()
    const { name, category, sku, stock, price, sold } = body

    let status = "In Stock"
    if (stock === 0) status = "Out of Stock"
    else if (stock < 15) status = "Low Stock"

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        category,
        sku,
        stock: Number(stock),
        price: Number(price),
        status,
        sold: Number(sold)
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Gagal update produk" }, { status: 500 })
  }
}

// DELETE - Hapus produk
export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params // ← await params
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ message: "Produk dihapus" })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Gagal menghapus produk" },
      { status: 500 }
    )
  }
}
