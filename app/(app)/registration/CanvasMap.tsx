"use client"

import { useEffect, useRef, useCallback, useState } from "react"

interface CanvasMapProps {
  center: [number, number]
  marker: [number, number] | null
  isDark: boolean
  onMapClick: (lat: number, lng: number) => void
}

// ── Tile math helpers ────────────────────────────────────────────────────────
function lon2tile(lon: number, zoom: number) {
  return ((lon + 180) / 360) * Math.pow(2, zoom)
}
function lat2tile(lat: number, zoom: number) {
  return (
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
    Math.pow(2, zoom)
  )
}
function tile2lon(x: number, zoom: number) {
  return (x / Math.pow(2, zoom)) * 360 - 180
}
function tile2lat(y: number, zoom: number) {
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, zoom)
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))
}

const TILE_SIZE = 256
const MIN_ZOOM = 3
const MAX_ZOOM = 19

// Global tile cache (survives re-renders)
const tileCache = new Map<string, HTMLImageElement>()

export default function CanvasMap({
  center,
  marker,
  isDark,
  onMapClick
}: CanvasMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Map state
  const zoomRef = useRef(15)
  const centerRef = useRef(center)
  const isDragging = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })
  const markerRef = useRef(marker)
  const isDarkRef = useRef(isDark)
  const pendingTiles = useRef(new Set<string>())
  const animFrame = useRef<number | null>(null)
  const [, forceUpdate] = useState(0)

  // Sync refs with props
  useEffect(() => {
    centerRef.current = center
    scheduleRender()
  }, [center])

  useEffect(() => {
    markerRef.current = marker
    scheduleRender()
  }, [marker])

  useEffect(() => {
    isDarkRef.current = isDark
    scheduleRender()
  }, [isDark])

  // ── Render ──────────────────────────────────────────────────────────────────
  const scheduleRender = useCallback(() => {
    if (animFrame.current) cancelAnimationFrame(animFrame.current)
    animFrame.current = requestAnimationFrame(render)
  }, [])

  const render = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const W = container.clientWidth
    const H = container.clientHeight
    if (W === 0 || H === 0) return

    // Keep canvas pixel dimensions in sync
    if (canvas.width !== W || canvas.height !== H) {
      canvas.width = W
      canvas.height = H
    }

    const ctx = canvas.getContext("2d")!
    const zoom = zoomRef.current
    const [lat, lon] = centerRef.current

    // Background
    ctx.fillStyle = isDarkRef.current ? "#1a1a2e" : "#e8e8e8"
    ctx.fillRect(0, 0, W, H)

    // Center tile coords (fractional)
    const cx = lon2tile(lon, zoom)
    const cy = lat2tile(lat, zoom)

    // Pixel offset of center
    const ox = W / 2 - (cx % 1) * TILE_SIZE
    const oy = H / 2 - (cy % 1) * TILE_SIZE

    const startTX = Math.floor(cx) - Math.ceil(W / 2 / TILE_SIZE) - 1
    const startTY = Math.floor(cy) - Math.ceil(H / 2 / TILE_SIZE) - 1
    const endTX = Math.floor(cx) + Math.ceil(W / 2 / TILE_SIZE) + 2
    const endTY = Math.floor(cy) + Math.ceil(H / 2 / TILE_SIZE) + 2

    const maxTile = Math.pow(2, zoom)
    let needsRedraw = false

    for (let tx = startTX; tx <= endTX; tx++) {
      for (let ty = startTY; ty <= endTY; ty++) {
        if (ty < 0 || ty >= maxTile) continue
        const wrappedTx = ((tx % maxTile) + maxTile) % maxTile

        const px = ox + (tx - Math.floor(cx)) * TILE_SIZE
        const py = oy + (ty - Math.floor(cy)) * TILE_SIZE

        const key = `${zoom}/${wrappedTx}/${ty}`
        let img = tileCache.get(key)

        if (!img) {
          if (!pendingTiles.current.has(key)) {
            pendingTiles.current.add(key)
            const image = new Image()
            image.crossOrigin = "anonymous"
            // Use multiple subdomains for OSM
            const sub = ["a", "b", "c"][Math.abs(wrappedTx + ty) % 3]
            image.src = `https://${sub}.tile.openstreetmap.org/${zoom}/${wrappedTx}/${ty}.png`
            image.onload = () => {
              tileCache.set(key, image)
              pendingTiles.current.delete(key)
              scheduleRender()
            }
            image.onerror = () => {
              pendingTiles.current.delete(key)
            }
          }
          needsRedraw = true
          // Draw placeholder
          ctx.fillStyle = isDarkRef.current ? "#16213e" : "#d4d4d4"
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE)
          ctx.strokeStyle = isDarkRef.current ? "#0f3460" : "#c4c4c4"
          ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE)
          continue
        }

        // Dark mode filter via offscreen compositing
        if (isDarkRef.current) {
          ctx.save()
          ctx.filter = "brightness(0.65) saturate(0.7)"
          ctx.drawImage(img, px, py, TILE_SIZE, TILE_SIZE)
          ctx.filter = "none"
          ctx.restore()
        } else {
          ctx.drawImage(img, px, py, TILE_SIZE, TILE_SIZE)
        }

        // Tile border (subtle)
        ctx.strokeStyle = "rgba(0,0,0,0.04)"
        ctx.lineWidth = 0.5
        ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE)
      }
    }

    // ── Draw marker ──
    const m = markerRef.current
    if (m) {
      const mx = W / 2 + (lon2tile(m[1], zoom) - cx) * TILE_SIZE
      const my = H / 2 + (lat2tile(m[0], zoom) - cy) * TILE_SIZE

      // Shadow
      ctx.beginPath()
      ctx.ellipse(mx, my + 4, 8, 4, 0, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(0,0,0,0.25)"
      ctx.fill()

      // Pin body
      ctx.save()
      ctx.translate(mx, my - 22)
      ctx.rotate(Math.PI / 4) // teardrop rotate

      const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, 14)
      grad.addColorStop(0, "#3b82f6")
      grad.addColorStop(1, "#1e3a8a")

      ctx.beginPath()
      ctx.roundRect(-10, -10, 20, 20, [50, 50, 50, 0])
      ctx.fillStyle = grad
      ctx.shadowColor = "rgba(30,58,138,0.5)"
      ctx.shadowBlur = 10
      ctx.fill()
      ctx.restore()

      // White dot
      ctx.beginPath()
      ctx.arc(mx, my - 24, 4, 0, Math.PI * 2)
      ctx.fillStyle = "#fff"
      ctx.shadowColor = "transparent"
      ctx.fill()
    }

    // ── Attribution ──
    ctx.fillStyle = "rgba(255,255,255,0.75)"
    ctx.fillRect(W - 200, H - 18, 200, 18)
    ctx.fillStyle = "#333"
    ctx.font = "9px sans-serif"
    ctx.textAlign = "right"
    ctx.fillText("© OpenStreetMap contributors", W - 4, H - 5)

    // ── Zoom buttons (drawn on canvas) ──
    drawZoomButtons(ctx, W, H)
  }, [scheduleRender])

  function drawZoomButtons(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number
  ) {
    const bx = W - 44
    const btnW = 32
    const btnH = 28

    // + button
    const plusY = H - 80
    ctx.fillStyle = isDarkRef.current
      ? "rgba(20,20,20,0.9)"
      : "rgba(255,255,255,0.95)"
    ctx.strokeStyle = isDarkRef.current ? "#333" : "#ccc"
    ctx.lineWidth = 1
    roundRect(ctx, bx, plusY, btnW, btnH, 4)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = isDarkRef.current ? "#f0f0f0" : "#333"
    ctx.font = "bold 16px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("+", bx + btnW / 2, plusY + 19)

    // − button
    const minusY = plusY + btnH + 4
    ctx.fillStyle = isDarkRef.current
      ? "rgba(20,20,20,0.9)"
      : "rgba(255,255,255,0.95)"
    ctx.strokeStyle = isDarkRef.current ? "#333" : "#ccc"
    roundRect(ctx, bx, minusY, btnW, btnH, 4)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = isDarkRef.current ? "#f0f0f0" : "#333"
    ctx.fillText("−", bx + btnW / 2, minusY + 19)
  }

  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arcTo(x + w, y, x + w, y + r, r)
    ctx.lineTo(x + w, y + h - r)
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
    ctx.lineTo(x + r, y + h)
    ctx.arcTo(x, y + h, x, y + h - r, r)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
  }

  // ── Zoom helpers ─────────────────────────────────────────────────────────
  const zoomAt = useCallback(
    (delta: number, px?: number, py?: number) => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return

      const W = container.clientWidth
      const H = container.clientHeight
      const oldZoom = zoomRef.current
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, oldZoom + delta))
      if (newZoom === oldZoom) return

      // Zoom toward mouse position
      if (px !== undefined && py !== undefined) {
        const [lat, lon] = centerRef.current
        const cx = lon2tile(lon, oldZoom)
        const cy = lat2tile(lat, oldZoom)
        const tileDx = (px - W / 2) / TILE_SIZE
        const tileDy = (py - H / 2) / TILE_SIZE
        const tileX = cx + tileDx
        const tileY = cy + tileDy
        const scale = Math.pow(2, newZoom - oldZoom)
        const newCx = tileX - tileDx / scale + (tileX - (cx + tileDx)) * 0
        const newCy = tileY - tileDy / scale + (tileY - (cy + tileDy)) * 0
        // Simplified: zoom toward center of clicked point
        const newLon = tile2lon(
          cx + tileDx * (1 - 1 / scale),
          (newZoom / newZoom) * newZoom
        )
        const newLon2 = tile2lon(
          lon2tile(lon, newZoom) + tileDx * (1 - Math.pow(2, delta)),
          newZoom
        )
        const newLat2 = tile2lat(
          lat2tile(lat, newZoom) + tileDy * (1 - Math.pow(2, delta)),
          newZoom
        )
        centerRef.current = [newLat2, newLon2]
      }

      zoomRef.current = newZoom
      scheduleRender()
    },
    [scheduleRender]
  )

  // ── Mouse / touch events ─────────────────────────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging.current) return
      const dx = e.clientX - lastMouse.current.x
      const dy = e.clientY - lastMouse.current.y
      lastMouse.current = { x: e.clientX, y: e.clientY }

      const zoom = zoomRef.current
      const [lat, lon] = centerRef.current
      const newCx = lon2tile(lon, zoom) - dx / TILE_SIZE
      const newCy = lat2tile(lat, zoom) - dy / TILE_SIZE
      centerRef.current = [tile2lat(newCy, zoom), tile2lon(newCx, zoom)]
      scheduleRender()
    },
    [scheduleRender]
  )

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging.current) return
      const dx = Math.abs(e.clientX - lastMouse.current.x)
      const dy = Math.abs(e.clientY - lastMouse.current.y)
      isDragging.current = false

      // Only trigger click if barely moved (not a drag)
      if (dx < 4 && dy < 4) {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return
        const rect = canvas.getBoundingClientRect()
        const px = e.clientX - rect.left
        const py = e.clientY - rect.top
        const W = container.clientWidth
        const H = container.clientHeight
        const zoom = zoomRef.current
        const [lat, lon] = centerRef.current

        // Check zoom button hit
        const bx = W - 44
        const plusY = H - 80
        const minusY = plusY + 32
        if (px >= bx && px <= bx + 32) {
          if (py >= plusY && py <= plusY + 28) {
            zoomAt(1)
            return
          }
          if (py >= minusY && py <= minusY + 28) {
            zoomAt(-1)
            return
          }
        }

        const clickLon = tile2lon(
          lon2tile(lon, zoom) + (px - W / 2) / TILE_SIZE,
          zoom
        )
        const clickLat = tile2lat(
          lat2tile(lat, zoom) + (py - H / 2) / TILE_SIZE,
          zoom
        )
        onMapClick(clickLat, clickLon)
      }
    },
    [onMapClick, zoomAt]
  )

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      zoomAt(e.deltaY < 0 ? 1 : -1, e.clientX - rect.left, e.clientY - rect.top)
    },
    [zoomAt]
  )

  // Touch support
  const touchStart = useRef<{ x: number; y: number; dist: number } | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true
      lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        dist: 0
      }
    } else if (e.touches.length === 2) {
      isDragging.current = false
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      touchStart.current = {
        x: 0,
        y: 0,
        dist: Math.sqrt(dx * dx + dy * dy)
      }
    }
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      if (e.touches.length === 1 && isDragging.current) {
        const dx = e.touches[0].clientX - lastMouse.current.x
        const dy = e.touches[0].clientY - lastMouse.current.y
        lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        const zoom = zoomRef.current
        const [lat, lon] = centerRef.current
        const newCx = lon2tile(lon, zoom) - dx / TILE_SIZE
        const newCy = lat2tile(lat, zoom) - dy / TILE_SIZE
        centerRef.current = [tile2lat(newCy, zoom), tile2lon(newCx, zoom)]
        scheduleRender()
      } else if (e.touches.length === 2 && touchStart.current) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const newDist = Math.sqrt(dx * dx + dy * dy)
        const ratio = newDist / (touchStart.current.dist || newDist)
        if (ratio > 1.15) {
          zoomAt(1)
          touchStart.current.dist = newDist
        } else if (ratio < 0.87) {
          zoomAt(-1)
          touchStart.current.dist = newDist
        }
      }
    },
    [scheduleRender, zoomAt]
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (e.changedTouches.length === 1 && touchStart.current) {
        const dx = Math.abs(e.changedTouches[0].clientX - touchStart.current.x)
        const dy = Math.abs(e.changedTouches[0].clientY - touchStart.current.y)
        isDragging.current = false
        if (dx < 8 && dy < 8) {
          const canvas = canvasRef.current
          const container = containerRef.current
          if (!canvas || !container) return
          const rect = canvas.getBoundingClientRect()
          const px = e.changedTouches[0].clientX - rect.left
          const py = e.changedTouches[0].clientY - rect.top
          const W = container.clientWidth
          const H = container.clientHeight
          const zoom = zoomRef.current
          const [lat, lon] = centerRef.current
          const clickLon = tile2lon(
            lon2tile(lon, zoom) + (px - W / 2) / TILE_SIZE,
            zoom
          )
          const clickLat = tile2lat(
            lat2tile(lat, zoom) + (py - H / 2) / TILE_SIZE,
            zoom
          )
          onMapClick(clickLat, clickLon)
        }
      }
    },
    [onMapClick]
  )

  // ── Setup & resize ────────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    // Wheel listener (non-passive to allow preventDefault)
    canvas.addEventListener("wheel", handleWheel, { passive: false })

    // ResizeObserver — re-render when container resizes
    const ro = new ResizeObserver(() => {
      scheduleRender()
    })
    ro.observe(container)

    // Initial renders
    scheduleRender()
    setTimeout(scheduleRender, 50)
    setTimeout(scheduleRender, 200)

    return () => {
      canvas.removeEventListener("wheel", handleWheel)
      ro.disconnect()
      if (animFrame.current) cancelAnimationFrame(animFrame.current)
    }
  }, [handleWheel, scheduleRender])

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        borderRadius: "inherit",
        cursor: isDragging.current ? "grabbing" : "crosshair"
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          userSelect: "none",
          WebkitUserSelect: "none"
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          isDragging.current = false
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  )
}
