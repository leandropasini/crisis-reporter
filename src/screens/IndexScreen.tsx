import LanguageSelector from "../components/LanguageSelector";

interface Props {
  onSelectCitizen: () => void;
  onSelectAgent: () => void;
  onSelectMap: () => void;
}

const CARDS = [
  {
    id: "citizen",
    icon: "ti-building-community",
    iconBg: "rgba(239,68,68,0.12)",
    iconColor: "#EF4444",
    title: "I'm reporting damage",
    desc: "Report building damage in your area",
  },
  {
    id: "map",
    icon: "ti-map-2",
    iconBg: "rgba(34,197,94,0.1)",
    iconColor: "#22C55E",
    title: "View community map",
    desc: "See what neighbors are reporting",
  },
  {
    id: "agent",
    icon: "ti-layout-dashboard",
    iconBg: "rgba(96,165,250,0.12)",
    iconColor: "#60A5FA",
    title: "Agent dashboard",
    desc: "Coordinate field response",
  },
] as const;

export default function IndexScreen({ onSelectCitizen, onSelectAgent, onSelectMap }: Props) {
  const handlers: Record<string, () => void> = {
    citizen: onSelectCitizen,
    map: onSelectMap,
    agent: onSelectAgent,
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        background: "var(--cr-bg)",
        color: "var(--cr-text)",
        userSelect: "none",
      }}
    >
      {/* Topbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--cr-label)",
            fontWeight: 600,
          }}
        >
          UN Crisis Reporter
        </span>
        <LanguageSelector variant="inline" />
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          padding: "8px 20px 24px",
          gap: 24,
        }}
      >
        {/* Active crisis badge + city */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "5px 12px",
                borderRadius: 20,
                background: "var(--cr-primary-dim)",
                border: "1px solid rgba(232,130,58,0.3)",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--cr-primary)",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--cr-primary)",
                  animation: "pulse-dot 1.6s ease-in-out infinite",
                  flexShrink: 0,
                }}
              />
              Active crisis
            </span>
          </div>

          <div>
            <h1
              style={{
                fontSize: 38,
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "var(--cr-text)",
              }}
            >
              Porto Alegre
            </h1>
            <p style={{ fontSize: 16, color: "var(--cr-label)", marginTop: 4 }}>
              RS Floods 2024
            </p>
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {CARDS.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={handlers[card.id]}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: 20,
                borderRadius: 18,
                background: "var(--cr-surface)",
                border: "1px solid var(--cr-border)",
                textAlign: "left",
                cursor: "pointer",
                transition: "opacity 0.15s",
              }}
              onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.8"; }}
              onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
            >
              {/* Icon */}
              <span
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: card.iconBg,
                  color: card.iconColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <i className={`ti ${card.icon}`} style={{ fontSize: 24 }} />
              </span>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "var(--font-title)",
                    fontWeight: 700,
                    color: "var(--cr-text)",
                    marginBottom: 3,
                  }}
                >
                  {card.title}
                </p>
                <p style={{ fontSize: "var(--font-label)", color: "var(--cr-label)", lineHeight: 1.4 }}>
                  {card.desc}
                </p>
              </div>

              {/* Chevron */}
              <i
                className="ti ti-chevron-right"
                style={{ fontSize: 18, color: "var(--cr-label)", flexShrink: 0 }}
              />
            </button>
          ))}
        </div>

        {/* Footer */}
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.25)",
            textAlign: "center",
          }}
        >
          No account needed to report damage
        </p>
      </div>
    </div>
  );
}
