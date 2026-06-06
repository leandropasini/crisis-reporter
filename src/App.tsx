import { useState, useEffect } from "react";
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
import DemoWelcomeScreen from "./screens/DemoWelcomeScreen";
import CrisisSetupScreen from "./screens/agent/CrisisSetupScreen";
import { CrisisModeProvider, useCrisisMode, MODE_META } from "./contexts/CrisisModeContext";
import type { ObservationInput } from "./types/observation";
import type { DisasterType } from "./types/schema";
import { supabase, isSupabaseConfigured } from "./services/supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

type AppMode = "index" | "citizen" | "agent" | "map";
type CitizenStep = "camera" | "location" | "classification" | "rapid-classification" | "details" | "review";

interface Props {
  mode: "demo" | "live";
}

function AppInner({ mode }: Props) {
  const { mode: crisisMode } = useCrisisMode();
  const modeMeta = MODE_META[crisisMode];
  const isDemo = mode === "demo";

  const [showWelcome, setShowWelcome] = useState(
    isDemo && !sessionStorage.getItem("demo_welcome_seen")
  );
  const [appMode, setAppMode] = useState<AppMode>("index");
  const [step, setStep] = useState<CitizenStep>("camera");
  const [confirmed, setConfirmed] = useState<ReviewSuccessPayload | null>(null);

  const [cameraData, setCameraData]       = useState<{ file: File; previewUrl: string } | null>(null);
  const [locationData, setLocationData]   = useState<LocationResult | null>(null);
  const [classificationData, setClassificationData] = useState<ClassificationData | null>(null);
  const [rapidData, setRapidData]         = useState<RapidClassificationData | null>(null);
  const [detailsData, setDetailsData]     = useState<DetailsData | null>(null);
  const [disasterType, setDisasterType]   = useState<DisasterType>(isDemo ? "flood" : "generic");
  const [liveCrisisId, setLiveCrisisId]       = useState<string | null>(null);
  const [crisisCheckDone, setCrisisCheckDone] = useState(isDemo); // demo skips the check

  const DEMO_CRISIS_ID = import.meta.env.VITE_DEMO_CRISIS_ID ?? "f58c928d-9fc7-4499-8987-f8f4f92924ed";
  const effectiveCrisisId = isDemo ? DEMO_CRISIS_ID : (liveCrisisId ?? "");

  useEffect(() => {
    if (isDemo || !isSupabaseConfigured) return;
    async function fetchDisasterType() {
      try {
        const { data } = await db
          .from("crises")
          .select("disaster_type")
          .eq("id", effectiveCrisisId)
          .single() as { data: { disaster_type: string } | null };
        if (data?.disaster_type) {
          setDisasterType(data.disaster_type as DisasterType);
        }
      } catch {
        // keep default 'generic'
      }
    }
    if (effectiveCrisisId) fetchDisasterType();
  }, [isDemo, effectiveCrisisId]);

  useEffect(() => {
    if (isDemo || !isSupabaseConfigured) {
      setCrisisCheckDone(true);
      return;
    }
    async function checkActiveCrisis() {
      console.log('[SW-DEBUG] checking active crisis...');
      try {
        const { data } = await db
          .from("crises")
          .select("id")
          .eq("status", "active")
          .limit(1)
          .maybeSingle() as { data: { id: string } | null };
        console.log('[SW-DEBUG] result:', data);
        setLiveCrisisId(data?.id ?? null);
      } catch {
        // leave liveCrisisId as null → show setup screen
      } finally {
        setCrisisCheckDone(true);
      }
    }
    checkActiveCrisis();
  }, [isDemo]);

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

  // ── Demo welcome ──────────────────────────────────────────────────────────────
  if (showWelcome) {
    return (
      <DemoWelcomeScreen
        onStartAgent={() => { setShowWelcome(false); setAppMode("agent"); }}
        onStartCitizen={() => { setShowWelcome(false); setAppMode("citizen"); }}
      />
    );
  }

  // ── Live crisis loading ───────────────────────────────────────────────────────
  if (!isDemo && !crisisCheckDone) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: "var(--cr-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "var(--cr-label)", fontSize: 14 }}>Loading…</p>
      </div>
    );
  }

  // ── Crisis setup (live mode, no active crisis) ────────────────────────────────
  if (!isDemo && crisisCheckDone && !liveCrisisId) {
    return (
      <CrisisSetupScreen
        onActivate={(id) => {
          console.log('[DEBUG] liveCrisisId set to:', id);
          setLiveCrisisId(id);
          setAppMode("agent");
        }}
      />
    );
  }

  // ── Agent mode ───────────────────────────────────────────────────────────────
  if (appMode === "agent") {
    return (
      <DashboardScreen
        crisisId={effectiveCrisisId}
        onGoHome={() => setAppMode("index")}
        onGoMap={() => setAppMode("map")}
        isDemo={isDemo}
        onEndCrisis={() => setLiveCrisisId(null)}
      />
    );
  }

  // ── Community map ─────────────────────────────────────────────────────────────
  if (appMode === "map") {
    return (
      <CommunityMapScreen
        crisisId={effectiveCrisisId}
        isDemo={isDemo}
        refreshKey={confirmed?.id}
        onBack={() => setAppMode("index")}
        onGoHome={() => setAppMode("index")}
        onGoReport={startCitizenFlow}
      />
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
          photoFile:                  cameraData.file,
          photoPreviewUrl:            cameraData.previewUrl,
          lat:                        locationData.lat,
          lng:                        locationData.lng,
          locationMethod:             locationData.locationMethod,
          address:                    locationData.address,
          placeName:                  locationData.placeName,
          damageLevel:                classificationData.damageLevel,
          damageLevelLabel:           classificationData.damageLevelLabel,
          infrastructureType:         classificationData.infrastructureType,
          infrastructureTypeOther:    classificationData.infrastructureTypeOther,
          crisisNature:               classificationData.crisisNature,
          crisisSubtype:              classificationData.crisisSubtype,
          debrisClearingNeeded:       classificationData.debrisClearingNeeded,
          infrastructureName:         detailsData.infrastructureName,
          infrastructureDescription:  detailsData.infrastructureDescription,
          modularFields:              detailsData.modularFields,
          crisisId:                   effectiveCrisisId,
          isDemo,
        }
      : null;

  const rapidObservationInput: ObservationInput | null =
    cameraData && locationData && rapidData
      ? {
          photoFile:          cameraData.file,
          photoPreviewUrl:    cameraData.previewUrl,
          lat:                locationData.lat,
          lng:                locationData.lng,
          locationMethod:     locationData.locationMethod,
          address:            locationData.address,
          placeName:          locationData.placeName,
          damageLevel:        rapidData.damageLevel,
          damageLevelLabel:   rapidData.damageLevelLabel,
          infrastructureType: rapidData.infrastructureType,
          modularFields:      {},
          crisisId:           effectiveCrisisId,
          isDemo,
        }
      : null;

  const observationInput = crisisMode === "rapid" ? rapidObservationInput : fullObservationInput;

  const ml = modeMeta.label;
  const ts = modeMeta.totalSteps;

  const navProps = {
    onGoHome: () => setAppMode("index"),
    onGoMap:  () => setAppMode("map"),
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
          demoMode={isDemo}
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
        <ClassificationScreen
          disasterType={disasterType}
          onConfirm={handleClassificationConfirm}
          onBack={() => setStep("location")}
          modeLabel={ml}
          totalSteps={ts}
        />
      )}

      {step === "details" && (
        <DetailsScreen
          modularFieldsEnabled={crisisMode === "contextual"}
          initialName={classificationData?.infrastructureName}
          onConfirm={handleDetailsConfirm}
          onBack={() => setStep("classification")}
          modeLabel={ml}
          totalSteps={ts}
        />
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

export default function App({ mode }: Props) {
  return (
    <CrisisModeProvider>
      {/* Desktop-only DEMO badge — mobile gets it inline in BottomNav */}
      {mode === "demo" && window.innerWidth >= 768 && (
        <div
          style={{
            position: "fixed",
            top: 10,
            left: 10,
            zIndex: 9000,
            background: "var(--cr-primary)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            padding: "3px 9px",
            borderRadius: 20,
            pointerEvents: "none",
          }}
        >
          DEMO
        </div>
      )}
      <AppInner mode={mode} />
    </CrisisModeProvider>
  );
}
