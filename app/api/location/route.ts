import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { query } = (await req.json()) as { query?: string }

  if (!query || query.trim().length < 3) {
    return NextResponse.json({ error: "Query terlalu pendek" }, { status: 400 })
  }

  try {
    // Nominatim OpenStreetMap — gratis, tanpa API key
    const params = new URLSearchParams({
      q: query,
      format: "json",
      limit: "1",
      addressdetails: "1",
      // Bias ke Indonesia
      countrycodes: "id",
      "accept-language": "id"
    })

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          // Nominatim mewajibkan User-Agent yang deskriptif
          "User-Agent": "InventoryApp/1.0 (contact@yourapp.com)"
        }
      }
    )

    if (!res.ok) {
      throw new Error(`Nominatim error: ${res.status}`)
    }

    const data = await res.json()

    if (!data || data.length === 0) {
      return NextResponse.json({
        found: false,
        lat: 0,
        lng: 0,
        label: ""
      })
    }

    const place = data[0]
    return NextResponse.json({
      found: true,
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
      label: place.display_name as string
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal mencari lokasi"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
