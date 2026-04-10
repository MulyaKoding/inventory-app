"use client"

import { useState, useEffect, useCallback } from "react"
import { Box } from "@mui/material"

interface Provinsi {
  Kd_Provinsi: string
  NamaProvinsi: string
}
interface Kota {
  Kd_Kota: string
  NamaKota: string
}
interface Kecamatan {
  Kd_Kecamatan: string
  NamaKecamatan: string
}
interface Kelurahan {
  Kd_Kelurahan: string
  NamaKelurahan: string
  KodePos?: string
}

export interface LocationValue {
  provinsiKd: string
  provinsiNama: string
  kotaKd: string
  kotaNama: string
  kecamatanKd: string
  kecamatanNama: string
  kelurahanKd: string
  kelurahanNama: string
  kodePos: string
}

interface LocationSelectorProps {
  value: LocationValue
  onChange: (val: LocationValue) => void
  errors?: Partial<Record<keyof LocationValue, string>>
  isDark: boolean
  p: {
    border: string
    textPrimary: string
    textMuted: string
  }
}

const BASE = "https://api.klinikme.com/api/v1"

function toTitle(s: string) {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function LocationSelector({
  value,
  onChange,
  errors = {},
  isDark,
  p
}: LocationSelectorProps) {
  const [provinsiList, setProvinsiList] = useState<Provinsi[]>([])
  const [kotaList, setKotaList] = useState<Kota[]>([])
  const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([])
  const [kelurahanList, setKelurahanList] = useState<Kelurahan[]>([])

  const [loadingProv, setLoadingProv] = useState(false)
  const [loadingKota, setLoadingKota] = useState(false)
  const [loadingKec, setLoadingKec] = useState(false)
  const [loadingKel, setLoadingKel] = useState(false)

  // ── Fetch Provinsi on mount ─────────────────────────────────────────────────
  useEffect(() => {
    setLoadingProv(true)
    fetch(`${BASE}/data_provinsi`)
      .then((r) => r.json())
      .then((d) => setProvinsiList(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingProv(false))
  }, [])

  // ── Fetch Kota when provinsi changes ───────────────────────────────────────
  useEffect(() => {
    if (!value.provinsiKd) {
      setKotaList([])
      setKecamatanList([])
      setKelurahanList([])
      return
    }
    setLoadingKota(true)
    setKotaList([])
    setKecamatanList([])
    setKelurahanList([])
    fetch(`${BASE}/data_kota?provinsi=${value.provinsiKd}`)
      .then((r) => r.json())
      .then((d) => setKotaList(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingKota(false))
  }, [value.provinsiKd])

  // ── Fetch Kecamatan when kota changes ──────────────────────────────────────
  useEffect(() => {
    if (!value.kotaKd) {
      setKecamatanList([])
      setKelurahanList([])
      return
    }
    setLoadingKec(true)
    setKecamatanList([])
    setKelurahanList([])
    fetch(`${BASE}/data_kecamatan?kota=${value.kotaKd}`)
      .then((r) => r.json())
      .then((d) => setKecamatanList(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingKec(false))
  }, [value.kotaKd])

  // ── Fetch Kelurahan when kecamatan changes ─────────────────────────────────
  useEffect(() => {
    if (!value.kecamatanKd) {
      setKelurahanList([])
      return
    }
    setLoadingKel(true)
    setKelurahanList([])
    fetch(`${BASE}/data_kelurahan?kecamatan=${value.kecamatanKd}`)
      .then((r) => r.json())
      .then((d) => setKelurahanList(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingKel(false))
  }, [value.kecamatanKd])

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleProvinsi = (kd: string) => {
    const nama =
      provinsiList.find((x) => x.Kd_Provinsi === kd)?.NamaProvinsi ?? ""
    onChange({
      ...value,
      provinsiKd: kd,
      provinsiNama: toTitle(nama),
      kotaKd: "",
      kotaNama: "",
      kecamatanKd: "",
      kecamatanNama: "",
      kelurahanKd: "",
      kelurahanNama: "",
      kodePos: ""
    })
  }

  const handleKota = (kd: string) => {
    const nama = kotaList.find((x) => x.Kd_Kota === kd)?.NamaKota ?? ""
    onChange({
      ...value,
      kotaKd: kd,
      kotaNama: toTitle(nama),
      kecamatanKd: "",
      kecamatanNama: "",
      kelurahanKd: "",
      kelurahanNama: "",
      kodePos: ""
    })
  }

  const handleKecamatan = (kd: string) => {
    const nama =
      kecamatanList.find((x) => x.Kd_Kecamatan === kd)?.NamaKecamatan ?? ""
    onChange({
      ...value,
      kecamatanKd: kd,
      kecamatanNama: toTitle(nama),
      kelurahanKd: "",
      kelurahanNama: "",
      kodePos: ""
    })
  }

  const handleKelurahan = (kd: string) => {
    const item = kelurahanList.find((x) => x.Kd_Kelurahan === kd)
    const nama = item?.NamaKelurahan ?? ""
    const pos = item?.KodePos ?? value.kodePos
    onChange({
      ...value,
      kelurahanKd: kd,
      kelurahanNama: toTitle(nama),
      kodePos: pos
    })
  }

  // ── Shared select style ────────────────────────────────────────────────────
  const sel = (hasError: boolean, disabled: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "10px 12px",
    borderRadius: 6,
    border: `1px solid ${hasError ? "#ef4444" : disabled ? (isDark ? "#1a1a1a" : "#f0f0f0") : p.border}`,
    background: disabled
      ? isDark
        ? "#0d0d0d"
        : "#f8fafc"
      : isDark
        ? "#111"
        : "#fff",
    color: disabled ? p.textMuted : p.textPrimary,
    fontFamily: "'Nunito', sans-serif",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box" as const,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    transition: "border-color 0.2s, opacity 0.2s",
    appearance: "auto" as any
  })

  const label = (text: string, loading: boolean) => (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 700,
        color: "#64748b",
        marginBottom: 6,
        fontFamily: "'Nunito', sans-serif"
      }}
    >
      {text}
      {loading && (
        <span
          style={{
            width: 10,
            height: 10,
            border: "1.5px solid #1e3a8a",
            borderTopColor: "transparent",
            borderRadius: "50%",
            display: "inline-block",
            animation: "lspin 0.7s linear infinite"
          }}
        />
      )}
    </label>
  )

  const errText = (msg?: string) =>
    msg ? (
      <p
        style={{
          fontSize: 11,
          color: "#ef4444",
          marginTop: 4,
          fontFamily: "'Nunito', sans-serif"
        }}
      >
        {msg}
      </p>
    ) : null

  return (
    <>
      <style>{`@keyframes lspin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* Row 1: Provinsi + Kota */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: { xs: 2, sm: 2.5 }
        }}
      >
        {/* Provinsi */}
        <div>
          {label("PROVINSI *", loadingProv)}
          <select
            value={value.provinsiKd}
            onChange={(e) => handleProvinsi(e.target.value)}
            disabled={loadingProv}
            style={sel(!!errors.provinsiKd, loadingProv)}
          >
            <option value="">
              {loadingProv ? "Memuat..." : "Pilih provinsi"}
            </option>
            {provinsiList.map((p) => (
              <option key={p.Kd_Provinsi} value={p.Kd_Provinsi}>
                {toTitle(p.NamaProvinsi)}
              </option>
            ))}
          </select>
          {errText(errors.provinsiKd)}
        </div>

        {/* Kota / Kabupaten */}
        <div>
          {label("KOTA / KABUPATEN *", loadingKota)}
          <select
            value={value.kotaKd}
            onChange={(e) => handleKota(e.target.value)}
            disabled={!value.provinsiKd || loadingKota}
            style={sel(!!errors.kotaKd, !value.provinsiKd || loadingKota)}
          >
            <option value="">
              {!value.provinsiKd
                ? "Pilih provinsi dulu"
                : loadingKota
                  ? "Memuat..."
                  : "Pilih kota / kabupaten"}
            </option>
            {kotaList.map((k) => (
              <option key={k.Kd_Kota} value={k.Kd_Kota}>
                {toTitle(k.NamaKota)}
              </option>
            ))}
          </select>
          {errText(errors.kotaKd)}
        </div>
      </Box>

      {/* Row 2: Kecamatan + Kelurahan */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: { xs: 2, sm: 2.5 },
          mt: { xs: 2, sm: 2.5 }
        }}
      >
        {/* Kecamatan */}
        <div>
          {label("KECAMATAN *", loadingKec)}
          <select
            value={value.kecamatanKd}
            onChange={(e) => handleKecamatan(e.target.value)}
            disabled={!value.kotaKd || loadingKec}
            style={sel(!!errors.kecamatanKd, !value.kotaKd || loadingKec)}
          >
            <option value="">
              {!value.kotaKd
                ? "Pilih kota dulu"
                : loadingKec
                  ? "Memuat..."
                  : "Pilih kecamatan"}
            </option>
            {kecamatanList.map((k) => (
              <option key={k.Kd_Kecamatan} value={k.Kd_Kecamatan}>
                {toTitle(k.NamaKecamatan)}
              </option>
            ))}
          </select>
          {errText(errors.kecamatanKd)}
        </div>

        {/* Kelurahan / Desa */}
        <div>
          {label("KELURAHAN / DESA *", loadingKel)}
          <select
            value={value.kelurahanKd}
            onChange={(e) => handleKelurahan(e.target.value)}
            disabled={!value.kecamatanKd || loadingKel}
            style={sel(!!errors.kelurahanKd, !value.kecamatanKd || loadingKel)}
          >
            <option value="">
              {!value.kecamatanKd
                ? "Pilih kecamatan dulu"
                : loadingKel
                  ? "Memuat..."
                  : "Pilih kelurahan / desa"}
            </option>
            {kelurahanList.map((k) => (
              <option key={k.Kd_Kelurahan} value={k.Kd_Kelurahan}>
                {toTitle(k.NamaKelurahan)}
              </option>
            ))}
          </select>
          {errText(errors.kelurahanKd)}
        </div>
      </Box>

      {/* Kode Pos — user input manual */}
      <Box sx={{ mt: { xs: 2, sm: 2.5 }, maxWidth: { xs: "100%", sm: 200 } }}>
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 700,
            color: "#64748b",
            marginBottom: 6,
            fontFamily: "'Nunito', sans-serif"
          }}
        >
          KODE POS
        </label>
        <input
          type="text"
          placeholder="Isi kode pos"
          maxLength={5}
          value={value.kodePos}
          onChange={(e) =>
            onChange({ ...value, kodePos: e.target.value.replace(/\D/g, "") })
          }
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 6,
            border: `1px solid ${p.border}`,
            background: isDark ? "#111" : "#fff",
            color: p.textPrimary,
            fontFamily: "'Nunito', sans-serif",
            fontSize: 14,
            outline: "none",
            boxSizing: "border-box"
          }}
        />
      </Box>
    </>
  )
}
