import { IconLayoutDashboard, IconBuildingCommunity } from "@tabler/icons-react";

interface Props {
  onStartAgent: () => void;
  onStartCitizen: () => void;
}

function markSeen() {
  sessionStorage.setItem("demo_welcome_seen", "1");
}

export default function DemoWelcomeScreen({ onStartAgent, onStartCitizen }: Props) {
  function handleAgent() {
    markSeen();
    onStartAgent();
  }

  function handleCitizen() {
    markSeen();
    onStartCitizen();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 8000,
        background: "rgba(10, 12, 18, 0.97)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px",
        overflowY: "auto",
      }}
    >
      {/* Brand header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div
          style={{
            display: "inline-block",
            background: "var(--color-primary, #f59e0b)",
            color: "#fff",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.18em",
            padding: "3px 10px",
            borderRadius: 20,
            marginBottom: 14,
          }}
        >
          DEMO
        </div>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: "#fff",
            margin: "0 0 8px",
            letterSpacing: "-0.02em",
          }}
        >
          Crisis Reporter
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", margin: 0 }}>
          Porto Alegre RS Floods 2024 — choose a perspective to explore
        </p>
      </div>

      {/* Role cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
          width: "100%",
          maxWidth: 600,
          marginBottom: 40,
        }}
      >
        {/* Agent card */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            padding: "28px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "rgba(96,165,250,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconLayoutDashboard size={24} color="#60A5FA" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
              Agent View
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
              Explore the dashboard, heatmap, and cluster analysis tools used by field coordinators
            </div>
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span>① Open Agent Dashboard</span>
            <span>② Toggle heatmap / clusters</span>
            <span>③ Click a pin for details</span>
          </div>
          <button
            onClick={handleAgent}
            style={{
              marginTop: 8,
              padding: "12px 0",
              background: "#60A5FA",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              minHeight: 48,
            }}
          >
            Open Dashboard →
          </button>
        </div>

        {/* Citizen card */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            padding: "28px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "rgba(239,68,68,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconBuildingCommunity size={24} color="#EF4444" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
              Citizen View
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
              Report building damage as a citizen would — photo, location, classification, and submit
            </div>
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span>① Take or upload a photo</span>
            <span>② Pin your location on the map</span>
            <span>③ Classify damage and submit</span>
          </div>
          <button
            onClick={handleCitizen}
            style={{
              marginTop: 8,
              padding: "12px 0",
              background: "#EF4444",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              minHeight: 48,
            }}
          >
            Report Damage →
          </button>
        </div>
      </div>

      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
        All data is pre-loaded. No real submissions are stored in this demo.
      </p>
    </div>
  );
}
