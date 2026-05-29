import { useState } from "react";
import "./i18n";
import IndexScreen from "./screens/IndexScreen";
import CameraScreen from "./screens/citizen/CameraScreen";
import LocationScreen, { type LocationResult } from "./screens/citizen/LocationScreen";
import ClassificationScreen, { type ClassificationData } from "./screens/citizen/ClassificationScreen";
import RapidClassificationScreen, { type RapidClassificationData } from "./screens/citizen/RapidClassificationScreen";
import DetailsScreen, { type DetailsData } from "./screens/citizen/DetailsScreen";
import ReviewScreen, { type ReviewSuccessPayload } from "./screens/citizen/ReviewScreen";
import ConfirmationScreen from "./screens/citizen/ConfirmationScreen";
import DashboardScreen from "./screens/agent/DashboardScreen";
import CommunityMapScreen from "./screens/CommunityMapScreen";
import LanguageSelector from "./components/LanguageSelector";
import { CrisisModeProvider, useCrisisMode, MODE_META } from "./contexts/CrisisModeContext";
import type { ObservationInput } from "./types/observation";

type AppMode = "index" | "citizen" | "agent" | "map";
type CitizenStep = "camera" | "location" | "classification" | "rapid-classification" | "details" | "review";

const CRISIS_ID = import.meta.env.VITE_DEMO_CRISIS_ID ?? "00000000-0000-0000-0000-000000000001";

function AppInner() {
  const { mode: crisisMode } = useCrisisMode();
  const modeMeta = MODE_META[crisisMode];

  const [appMode, setAppMode] = useState<AppMode>("index");
  const [step, setStep] = useState<CitizenStep>("camera");
  const [confirmed, setConfirmed] = useState<ReviewSuccessPayload | null>(null);

  const [cameraData, setCameraData]   = useState<{ file: File; previewUrl: string } | null>(null);
  const [locationData, setLocationData]   = useState<LocationResult | null>(null);
  const [classificationData, setClassificationData] = useState<ClassificationData | null>(null);
  const [rapidData, setRapidData]         = useState<RapidClassificationData | null>(null);
  const [detailsData, setDetailsData]     = useState<DetailsData | null>(null);

  function startCitizenFlow() {
    setCameraData(null);
    setLocationData(null);
    setClassificationData(null);
    setRapidData(null);
    setDetailsData(null);
    setConfirmed(null);
    setStep("camera");
    setAppMode("citizen");
  }

  function handleCameraCapture(file: File, previewUrl: string) {
    setCameraData({ file, previewUrl });
    setStep("location");
  }

  function handleLocationConfirm(result: LocationResult) {
    setLocationData(result);
    setStep(crisisMode === "rapid" ? "rapid-classification" : "classification");
  }

  function handleClassificationConfirm(data: ClassificationData) {
    setClassificationData(data);
    setStep("details");
  }

  function handleRapidConfirm(data: RapidClassificationData) {
    setRapidData(data);
    setStep("review");
  }

  function handleDetailsConfirm(data: DetailsData) {
    setDetailsData(data);
    setStep("review");
  }

  function handleReportAnother() {
    setConfirmed(null);
    setAppMode("index");
  }

  // ── Agent mode ───────────────────────────────────────────────────────────────
  if (appMode === "agent") {
    return (
      <DashboardScreen onGoHome={() => setAppMode("index")} />
    );
  }

  // ── Community map ─────────────────────────────────────────────────────────────
  if (appMode === "map") {
    return (
      <>
        <LanguageSelector variant="fixed" />
        <CommunityMapScreen
          crisisId={CRISIS_ID}
          onBack={() => setAppMode("index")}
        />
      </>
    );
  }

  // ── Confirmation ──────────────────────────────────────────────────────────────
  if (appMode === "citizen" && confirmed) {
    return (
      <ConfirmationScreen
        {...confirmed}
        onReportAnother={handleReportAnother}
        onViewMap={() => setAppMode("map")}
      />
    );
  }

  // ── Index ──────────────────────────────────────────────────────────────────────
  if (appMode === "index") {
    return (
      <IndexScreen
        onSelectCitizen={startCitizenFlow}
        onSelectAgent={() => setAppMode("agent")}
        onSelectMap={() => setAppMode("map")}
      />
    );
  }

  // ── Citizen flow ───────────────────────────────────────────────────────────────

  const fullObservationInput: ObservationInput | null =
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

  const rapidObservationInput: ObservationInput | null =
    cameraData && locationData && rapidData
      ? {
          photoFile: cameraData.file,
          photoPreviewUrl: cameraData.previewUrl,
          lat: locationData.lat,
          lng: locationData.lng,
          locationMethod: locationData.locationMethod,
          address: locationData.address,
          damageLevel: rapidData.damageLevel,
          infrastructureType: rapidData.infrastructureType,
          modularFields: {},
          crisisId: CRISIS_ID,
        }
      : null;

  const observationInput = crisisMode === "rapid" ? rapidObservationInput : fullObservationInput;

  const ml = modeMeta.label;
  const ts = modeMeta.totalSteps;

  const navProps = {
    onGoHome: () => setAppMode("index"),
    onGoMap: () => setAppMode("map"),
  };

  return (
    <>
      {step === "camera" && (
        <CameraScreen
          onCapture={handleCameraCapture}
          modeLabel={ml}
          totalSteps={ts}
          {...navProps}
        />
      )}

      {step === "location" && (
        <LocationScreen
          onConfirm={handleLocationConfirm}
          onBack={() => setStep("camera")}
          modeLabel={ml}
          totalSteps={ts}
          {...navProps}
        />
      )}

      {step === "rapid-classification" && (
        <RapidClassificationScreen
          onConfirm={handleRapidConfirm}
          onBack={() => setStep("location")}
          {...navProps}
        />
      )}

      {step === "classification" && (
        <>
          <LanguageSelector variant="fixed" />
          <ClassificationScreen
            onConfirm={handleClassificationConfirm}
            onBack={() => setStep("location")}
            modeLabel={ml}
            totalSteps={ts}
          />
        </>
      )}

      {step === "details" && (
        <>
          <LanguageSelector variant="fixed" />
          <DetailsScreen
            modularFieldsEnabled={crisisMode === "contextual"}
            onConfirm={handleDetailsConfirm}
            onBack={() => setStep("classification")}
            modeLabel={ml}
            totalSteps={ts}
          />
        </>
      )}

      {step === "review" && observationInput && (
        <ReviewScreen
          data={observationInput}
          onSuccess={setConfirmed}
          onBack={() => setStep(crisisMode === "rapid" ? "rapid-classification" : "details")}
          modeLabel={ml}
          totalSteps={ts}
          {...navProps}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <CrisisModeProvider>
      <AppInner />
    </CrisisModeProvider>
  );
}
