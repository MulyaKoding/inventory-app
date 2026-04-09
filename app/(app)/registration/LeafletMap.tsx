"use client"

import { useEffect, useRef, useState } from "react"

interface LeafletMapProps {
  center: [number, number]
  marker: [number, number] | null
  isDark: boolean
  onMapClick: (lat: number, lng: number) => void
}

export default function LeafletMap({
  center,
  marker,
  isDark,
  onMapClick
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const initedRef = useRef(false) // guard double-init
  const [ready, setReady] = useState(false)

  const onClickRef = useRef(onMapClick)
  useEffect(() => {
    onClickRef.current = onMapClick
  }, [onMapClick])

  /* ── INIT ── */
  useEffect(() => {
    // Guard: jangan init lebih dari sekali
    if (initedRef.current) return
    initedRef.current = true

    const el = containerRef.current!
    // Bersihkan sisa leaflet_id kalau ada
    ;(el as any)._leaflet_id = undefined

    import("leaflet").then((L) => {
      // Kalau sudah ada map (race condition), skip
      if (mapRef.current) return

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
      })

      const blueIcon = L.divIcon({
        className: "",
        html: `<div style="width:28px;height:28px;background:#1e3a8a;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 12px rgba(30,58,138,.5)"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -30]
      })

      const map = L.map(el, {
        center,
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: true
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(map)

      map.on("click", (e: any) =>
        onClickRef.current(e.latlng.lat, e.latlng.lng)
      )

      if (marker) {
        markerRef.current = L.marker(marker, { icon: blueIcon }).addTo(map)
      }

      mapRef.current = map
      ;(map as any)._blueIcon = blueIcon

      // invalidateSize setelah container benar-benar terpaint
      const fix = () => map.invalidateSize(true)
      setTimeout(fix, 0)
      setTimeout(fix, 100)
      setTimeout(fix, 300)

      // ResizeObserver — live fix kalau ukuran berubah
      const ro = new ResizeObserver(fix)
      ro.observe(el)
      ;(map as any)._ro = ro

      setReady(true)
    })

    return () => {
      if (mapRef.current) {
        ;(mapRef.current as any)._ro?.disconnect()
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
      initedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── CENTER ── */
  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.flyTo(center, Math.max(mapRef.current.getZoom(), 15), {
      duration: 1.2
    })
  }, [center])

  /* ── MARKER ── */
  useEffect(() => {
    if (!mapRef.current || !ready) return
    import("leaflet").then((L) => {
      markerRef.current?.remove()
      markerRef.current = null
      if (marker) {
        markerRef.current = L.marker(marker, {
          icon: (mapRef.current as any)._blueIcon
        }).addTo(mapRef.current)
      }
    })
  }, [marker, ready])

  return (
    <>
      <style>{`
        .leaflet-container { font-family:'Nunito',sans-serif !important; }
        .leaflet-control-attribution { font-size:9px !important; }
        .leaflet-tile-pane { filter:${isDark ? "brightness(.75) saturate(.8)" : "none"}; }
        .leaflet-control-zoom a {
          color:${isDark ? "#F5F5F0" : "#0f172a"} !important;
          background:${isDark ? "#111" : "#fff"} !important;
          border-color:${isDark ? "#1f1f1f" : "#e2e8f0"} !important;
        }
      `}</style>
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", minHeight: 320 }}
      />
    </>
  )
}
