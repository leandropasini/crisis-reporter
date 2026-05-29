import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../../components/LanguageSelector";
import BottomNav from "../../components/BottomNav";

interface Props {
  onCapture: (file: File, previewUrl: string) => void;
  modeLabel?: string;
  totalSteps?: number;
  onGoHome?: () => void;
  onGoMap?: () => void;
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div style={{ height: 3, background: "var(--cr-surface2)", borderRadius: 2, overflow: "hidden" }}>
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: "var(--cr-primary)",
          borderRadius: 2,
          transition: "width 0.3s",
        }}
      />
    </div>
  );
}

export default function CameraScreen({
  onCapture,
  modeLabel,
  totalSteps = 3,
  onGoHome,
  onGoMap,
}: Props) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setCapturedFile(file);
    e.target.value = "";
  }

  function handleRetake() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setCapturedFile(null);
  }

  function handleNext() {
    if (capturedFile && preview) onCapture(capturedFile, preview);
  }

  const stepNum = 1;
  const pct = (stepNum / totalSteps) * 100;
  const headerLabel = modeLabel
    ? `${modeLabel} — STEP ${stepNum} OF ${totalSteps}`
    : t("camera.step");

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
      {/* Header */}
      <div style={{ flexShrink: 0, padding: "16px 20px 12px" }}>
        <ProgressBar pct={pct} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 10,
          }}
        >
          <span
            style={{
              fontSize: 13,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--cr-label)",
              fontWeight: 600,
            }}
          >
            {headerLabel}
          </span>
          <LanguageSelector variant="inline" />
        </div>
      </div>

      {/* Viewfinder / Preview */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "8px 20px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 360,
            aspectRatio: "1",
            borderRadius: 20,
            overflow: "hidden",
            background: "#111",
          }}
        >
          {/* Corner brackets */}
          {!preview && (
            <>
              {[
                { top: 0, left: 0, borderTop: "2px solid var(--cr-primary)", borderLeft: "2px solid var(--cr-primary)" },
                { top: 0, right: 0, borderTop: "2px solid var(--cr-primary)", borderRight: "2px solid var(--cr-primary)" },
                { bottom: 0, left: 0, borderBottom: "2px solid var(--cr-primary)", borderLeft: "2px solid var(--cr-primary)" },
                { bottom: 0, right: 0, borderBottom: "2px solid var(--cr-primary)", borderRight: "2px solid var(--cr-primary)" },
              ].map((style, i) => (
                <span
                  key={i}
                  style={{
                    position: "absolute",
                    width: 28,
                    height: 28,
                    ...style,
                  }}
                />
              ))}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <i className="ti ti-camera" style={{ fontSize: 36, color: "var(--cr-label)", opacity: 0.4 }} />
                <span style={{ fontSize: 16, color: "var(--cr-label)" }}>Point at the scene</span>
              </div>
            </>
          )}

          {preview && (
            <img
              src={preview}
              alt={t("camera.take_photo")}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          flexShrink: 0,
          padding: "12px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {preview ? (
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={handleRetake}
              style={{
                flex: 1,
                minHeight: "var(--min-touch)",
                borderRadius: 16,
                border: "1px solid var(--cr-border)",
                background: "var(--cr-surface)",
                color: "var(--cr-label)",
                fontSize: 15,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {t("camera.retake")}
            </button>
            <button
              type="button"
              onClick={handleNext}
              style={{
                flex: 2,
                minHeight: "var(--min-touch)",
                borderRadius: 16,
                border: "none",
                background: "var(--cr-primary)",
                color: "#fff",
                fontSize: 17,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {t("camera.use_photo")}
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                minHeight: "var(--min-touch)",
                padding: 20,
                borderRadius: 16,
                border: "none",
                background: "var(--cr-primary)",
                color: "#fff",
                fontSize: 17,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <i className="ti ti-camera" style={{ fontSize: 22 }} />
              {t("camera.take_photo")}
            </button>

            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                minHeight: "var(--min-touch)",
                padding: 16,
                borderRadius: 16,
                border: "1px solid var(--cr-border)",
                background: "var(--cr-surface)",
                color: "var(--cr-label)",
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              <i className="ti ti-photo" style={{ fontSize: 18 }} />
              {t("camera.choose_gallery")}
            </button>
          </>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <BottomNav
        active="report"
        onHome={onGoHome}
        onReport={undefined}
        onMap={onGoMap}
      />
    </div>
  );
}
