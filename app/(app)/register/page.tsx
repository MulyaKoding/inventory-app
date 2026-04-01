"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError("Password tidak cocok")
      return
    }
    if (form.password.length < 8) {
      setError("Password minimal 8 karakter")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Registrasi gagal")
        return
      }
      setSuccess("Registrasi berhasil! Mengarahkan ke halaman login...")
      setTimeout(() => {
        window.location.href = "/login"
      }, 1500)
    } catch {
      setError("Terjadi kesalahan, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes gridPan {
          from { background-position: 0 0; }
          to { background-position: 48px 48px; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .rg-root { display: flex; min-height: 100vh; font-family: 'Nunito', sans-serif; }

        /* ── LEFT ── */
        .rg-left {
          position: relative; width: 52%; min-height: 100vh;
          background: linear-gradient(160deg, #060b1a 0%, #0c1733 30%, #0f2050 60%, #1e3a8a 100%);
          display: flex; flex-direction: column; overflow: hidden;
        }
        .rg-left-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image: linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
          background-size: 48px 48px; animation: gridPan 8s linear infinite;
        }
        .rg-left-glow {
          position: absolute; top: -100px; right: -100px;
          width: 450px; height: 450px; border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,.22) 0%, transparent 70%);
          pointer-events: none;
        }
        .rg-left-glow2 {
          position: absolute; bottom: -80px; left: -80px;
          width: 380px; height: 380px; border-radius: 50%;
          background: radial-gradient(circle, rgba(30,58,138,.18) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Brand */
        .rg-brand-area {
          position: relative; z-index: 2; padding: 48px 52px 0;
          display: flex; align-items: center; gap: 12px; cursor: pointer;
        }
        .rg-brand-mark {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #1e3a8a, #3b82f6);
          border-radius: 9px; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; box-shadow: 0 4px 12px rgba(59,130,246,.35);
        }
        .rg-brand-mark span { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 11px; color: #fff; }
        .rg-brand-name { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 18px; color: #fff; letter-spacing: .06em; }
        .rg-brand-sub { font-size: 11px; color: rgba(255,255,255,.4); font-family: 'Nunito', sans-serif; font-weight: 600; margin-top: 2px; }

        /* Hero */
        .rg-hero { position: relative; z-index: 2; padding: 48px 52px 0; flex: 1; }
        .rg-hero-tag {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,.08); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,.15); border-radius: 100px;
          padding: 6px 14px; margin-bottom: 24px;
        }
        .rg-hero-tag-dot { width: 6px; height: 6px; border-radius: 50%; background: #60a5fa; position: relative; }
        .rg-hero-tag-dot::after {
          content: ''; position: absolute; inset: -3px; border-radius: 50%;
          background: rgba(96,165,250,.4); animation: pulse-ring 1.8s ease-out infinite;
        }
        .rg-hero-tag-text { color: rgba(255,255,255,.85); font-size: 11px; font-family: 'Nunito', sans-serif; font-weight: 800; letter-spacing: .05em; }
        .rg-hero-title {
          font-family: 'Nunito', sans-serif; font-weight: 900;
          font-size: clamp(28px, 3vw, 42px); line-height: 1.1; letter-spacing: -.02em;
          color: #fff; margin-bottom: 14px;
        }
        .rg-hero-title em { font-style: normal; color: #60a5fa; }
        .rg-hero-desc {
          font-size: 14px; color: rgba(255,255,255,.6); line-height: 1.7;
          max-width: 360px; font-family: 'Nunito', sans-serif; font-weight: 500;
          margin-bottom: 32px;
        }

        /* Visual mock */
        .rg-visual {
          border: 1px solid rgba(255,255,255,.1); border-radius: 14px;
          overflow: hidden; background: rgba(0,0,0,.2); margin-bottom: 28px;
        }
        .rg-visual-header {
          padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,.07);
          display: flex; align-items: center; gap: 8px;
          background: rgba(0,0,0,.15);
        }
        .rg-visual-dot { width: 8px; height: 8px; border-radius: 50%; }
        .rg-visual-title { font-size: 11px; color: rgba(255,255,255,.3); font-family: 'Nunito', sans-serif; font-weight: 700; margin-left: 4px; letter-spacing: .04em; }
        .rg-visual-body { padding: 14px; display: flex; flex-direction: column; gap: 8px; }
        .rg-visual-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 14px; background: rgba(255,255,255,.04);
          border-radius: 8px; border: 1px solid rgba(255,255,255,.06);
          animation: slideIn .4s ease forwards;
        }
        .rg-visual-row-left { display: flex; align-items: center; gap: 10px; }
        .rg-visual-row-ico { width: 28px; height: 28px; border-radius: 6px; background: rgba(255,255,255,.06); display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .rg-visual-row-name { font-size: 13px; color: rgba(255,255,255,.65); font-family: 'Nunito', sans-serif; font-weight: 700; }
        .rg-visual-row-stock { font-size: 11px; color: rgba(255,255,255,.25); font-family: 'Nunito', sans-serif; font-weight: 600; }
        .rg-visual-badge { font-size: 11px; font-family: 'Nunito', sans-serif; font-weight: 800; padding: 3px 10px; border-radius: 100px; }
        .rg-visual-badge.ok { background: rgba(29,78,216,.15); color: #93c5fd; }
        .rg-visual-badge.warn { background: rgba(245,158,11,.12); color: #fde68a; }
        .rg-visual-badge.low { background: rgba(239,68,68,.12); color: #fca5a5; }

        /* Steps */
        .rg-steps { display: flex; flex-direction: column; gap: 10px; }
        .rg-step { display: flex; align-items: flex-start; gap: 14px; }
        .rg-step-num {
          width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
          background: rgba(59,130,246,.15); border: 1px solid rgba(59,130,246,.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-family: 'Nunito', sans-serif; font-weight: 900;
          color: #93c5fd; margin-top: 2px;
        }
        .rg-step-text { font-size: 13px; color: rgba(255,255,255,.5); font-family: 'Nunito', sans-serif; font-weight: 600; line-height: 1.5; }
        .rg-step-text strong { color: rgba(255,255,255,.8); font-weight: 800; }

        /* Bottom */
        .rg-bottom-bar {
          position: relative; z-index: 2; padding: 22px 52px;
          border-top: 1px solid rgba(255,255,255,.07);
          display: flex; align-items: center; justify-content: space-between;
        }
        .rg-bottom-trust { display: flex; align-items: center; gap: 8px; font-size: 12px; color: rgba(255,255,255,.35); font-family: 'Nunito', sans-serif; font-weight: 700; }
        .rg-bottom-trust-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; }
        .rg-bottom-version { font-size: 11px; color: rgba(255,255,255,.2); font-family: 'Nunito', sans-serif; font-weight: 700; }

        /* ── RIGHT — WHITE ── */
        .rg-right {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 40px 40px; background: #fff; overflow-y: auto;
        }
        .rg-card { width: 100%; max-width: 400px; animation: fadeUp .5s ease forwards; }

        .rg-form-head { margin-bottom: 28px; }
        .rg-form-logo {
          width: 44px; height: 44px;
          background: linear-gradient(135deg, #1e3a8a, #3b82f6);
          border-radius: 10px; display: flex; align-items: center; justify-content: center;
          margin-bottom: 18px; box-shadow: 0 6px 20px rgba(59,130,246,.25);
        }
        .rg-form-logo span { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 12px; color: #fff; }
        .rg-form-title { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 28px; color: #0f172a; letter-spacing: -.02em; line-height: 1.2; margin-bottom: 6px; }
        .rg-form-sub { font-size: 14px; color: #64748b; font-family: 'Nunito', sans-serif; font-weight: 500; line-height: 1.5; }

        /* Fields */
        .rg-field { margin-bottom: 14px; }
        .rg-lbl { display: block; font-size: 13px; font-weight: 700; color: #374151; font-family: 'Nunito', sans-serif; margin-bottom: 7px; }
        .rg-inp-wrap { position: relative; display: flex; align-items: center; }
        .rg-inp-icon { position: absolute; left: 14px; width: 16px; height: 16px; pointer-events: none; z-index: 1; color: #94a3b8; }
        .rg-inp {
          width: 100%; height: 48px; padding: 0 44px;
          background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px;
          font-size: 14px; font-family: 'Nunito', sans-serif; font-weight: 600;
          color: #0f172a; outline: none;
          transition: border-color .2s, box-shadow .2s, background .2s;
        }
        .rg-inp::placeholder { color: #cbd5e1; font-weight: 500; }
        .rg-inp:focus { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 3px rgba(59,130,246,.12); }
        .rg-inp-eye { position: absolute; right: 14px; background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; color: #94a3b8; transition: color .2s; }
        .rg-inp-eye:hover { color: #475569; }
        .rg-field-err { font-size: 12px; color: #dc2626; margin-top: 5px; font-weight: 700; font-family: 'Nunito', sans-serif; }

        /* Strength */
        .rg-strength { display: flex; gap: 4px; margin-top: 7px; }
        .rg-strength-bar { flex: 1; height: 3px; border-radius: 2px; background: #e2e8f0; transition: background .3s; }

        .rg-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; font-family: 'Nunito', sans-serif; margin-bottom: 14px; text-align: center; }
        .rg-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; font-family: 'Nunito', sans-serif; margin-bottom: 14px; text-align: center; }

        .rg-btn {
          width: 100%; height: 50px;
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: #fff; border: none; border-radius: 10px;
          font-size: 15px; font-weight: 800; letter-spacing: .02em; cursor: pointer;
          font-family: 'Nunito', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 8px 24px rgba(59,130,246,.3);
          transition: transform .2s, box-shadow .2s; margin-top: 6px;
        }
        .rg-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(59,130,246,.4); }
        .rg-btn:disabled { opacity: .7; cursor: not-allowed; }

        .rg-dots { display: flex; gap: 5px; align-items: center; }
        .rg-dot { width: 6px; height: 6px; border-radius: 50%; background: #fff; animation: dotBounce 1s ease-in-out infinite; }

        .rg-foot { text-align: center; margin-top: 20px; font-size: 13px; color: #64748b; font-family: 'Nunito', sans-serif; font-weight: 600; }
        .rg-foot a { color: #1e3a8a; text-decoration: none; font-weight: 800; }
        .rg-foot a:hover { color: #3b82f6; }

        .rg-terms { text-align: center; margin-top: 12px; font-size: 12px; color: #94a3b8; font-family: 'Nunito', sans-serif; font-weight: 600; }
        .rg-terms a { color: #1e3a8a; text-decoration: none; }

        /* Mobile */
        .rg-topbar { display: none; background: linear-gradient(135deg, #060b1a, #1e3a8a); padding: 14px 20px; align-items: center; gap: 12px; cursor: pointer; }
        .rg-topbar-mark { width: 34px; height: 34px; border-radius: 8px; background: linear-gradient(135deg, #1e3a8a, #3b82f6); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .rg-topbar-mark span { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 10px; color: #fff; }
        .rg-topbar-name { font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 15px; color: #fff; }
        .rg-topbar-sub { font-size: 10px; color: rgba(255,255,255,.4); font-family: 'Nunito', sans-serif; font-weight: 600; }

        @media (max-width: 900px) {
          .rg-left { display: none; }
          .rg-topbar { display: flex; }
          .rg-root { flex-direction: column; }
          .rg-right { padding: 32px 20px 48px; align-items: flex-start; }
          .rg-card { max-width: 100%; }
        }
        @media (max-width: 480px) {
          .rg-right { padding: 24px 16px 40px; }
          .rg-form-title { font-size: 24px; }
          .rg-inp { height: 44px; }
          .rg-btn { height: 48px; }
          .rg-field { margin-bottom: 12px; }
        }
      `}</style>

      <div className="rg-root">
        <div className="rg-topbar" onClick={() => router.push("/")}>
          <div className="rg-topbar-mark">
            <span>INV</span>
          </div>
          <div>
            <div className="rg-topbar-name">STOCKR</div>
            <div className="rg-topbar-sub">Inventory Management System</div>
          </div>
        </div>

        {/* LEFT */}
        <div className="rg-left">
          <div className="rg-left-grid" />
          <div className="rg-left-glow" />
          <div className="rg-left-glow2" />
          <div className="rg-brand-area" onClick={() => router.push("/")}>
            <div className="rg-brand-mark">
              <span>INV</span>
            </div>
            <div>
              <div className="rg-brand-name">STOCKR</div>
              <div className="rg-brand-sub">Inventory Management System</div>
            </div>
          </div>
          <div className="rg-hero">
            <div className="rg-hero-tag">
              <span className="rg-hero-tag-dot" />
              <span className="rg-hero-tag-text">Gratis Selamanya</span>
            </div>
            <h1 className="rg-hero-title">
              Mulai Kelola
              <br />
              <em>Inventori Kamu.</em>
            </h1>
            <p className="rg-hero-desc">
              Buat akun gratis dan langsung akses semua fitur manajemen stok,
              pesanan, dan laporan bisnis.
            </p>

            {/* Visual mock */}
            <div className="rg-visual">
              <div className="rg-visual-header">
                <span
                  className="rg-visual-dot"
                  style={{ background: "#ef4444" }}
                />
                <span
                  className="rg-visual-dot"
                  style={{ background: "#f59e0b" }}
                />
                <span
                  className="rg-visual-dot"
                  style={{ background: "#22c55e" }}
                />
                <span className="rg-visual-title">stockr / inventory</span>
              </div>
              <div className="rg-visual-body">
                {[
                  {
                    ico: "📦",
                    name: "Kaos Polos Putih",
                    stock: "124 pcs",
                    status: "ok",
                    badge: "In Stock"
                  },
                  {
                    ico: "👟",
                    name: "Sepatu Running X9",
                    stock: "8 pcs",
                    status: "warn",
                    badge: "Low Stock"
                  },
                  {
                    ico: "🎒",
                    name: "Tas Ransel Urban",
                    stock: "0 pcs",
                    status: "low",
                    badge: "Habis"
                  }
                ].map((r, i) => (
                  <div
                    key={r.name}
                    className="rg-visual-row"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="rg-visual-row-left">
                      <div className="rg-visual-row-ico">{r.ico}</div>
                      <div>
                        <div className="rg-visual-row-name">{r.name}</div>
                        <div className="rg-visual-row-stock">{r.stock}</div>
                      </div>
                    </div>
                    <span className={`rg-visual-badge ${r.status}`}>
                      {r.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div className="rg-steps">
              {[
                {
                  n: "01",
                  t: (
                    <>
                      Daftar gratis dalam <strong>2 menit</strong>
                    </>
                  )
                },
                {
                  n: "02",
                  t: (
                    <>
                      Tambah produk & <strong>atur stok</strong> kamu
                    </>
                  )
                },
                {
                  n: "03",
                  t: (
                    <>
                      <strong>Monitor & analisis</strong> semua dari dasbor
                    </>
                  )
                }
              ].map((s) => (
                <div key={s.n} className="rg-step">
                  <div className="rg-step-num">{s.n}</div>
                  <div className="rg-step-text">{s.t}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rg-bottom-bar">
            <div className="rg-bottom-trust">
              <span className="rg-bottom-trust-dot" />
              Gratis, tanpa kartu kredit
            </div>
            <span className="rg-bottom-version">v2.4.1 · 2026</span>
          </div>
        </div>

        {/* RIGHT — WHITE */}
        <div className="rg-right">
          <div className="rg-card">
            <div className="rg-form-head">
              <h1 className="rg-form-title">Buat Akun</h1>
              <p className="rg-form-sub">
                Isi data di bawah untuk mulai menggunakan platform.
              </p>
            </div>

            {/* Name */}
            <div className="rg-field">
              <label className="rg-lbl">Nama Lengkap</label>
              <div className="rg-inp-wrap">
                <svg
                  className="rg-inp-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  className="rg-inp"
                  type="text"
                  placeholder="Nama kamu"
                  value={form.name}
                  onChange={handleChange("name")}
                />
              </div>
            </div>

            {/* Email */}
            <div className="rg-field">
              <label className="rg-lbl">Email</label>
              <div className="rg-inp-wrap">
                <svg
                  className="rg-inp-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  className="rg-inp"
                  type="email"
                  placeholder="nama@email.com"
                  value={form.email}
                  onChange={handleChange("email")}
                />
              </div>
            </div>

            {/* Password */}
            <div className="rg-field">
              <label className="rg-lbl">Password</label>
              <div className="rg-inp-wrap">
                <svg
                  className="rg-inp-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  className="rg-inp"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 karakter"
                  value={form.password}
                  onChange={handleChange("password")}
                />
                <button
                  type="button"
                  className="rg-inp-eye"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {/* Strength bars */}
              <div className="rg-strength">
                {[0, 1, 2, 3].map((i) => {
                  const len = form.password.length
                  const active =
                    len === 0
                      ? -1
                      : len < 6
                        ? 0
                        : len < 8
                          ? 1
                          : len < 12
                            ? 2
                            : 3
                  const colors = ["#ef4444", "#f59e0b", "#3b82f6", "#22c55e"]
                  return (
                    <div
                      key={i}
                      className="rg-strength-bar"
                      style={{
                        background: i <= active ? colors[active] : undefined
                      }}
                    />
                  )
                })}
              </div>
            </div>

            {/* Confirm */}
            <div className="rg-field">
              <label className="rg-lbl">Konfirmasi Password</label>
              <div className="rg-inp-wrap">
                <svg
                  className="rg-inp-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <input
                  className="rg-inp"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Ulangi password"
                  value={form.confirm}
                  onChange={handleChange("confirm")}
                  style={{
                    borderColor:
                      form.confirm && form.password !== form.confirm
                        ? "#ef4444"
                        : undefined
                  }}
                />
                <button
                  type="button"
                  className="rg-inp-eye"
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  {showConfirm ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {form.confirm && form.password !== form.confirm && (
                <p className="rg-field-err">Password tidak cocok</p>
              )}
            </div>

            {error && <div className="rg-error">⚠ {error}</div>}
            {success && <div className="rg-success">✓ {success}</div>}

            <button
              className="rg-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <span className="rg-dots">
                  <span className="rg-dot" style={{ animationDelay: "0s" }} />
                  <span
                    className="rg-dot"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <span className="rg-dot" style={{ animationDelay: "0.3s" }} />
                </span>
              ) : (
                "Buat Akun Sekarang"
              )}
            </button>

            <p className="rg-foot">
              Sudah punya akun? <Link href="/login">Masuk di sini</Link>
            </p>
            <p className="rg-terms">
              Dengan mendaftar kamu menyetujui{" "}
              <a href="#">Syarat & Ketentuan</a> kami
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
