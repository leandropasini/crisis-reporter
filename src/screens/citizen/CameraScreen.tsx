import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  onCapture: (file: File, previewUrl: string) => void;
  modeLabel?: string;
  totalSteps?: number;
}

// Step progress bar — 5 steps total, amber fill
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="w-full h-1 bg-surface-2 rounded-full overflow-hidden">
      <div
        className="h-full bg-amber-400 rounded-full transition-all duration-300"
        style={{ width: `${(step / total) * 100}%` }}
      />
    </div>
  );
}

// Four L-shaped corner brackets that frame the viewfinder
function ViewfinderCorners() {
  const corner = "absolute w-8 h-8 border-warning";
  const size = "border-[3px]";
  return (
    <>
      <span className={`${corner} ${size} top-0 left-0 border-t border-l`} />
      <span className={`${corner} ${size} top-0 right-0 border-t border-r`} />
      <span className={`${corner} ${size} bottom-0 left-0 border-b border-l`} />
      <span className={`${corner} ${size} bottom-0 right-0 border-b border-r`} />
    </>
  );
}

function CameraIcon() {
  return (
    <svg width="28" height="24" viewBox="0 0 28 24" fill="none" aria-hidden>
      <path
        d="M10 2L8 5H3a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h22a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-5l-2-3H10Z"
        stroke="var(--color-surface)"
        strokeWidth="1.8"
        fill="none"
      />
      <circle cx="14" cy="13" r="4.5" stroke="var(--color-surface)" strokeWidth="1.8" />
    </svg>
  );
}

export default function CameraScreen({ onCapture, modeLabel, totalSteps = 5 }: Props) {
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
    // reset input so the same file can be re-selected after retake
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

  return (
    <div className="flex flex-col h-screen bg-surface text-text-primary select-none">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 space-y-3">
        <ProgressBar step={1} total={totalSteps} />
        <p className="text-xs text-text-muted text-center tracking-widest uppercase">
          {modeLabel ? `${modeLabel} — STEP 1 OF ${totalSteps}` : t("camera.step")}
        </p>
      </div>

      {/* Viewfinder / Preview */}
      <div className="flex-1 flex items-center justify-center px-6 py-2">
        <div className="relative w-full max-w-sm aspect-[3/4] rounded-lg overflow-hidden bg-surface-2">
          <ViewfinderCorners />

          {preview ? (
            <img
              src={preview}
              alt={t("camera.take_photo")}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-text-muted">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
                <path
                  d="M18 8L15 13H7a3 3 0 0 0-3 3v20a3 3 0 0 0 3 3h34a3 3 0 0 0 3-3V16a3 3 0 0 0-3-3h-8l-3-5H18Z"
                  stroke="currentColor" strokeWidth="2" fill="none"
                />
                <circle cx="24" cy="25" r="7" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span className="text-sm">{t("camera.point_at_building")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="pb-8 px-6 flex flex-col items-center gap-5">

        {preview ? (
          /* Post-capture: Retake + Next */
          <div className="flex w-full max-w-sm gap-3">
            <button
              type="button"
              onClick={handleRetake}
              className="flex-1 py-3 rounded-xl border border-border text-text-secondary text-sm font-medium active:opacity-70"
            >
              {t("camera.retake")}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 py-3 rounded-xl bg-accent text-white text-sm font-semibold active:opacity-80"
            >
              {t("camera.use_photo")}
            </button>
          </div>
        ) : (
          /* Idle: capture button */
          <>
            {/* Primary: camera shutter */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              aria-label={t("camera.take_photo")}
              className="w-[72px] h-[72px] rounded-full bg-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <CameraIcon />
            </button>
            <span className="text-xs text-text-muted">{t("camera.take_photo")}</span>

            {/* Secondary: gallery */}
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="text-sm text-text-secondary underline underline-offset-2 active:opacity-60"
            >
              {t("camera.choose_gallery")}
            </button>
          </>
        )}

        {/* Hidden inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
