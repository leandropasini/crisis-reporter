import { useState } from "react";
import "./i18n";
import IndexScreen from "./screens/IndexScreen";
import CameraScreen from "./screens/citizen/CameraScreen";
import LocationScreen, { type LocationResult } from "./screens/citizen/LocationScreen";
import ClassificationScreen, { type ClassificationData } from "./screens/citizen/ClassificationScreen";
import DetailsScreen, { type DetailsData } from "./screens/citizen/DetailsScreen";
import ReviewScreen, { type ReviewSuccessPayload } from "./screens/citizen/ReviewScreen";
import ConfirmationScreen from "./screens/citizen/ConfirmationScreen";
import DashboardScreen from "./screens/agent/DashboardScreen";
import LanguageSelector from "./components/LanguageSelector";
import type { ObservationInput } from "./types/observation";

type AppMode = "index" | "citizen" | "agent";
type CitizenStep = "camera" | "location" | "classification" | "details" | "review";

const CRISIS_ID = import.meta.env.VITE_DEMO_CRISIS_ID ?? "00000000-0000-0000-0000-000000000001";

export default function App() {
  const [mode, setMode] = useState<AppMode>("index");
  const [step, setStep] = useState<CitizenStep>("camera");
  const [confirmed, setConfirmed] = useState<ReviewSuccessPayload | null>(null);

  const [cameraData, setCameraData] = useState<{ file: File; previewUrl: string } | null>(null);
  const [locationData, setLocationData] = useState<LocationResult | null>(null);
  const [classificationData, setClassificationData] = useState<ClassificationData | null>(null);
  const [detailsData, setDetailsData] = useState<DetailsData | null>(null);

  function startCitizenFlow() {
    setCameraData(null);
    setLocationData(null);
    setClassificationData(null);
    setDetailsData(null);
    setConfirmed(null);
    setStep("camera");
    setMode("citizen");
  }

  function handleCameraCapture(file: File, previewUrl: string) {
    setCameraData({ file, previewUrl });
    setStep("location");
  }

  function handleLocationConfirm(result: LocationResult) {
    setLocationData(result);
    setStep("classification");
  }

  function handleClassificationConfirm(data: ClassificationData) {
    setClassificationData(data);
    setStep("details");
  }

  function handleDetailsConfirm(data: DetailsData) {
    setDetailsData(data);
    setStep("review");
  }

  function handleReportAnother() {
    setConfirmed(null);
    setMode("index");
  }

  // ── Agent mode ──────────────────────────────────────────────────────────────
  if (mode === "agent") {
    return (
      <>
        <LanguageSelector />
        <DashboardScreen />
      </>
    );
  }

  // ── Confirmation ────────────────────────────────────────────────────────────
  if (mode === "citizen" && confirmed) {
    return (
      <>
        <LanguageSelector />
        <ConfirmationScreen {...confirmed} onReportAnother={handleReportAnother} />
      </>
    );
  }

  // ── Index ───────────────────────────────────────────────────────────────────
  if (mode === "index") {
    return (
      <>
        <LanguageSelector />
        <IndexScreen
          onSelectCitizen={startCitizenFlow}
          onSelectAgent={() => setMode("agent")}
        />
      </>
    );
  }

  // ── Citizen flow ────────────────────────────────────────────────────────────
  const observationInput: ObservationInput | null =
    cameraData && locationData && classificationData && detailsData
      ? {
          photoFile: cameraData.file,
          photoPreviewUrl: cameraData.previewUrl,
          lat: locationData.lat,
          lng: locationData.lng,
          locationMethod: locationData.locationMethod,
          address: locationData.address,
          damageLevel: classificationData.damageLevel,
          infrastructureType: classificationData.infrastructureType,
          infrastructureTypeOther: classificationData.infrastructureTypeOther,
          crisisNature: classificationData.crisisNature,
          crisisSubtype: classificationData.crisisSubtype,
          debrisClearingNeeded: classificationData.debrisClearingNeeded,
          infrastructureName: detailsData.infrastructureName,
          infrastructureDescription: detailsData.infrastructureDescription,
          modularFields: detailsData.modularFields,
          crisisId: CRISIS_ID,
        }
      : null;

  return (
    <>
      <LanguageSelector />

      {step === "camera" && (
        <CameraScreen onCapture={handleCameraCapture} />
      )}

      {step === "location" && (
        <LocationScreen
          onConfirm={handleLocationConfirm}
          onBack={() => setStep("camera")}
        />
      )}

      {step === "classification" && (
        <ClassificationScreen
          onConfirm={handleClassificationConfirm}
          onBack={() => setStep("location")}
        />
      )}

      {step === "details" && (
        <DetailsScreen
          modularFieldsEnabled
          onConfirm={handleDetailsConfirm}
          onBack={() => setStep("classification")}
        />
      )}

      {step === "review" && observationInput && (
        <ReviewScreen
          data={observationInput}
          onSuccess={setConfirmed}
          onBack={() => setStep("details")}
        />
      )}
    </>
  );
}
