import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../../services/supabase";
import type { DisasterType } from "../../types/schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const NATURE_OPTIONS: { label: string; value: DisasterType }[] = [
  { label: "Flood",      value: "flood" },
  { label: "Earthquake", value: "earthquake" },
  { label: "Hurricane",  value: "hurricane" },
  { label: "Landslide",  value: "landslide" },
  { label: "Fire",       value: "fire" },
  { label: "Drought",    value: "drought" },
];

const SUBTYPE_MAP: Record<string, string> = {
  flood:      "flood",
  earthquake: "earthquake",
  hurricane:  "hurricane_cyclone",
  landslide:  "landslide",
  fire:       "wildfire",
  drought:    "drought",
};

interface Props {
  onActivate: (crisisId: string) => void;
}

export default function CrisisSetupScreen({ onActivate }: Props) {
  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [disasterType, setDisasterType] = useState<DisasterType | "">("");
  const [city, setCity]               = useState("");
  const [lat, setLat]                 = useState<number | null>(null);
  const [lng, setLng]                 = useState<number | null>(null);
  const [gpsStatus, setGpsStatus]     = useState<"loading" | "ok" | "denied">("loading");
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [startDate] = useState(() => new Date().toLocaleDateString("en-CA")); // pinned at mount

  useEffect(() => {
    const ac = new AbortController();

    if (!navigator.geolocation) {
      setGpsStatus("denied");
      setLat(0);
      setLng(0);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);
        setGpsStatus("ok");
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { signal: ac.signal }
          );
          const data = await res.json();
          const addr = data.address ?? {};
          setCity(addr.city || addr.town || addr.village || data.display_name || "");
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError") return;
          // city stays empty, user can type
        }
      },
      () => {
        setGpsStatus("denied");
        setLat(0);
        setLng(0);
      },
      { timeout: 10_000 }
    );

    return () => ac.abort();
  }, []);

  const canSubmit =
    name.trim().length > 0 &&
    description.trim().length > 0 &&
    disasterType !== "" &&
    gpsStatus !== "loading";

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    if (!isSupabaseConfigured) {
      setSubmitError("Supabase not configured.");
      setSubmitting(false);
      return;
    }

    try {
      const id = crypto.randomUUID();
      const { error } = await db
        .from("crises")
        .insert({
          id,
          name:          name.trim(),
          description:   description.trim(),
          nature:        "natural",
          subtype:       SUBTYPE_MAP[disasterType],
          disaster_type: disasterType,
          location_name: city.trim() || "Unknown",
          bbox_sw_lat:   lat ?? 0,
          bbox_sw_lng:   lng ?? 0,
          bbox_ne_lat:   lat ?? 0,
          bbox_ne_lng:   lng ?? 0,
          started_at:    new Date().toISOString(),
          status:        "active",
        });

      if (error) throw error;
      onActivate(id);
    } catch (err: unknown) {
      console.error('Crisis insert error:', err);
      const e = err as Record<string, unknown>;
      const errorMessage = (e?.message as string) || (e?.details as string) || (e?.hint as string) || JSON.stringify(err);
      setSubmitError(`Failed to create crisis: ${errorMessage}`);
      setSubmitting(false);
    }
  }

  const latDisplay = lat !== null ? lat.toFixed(6) : "—";
  const lngDisplay = lng !== null ? lng.toFixed(6) : "—";

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--cr-surface)",
    border: "1px solid var(--cr-border)",
    borderRadius: 12,
    color: "var(--cr-text)",
    fontSize: 16,
    padding: "14px 16px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const readonlyBoxStyle: React.CSSProperties = {
    background: "var(--cr-surface2)",
    border: "1px solid var(--cr-border)",
    borderRadius: 12,
    padding: "14px 16px",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "var(--cr-label)",
    fontWeight: 700,
    marginBottom: 8,
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--cr-bg)",
        color: "var(--cr-text)",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "48px 24px 24px",
          borderBottom: "1px solid var(--cr-border)",
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "var(--cr-primary)",
            fontWeight: 700,
            margin: "0 0 8px",
          }}
        >
          Crisis Reporter · LIVE
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>
          Activate Crisis
        </h1>
        <p style={{ fontSize: 14, color: "var(--cr-label)", marginTop: 6, marginBottom: 0 }}>
          Configure the crisis before the Agent Dashboard loads.
        </p>
      </div>

      {/* Form */}
      <div
        style={{
          flex: 1,
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
          maxWidth: 560,
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {/* Crisis name */}
        <div>
          <label style={labelStyle}>Crisis name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. RS Floods 2024"
            maxLength={120}
            style={inputStyle}
          />
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>
            Crisis description *{" "}
            <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
              {description.length}/280
            </span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 280))}
            placeholder="Brief description of the ongoing situation"
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        {/* Nature of crisis */}
        <div>
          <label style={labelStyle}>Nature of crisis *</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {NATURE_OPTIONS.map((opt) => {
              const active = disasterType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDisasterType(opt.value)}
                  style={{
                    padding: "12px 20px",
                    borderRadius: 24,
                    border: `1px solid ${active ? "var(--cr-primary)" : "var(--cr-border)"}`,
                    background: active ? "var(--cr-primary-dim)" : "var(--cr-surface)",
                    color: active ? "var(--cr-primary)" : "var(--cr-label)",
                    fontSize: 14,
                    fontWeight: active ? 700 : 400,
                    cursor: "pointer",
                    minHeight: "var(--min-touch)",
                    transition: "all 0.15s",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* City */}
        <div>
          <label style={labelStyle}>
            City{" "}
            {gpsStatus === "loading" && (
              <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                — detecting…
              </span>
            )}
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={gpsStatus === "denied" ? "Enter city name" : "Detecting…"}
            style={inputStyle}
          />
        </div>

        {/* Coordinates */}
        <div>
          <label style={labelStyle}>Coordinates (auto-filled)</label>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ ...readonlyBoxStyle, flex: 1 }}>
              <p style={{ fontSize: 11, color: "var(--cr-label)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Lat
              </p>
              <p style={{ fontSize: 16, color: "var(--cr-text)", margin: 0 }}>{latDisplay}</p>
            </div>
            <div style={{ ...readonlyBoxStyle, flex: 1 }}>
              <p style={{ fontSize: 11, color: "var(--cr-label)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Lng
              </p>
              <p style={{ fontSize: 16, color: "var(--cr-text)", margin: 0 }}>{lngDisplay}</p>
            </div>
          </div>
        </div>

        {/* Start date */}
        <div>
          <label style={labelStyle}>Start date</label>
          <div style={readonlyBoxStyle}>
            <p style={{ fontSize: 16, color: "var(--cr-text)", margin: 0 }}>{startDate}</p>
          </div>
        </div>

        {/* Submit error */}
        {submitError && (
          <p style={{ color: "var(--cr-critical)", fontSize: 14, margin: 0 }}>
            {submitError}
          </p>
        )}

        {/* Submit button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: 14,
            border: "none",
            background:
              canSubmit && !submitting ? "var(--cr-primary)" : "var(--cr-surface2)",
            color:
              canSubmit && !submitting ? "#fff" : "var(--cr-label)",
            fontSize: 16,
            fontWeight: 700,
            cursor: canSubmit && !submitting ? "pointer" : "default",
            minHeight: "var(--min-touch)",
            transition: "all 0.2s",
            marginBottom: 32,
          }}
        >
          {submitting ? "Activating…" : "Activate Crisis"}
        </button>
      </div>
    </div>
  );
}
