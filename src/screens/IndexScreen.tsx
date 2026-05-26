import { useTranslation } from "react-i18next";

interface Props {
  onSelectCitizen: () => void;
  onSelectAgent: () => void;
  onSelectMap: () => void;
}

function DamageIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M3 13L14 4l11 9M6 11v11h16V11" />
      <path d="M12 22v-5l2-2M16 22v-4l-2-2M11 12l3 3 3-3" strokeWidth="1.4" />
      <circle cx="22" cy="6" r="4" fill="#e84040" stroke="none" />
      <path d="M22 4v2.5M22 8v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M3 6l8 3 6-3 8 3v16l-8-3-6 3-8-3V6z" />
      <path d="M11 9v16M17 6v16" />
      <circle cx="20" cy="10" r="2.5" fill="currentColor" stroke="none" opacity="0.5" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="14" cy="14" r="11" />
      <path d="M14 3c-4 4-4 14 0 22M14 3c4 4 4 14 0 22" />
      <path d="M3 14h22" />
      <path d="M5 8h18M5 20h18" />
    </svg>
  );
}

function WaveDecoration() {
  return (
    <svg width="100%" height="60" viewBox="0 0 360 60" preserveAspectRatio="none" aria-hidden>
      <path
        d="M0 30 Q45 0 90 30 Q135 60 180 30 Q225 0 270 30 Q315 60 360 30 L360 60 L0 60 Z"
        fill="#f59e0b"
        opacity="0.06"
      />
      <path
        d="M0 40 Q60 10 120 40 Q180 70 240 40 Q300 10 360 40 L360 60 L0 60 Z"
        fill="#e86c2c"
        opacity="0.05"
      />
    </svg>
  );
}

export default function IndexScreen({ onSelectCitizen, onSelectAgent, onSelectMap }: Props) {
  const { t } = useTranslation();

  return (
    <div
      className="flex flex-col h-screen select-none"
      style={{ background: "#0a0a09", color: "#f5f5f4" }}
    >
      {/* Top wave / flood visual */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, pointerEvents: "none" }}>
        <WaveDecoration />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">

        {/* Logo block */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 mb-3">
            {/* Alert / crisis icon */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
              <path
                d="M11 2L2 19h18L11 2z"
                fill="#f59e0b22"
                stroke="#f59e0b"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M11 9v4M11 15.5v.5" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#6b6b68",
                fontWeight: 500,
              }}
            >
              Crisis Reporter
            </span>
          </div>

          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#f5f5f4",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            Porto Alegre
          </h1>
          <p style={{ fontSize: 13, color: "#a8a8a5", letterSpacing: "0.02em" }}>
            RS Floods 2024
          </p>
        </div>

        {/* Cards */}
        <div className="w-full max-w-sm flex flex-col gap-3">

          {/* Citizen card */}
          <button
            type="button"
            onClick={onSelectCitizen}
            className="w-full text-left rounded-2xl active:scale-[0.98] transition-transform"
            style={{
              background: "#1e1e1c",
              border: "1px solid #e86c2c44",
              padding: "20px 22px",
            }}
          >
            <div className="flex items-start gap-4">
              <span
                className="flex-none mt-0.5 flex items-center justify-center rounded-xl"
                style={{
                  width: 48,
                  height: 48,
                  background: "#e86c2c18",
                  color: "#e86c2c",
                }}
              >
                <DamageIcon />
              </span>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#f5f5f4", marginBottom: 3 }}>
                  {t("index.citizen_title")}
                </p>
                <p style={{ fontSize: 12, color: "#6b6b68", lineHeight: 1.5 }}>
                  {t("index.citizen_desc")}
                </p>
              </div>
            </div>
          </button>

          {/* Agent card */}
          <button
            type="button"
            onClick={onSelectAgent}
            className="w-full text-left rounded-2xl active:scale-[0.98] transition-transform"
            style={{
              background: "#1e1e1c",
              border: "1px solid #2a2a28",
              padding: "20px 22px",
            }}
          >
            <div className="flex items-start gap-4">
              <span
                className="flex-none mt-0.5 flex items-center justify-center rounded-xl"
                style={{
                  width: 48,
                  height: 48,
                  background: "#3ecf8e18",
                  color: "#3ecf8e",
                }}
              >
                <MapIcon />
              </span>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#f5f5f4", marginBottom: 3 }}>
                  {t("index.agent_title")}
                </p>
                <p style={{ fontSize: 12, color: "#6b6b68", lineHeight: 1.5 }}>
                  {t("index.agent_desc")}
                </p>
              </div>
            </div>
          </button>

          {/* Community map card */}
          <button
            type="button"
            onClick={onSelectMap}
            className="w-full text-left rounded-2xl active:scale-[0.98] transition-transform"
            style={{
              background: "#1e1e1c",
              border: "1px solid #2a2a28",
              padding: "20px 22px",
            }}
          >
            <div className="flex items-start gap-4">
              <span
                className="flex-none mt-0.5 flex items-center justify-center rounded-xl"
                style={{
                  width: 48,
                  height: 48,
                  background: "#3b82f618",
                  color: "#3b82f6",
                }}
              >
                <GlobeIcon />
              </span>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#f5f5f4", marginBottom: 3 }}>
                  {t("index.map_title")}
                </p>
                <p style={{ fontSize: 12, color: "#6b6b68", lineHeight: 1.5 }}>
                  {t("index.map_desc")}
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom badge */}
      <div className="flex justify-center pb-8">
        <span style={{ fontSize: 10, color: "#2a2a28", letterSpacing: "0.1em" }}>
          UNHCR · OCHA · WFP
        </span>
      </div>
    </div>
  );
}
