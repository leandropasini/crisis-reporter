import { useState } from "react";
import { useTranslation } from "react-i18next";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Props {
  crisisId?: string;
  filters?: unknown;
  rows?: unknown[];
}

const FEATURES = [
  { type: "Feature", geometry: { type: "Point", coordinates: [-51.2330, -30.0346] }, properties: { id: "HPS-001", name: "Hospital de Pronto Socorro — Humaitá", type: "community", damage: "complete", confidence: 0.80, reported: "2024-05-15T08:30:00Z" } },
  { type: "Feature", geometry: { type: "Point", coordinates: [-51.2180, -30.0280] }, properties: { id: "HPS-002", name: "Hospital de Pronto Socorro", type: "community", damage: "complete", confidence: 0.75, reported: "2024-05-15T09:00:00Z" } },
  { type: "Feature", geometry: { type: "Point", coordinates: [-51.2190, -30.0310] }, properties: { id: "ESC-001", name: "Escola Est. Senador Pasqualini", type: "community", damage: "complete", confidence: 0.70, reported: "2024-05-15T10:00:00Z" } },
  { type: "Feature", geometry: { type: "Point", coordinates: [-51.2210, -30.0310] }, properties: { id: "RES-001", name: "Residência Rua Humaitá 142", type: "residential", damage: "complete", confidence: 0.30, reported: "2024-05-15T06:00:00Z" } },
  { type: "Feature", geometry: { type: "Point", coordinates: [-51.2290, -30.0350] }, properties: { id: "SUB-001", name: "Subestação Navegantes", type: "utility", damage: "complete", confidence: 0.30, reported: "2024-05-15T11:00:00Z" } },
];

const CSV_ROWS = [
  "id,name,type,damage,confidence,latitude,longitude,reported",
  "HPS-001,Hospital de Pronto Socorro — Humaitá,community,complete,0.80,-30.0346,-51.2330,2024-05-15T08:30:00Z",
  "HPS-002,Hospital de Pronto Socorro,community,complete,0.75,-30.0280,-51.2180,2024-05-15T09:00:00Z",
  "ESC-001,Escola Est. Senador Pasqualini,community,complete,0.70,-30.0310,-51.2190,2024-05-15T10:00:00Z",
  "RES-001,Residência Rua Humaitá 142,residential,complete,0.30,-30.0310,-51.2210,2024-05-15T06:00:00Z",
  "SUB-001,Subestação Navegantes,utility,complete,0.30,-30.0350,-51.2290,2024-05-15T11:00:00Z",
].join("\n");

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ExportButton(_props: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  function handleExport() {
    setLoading(true);
    const geojson = JSON.stringify({
      type: "FeatureCollection",
      crisis: "RS Floods 2024",
      location: "Porto Alegre, Rio Grande do Sul",
      exported_at: new Date().toISOString(),
      features: FEATURES,
    }, null, 2);

    triggerDownload(geojson, "crisis-reporter-porto-alegre.geojson", "application/geo+json");
    setTimeout(() => {
      triggerDownload(CSV_ROWS, "crisis-reporter-porto-alegre.csv", "text/csv;charset=utf-8;");
      setLoading(false);
    }, 50);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
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
        background: "var(--cr-surface)",
        color: "var(--cr-text)",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: 11 }}>↓</span>
      {loading ? t("export.exporting") : t("export.button")}
    </button>
  );
}
