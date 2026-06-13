import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { supabase, isSupabaseConfigured } from "../../services/supabase";
import type { DisasterType } from "../../types/schema";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "pt", label: "PT" },
  { code: "es", label: "ES" },
  { code: "fr", label: "FR" },
  { code: "ar", label: "AR" },
  { code: "zh", label: "ZH" },
  { code: "ru", label: "RU" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const NATURE_OPTIONS: { tKey: string; value: DisasterType }[] = [
  { tKey: "setup.type_flood",             value: "flood"             },
  { tKey: "setup.type_earthquake",        value: "earthquake"        },
  { tKey: "setup.type_hurricane",         value: "hurricane"         },
  { tKey: "setup.type_landslide",         value: "landslide"         },
  { tKey: "setup.type_fire",              value: "fire"              },
  { tKey: "setup.type_drought",           value: "drought"           },
  { tKey: "setup.type_tsunami",           value: "tsunami"           },
  { tKey: "setup.type_conflict",          value: "conflict"          },
  { tKey: "setup.type_civil_unrest",      value: "civil_unrest"      },
  { tKey: "setup.type_explosion",         value: "explosion"         },
  { tKey: "setup.type_chemical_incident", value: "chemical_incident" },
];

const SUBTYPE_MAP: Record<string, string> = {
  flood:             "flood",
  earthquake:        "earthquake",
  hurricane:         "hurricane_cyclone",
  landslide:         "landslide",
  fire:              "wildfire",
  drought:           "drought",
  tsunami:           "tsunami",
  conflict:          "conflict",
  civil_unrest:      "civil_unrest",
  explosion:         "explosion",
  chemical_incident: "chemical_incident",
};

function parseCoord(s: string): number | null {
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function isValidLat(n: number | null): boolean {
  return n !== null && n !== 0 && n >= -90 && n <= 90;
}

function isValidLng(n: number | null): boolean {
  return n !== null && n !== 0 && n >= -180 && n <= 180;
}

interface Props {
  onActivate: (crisisId: string) => void;
}

export default function CrisisSetupScreen({ onActivate }: Props) {
  const { t, i18n } = useTranslation();
  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [disasterType, setDisasterType] = useState<DisasterType | "">("");
  const [city, setCity]               = useState("");
  const [lat, setLat]                 = useState<number | null>(null);
  const [lng, setLng]                 = useState<number | null>(null);
  const [latInput, setLatInput]       = useState("");
  const [lngInput, setLngInput]       = useState("");
  const [latError, setLatError]       = useState<string | null>(null);
  const [lngError, setLngError]       = useState<string | null>(null);
  const [gpsStatus, setGpsStatus]     = useState<"loading" | "ok" | "denied">("loading");
  const [manualOverride, setManualOverride] = useState(false);
  const [geoSearching, setGeoSearching]     = useState(false);
  const [geoError, setGeoError]             = useState<string | null>(null);
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [mountDate] = useState(() => new Date());
  const startDateFormatted = useMemo(
    () => mountDate.toLocaleDateString(i18n.language, { dateStyle: "long" }),
    [mountDate, i18n.language]
  );

  const coordsEditable = manualOverride || gpsStatus === "denied";

  useEffect(() => {
    const ac = new AbortController();

    if (!navigator.geolocation) {
      setGpsStatus("denied");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);
        setLatInput(latitude.toFixed(6));
        setLngInput(longitude.toFixed(6));
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
      },
      { timeout: 10_000 }
    );

    return () => ac.abort();
  }, []);

  function handleLanguageChange(code: string) {
    i18n.changeLanguage(code);
    localStorage.setItem("lang", code);
    document.documentElement.lang = code;
    document.documentElement.dir = code === "ar" ? "rtl" : "ltr";
  }

  function handleLatInput(val: string) {
    setLatInput(val);
    setLatError(null);
    const n = parseCoord(val);
    if (val === "" || n === null) {
      setLat(null);
    } else if (!isValidLat(n)) {
      setLatError(t("setup.lat_invalid"));
      setLat(null);
    } else {
      setLat(n);
    }
  }

  function handleLngInput(val: string) {
    setLngInput(val);
    setLngError(null);
    const n = parseCoord(val);
    if (val === "" || n === null) {
      setLng(null);
    } else if (!isValidLng(n)) {
      setLngError(t("setup.lng_invalid"));
      setLng(null);
    } else {
      setLng(n);
    }
  }

  async function handleGeoSearch() {
    const q = city.trim();
    if (!q) return;
    setGeoSearching(true);
    setGeoError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`
      );
      const results = await res.json();
      if (!Array.isArray(results) || results.length === 0) {
        setGeoError(t("setup.geo_no_result"));
        return;
      }
      const { lat: rLat, lon: rLon, display_name } = results[0];
      const latN = parseFloat(rLat);
      const lngN = parseFloat(rLon);
      setLat(latN);
      setLng(lngN);
      setLatInput(latN.toFixed(6));
      setLngInput(lngN.toFixed(6));
      setLatError(null);
      setLngError(null);
      setCity(display_name || q);
    } catch {
      setGeoError(t("setup.geo_error"));
    } finally {
      setGeoSearching(false);
    }
  }

  function handleEditOverride() {
    setManualOverride(true);
    // Pre-fill inputs with current coords for editing
    if (lat !== null) setLatInput(lat.toFixed(6));
    if (lng !== null) setLngInput(lng.toFixed(6));
  }

  const validCoords = isValidLat(lat) && isValidLng(lng);

  const canSubmit =
    name.trim().length > 0 &&
    description.trim().length > 0 &&
    disasterType !== "" &&
    gpsStatus !== "loading" &&
    validCoords;

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
      console.log('[SETUP] inserting crisis with coords:', lat, lng);
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
      setSubmitError(t("setup.error_prefix", { message: errorMessage }));
      setSubmitting(false);
    }
  }

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

  const coordInputStyle = (hasError: boolean): React.CSSProperties => ({
    ...inputStyle,
    border: `1px solid ${hasError ? "var(--cr-critical)" : "var(--cr-border)"}`,
    flex: 1,
  });

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
          {t("setup.badge")}
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>
          {t("setup.title")}
        </h1>
        <p style={{ fontSize: 14, color: "var(--cr-label)", marginTop: 6, marginBottom: 0 }}>
          {t("setup.subtitle")}
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
          <label style={labelStyle}>{t("setup.name_label")}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("setup.name_placeholder")}
            maxLength={120}
            style={inputStyle}
          />
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>
            {t("setup.description_label")}{" "}
            <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
              {description.length}/280
            </span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 280))}
            placeholder={t("setup.description_placeholder")}
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        {/* Nature of crisis */}
        <div>
          <label style={labelStyle}>{t("setup.nature_label")}</label>
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
                  {t(opt.tKey)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Language */}
        <div>
          <label style={labelStyle}>{t("setup.language_label")}</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {LANGUAGES.map((lang) => {
              const active = i18n.language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageChange(lang.code)}
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
                  {lang.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* City */}
        <div>
          <label style={labelStyle}>
            {t("setup.city_label")}{" "}
            {gpsStatus === "loading" && (
              <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                {t("setup.city_detecting")}
              </span>
            )}
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={city}
              onChange={(e) => { setCity(e.target.value); setGeoError(null); }}
              placeholder={gpsStatus === "denied" ? t("setup.city_placeholder_denied") : t("setup.city_placeholder_loading")}
              style={{ ...inputStyle, flex: 1 }}
              onKeyDown={(e) => { if (e.key === "Enter" && coordsEditable) { void handleGeoSearch(); } }}
            />
            {coordsEditable && (
              <button
                type="button"
                onClick={() => { void handleGeoSearch(); }}
                disabled={geoSearching || city.trim().length === 0}
                style={{
                  padding: "0 20px",
                  borderRadius: 12,
                  border: "1px solid var(--cr-border)",
                  background: "var(--cr-surface)",
                  color: "var(--cr-text)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: geoSearching || city.trim().length === 0 ? "default" : "pointer",
                  whiteSpace: "nowrap",
                  minHeight: "var(--min-touch)",
                  opacity: geoSearching || city.trim().length === 0 ? 0.5 : 1,
                  flexShrink: 0,
                }}
              >
                {geoSearching ? "…" : t("setup.search_city")}
              </button>
            )}
          </div>
          {geoError && (
            <p style={{ fontSize: 12, color: "var(--cr-critical)", margin: "6px 0 0" }}>{geoError}</p>
          )}
        </div>

        {/* Coordinates */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>
              {coordsEditable ? t("setup.coords_label") : t("setup.coords_label_gps")}
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {!coordsEditable && gpsStatus === "ok" && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#22C55E",
                    background: "rgba(34,197,94,0.12)",
                    border: "1px solid rgba(34,197,94,0.3)",
                    borderRadius: 20,
                    padding: "2px 10px",
                    letterSpacing: "0.08em",
                  }}
                >
                  ✓ {t("setup.gps_ok_badge")}
                </span>
              )}
              {!coordsEditable && (
                <button
                  type="button"
                  onClick={handleEditOverride}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--cr-label)",
                    background: "none",
                    border: "1px solid var(--cr-border)",
                    borderRadius: 8,
                    padding: "4px 10px",
                    cursor: "pointer",
                  }}
                >
                  {t("setup.edit_coords")}
                </button>
              )}
            </div>
          </div>

          {coordsEditable ? (
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: "var(--cr-label)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {t("setup.lat")}
                </p>
                <input
                  type="number"
                  step="0.000001"
                  min="-90"
                  max="90"
                  value={latInput}
                  onChange={(e) => handleLatInput(e.target.value)}
                  placeholder="-90 … 90"
                  style={coordInputStyle(latError !== null)}
                />
                {latError && (
                  <p style={{ fontSize: 12, color: "var(--cr-critical)", margin: "4px 0 0" }}>{latError}</p>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: "var(--cr-label)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {t("setup.lng")}
                </p>
                <input
                  type="number"
                  step="0.000001"
                  min="-180"
                  max="180"
                  value={lngInput}
                  onChange={(e) => handleLngInput(e.target.value)}
                  placeholder="-180 … 180"
                  style={coordInputStyle(lngError !== null)}
                />
                {lngError && (
                  <p style={{ fontSize: 12, color: "var(--cr-critical)", margin: "4px 0 0" }}>{lngError}</p>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ ...readonlyBoxStyle, flex: 1 }}>
                <p style={{ fontSize: 11, color: "var(--cr-label)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {t("setup.lat")}
                </p>
                <p style={{ fontSize: 16, color: "var(--cr-text)", margin: 0 }}>
                  {lat !== null ? lat.toFixed(6) : "—"}
                </p>
              </div>
              <div style={{ ...readonlyBoxStyle, flex: 1 }}>
                <p style={{ fontSize: 11, color: "var(--cr-label)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {t("setup.lng")}
                </p>
                <p style={{ fontSize: 16, color: "var(--cr-text)", margin: 0 }}>
                  {lng !== null ? lng.toFixed(6) : "—"}
                </p>
              </div>
            </div>
          )}

          {/* Coords required hint when editable and invalid */}
          {coordsEditable && !validCoords && (lat !== null || lng !== null || latInput || lngInput) && !latError && !lngError && (
            <p style={{ fontSize: 12, color: "var(--cr-label)", margin: "6px 0 0" }}>
              {t("setup.coords_required")}
            </p>
          )}
        </div>

        {/* Start date */}
        <div>
          <label style={labelStyle}>{t("setup.start_date_label")}</label>
          <div style={readonlyBoxStyle}>
            <p style={{ fontSize: 16, color: "var(--cr-text)", margin: 0 }}>{startDateFormatted}</p>
          </div>
        </div>

        {/* Submit error */}
        {submitError && (
          <p style={{ color: "var(--cr-critical)", fontSize: 14, margin: 0 }}>
            {submitError}
          </p>
        )}

        {/* Coords required hint when no coords at all and trying to submit */}
        {!validCoords && gpsStatus !== "loading" && (
          <p style={{ fontSize: 13, color: "var(--cr-label)", margin: 0, textAlign: "center" }}>
            {t("setup.coords_required")}
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
          {submitting ? t("setup.activating") : t("setup.activate")}
        </button>
      </div>
    </div>
  );
}
