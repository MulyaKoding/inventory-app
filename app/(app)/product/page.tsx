"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import CSChatWidget from "../components/CSChatWidget"

/* ── DATA ── */
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Product", href: "/product" },
  { label: "About Us", href: "/about" }
]

const IMG_BG1 =
  "https://res.cloudinary.com/dp0dtct3v/image/upload/v1775018967/ic_bc_ymt1ze.jpg"
const IMG_BG2 =
  "https://res.cloudinary.com/dp0dtct3v/image/upload/v1775018967/ic_cb_esgcqk.jpg"

const PRODUCTS = [
  {
    id: 1,
    name: "Manajemen Produk",
    tagline: "Ribuan SKU, Satu Dasbor",
    desc: "Tambah, edit, dan kategorikan produk dalam hitungan detik. Sistem kami mendukung bulk import via CSV, barcode scanning, dan multi-varian produk tanpa batas.",
    badge: "Core Feature",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" width="80" height="80">
        <rect
          x="8"
          y="14"
          width="64"
          height="52"
          rx="8"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path d="M8 28h64" stroke="currentColor" strokeWidth="3" />
        <path
          d="M28 14v14M52 14v14"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <rect
          x="20"
          y="38"
          width="16"
          height="16"
          rx="3"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          d="M44 44h16M44 52h10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    color: "#1e3a5f",
    accent: "#38bdf8",
    stat: [
      { v: "10K+", l: "SKU Didukung" },
      { v: "< 1s", l: "Load Time" },
      { v: "99%", l: "Akurasi Data" }
    ],
    visual: "grid"
  },
  {
    id: 2,
    name: "Stok Real-Time",
    tagline: "Pantau Setiap Pergerakan",
    desc: "Monitor stok masuk dan keluar secara langsung. Alert otomatis saat stok menipis, histori lengkap setiap mutasi, dan sinkronisasi lintas gudang dalam satu klik.",
    badge: "Live Sync",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" width="80" height="80">
        <path
          d="M14 64V32l26-18 26 18v32"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <rect
          x="28"
          y="42"
          width="24"
          height="22"
          rx="3"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          d="M22 36h8M50 36h8"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle
          cx="60"
          cy="20"
          r="10"
          fill="#38bdf8"
          stroke="white"
          strokeWidth="2.5"
        />
        <path
          d="M56 20l2.5 2.5 5-5"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    color: "#0f2744",
    accent: "#7dd3fc",
    stat: [
      { v: "< 1s", l: "Sync Speed" },
      { v: "24/7", l: "Monitoring" },
      { v: "0", l: "Downtime" }
    ],
    visual: "pulse"
  },
  {
    id: 3,
    name: "Laporan & Analitik",
    tagline: "Data Jadi Keputusan",
    desc: "Grafik penjualan interaktif, tren produk terlaris, dan laporan keuangan otomatis. Export ke PDF atau Excel kapan saja, dari mana saja.",
    badge: "Analytics",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" width="80" height="80">
        <path
          d="M14 66V26l12-10h28l12 10v40"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M14 34h52" stroke="currentColor" strokeWidth="2.5" />
        <path
          d="M30 44v18M40 38v24M50 42v22"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="30" cy="44" r="3" fill="currentColor" />
        <circle cx="40" cy="38" r="3" fill="currentColor" />
        <circle cx="50" cy="42" r="3" fill="currentColor" />
      </svg>
    ),
    color: "#162b50",
    accent: "#60a5fa",
    stat: [
      { v: "15+", l: "Tipe Laporan" },
      { v: "PDF/XLS", l: "Format Export" },
      { v: "Real-time", l: "Dashboard" }
    ],
    visual: "bars"
  },
  {
    id: 4,
    name: "Riwayat Transaksi",
    tagline: "Audit Trail Lengkap",
    desc: "Setiap transaksi tercatat dengan timestamp, user, dan detail perubahan. Filter berdasarkan tanggal, produk, atau kategori. Audit mudah, verifikasi cepat.",
    badge: "Audit Log",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" width="80" height="80">
        <circle cx="40" cy="40" r="26" stroke="currentColor" strokeWidth="3" />
        <path
          d="M40 24v16l8 8"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18 18l6 6M62 18l-6 6"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    color: "#0c1f3e",
    accent: "#93c5fd",
    stat: [
      { v: "∞", l: "History" },
      { v: "5s", l: "Filter Speed" },
      { v: "100%", l: "Log Coverage" }
    ],
    visual: "timeline"
  }
]

