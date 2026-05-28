import { createContext, useContext, useState } from "react";
import type { CrisisMode } from "../types/schema";

const MODE_KEY = "crisis_reporter_mode";

function loadMode(): CrisisMode {
  const stored = localStorage.getItem(MODE_KEY);
  if (stored === "rapid" || stored === "full" || stored === "contextual") return stored;
  return "rapid";
}

interface CrisisModeContextValue {
  mode: CrisisMode;
  setMode: (m: CrisisMode) => void;
}

const CrisisModeContext = createContext<CrisisModeContextValue>({
  mode: "rapid",
  setMode: () => {},
});

export function CrisisModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<CrisisMode>(loadMode);

  function setMode(m: CrisisMode) {
    localStorage.setItem(MODE_KEY, m);
    setModeState(m);
  }

  return (
    <CrisisModeContext.Provider value={{ mode, setMode }}>
      {children}
    </CrisisModeContext.Provider>
  );
}

export function useCrisisMode() {
  return useContext(CrisisModeContext);
}

export const MODE_META: Record<CrisisMode, { label: string; totalSteps: number }> = {
  rapid:       { label: "RAPID REPORT",       totalSteps: 3 },
  full:        { label: "FULL REPORT",         totalSteps: 5 },
  contextual:  { label: "CONTEXTUAL REPORT",   totalSteps: 5 },
};
