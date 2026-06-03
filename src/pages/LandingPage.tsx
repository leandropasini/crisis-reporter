import { useNavigate } from "react-router-dom";
import { IconPlayerPlay, IconDeviceMobile } from "@tabler/icons-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
        background: "var(--cr-bg)",
        color: "var(--cr-text)",
        padding: "32px 20px",
        gap: 40,
      }}
    >
      {/* Title block */}
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--cr-text)", margin: 0 }}>
          UN Crisis Reporter
        </h1>
        <p style={{ fontSize: 15, color: "var(--cr-label)", marginTop: 8 }}>
          Damage & crisis reporting
        </p>
      </div>

      {/* Cards */}
      <div
        className="landing-cards"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          width: "100%",
          maxWidth: 560,
        }}
      >
        {/* Demo card */}
        <button
          type="button"
          onClick={() => navigate("/demo")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "22px 20px",
            borderRadius: 20,
            background: "var(--cr-surface)",
            border: "1px solid var(--cr-border)",
            cursor: "pointer",
            textAlign: "left",
            transition: "opacity 0.15s",
            outline: "none",
            boxShadow: "none",
          }}
          onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.75"; }}
          onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
        >
          <span
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "rgba(232,130,58,0.12)",
              color: "var(--cr-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconPlayerPlay size={26} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 17, fontWeight: 700, color: "var(--cr-text)", margin: 0 }}>
              Watch the Demo
            </p>
            <p style={{ fontSize: 13, color: "var(--cr-label)", marginTop: 3 }}>
              Porto Alegre · RS Floods 2024
            </p>
          </div>
        </button>

        {/* Live card */}
        <button
          type="button"
          onClick={() => navigate("/app")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "22px 20px",
            borderRadius: 20,
            background: "var(--cr-primary-dim)",
            border: "1px solid var(--cr-primary)",
            cursor: "pointer",
            textAlign: "left",
            transition: "opacity 0.15s",
            outline: "none",
            boxShadow: "none",
          }}
          onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.75"; }}
          onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
        >
          <span
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "rgba(232,130,58,0.2)",
              color: "var(--cr-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconDeviceMobile size={26} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 17, fontWeight: 700, color: "var(--cr-text)", margin: 0 }}>
              Try the App
            </p>
            <p style={{ fontSize: 13, color: "var(--cr-label)", marginTop: 3 }}>
              Test with your real location
            </p>
          </div>
        </button>
      </div>

      {/* Footer */}
      <p
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.25)",
          textAlign: "center",
          margin: 0,
        }}
      >
        Built for UNDP · Crisis Mapping Challenge 2024
      </p>
    </div>
  );
}
