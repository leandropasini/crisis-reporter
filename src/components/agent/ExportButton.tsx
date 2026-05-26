import { useState, useRef, useEffect } from "react";
import { exportGeoJSON, exportCSV, type ExportRow, type ExportFilters } from "../../services/export";

interface Props {
  crisisId: string;
  filters: ExportFilters;
  rows: ExportRow[];   // already-filtered fallback rows
}

type Format = "geojson" | "csv";

const OPTIONS: Array<{ fmt: Format; label: string; ext: string }> = [
  { fmt: "geojson", label: "Export GeoJSON", ext: ".geojson" },
  { fmt: "csv",     label: "Export CSV",     ext: ".csv" },
];

export default function ExportButton({ crisisId, filters, rows }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<Format | null>(null);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
    } catch (err) {
      setError(fmt === "geojson" ? "GeoJSON export failed" : "CSV export failed");
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
          gap: 6,
          padding: "7px 12px",
          borderRadius: 8,
          border: "1px solid #2a2a28",
          background: open ? "#1e1e1c" : "transparent",
          color: loading ? "#6b6b68" : "#a8a8a5",
          fontSize: 12,
          cursor: loading ? "not-allowed" : "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {loading ? (
          <>
            <span style={{ fontSize: 10, animation: "spin 1s linear infinite" }}>⟳</span>
            Exporting…
          </>
        ) : (
          <>
            <span style={{ fontSize: 11 }}>↓</span>
            Export ▾
          </>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          right: 0,
          width: 160,
          background: "#1e1e1c",
          border: "1px solid #2a2a28",
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
                color: "#f5f5f4",
                fontSize: 12,
                cursor: "pointer",
                borderBottom: "1px solid #2a2a28",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#2a2a28")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <span style={{ color: "#6b6b68", fontSize: 10, display: "block", marginBottom: 1 }}>
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
          background: "#e8404022",
          border: "1px solid #e8404055",
          borderRadius: 6,
          padding: "5px 10px",
          fontSize: 11,
          color: "#e84040",
          whiteSpace: "nowrap",
          zIndex: 2000,
        }}>
          {error}
        </p>
      )}
    </div>
  );
}
