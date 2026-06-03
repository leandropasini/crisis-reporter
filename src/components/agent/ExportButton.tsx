import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { exportGeoJSON, exportCSV, type ExportRow, type ExportFilters } from "../../services/export";

interface Props {
  crisisId: string;
  filters: ExportFilters;
  rows: ExportRow[];
}

type Format = "geojson" | "csv";

export default function ExportButton({ crisisId, filters, rows }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<Format | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const OPTIONS: Array<{ fmt: Format; label: string; ext: string }> = [
    { fmt: "geojson", label: t("export.geojson"), ext: ".geojson" },
    { fmt: "csv",     label: t("export.csv"),     ext: ".csv" },
  ];

  function handleToggle() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setOpen((v) => !v);
  }

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      const target = e.target as Node;
      if (buttonRef.current && !buttonRef.current.contains(target)) {
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
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
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
          position: "fixed",
          top: dropdownPos.top,
          left: dropdownPos.left,
          width: Math.max(dropdownPos.width, 160),
          background: "var(--cr-surface)",
          border: "1px solid var(--cr-border)",
          borderRadius: 12,
          overflow: "hidden",
          zIndex: 6000,
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}>
          {OPTIONS.map((opt) => (
            <button
              key={opt.fmt}
              type="button"
              onClick={() => handleExport(opt.fmt)}
              style={{
                display: "block",
                width: "100%",
                padding: "12px 16px",
                textAlign: "left",
                background: "none",
                border: "none",
                color: "var(--cr-text)",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                borderBottom: "1px solid var(--cr-border)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--cr-surface2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <span style={{ color: "var(--cr-label)", fontSize: 11, display: "block", marginBottom: 2 }}>
                {opt.ext}
              </span>
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p style={{
          position: "fixed",
          top: dropdownPos.top,
          left: dropdownPos.left,
          background: "color-mix(in srgb, var(--color-critical) 13%, transparent)",
          border: "1px solid color-mix(in srgb, var(--color-critical) 33%, transparent)",
          borderRadius: 6,
          padding: "5px 10px",
          fontSize: 11,
          color: "var(--color-critical)",
          whiteSpace: "nowrap",
          zIndex: 6000,
        }}>
          {error}
        </p>
      )}
    </>
  );
}