const FEATURES_MINI = [
  { icon: "⚡", label: "Import CSV Bulk" },
  { icon: "📱", label: "Mobile Friendly" },
  { icon: "🔒", label: "Data Encrypted" },
  { icon: "🔔", label: "Smart Alert" },
  { icon: "👥", label: "Multi User" },
  { icon: "☁️", label: "Cloud Backup" }
]

/* ── VISUALS ── */
function VisualGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: 8,
        width: "100%"
      }}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 48,
            borderRadius: 10,
            background:
              i % 3 === 0
                ? "rgba(56,189,248,.25)"
                : i % 5 === 0
                  ? "rgba(30,58,95,.45)"
                  : "rgba(255,255,255,.07)",
            border: "1px solid rgba(255,255,255,.1)"
          }}
        />
      ))}
    </div>
  )
}

function VisualPulse() {
  return (
    <div
      style={{
        position: "relative",
        width: 160,
        height: 160,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: i * 50,
            height: i * 50,
            borderRadius: "50%",
            border: "1.5px solid rgba(96,165,250,.35)",
            animation: `expandRing 2.5s ease-out infinite`,
            animationDelay: `${(i - 1) * 0.75}s`
          }}
        />
      ))}
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 28px rgba(59,130,246,.5)"
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      </div>
    </div>
  )
}

