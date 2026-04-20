/** Domain models for Canine Echo Helper. */

export type Sex =
  | "male"
  | "male_neuter"
  | "female"
  | "female_neuter"
  | "unknown"
  | "";

export type MeasurementKey =
  | "ao"
  | "la"
  | "lvidD"
  | "lvidS"
  | "ivsD"
  | "ivsS"
  | "lvpwD"
  | "lvpwS"
  | "lvLength"
  | "mitralE"
  | "mitralA"
  | "aorticVelocity";

/** Raw numeric measurements; undefined means not entered. */
export type Measurements = Partial<Record<MeasurementKey, number>>;

export type PatientDetails = {
  patientName: string;
  recordId: string;
  examDate: string;
  weightKg: string;
  breed: string;
  sex: Sex;
  heartRate: string;
  notes: string;
};

export type CalculatedResults = {
  laAoRatio: number | null;
  fsPercent: number | null;
  eaRatio: number | null;
  /** Short human-readable summary of septal + posterior wall thickness. */
  wallThicknessSummary: string | null;
  warnings: string[];
  /** True when LVIDs >= LVIDd or IVSs >= IVSd etc. */
  geometryFlags: {
    lvidInconsistent: boolean;
    ivsInconsistent: boolean;
    lvpwInconsistent: boolean;
  };
};

export type InterpretationSeverity = "info" | "caution" | "highlight";

export type InterpretationFinding = {
  id: string;
  title: string;
  detail: string;
  severity: InterpretationSeverity;
};

export type InterpretationBundle = {
  findings: InterpretationFinding[];
  /** Fixed safety copy blocks shown with every interpretation. */
  safetyCopy: string[];
};

export type DiagramViewId = "heartBaseSax" | "papillarySax" | "optionalSchematic";

export type MeasurementGuide = {
  key: MeasurementKey;
  title: string;
  shortLabel: string;
  unit: string;
  requiredView: string;
  cardiacTiming: string;
  landmarks: string;
  pitfalls: string[];
  clinicalWhy: string;
  significance: string;
  diagramView: DiagramViewId;
  /** Optional relative path under `public/` once you add teaching images. */
  localImagePath?: string;
  /** Region to emphasize on the SVG schematic (e.g. "LA", "IVS"). */
  diagramHighlight?: string;
};

export type CaseRecord = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  patient: PatientDetails;
  measurements: Measurements;
  reportNotes: string;
  attachments: CaseAttachment[];
  /** Optional per-finding override text keyed by InterpretationFinding.id */
  interpretationOverrides: Record<string, string>;
};

export type CaseAttachment = {
  id: string;
  fileName: string;
  /** Actual filename on disk under public/uploads/cases/<case-id>/ */
  storedName?: string;
  url: string;
  uploadedAt: string;
};
