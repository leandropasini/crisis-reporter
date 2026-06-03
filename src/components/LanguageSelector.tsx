import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconWorld } from "@tabler/icons-react";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "ar", label: "AR" },
  { code: "zh", label: "ZH" },
  { code: "fr", label: "FR" },
  { code: "ru", label: "RU" },
  { code: "es", label: "ES" },
];

interface Props {
  variant?: "fixed" | "inline";
}

export default function LanguageSelector({ variant = "fixed" }: Props) {
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

  const trigger = (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      aria-label="Select language"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "6px 12px",
        borderRadius: 20,
        border: "1px solid var(--cr-border)",
        background: "transparent",
        color: "var(--cr-label)",
        fontSize: 13,
        cursor: "pointer",
        whiteSpace: "nowrap",
        minHeight: 32,
      }}
    >
      <IconWorld size={14} />
      <span style={{ color: "var(--cr-text)", fontWeight: 500 }}>{current.label}</span>
    </button>
  );

  const dropdown = open && (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 4px)",
        right: 0,
        width: 100,
        background: "var(--cr-surface)",
        border: "1px solid var(--cr-border)",
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
        zIndex: 10000,
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
              padding: "9px 14px",
              textAlign: "left",
              background: active ? "var(--cr-primary-dim)" : "none",
              border: "none",
              borderBottom: "1px solid var(--cr-border)",
              color: active ? "var(--cr-primary)" : "var(--cr-label)",
              fontSize: 13,
              cursor: "pointer",
              fontWeight: active ? 600 : 400,
            }}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );

  if (variant === "inline") {
    return (
      <div ref={menuRef} style={{ position: "relative", zIndex: 10001 }}>
        {trigger}
        {dropdown}
      </div>
    );
  }

  // fixed (legacy)
  return (
    <div ref={menuRef} style={{ position: "fixed", top: 10, right: 10, zIndex: 9999 }}>
      {trigger}
      {dropdown}
    </div>
  );
}
