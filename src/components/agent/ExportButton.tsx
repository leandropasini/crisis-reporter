import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { exportGeoJSON, exportCSV, type ExportRow, type ExportFilters } from "../../services/export";

interface Props {
  crisisId: string;
  filters: ExportFilters;
  rows: ExportRow[];   // already-filtered fallback rows
}

type Format = "geojson" | "csv";

export default function ExportButton({ crisisId, filters, rows }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<Format | null>(null);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const OPTIONS: Array<{ fmt: Format; label: string; ext: string }> = [
    { fmt: "geojson", label: t("export.geojson"), ext: ".geojson" },
    { fmt: "csv",     label: t("export.csv"),     ext: ".csv" },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function handleExport(fmt: Format) {
    setOpen(false);
    setLoading(fmt);
    setError(null);
    try {
      if (fmt === "geojson") {
        await exportGeoJSON(crisisId, filters, rows);
      } else {
        await exportCSV(crisisId, filters, rows);
      }
    } catch {
      setError(fmt === "geojson" ? t("export.error_geojson") : t("export.error_csv"));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={loading !== null}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          width: "100%",
          padding: "0 12px",
          minHeight: "var(--min-touch)",
          borderRadius: 14,
          border: "1px solid var(--cr-border)",
          background: open ? "var(--cr-surface2)" : "var(--cr-surface)",
          color: loading ? "var(--cr-label)" : "var(--cr-text)",
          fontSize: 14,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {loading ? (
          <>
            <span style={{ fontSize: 10, animation: "spin 1s linear infinite" }}>⟳</span>
            {t("export.exporting")}
          </>
        ) : (
          <>
            <span style={{ fontSize: 11 }}>↓</span>
            {t("export.button")}
          </>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          right: 0,
          width: 160,
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
          borderRadius: 8,
          overflow: "hidden",
          zIndex: 2000,
          boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
        }}>
          {OPTIONS.map((opt) => (
            <button
              key={opt.fmt}
              type="button"
              onClick={() => handleExport(opt.fmt)}
              style={{
                display: "block",
                width: "100%",
                padding: "9px 14px",
                textAlign: "left",
                background: "none",
                border: "none",
                color: "var(--color-text-primary)",
                fontSize: 12,
                cursor: "pointer",
                borderBottom: "1px solid var(--color-border)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-border)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <span style={{ color: "var(--color-text-muted)", fontSize: 10, display: "block", marginBottom: 1 }}>
                {opt.ext}
              </span>
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          right: 0,
          background: "color-mix(in srgb, var(--color-critical) 13%, transparent)",
          border: "1px solid color-mix(in srgb, var(--color-critical) 33%, transparent)",
          borderRadius: 6,
          padding: "5px 10px",
          fontSize: 11,
          color: "var(--color-critical)",
          whiteSpace: "nowrap",
          zIndex: 2000,
        }}>
          {error}
        </p>
      )}
    </div>
  );
}
