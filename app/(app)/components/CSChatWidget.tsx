"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface CSChatWidgetProps {
  whatsappNumber?: string
  agentName?: string
  agentRole?: string
  greeting?: string
  offlineMessage?: string
  onlineHours?: string
}

export default function CSChatWidget({
  whatsappNumber = "6285218789439",
  agentName = "STOCKR Support",
  agentRole = "Customer Success",
  greeting = "Halo! Ada yang bisa kami bantu? 👋",
  offlineMessage = "Kami sedang offline, tapi kamu bisa tinggalkan pesan dan kami akan balas secepatnya!",
  onlineHours = "Senin – Jumat, 08.00 – 17.00 WIB"
}: CSChatWidgetProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"form" | "sent">("form")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState<{
    name?: string
    phone?: string
    message?: string
  }>({})
  const [showBubble, setShowBubble] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  // Drag state
  const [pos, setPos] = useState({ x: 28, y: 28 }) // distance from bottom-right
  const [isDragging, setIsDragging] = useState(false)
  const [dragged, setDragged] = useState(false) // true if mouse actually moved during press
  const dragStart = useRef<{
    mouseX: number
    mouseY: number
    posX: number
    posY: number
  } | null>(null)
  const fabRef = useRef<HTMLButtonElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Show greeting bubble after 3s
  useEffect(() => {
    const t = setTimeout(() => setShowBubble(true), 3000)
    return () => clearTimeout(t)
  }, [])

  // Auto hide bubble after 8s
  useEffect(() => {
    if (showBubble) {
      const t = setTimeout(() => setShowBubble(false), 8000)
      return () => clearTimeout(t)
    }
  }, [showBubble])

  // Check online hours
  useEffect(() => {
    const now = new Date()
    const day = now.getDay()
    const hour = now.getHours()
    setIsOnline(day >= 1 && day <= 5 && hour >= 8 && hour < 17)
  }, [])

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  // ── DRAG LOGIC ──
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      setDragged(false)
      dragStart.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        posX: pos.x,
        posY: pos.y
      }
      setIsDragging(true)
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [pos]
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !dragStart.current) return
      const dx = e.clientX - dragStart.current.mouseX
      const dy = e.clientY - dragStart.current.mouseY

      // Mark as dragged if moved more than 5px
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        setDragged(true)
      }

      // We store position as distance from bottom-right corner
      // Moving right → dx positive → x decreases (closer to right edge)
      // Moving down  → dy positive → y decreases (closer to bottom edge)
      const newX = Math.max(8, dragStart.current.posX - dx)
      const newY = Math.max(8, dragStart.current.posY - dy)

      // Clamp to viewport
      const vw = window.innerWidth
      const vh = window.innerHeight
      const FAB_SIZE = 72 // fab width + some margin

      setPos({
        x: Math.min(newX, vw - FAB_SIZE),
        y: Math.min(newY, vh - FAB_SIZE)
      })
    },
    [isDragging]
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(false)
      dragStart.current = null
      // If it wasn't a drag, treat as click
      if (!dragged) {
        setOpen((v) => !v)
        setShowBubble(false)
      }
    },
    [dragged]
  )

  // Detect mobile (≤ 600px wide)
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 600

  // Smart panel positioning — stays fully visible regardless of FAB location
  const PANEL_WIDTH = 390
  const PANEL_HEIGHT = 520
  const FAB_W = 58
  const FAB_H = 58
  const GAP = 10
  const MARGIN = 8

  const vwNow = typeof window !== "undefined" ? window.innerWidth : 1440
  const vhNow = typeof window !== "undefined" ? window.innerHeight : 900

  const fabLeftEdge = vwNow - pos.x - FAB_W
  const fabTopEdge = vhNow - pos.y - FAB_H

  const openRight = pos.x + PANEL_WIDTH > vwNow - MARGIN
  const horizStyle: React.CSSProperties = openRight
    ? { left: Math.max(MARGIN, fabLeftEdge) }
    : { right: pos.x }

  const openDown = fabTopEdge - GAP - PANEL_HEIGHT < MARGIN
  const vertStyle: React.CSSProperties = openDown
    ? { top: Math.max(MARGIN, fabTopEdge + FAB_H + GAP) }
    : { bottom: pos.y + FAB_H + GAP }

  // On mobile: panel is centered in viewport, not anchored to FAB
  // Desktop only - mobile uses bottom sheet
  const panelStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 9998,
    ...horizStyle,
    ...vertStyle
  }

  // Bubble always anchored to FAB (both mobile and desktop)
  const bubbleStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 9998,
    ...horizStyle,
    ...vertStyle
  }

  // Pop-in corner matches actual panel anchor corner (desktop only)
  const transformOrigin = isMobile
    ? "bottom center"
    : `${openDown ? "top" : "bottom"} ${openRight ? "left" : "right"}`

  const validate = () => {
    const err: typeof errors = {}
    if (!name.trim()) err.name = "Nama wajib diisi"
    if (!phone.trim()) err.phone = "Nomor HP wajib diisi"
    else if (!/^[0-9+\-\s]{8,15}$/.test(phone.trim()))
      err.phone = "Nomor HP tidak valid"
    if (!message.trim()) err.message = "Pesan wajib diisi"
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const text = encodeURIComponent(
      `Halo STOCKR! 👋\n\nNama: ${name}\nNo. HP: ${phone}\n\nPesan:\n${message}`
    )
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank")
    setStep("sent")
  }

  const handleReset = () => {
    setStep("form")
    setName("")
    setPhone("")
    setMessage("")
    setErrors({})
  }

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');

    @keyframes cs-pop-in {
      0%   { opacity:0; transform:scale(.72); }
      70%  { transform:scale(1.04); }
      100% { opacity:1; transform:scale(1); }
    }
    @keyframes cs-slide-up {
      from { opacity:0; transform:translateY(16px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes cs-bubble-in {
      from { opacity:0; transform:translateX(12px); }
      to   { opacity:1; transform:translateX(0); }
    }
    @keyframes cs-pulse {
      0%,100% { transform:scale(1); box-shadow:0 0 0 0 rgba(15,191,159,.4); }
      50%     { transform:scale(1.06); box-shadow:0 0 0 10px rgba(15,191,159,0); }
    }
    @keyframes cs-dot-blink {
      0%,80%,100% { transform:scale(0); opacity:.3; }
      40%         { transform:scale(1); opacity:1; }
    }

    /* Panel */
    .cs-panel {
      width:390px; border-radius:20px; overflow:hidden;
      background:#fff;
      box-shadow:0 24px 64px rgba(0,0,0,.18), 0 0 0 1px rgba(0,0,0,.06);
      animation:cs-pop-in .4s cubic-bezier(.34,1.56,.64,1) forwards;
    }

    /* Header */
    .cs-header {
      background:linear-gradient(135deg,#054d42,#087463);
      padding:20px 20px 16px; position:relative; overflow:hidden;
    }
    .cs-header-grid {
      position:absolute; inset:0;
      background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),
                       linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);
      background-size:28px 28px; pointer-events:none;
    }
    .cs-header-top {
      display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;
      position:relative; z-index:1;
    }
    .cs-agent { display:flex; align-items:center; gap:12px; }
    .cs-avatar {
      width:44px; height:44px; border-radius:12px;
      background:linear-gradient(135deg,#0fbf9f,#34d399);
      display:flex; align-items:center; justify-content:center;
      font-weight:800; font-size:16px; color:#fff;
      box-shadow:0 4px 12px rgba(0,0,0,.2); flex-shrink:0;
    }
    .cs-agent-name { color:#fff; font-weight:800; font-size:15px; line-height:1.2; }
    .cs-agent-role { color:rgba(255,255,255,.65); font-size:12px; font-weight:600; margin-top:2px; }
    .cs-close {
      width:32px; height:32px; border-radius:8px;
      background:rgba(255,255,255,.12); border:none; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      color:rgba(255,255,255,.8); transition:background .2s;
    }
    .cs-close:hover { background:rgba(255,255,255,.22); color:#fff; }

    .cs-status-row {
      display:flex; align-items:center; gap:7px;
      position:relative; z-index:1;
    }
    .cs-status-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
    .cs-status-dot.online  { background:#34d399; box-shadow:0 0 0 2px rgba(52,211,153,.3); }
    .cs-status-dot.offline { background:#f87171; }
    .cs-status-txt { font-size:12px; font-weight:600; color:rgba(255,255,255,.8); }

    /* Body */
    .cs-body { padding:20px; }

    /* Greeting */
    .cs-greeting {
      background:#f0faf7; border-radius:14px; padding:14px 16px; margin-bottom:18px;
      border-left:3px solid #0fbf9f; animation:cs-slide-up .4s ease both;
    }
    .cs-greeting-txt { font-size:14px; color:#374151; line-height:1.6; font-weight:600; }
    .cs-greeting-offline { font-size:12px; color:#64748b; margin-top:6px; line-height:1.5; }

    /* Form */
    .cs-field { margin-bottom:14px; animation:cs-slide-up .4s ease both; }
    .cs-label {
      display:block; font-size:12px; font-weight:700; color:#374151;
      margin-bottom:5px; text-transform:uppercase; letter-spacing:.04em;
    }
    .cs-input {
      width:100%; height:42px; padding:0 14px;
      border:1.5px solid #e2e8f0; border-radius:10px;
      font-size:14px; font-weight:600; color:#0f172a;
      font-family:'Nunito',sans-serif;
      background:#fff; outline:none;
      transition:border-color .2s, box-shadow .2s;
      box-sizing:border-box;
    }
    .cs-input:focus { border-color:#087463; box-shadow:0 0 0 3px rgba(8,116,99,.1); }
    .cs-input.err { border-color:#ef4444; }
    .cs-textarea {
      width:100%; min-height:80px; padding:10px 14px;
      border:1.5px solid #e2e8f0; border-radius:10px;
      font-size:14px; font-weight:600; color:#0f172a;
      font-family:'Nunito',sans-serif;
      background:#fff; outline:none; resize:none;
      transition:border-color .2s, box-shadow .2s;
      line-height:1.5; box-sizing:border-box;
    }
    .cs-textarea:focus { border-color:#087463; box-shadow:0 0 0 3px rgba(8,116,99,.1); }
    .cs-textarea.err { border-color:#ef4444; }
    .cs-err-msg { font-size:11px; color:#ef4444; font-weight:600; margin-top:4px; }

    .cs-submit {
      width:100%; height:46px; border:none; border-radius:12px;
      background:linear-gradient(135deg,#087463,#0fbf9f);
      color:#fff; font-size:15px; font-weight:800;
      font-family:'Nunito',sans-serif;
      cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;
      box-shadow:0 4px 16px rgba(8,116,99,.3);
      transition:transform .2s, box-shadow .2s;
      margin-top:4px;
    }
    .cs-submit:hover { transform:translateY(-1px); box-shadow:0 6px 22px rgba(8,116,99,.4); }
    .cs-submit:active { transform:scale(.98); }

    .cs-hours {
      display:flex; align-items:center; gap:6px; margin-top:12px; justify-content:center;
    }
    .cs-hours-txt { font-size:11px; color:#94a3b8; font-weight:600; }

    /* Success */
    .cs-success { padding:8px 0 4px; text-align:center; animation:cs-slide-up .4s ease both; }
    .cs-success-icon {
      width:64px; height:64px; border-radius:18px; margin:0 auto 16px;
      background:linear-gradient(135deg,rgba(8,116,99,.1),rgba(15,191,159,.15));
      display:flex; align-items:center; justify-content:center;
    }
    .cs-success-title { font-weight:800; font-size:17px; color:#0f172a; margin-bottom:8px; }
    .cs-success-sub { font-size:13px; color:#64748b; line-height:1.6; margin-bottom:20px; }
    .cs-back {
      width:100%; height:42px; border:1.5px solid #e2e8f0; border-radius:10px;
      background:#fff; color:#087463; font-size:14px; font-weight:700;
      font-family:'Nunito',sans-serif; cursor:pointer;
      transition:border-color .2s, background .2s;
    }
    .cs-back:hover { border-color:#087463; background:#f0faf7; }

    /* FAB */
    .cs-fab {
      width:58px; height:58px; border-radius:18px;
      background:linear-gradient(135deg,#087463,#0fbf9f);
      border:none;
      display:flex; align-items:center; justify-content:center;
      box-shadow:0 8px 24px rgba(8,116,99,.45);
      position:relative;
      transition:box-shadow .2s, border-radius .2s;
      -webkit-user-select:none; user-select:none;
      touch-action:none;
    }
    .cs-fab.idle {
      animation:cs-pulse 2.4s ease-in-out infinite;
      cursor:grab;
    }
    .cs-fab.idle:hover {
      box-shadow:0 12px 32px rgba(8,116,99,.55);
      animation:none;
    }
    .cs-fab.dragging {
      cursor:grabbing;
      animation:none;
      box-shadow:0 16px 40px rgba(8,116,99,.6);
      border-radius:14px;
      transform:scale(1.08);
    }
    .cs-fab-badge {
      position:absolute; top:-4px; right:-4px;
      width:18px; height:18px; border-radius:50%; background:#ef4444;
      border:2.5px solid #fff;
      display:flex; align-items:center; justify-content:center;
      font-size:10px; font-weight:800; color:#fff;
      pointer-events:none;
    }

    /* Greeting bubble */
    .cs-bubble {
      background:#fff; border-radius:14px; padding:12px 16px;
      box-shadow:0 8px 28px rgba(0,0,0,.12), 0 0 0 1px rgba(0,0,0,.05);
      max-width:220px; animation:cs-bubble-in .35s ease forwards;
      position:relative;
    }
    .cs-bubble::after {
      content:''; position:absolute; bottom:-8px; right:20px;
      width:0; height:0;
      border-left:8px solid transparent;
      border-right:8px solid transparent;
      border-top:8px solid #fff;
    }
    .cs-bubble-txt { font-size:13px; font-weight:700; color:#0f172a; line-height:1.5; }
    .cs-bubble-sub { font-size:11px; color:#94a3b8; font-weight:600; margin-top:3px; }
    .cs-bubble-close {
      position:absolute; top:8px; right:8px;
      width:18px; height:18px; border-radius:50%;
      background:#f1f5f9; border:none; cursor:pointer;
      display:flex; align-items:center; justify-content:center; color:#94a3b8;
      font-size:10px; transition:background .2s;
    }
    .cs-bubble-close:hover { background:#e2e8f0; }

    /* Typing dots */
    .cs-typing { display:flex; gap:4px; align-items:center; padding:2px 0; }
    .cs-typing span {
      width:6px; height:6px; border-radius:50%; background:#0fbf9f;
      animation:cs-dot-blink 1.2s ease-in-out infinite;
    }
    .cs-typing span:nth-child(2) { animation-delay:.2s; }
    .cs-typing span:nth-child(3) { animation-delay:.4s; }

    @keyframes cs-pop-in-mobile {
      0%   { opacity:0; transform:translateX(-50%) scale(.72); }
      70%  { transform:translateX(-50%) scale(1.04); }
      100% { opacity:1; transform:translateX(-50%) scale(1); }
    }
    /* Mobile bottom sheet */
    @keyframes cs-sheet-in {
      from { transform:translateY(110%); }
      to   { transform:translateY(0); }
    }
    @keyframes cs-backdrop-in {
      from { opacity:0; }
      to   { opacity:1; }
    }
    .cs-backdrop {
      position:fixed; inset:0; background:rgba(0,0,0,.5);
      z-index:9997; animation:cs-backdrop-in .25s ease forwards;
    }
    .cs-sheet-wrap {
      position:fixed; left:0; right:0; bottom:0; z-index:9998;
      animation:cs-sheet-in .38s cubic-bezier(.32,0,.15,1) forwards;
      padding-bottom:env(safe-area-inset-bottom, 0px);
    }
    .cs-sheet-handle {
      width:44px; height:5px; border-radius:3px;
      background:rgba(0,0,0,.15); margin:10px auto 8px;
    }
    @media(max-width:600px){
      .cs-panel {
        width:100%;
        border-radius:20px 20px 0 0;
        max-height:88vh;
        overflow-y:auto;
      }
    }
  `

  const panelInner = (
    <>
      <div className="cs-header">
        <div className="cs-header-grid" />
        <div className="cs-header-top">
          <div className="cs-agent">
            <div className="cs-avatar">CS</div>
            <div>
              <div className="cs-agent-name">{agentName}</div>
              <div className="cs-agent-role">{agentRole}</div>
            </div>
          </div>
          <button className="cs-close" onClick={() => setOpen(false)}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="cs-status-row">
          <div className={`cs-status-dot ${isOnline ? "online" : "offline"}`} />
          <span className="cs-status-txt">
            {isOnline
              ? "Online sekarang · Biasanya balas dalam 5 menit"
              : "Offline"}
          </span>
        </div>
      </div>

      <div className="cs-body">
        {step === "form" ? (
          <>
            <div className="cs-greeting">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8
                }}
              >
                <div className="cs-typing">
                  <span />
                  <span />
                  <span />
                </div>
                <span
                  style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}
                >
                  STOCKR Support
                </span>
              </div>
              <div className="cs-greeting-txt">{greeting}</div>
              {!isOnline && (
                <div className="cs-greeting-offline">{offlineMessage}</div>
              )}
            </div>

            <div className="cs-field" style={{ animationDelay: ".05s" }}>
              <label className="cs-label">Nama Kamu *</label>
              <input
                className={`cs-input${errors.name ? " err" : ""}`}
                placeholder="Contoh: Budi Santoso"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setErrors((p) => ({ ...p, name: undefined }))
                }}
              />
              {errors.name && <div className="cs-err-msg">⚠ {errors.name}</div>}
            </div>

            <div className="cs-field" style={{ animationDelay: ".1s" }}>
              <label className="cs-label">Nomor HP *</label>
              <input
                className={`cs-input${errors.phone ? " err" : ""}`}
                placeholder="Contoh: 08123456789"
                value={phone}
                type="tel"
                onChange={(e) => {
                  setPhone(e.target.value)
                  setErrors((p) => ({ ...p, phone: undefined }))
                }}
              />
              {errors.phone && (
                <div className="cs-err-msg">⚠ {errors.phone}</div>
              )}
            </div>

            <div className="cs-field" style={{ animationDelay: ".15s" }}>
              <label className="cs-label">Pesan *</label>
              <textarea
                className={`cs-textarea${errors.message ? " err" : ""}`}
                placeholder="Tulis pertanyaan atau kebutuhanmu di sini..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  setErrors((p) => ({ ...p, message: undefined }))
                }}
              />
              {errors.message && (
                <div className="cs-err-msg">⚠ {errors.message}</div>
              )}
            </div>

            <button className="cs-submit" onClick={handleSubmit}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 2C6.477 2 2 6.477 2 12c0 1.89.524 3.656 1.435 5.163L2 22l4.978-1.405A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
              </svg>
              Chat via WhatsApp
            </button>

            <div className="cs-hours">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span className="cs-hours-txt">{onlineHours}</span>
            </div>
          </>
        ) : (
          <div className="cs-success">
            <div className="cs-success-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#087463"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="cs-success-title">Pesan Terkirim! 🎉</div>
            <div className="cs-success-sub">
              WhatsApp sudah terbuka. Tim kami akan segera merespons pesanmu,{" "}
              <strong>{name}</strong>!
            </div>
            <button className="cs-back" onClick={handleReset}>
              ← Kirim Pesan Lain
            </button>
          </div>
        )}
      </div>
    </>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Mobile: backdrop */}
      {open && isMobile && (
        <div className="cs-backdrop" onClick={() => setOpen(false)} />
      )}

      {/* Panel — mobile: bottom sheet | desktop: anchored to FAB */}
      {open &&
        (isMobile ? (
          <div className="cs-sheet-wrap">
            <div className="cs-sheet-handle" />
            <div className="cs-panel">{panelInner}</div>
          </div>
        ) : (
          <div style={panelStyle}>
            <div className="cs-panel" style={{ transformOrigin }}>
              {panelInner}
            </div>
          </div>
        ))}

      {/* Greeting bubble */}
      {!open && showBubble && (
        <div style={bubbleStyle}>
          <div className="cs-bubble">
            <button
              className="cs-bubble-close"
              onClick={() => setShowBubble(false)}
            >
              ✕
            </button>
            <div className="cs-bubble-txt">Ada yang bisa kami bantu? 👋</div>
            <div className="cs-bubble-sub">Klik untuk chat dengan CS kami</div>
          </div>
        </div>
      )}

      {/* FAB — draggable */}
      <div
        className="cs-fab-wrap"
        style={{
          position: "fixed",
          bottom: pos.y,
          right: pos.x,
          zIndex: 9999,
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "flex-end"
        }}
      >
        <button
          ref={fabRef}
          className={`cs-fab ${isDragging ? "dragging" : "idle"}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          aria-label="Chat with support"
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          {open ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 2C6.477 2 2 6.477 2 12c0 1.89.524 3.656 1.435 5.163L2 22l4.978-1.405A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
            </svg>
          )}
          {!open && <div className="cs-fab-badge">1</div>}
        </button>
      </div>
    </>
  )
}
