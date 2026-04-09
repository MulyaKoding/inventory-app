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
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [ready, setReady] = useState(false)

  const onMapClickRef = useRef(onMapClick)
  useEffect(() => {
    onMapClickRef.current = onMapClick
  }, [onMapClick])

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return
    if (mapRef.current) return

    const c = containerRef.current as any
    if (c._leaflet_id) c._leaflet_id = null

    let destroyed = false

    import("leaflet").then((L) => {
      if (destroyed || !containerRef.current) return
      if (mapRef.current) return

      const el = containerRef.current as any
      if (el._leaflet_id) el._leaflet_id = null

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
        html: `<div style="width:28px;height:28px;background:#1e3a8a;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 12px rgba(30,58,138,0.5);"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -30]
      })

      const map = L.map(containerRef.current!, {
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

      map.on("click", (e: any) => {
        onMapClickRef.current(e.latlng.lat, e.latlng.lng)
      })

      if (marker) {
        markerRef.current = L.marker(marker, { icon: blueIcon }).addTo(map)
      }

      mapRef.current = map
      ;(mapRef.current as any)._blueIcon = blueIcon

      // Paksa recalculate setelah MUI Modal selesai animasi
      setTimeout(() => {
        if (mapRef.current) mapRef.current.invalidateSize()
      }, 350)

      setReady(true)
    })

    return () => {
      destroyed = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
        setReady(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.flyTo(center, Math.max(mapRef.current.getZoom(), 15), {
      duration: 1.2
    })
  }, [center])

  useEffect(() => {
    if (!mapRef.current || !ready) return
    import("leaflet").then((L) => {
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
      if (marker) {
        const icon = (mapRef.current as any)._blueIcon
        markerRef.current = L.marker(marker, { icon }).addTo(mapRef.current)
      }
    })
  }, [marker, ready])

  return (
    <>
      <style>{`
        .leaflet-container {
          font-family: 'Nunito', sans-serif !important;
        }
        .leaflet-control-attribution { font-size: 9px !important; }
        .leaflet-tile-pane { filter: ${isDark ? "brightness(0.75) saturate(0.8)" : "none"}; }
        .leaflet-control-zoom a {
          color: ${isDark ? "#F5F5F0" : "#0f172a"} !important;
          background: ${isDark ? "#111" : "#fff"} !important;
          border-color: ${isDark ? "#1f1f1f" : "#e2e8f0"} !important;
        }
      `}</style>

      {/*
        Pola: wrapper relative dengan height eksplisit,
        container absolute fill di dalamnya.
        Ini memastikan Leaflet selalu dapat ukuran yang benar.
      */}
      <div
        ref={wrapperRef}
        style={{
          position: "relative",
          width: "100%",
          height: "320px",
          borderRadius: "8px",
          overflow: "hidden"
        }}
      >
        <div
          ref={containerRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        />
      </div>
    </>
  )
}
