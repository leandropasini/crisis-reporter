import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "zh", label: "中文" },
  { code: "fr", label: "Français" },
  { code: "ru", label: "Русский" },
  { code: "es", label: "Español" },
];

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 1.5C8 1.5 6 4 6 8s2 6.5 2 6.5M8 1.5C8 1.5 10 4 10 8s-2 6.5-2 6.5M1.5 8h13" />
    </svg>
  );
}

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function handleChange(code: string) {
    i18n.changeLanguage(code);
    localStorage.setItem("lang", code);
    document.documentElement.lang = code;
    document.documentElement.dir = code === "ar" ? "rtl" : "ltr";
    setOpen(false);
  }

  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  return (
    <div
      ref={menuRef}
      style={{ position: "fixed", top: 10, right: 10, zIndex: 9999 }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Select language"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "5px 10px",
          borderRadius: 8,
          border: "1px solid var(--color-border)",
          background: open ? "var(--color-surface-2)" : "color-mix(in srgb, var(--color-surface) 85%, transparent)",
          backdropFilter: "blur(8px)",
          color: "var(--color-text-secondary)",
          fontSize: 12,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        <GlobeIcon />
        <span>{current.label}</span>
        <span style={{ fontSize: 9, opacity: 0.6 }}>▾</span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            width: 140,
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
          }}
        >
          {LANGUAGES.map((lang) => {
            const active = lang.code === i18n.language;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleChange(lang.code)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px 14px",
                  textAlign: "left",
                  background: active ? "var(--color-border)" : "none",
                  border: "none",
                  borderBottom: "1px solid var(--color-border)",
                  color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  fontSize: 12,
                  cursor: "pointer",
                  fontWeight: active ? 600 : 400,
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--color-surface-1)"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "none"; }}
              >
                {lang.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