function VisualBars() {
  const heights = [40, 70, 55, 85, 65, 90, 75]
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 7,
        height: 100,
        width: "100%"
      }}
    >
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            borderRadius: "5px 5px 0 0",
            background:
              i === 5
                ? "linear-gradient(180deg, #60a5fa, #1d4ed8)"
                : "rgba(255,255,255,.14)",
            height: `${h}%`,
            position: "relative",
            overflow: "hidden"
          }}
        >
          {i === 5 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,.2), transparent)"
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function VisualTimeline() {
  const items = [
    "Order #1042 · Masuk 50 pcs",
    "Order #1041 · Keluar 12 pcs",
    "Order #1040 · Update stok",
    "Order #1039 · Masuk 100 pcs"
  ]
  return (
    <div style={{ width: "100%" }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: i === 0 ? "#60a5fa" : "rgba(255,255,255,.2)",
                flexShrink: 0,
                marginTop: 5
              }}
            />
            {i < items.length - 1 && (
              <div
                style={{
                  width: 1,
                  flex: 1,
                  background: "rgba(255,255,255,.08)",
                  marginTop: 3
                }}
              />
            )}
          </div>
          <div
            style={{
              flex: 1,
              background: "rgba(255,255,255,.06)",
              borderRadius: 8,
              padding: "7px 11px",
              border:
                i === 0
                  ? "1px solid rgba(96,165,250,.35)"
                  : "1px solid rgba(255,255,255,.06)",
              marginBottom: i < items.length - 1 ? 4 : 0
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: i === 0 ? "#60a5fa" : "rgba(255,255,255,.6)",
                fontFamily: "'Nunito', sans-serif"
              }}
            >
              {item}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── PAGE ── */
export default function ProductPage() {
  const [active, setActive] = useState(0)
  const [dir, setDir] = useState<"right" | "left">("right")
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [imgLoaded, setImgLoaded] = useState([false, false])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = (idx: number, direction?: "left" | "right") => {
    if (idx === active) return
    setDir(direction ?? (idx > active ? "right" : "left"))
    setActive(idx)
  }

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setDir("right")
      setActive((a) => (a + 1) % PRODUCTS.length)
    }, 4500)
  }

  useEffect(() => {
    startTimer()
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  const cur = PRODUCTS[active]
  const anim = dir === "right" ? "slideR" : "slideL"

  const renderVisual = (type: string) => {
    if (type === "grid") return <VisualGrid />
    if (type === "pulse") return <VisualPulse />
    if (type === "bars") return <VisualBars />
    return <VisualTimeline />
  }

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Nunito', sans-serif;
      background: #f0faf7; color: #0f172a; overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }

    @keyframes navSlide   { from{opacity:0;transform:translateY(-100%)} to{opacity:1;transform:translateY(0)} }
    @keyframes menuIn     { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes slideR     { from{opacity:0;transform:translateX(55px) scale(.97)} to{opacity:1;transform:translateX(0) scale(1)} }
    @keyframes slideL     { from{opacity:0;transform:translateX(-55px) scale(.97)} to{opacity:1;transform:translateX(0) scale(1)} }
    @keyframes expandRing { 0%{transform:scale(.3);opacity:.7} 100%{transform:scale(1);opacity:0} }
    @keyframes floatY     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
    @keyframes gridPan    { from{background-position:0 0} to{background-position:48px 48px} }
    @keyframes blink      { 0%,100%{opacity:1} 50%{opacity:.2} }
    @keyframes fillProg   { from{width:0%} to{width:100%} }
    @keyframes fadeUp     { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
    @keyframes kenBurns   {
      0%   { transform: scale(1.0) translate(0, 0); }
      50%  { transform: scale(1.08) translate(-1%, 1%); }
      100% { transform: scale(1.0) translate(0, 0); }
    }
    @keyframes imgFade { from{opacity:0} to{opacity:1} }

    .anim-slideR { animation: slideR .5s cubic-bezier(.22,.68,0,1.15) both; }
    .anim-slideL { animation: slideL .5s cubic-bezier(.22,.68,0,1.15) both; }
    .anim-fadeUp { animation: fadeUp .6s ease both; }

    /* NAV */
    .nav {
      position:fixed; top:0; left:0; right:0; z-index:100;
      transition: background .3s, box-shadow .3s;
      animation: navSlide .4s ease forwards;
    }
    .nav.s {
      background: rgba(8,12,24,.96);
      backdrop-filter: blur(18px);
      box-shadow: 0 1px 0 rgba(255,255,255,.06), 0 4px 20px rgba(0,0,0,.4);
    }
    .nav-in {
      max-width:1200px; margin:0 auto;
      display:flex; align-items:center; justify-content:space-between;
      padding:0 32px; height:70px;
    }
    .logo { display:flex; align-items:center; gap:12px; text-decoration:none; }
    .logo-box {
      width:40px; height:40px; border-radius:10px;
      background:linear-gradient(135deg,#1e3a8a,#3b82f6);
      display:flex; align-items:center; justify-content:center;
      box-shadow: 0 4px 14px rgba(59,130,246,.4);
    }
    .logo-lbl { color:#fff; font-family:'Nunito',sans-serif; font-weight:900; font-size:11px; letter-spacing:.05em; }
    .logo-name { font-family:'Nunito',sans-serif; font-weight:900; font-size:20px; letter-spacing:.07em; color:#fff; }
    .logo-em { color:#60a5fa; font-style:normal; }
    .nav.s .logo-name { color: #f1f5f9; }

    .nav-links { display:flex; align-items:center; gap:2px; }
    .nl {
      padding:9px 20px; border-radius:8px; font-size:15px; font-weight:700;
      color:rgba(255,255,255,.75); text-decoration:none;
      font-family:'Nunito',sans-serif;
      transition:color .2s, background .2s;
    }
    .nl:hover { color:#fff; background:rgba(255,255,255,.1); }
    .nl.on { color:#fff; font-weight:800; }
    .nav.s .nl { color:rgba(255,255,255,.65); }
    .nav.s .nl:hover { color:#fff; background:rgba(255,255,255,.1); }
    .nav.s .nl.on { color:#60a5fa; }

    .btn-l {
      height:42px; padding:0 22px;
      background:rgba(255,255,255,.12); color:#fff;
      border:1px solid rgba(255,255,255,.2); border-radius:10px;
      font-size:15px; font-weight:800;
      font-family:'Nunito',sans-serif;
      cursor:pointer; text-decoration:none; display:flex; align-items:center;
      backdrop-filter:blur(8px); transition:all .2s;
    }
    .btn-l:hover { background:rgba(255,255,255,.2); transform:translateY(-1px); }
    .nav.s .btn-l { background:#3b82f6; color:#fff; border-color:transparent; box-shadow:0 4px 12px rgba(59,130,246,.4); }
    .nav.s .btn-l:hover { background:#2563eb; }

    .hbg { display:none; flex-direction:column; gap:5px; cursor:pointer; padding:6px; background:none; border:none; }
    .hbg span { display:block; width:22px; height:2px; background:#fff; border-radius:2px; transition:all .3s; }
    .hbg.op span:nth-child(1){transform:rotate(45deg) translate(5px,5px)}
    .hbg.op span:nth-child(2){opacity:0}
    .hbg.op span:nth-child(3){transform:rotate(-45deg) translate(5px,-5px)}

    .m-menu {
      display:none; position:absolute; top:70px; left:0; right:0;
      background:rgba(8,12,24,.97); backdrop-filter:blur(20px);
      border-bottom:1px solid rgba(255,255,255,.08); padding:12px 20px 20px;
      box-shadow:0 12px 32px rgba(0,0,0,.4);
      animation: menuIn .2s ease forwards;
    }
    .m-menu.op { display:block; }
    .m-nl {
      display:block; padding:13px 16px; border-radius:10px; font-size:15px; font-weight:700;
      color:rgba(255,255,255,.7); text-decoration:none; margin-bottom:4px;
      font-family:'Nunito',sans-serif;
      transition:all .2s; border:none; background:none; width:100%; text-align:left; cursor:pointer;
    }
    .m-nl:hover,.m-nl.on { color:#60a5fa; background:rgba(59,130,246,.1); }
    .m-login {
      margin-top:12px; width:100%; height:48px; background:#3b82f6; color:#fff;
      border:none; border-radius:10px; font-size:15px; font-weight:800; cursor:pointer;
      font-family:'Nunito',sans-serif;
      text-decoration:none; display:flex; align-items:center; justify-content:center;
    }

    /* HERO */
    .hero {
      min-height: 100vh;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      padding: 100px 32px 72px;
    }

    /* Background image collage */
    .hero-bg {
      position: absolute;
      inset: 0;
      z-index: 0;
    }
    .hero-bg-img1 {
      position: absolute;
      top: 0; right: 0;
      width: 55%; height: 60%;
      object-fit: cover;
      opacity: .22;
      animation: kenBurns 18s ease-in-out infinite;
    }
    .hero-bg-img2 {
      position: absolute;
      bottom: 0; left: 0;
      width: 50%; height: 55%;
      object-fit: cover;
      opacity: .16;
      animation: kenBurns 22s ease-in-out infinite reverse;
    }

    /* dark gradient overlay on top of images */
    .hero-bg-overlay {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 80% 60% at 70% 20%, rgba(30,58,138,.18) 0%, transparent 60%),
        radial-gradient(ellipse 70% 60% at 20% 80%, rgba(15,23,42,.3) 0%, transparent 60%),
        linear-gradient(160deg,
          #060b1a 0%,
          #0c1733 25%,
          #0f2050 50%,
          #0c1a3a 75%,
          #080d1f 100%
        );
    }

    .h-grid {
      position:absolute; inset:0; z-index:1;
      background-image:
        linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),
        linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);
      background-size:52px 52px; animation:gridPan 12s linear infinite; pointer-events:none;
    }
    .h-glow {
      position:absolute; z-index:1; top:-80px; right:-80px; width:520px; height:520px;
      border-radius:50%; background:radial-gradient(circle,rgba(59,130,246,.15) 0%,transparent 65%); pointer-events:none;
    }
    .h-glow2 {
      position:absolute; z-index:1; bottom:-60px; left:-60px; width:400px; height:400px;
      border-radius:50%; background:radial-gradient(circle,rgba(30,58,138,.12) 0%,transparent 65%); pointer-events:none;
    }
    .h-in {
      max-width:1200px; margin:0 auto; width:100%;
      display:grid; grid-template-columns:1fr 1fr; gap:72px; align-items:center;
      position:relative; z-index:2;
    }

    .s-badge {
      display:inline-flex; align-items:center; gap:9px;
      background:rgba(255,255,255,.08); backdrop-filter:blur(8px);
      border:1px solid rgba(255,255,255,.15); border-radius:100px;
      padding:8px 20px; margin-bottom:20px;
    }
    .s-dot { width:7px; height:7px; border-radius:50%; background:#60a5fa; animation:blink 1.4s ease-in-out infinite; flex-shrink:0; }
    .s-badge-txt { font-family:'Nunito',sans-serif; font-size:12px; font-weight:800; color:rgba(255,255,255,.85); letter-spacing:.08em; text-transform:uppercase; }

    .s-tag { font-family:'Nunito',sans-serif; font-size:12px; font-weight:700; color:rgba(255,255,255,.45); letter-spacing:.1em; text-transform:uppercase; margin-bottom:12px; }

    .s-title {
      font-family:'Nunito',sans-serif; font-weight:900; font-size:64px; line-height:1.04;
      color:#fff; letter-spacing:-.02em; margin-bottom:20px;
    }
    .s-title em { font-style:normal; color:#60a5fa; }

    .s-desc { color:rgba(255,255,255,.65); font-size:17px; line-height:1.75; margin-bottom:34px; max-width:440px; font-family:'Nunito',sans-serif; font-weight:500; }

    .s-stats { display:flex; gap:12px; margin-bottom:34px; flex-wrap:wrap; }
    .s-stat {
      background:rgba(0,0,0,.35); backdrop-filter:blur(12px);
      border:1px solid rgba(255,255,255,.08); border-radius:14px; padding:16px 20px;
    }
    .s-stat-v { font-family:'Nunito',sans-serif; font-weight:900; font-size:26px; color:#fff; line-height:1; }
    .s-stat-l { font-family:'Nunito',sans-serif; font-size:10px; font-weight:700; color:rgba(255,255,255,.38); text-transform:uppercase; letter-spacing:.07em; margin-top:5px; }

    .s-cta { display:flex; gap:12px; flex-wrap:wrap; }
    .btn-p {
      height:52px; padding:0 30px; background:#3b82f6; color:#fff;
      border:none; border-radius:12px; font-size:16px; font-weight:800; cursor:pointer;
      font-family:'Nunito',sans-serif; text-decoration:none; display:inline-flex; align-items:center; gap:8px;
      box-shadow:0 8px 28px rgba(59,130,246,.4); transition:transform .2s, box-shadow .2s, background .2s;
    }
    .btn-p:hover { transform:translateY(-2px); box-shadow:0 12px 36px rgba(59,130,246,.5); background:#2563eb; }
    .btn-g {
      height:52px; padding:0 26px; background:rgba(255,255,255,.08); color:#fff;
      border:1.5px solid rgba(255,255,255,.2); border-radius:12px;
      font-size:16px; font-weight:700; cursor:pointer;
      font-family:'Nunito',sans-serif; text-decoration:none; display:inline-flex; align-items:center;
      backdrop-filter:blur(8px); transition:background .2s;
    }
    .btn-g:hover { background:rgba(255,255,255,.16); }

    .tabs { display:flex; gap:8px; flex-wrap:wrap; margin-top:40px; }
    .tab {
      display:flex; align-items:center; gap:8px; padding:11px 22px; border-radius:100px;
      background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
      color:rgba(255,255,255,.55); font-size:14px; font-weight:700; cursor:pointer;
      font-family:'Nunito',sans-serif; transition:all .22s;
    }
    .tab:hover { background:rgba(255,255,255,.12); color:rgba(255,255,255,.85); }
    .tab.on { background:rgba(59,130,246,.2); color:#93c5fd; border-color:rgba(59,130,246,.35); }
    .tab-n { font-family:'Nunito',sans-serif; font-size:11px; font-weight:700; opacity:.5; }

    .prog-wrap { display:flex; gap:6px; margin-top:14px; }
    .prog-bar { height:2px; border-radius:2px; flex:1; background:rgba(255,255,255,.1); overflow:hidden; }
    .prog-fill { height:100%; border-radius:2px; background:#3b82f6; width:0%; }
    .prog-fill.go { animation:fillProg 4.5s linear forwards; }

    .dots { display:flex; align-items:center; gap:12px; margin-top:14px; }
    .dot-btn {
      width:8px; height:8px; border-radius:100px; background:rgba(255,255,255,.2);
      cursor:pointer; border:none; transition:width .4s cubic-bezier(.34,1.56,.64,1), background .3s;
    }
    .dot-btn.on { width:30px; background:#60a5fa; }
    .next-b {
      background:rgba(255,255,255,.08); border:none; border-radius:8px; padding:8px 16px;
      color:rgba(255,255,255,.5); font-size:13px; font-weight:700; cursor:pointer;
      font-family:'Nunito',sans-serif; transition:all .2s;
    }
    .next-b:hover { background:rgba(255,255,255,.15); color:#fff; }

    /* Right card */
    .v-card {
      background:rgba(255,255,255,.05); backdrop-filter:blur(20px);
      border:1px solid rgba(255,255,255,.1); border-radius:24px;
      padding:36px; width:100%; max-width:380px;
      display:flex; flex-direction:column; align-items:center; gap:26px;
      box-shadow:0 24px 64px rgba(0,0,0,.5);
      animation: floatY 5s ease-in-out infinite;
    }
    .v-icon {
      width:96px; height:96px; border-radius:20px;
      background:rgba(59,130,246,.12);
      display:flex; align-items:center; justify-content:center; color:#93c5fd;
    }
    .v-stat {
      width:100%; padding:14px 16px; background:rgba(0,0,0,.3);
      border-radius:12px; border:1px solid rgba(255,255,255,.07);
    }
    .v-stat-lbl { font-family:'Nunito',sans-serif; font-size:10px; font-weight:800; color:rgba(255,255,255,.3); text-transform:uppercase; letter-spacing:.07em; margin-bottom:8px; }
    .v-stat-row { display:flex; gap:10px; }
    .v-stat-v { font-family:'Nunito',sans-serif; font-weight:900; font-size:17px; color:#60a5fa; }
    .v-stat-l { font-family:'Nunito',sans-serif; font-size:9px; font-weight:700; color:rgba(255,255,255,.28); text-transform:uppercase; letter-spacing:.05em; margin-top:3px; }

    /* STRIP */
    .strip { background:#fff; border-top:1px solid #e2e8f0; border-bottom:1px solid #e2e8f0; padding:26px 32px; }
    .strip-in {
      max-width:1200px; margin:0 auto;
      display:flex; align-items:center; gap:10px; flex-wrap:wrap; justify-content:center;
    }
    .s-item {
      display:flex; align-items:center; gap:7px; padding:8px 18px; border-radius:100px;
      background:#f0faf7; border:1px solid rgba(8,116,99,.15);
      font-size:14px; font-weight:700; color:#087463;
      font-family:'Nunito',sans-serif;
    }

    /* DETAIL SECTION */
    .det-sec { padding:100px 32px; background:#f0faf7; }
    .det-in { max-width:1200px; margin:0 auto; }
    .det-head { text-align:center; margin-bottom:60px; }
    .det-tag {
      display:inline-flex; align-items:center;
      background:rgba(8,116,99,.1); border-radius:100px; padding:5px 16px; margin-bottom:16px;
    }
    .det-tag span { color:#087463; font-size:12px; font-weight:800; font-family:'Nunito',sans-serif; text-transform:uppercase; letter-spacing:.07em; }
    .det-h2 { font-family:'Nunito',sans-serif; font-weight:900; font-size:42px; color:#0f172a; letter-spacing:-.02em; line-height:1.2; margin-bottom:14px; }
    .det-h2 em { font-style:normal; color:#087463; }
    .det-sub { color:#64748b; font-size:17px; line-height:1.65; max-width:520px; margin:0 auto; font-family:'Nunito',sans-serif; font-weight:500; }
    .det-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:24px; }
    .det-card {
      background:#fff; border:1.5px solid #e2e8f0; border-radius:20px; padding:36px;
      transition:border-color .25s, box-shadow .25s, transform .25s;
    }
    .det-card:hover { border-color:#087463; box-shadow:0 8px 32px rgba(8,116,99,.12); transform:translateY(-4px); }
    .det-ico {
      width:64px; height:64px; border-radius:16px; margin-bottom:20px;
      background:linear-gradient(135deg,rgba(8,116,99,.1),rgba(15,191,159,.1));
      display:flex; align-items:center; justify-content:center; color:#087463;
    }
    .det-badge {
      display:inline-block; font-size:11px; font-weight:800;
      font-family:'Nunito',sans-serif; letter-spacing:.06em; text-transform:uppercase;
      color:#087463; background:rgba(8,116,99,.08); border-radius:100px; padding:4px 12px; margin-bottom:12px;
    }
    .det-title { font-family:'Nunito',sans-serif; font-weight:900; font-size:22px; color:#0f172a; margin-bottom:10px; }
    .det-desc { color:#64748b; font-size:15px; line-height:1.7; margin-bottom:22px; font-family:'Nunito',sans-serif; font-weight:500; }
    .det-stats { display:flex; gap:20px; flex-wrap:wrap; }
    .det-sv { font-family:'Nunito',sans-serif; font-weight:900; font-size:20px; color:#087463; }
    .det-sl { font-size:10px; color:#94a3b8; font-family:'Nunito',sans-serif; font-weight:700; text-transform:uppercase; letter-spacing:.06em; margin-top:3px; }

    /* CTA */
    .cta-sec { padding:0 32px 100px; }
    .cta-in {
      max-width:1200px; margin:0 auto;
      background:linear-gradient(145deg,#060b1a,#0c1a3a,#1e3a8a);
      border-radius:28px; padding:80px 64px; text-align:center; position:relative; overflow:hidden;
    }
    .cta-grid {
      position:absolute; inset:0;
      background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);
      background-size:40px 40px; pointer-events:none;
    }
    .cta-glow {
      position:absolute; top:-80px; right:-80px; width:400px; height:400px; border-radius:50%;
      background:radial-gradient(circle,rgba(59,130,246,.2) 0%,transparent 65%); pointer-events:none;
    }
    .cta-h2 { font-family:'Nunito',sans-serif; font-weight:900; font-size:44px; color:#fff; letter-spacing:-.025em; margin-bottom:16px; position:relative; z-index:1; }
    .cta-h2 em { font-style:normal; color:#60a5fa; }
    .cta-p { color:rgba(255,255,255,.65); font-size:17px; line-height:1.7; max-width:480px; margin:0 auto 36px; position:relative; z-index:1; font-family:'Nunito',sans-serif; font-weight:500; }
    .cta-btns { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; position:relative; z-index:1; }
    .btn-cta-w {
      height:52px; padding:0 30px; background:#fff; color:#1e3a8a;
      border:none; border-radius:12px; font-size:16px; font-weight:900; cursor:pointer;
      font-family:'Nunito',sans-serif; text-decoration:none; display:inline-flex; align-items:center; gap:8px;
      box-shadow:0 8px 28px rgba(0,0,0,.3); transition:transform .2s, box-shadow .2s;
    }
    .btn-cta-w:hover { transform:translateY(-2px); box-shadow:0 12px 36px rgba(0,0,0,.4); }

    /* FOOTER */
    .footer { background:linear-gradient(135deg,#050a14 0%,#0c1733 50%,#080d1f 100%); padding:40px 32px; text-align:center; }
    .f-logo { font-family:'Nunito',sans-serif; font-weight:900; font-size:22px; color:#fff; letter-spacing:.07em; margin-bottom:8px; }
    .f-logo em { font-style:normal; color:#60a5fa; }
    .f-sub { color:rgba(255,255,255,.3); font-size:13px; font-family:'Nunito',sans-serif; font-weight:600; }

    /* RESPONSIVE */
    @media(max-width:960px){
      .h-in{grid-template-columns:1fr;gap:48px}
      .right-wrap{order:-1;display:flex;justify-content:center}
      .det-grid{grid-template-columns:1fr}
      .cta-in{padding:56px 36px}
      .s-title{font-size:48px}
      .det-h2{font-size:34px}
      .cta-h2{font-size:34px}
    }
    @media(max-width:768px){
      .nav-links{display:none} .btn-l{display:none} .hbg{display:flex}
      .hero{padding:88px 20px 60px}
      .det-sec{padding:72px 20px}
      .cta-sec{padding:0 20px 72px}
      .strip{padding:20px}
      .nav-in{padding:0 20px}
      .tabs{display:none}
      .s-title{font-size:40px}
    }
    @media(max-width:480px){
      .s-cta{flex-direction:column}
      .btn-p,.btn-g{width:100%;justify-content:center}
      .cta-in{padding:40px 24px}
      .s-title{font-size:32px}
      .det-h2,.cta-h2{font-size:26px}
    }
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* NAV */}
      <nav className={`nav${scrolled ? " s" : ""}`}>
        <div className="nav-in">
          <Link href="/" className="logo">
            <div className="logo-box">
              <span className="logo-lbl">INV</span>
            </div>
            <span className="logo-name">
              STOCK<em className="logo-em">R</em>
            </span>
          </Link>
          <div className="nav-links">
            {NAV_LINKS.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className={`nl${n.label === "Product" ? " on" : ""}`}
              >
                {n.label}
              </Link>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/login" className="btn-l">
              Login
            </Link>
            <button
              className={`hbg${menuOpen ? " op" : ""}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
        <div className={`m-menu${menuOpen ? " op" : ""}`}>
          {NAV_LINKS.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className={`m-nl${n.label === "Product" ? " on" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="m-login"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        {/* Background: 2 images + overlay */}
        <div className="hero-bg">
          <img
            src={IMG_BG1}
            alt=""
            className="hero-bg-img1"
            aria-hidden="true"
          />
          <img
            src={IMG_BG2}
            alt=""
            className="hero-bg-img2"
            aria-hidden="true"
          />
          <div className="hero-bg-overlay" />
        </div>

        {/* Grid texture & glows */}
        <div className="h-grid" />
        <div className="h-glow" />
        <div className="h-glow2" />

        <div className="h-in">
          {/* Left */}
          <div>
            <div
              key={`b-${active}`}
              className={`anim-${anim}`}
              style={{ animationDelay: "0s" }}
            >
              <div className="s-badge">
                <div className="s-dot" />
                <span className="s-badge-txt">{cur.badge}</span>
              </div>
            </div>
            <div
              key={`t-${active}`}
              className={`anim-${anim}`}
              style={{ animationDelay: ".07s" }}
            >
              <p className="s-tag">{cur.tagline}</p>
            </div>
            <div
              key={`h-${active}`}
              className={`anim-${anim}`}
              style={{ animationDelay: ".13s" }}
            >
              <h1 className="s-title">
                {cur.name.split(" ").map((w, i) =>
                  i === 0 ? (
                    <em key={i}>
                      {w}
                      <br />
                    </em>
                  ) : (
                    <span key={i}>{w} </span>
                  )
                )}
              </h1>
            </div>
            <div
              key={`d-${active}`}
              className={`anim-${anim}`}
              style={{ animationDelay: ".19s" }}
            >
              <p className="s-desc">{cur.desc}</p>
            </div>
            <div
              key={`s-${active}`}
              className={`anim-${anim}`}
              style={{ animationDelay: ".25s" }}
            >
              <div className="s-stats">
                {cur.stat.map((s, i) => (
                  <div key={i} className="s-stat">
                    <div className="s-stat-v">{s.v}</div>
                    <div className="s-stat-l">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div
              key={`c-${active}`}
              className={`anim-${anim}`}
              style={{ animationDelay: ".31s" }}
            >
              <div className="s-cta">
                <Link href="/register" className="btn-p">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  Coba Sekarang
                </Link>
                <Link href="/login" className="btn-g">
                  Lihat Demo
                </Link>
              </div>
            </div>

            <div className="tabs">
              {PRODUCTS.map((p, i) => (
                <button
                  key={i}
                  className={`tab${active === i ? " on" : ""}`}
                  onClick={() => {
                    goTo(i)
                    startTimer()
                  }}
                >
                  <span className="tab-n">0{i + 1}</span>
                  {p.name}
                </button>
              ))}
            </div>

            <div className="prog-wrap">
              {PRODUCTS.map((_, i) => (
                <div key={i} className="prog-bar">
                  <div
                    className={`prog-fill${active === i ? " go" : ""}`}
                    style={{ width: active === i ? undefined : "0%" }}
                  />
                </div>
              ))}
            </div>

            <div className="dots">
              {PRODUCTS.map((_, i) => (
                <button
                  key={i}
                  className={`dot-btn${active === i ? " on" : ""}`}
                  onClick={() => {
                    goTo(i)
                    startTimer()
                  }}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
              <button
                className="next-b"
                onClick={() => {
                  goTo((active + 1) % PRODUCTS.length, "right")
                  startTimer()
                }}
              >
                Next →
              </button>
            </div>
          </div>

          {/* Right */}
          <div className="right-wrap">
            <div key={`card-${active}`} className={`v-card anim-${anim}`}>
              <div className="v-icon">{cur.icon}</div>
              {renderVisual(cur.visual)}
              <div className="v-stat">
                <div className="v-stat-lbl">Statistik Fitur</div>
                <div className="v-stat-row">
                  {cur.stat.map((s, i) => (
                    <div key={i} style={{ flex: 1 }}>
                      <div className="v-stat-v">{s.v}</div>
                      <div className="v-stat-l">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STRIP */}
      <div className="strip">
        <div className="strip-in">
          {FEATURES_MINI.map((f, i) => (
            <div key={i} className="s-item">
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DETAIL */}
      <section className="det-sec">
        <div className="det-in">
          <div className="det-head">
            <div className="det-tag">
              <span>Semua Fitur</span>
            </div>
            <h2 className="det-h2">
              Platform Lengkap untuk <em>Inventori</em> Kamu
            </h2>
            <p className="det-sub">
              Dari manajemen produk hingga laporan keuangan — semuanya ada dalam
              satu sistem terintegrasi.
            </p>
          </div>
          <div className="det-grid">
            {PRODUCTS.map((p, i) => (
              <div key={i} className="det-card">
                <div className="det-ico">{p.icon}</div>
                <span className="det-badge">{p.badge}</span>
                <h3 className="det-title">{p.name}</h3>
                <p className="det-desc">{p.desc}</p>
                <div className="det-stats">
                  {p.stat.map((s, j) => (
                    <div key={j}>
                      <div className="det-sv">{s.v}</div>
                      <div className="det-sl">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-sec">
        <div className="cta-in">
          <div className="cta-grid" />
          <div className="cta-glow" />
          <h2 className="cta-h2">
            Siap Mulai Kelola Inventori <em>Lebih Cerdas?</em>
          </h2>
          <p className="cta-p">
            Bergabung dengan 500+ bisnis yang sudah menggunakan STOCKR untuk
            memantau stok dan meningkatkan efisiensi operasional.
          </p>
          <div className="cta-btns">
            <Link href="/register" className="btn-cta-w">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              Mulai Gratis Sekarang
            </Link>
            <Link href="/login" className="btn-g" style={{ color: "#fff" }}>
              Masuk ke Akun
            </Link>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="f-logo">
          STOCK<em>R</em>
        </div>
        <div className="f-sub">© 2026 STOCKR · Inventory Management System</div>
      </footer>
      <CSChatWidget />
    </>
  )
}
