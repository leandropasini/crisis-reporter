import { useState } from "react";
import { useTranslation } from "react-i18next";
import { exportCSV, exportGeoJSON, type ExportFilters, type ExportRow } from "../../services/export";

interface Props {
  crisisId?: string;
  filters: ExportFilters;
  rows: ExportRow[];
}

const buttonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  flex: 1,
  padding: "0 12px",
  minHeight: "var(--min-touch)",
  borderRadius: 14,
  border: "1px solid var(--cr-border)",
  background: "var(--cr-surface)",
  color: "var(--cr-text)",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

export default function ExportButton({ crisisId, filters, rows }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<"csv" | "geojson" | null>(null);
  const [error, setError] = useState<"csv" | "geojson" | null>(null);

  async function handleExport(format: "csv" | "geojson") {
    if (!crisisId) return;
    setError(null);
    setLoading(format);
    try {
      if (format === "csv") {
        await exportCSV(crisisId, filters, rows);
      } else {
        await exportGeoJSON(crisisId, filters, rows);
      }
    } catch {
      setError(format);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => handleExport("csv")}
          disabled={loading !== null || !crisisId}
          style={buttonStyle}
        >
          <span style={{ fontSize: 11 }}>↓</span>
          {loading === "csv" ? t("export.exporting") : t("export.csv")}
        </button>
        <button
          type="button"
          onClick={() => handleExport("geojson")}
          disabled={loading !== null || !crisisId}
          style={buttonStyle}
        >
          <span style={{ fontSize: 11 }}>↓</span>
          {loading === "geojson" ? t("export.exporting") : t("export.geojson")}
        </button>
      </div>
      {error && (
        <span style={{ fontSize: 12, color: "var(--cr-severe)" }}>
          {error === "csv" ? t("export.error_csv") : t("export.error_geojson")}
        </span>
      )}
    </div>
  );
}
