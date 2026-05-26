import { useState } from "react";
import "./i18n";
import ReviewScreen, { type ReviewSuccessPayload } from "./screens/citizen/ReviewScreen";
import ConfirmationScreen from "./screens/citizen/ConfirmationScreen";
import DashboardScreen from "./screens/agent/DashboardScreen";
import LanguageSelector from "./components/LanguageSelector";
import type { ObservationInput } from "./types/observation";

const DEMO_DATA: ObservationInput = {
  photoFile: new File([], "demo.jpg", { type: "image/jpeg" }),
  photoPreviewUrl: "",
  lat: -30.029,
  lng: -51.228,
  locationMethod: "gps",
  damageLevel: "partial",
  infrastructureType: "residential",
  crisisNature: "natural",
  crisisSubtype: "flood",
  debrisClearingNeeded: true,
  infrastructureName: "Casa de alvenaria — Av. Mauá 1050",
  infrastructureDescription: "Água até o primeiro andar. Estrutura aparentemente intacta.",
  modularFields: {
    electricity_condition: "no_service",
    health_services: "partially_functional",
    pressing_needs: ["water", "shelter"],
  },
  crisisId: import.meta.env.VITE_DEMO_CRISIS_ID ?? "00000000-0000-0000-0000-000000000001",
};

const MODE = import.meta.env.VITE_APP_MODE ?? "citizen";

export default function App() {
  const [confirmed, setConfirmed] = useState<ReviewSuccessPayload | null>(null);

  if (MODE === "agent") {
    return (
      <>
        <LanguageSelector />
        <DashboardScreen />
      </>
    );
  }

  if (confirmed) {
    return (
      <>
        <LanguageSelector />
        <ConfirmationScreen
          {...confirmed}
          onReportAnother={() => setConfirmed(null)}
        />
      </>
    );
  }

  return (
    <>
      <LanguageSelector />
      <ReviewScreen
        data={DEMO_DATA}
        onSuccess={setConfirmed}
        onBack={() => console.log("back")}
      />
    </>
  );
}
