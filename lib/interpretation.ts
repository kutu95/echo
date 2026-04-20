import type {
  CalculatedResults,
  InterpretationBundle,
  InterpretationFinding,
  Measurements,
} from "@/types/models";

const SAFETY_COPY: string[] = [];

function laAoFinding(ratio: number | null): InterpretationFinding | null {
  if (ratio === null) return null;
  if (ratio <= 1.6) {
    return {
      id: "laa-normal",
      title: "LA:Ao screen",
      detail:
        "LA:Ao is within a commonly cited general reference range (≤ 1.6). Breed and body size matter.",
      severity: "info",
    };
  }
  if (ratio <= 1.8) {
    return {
      id: "laa-mild",
      title: "LA:Ao screen",
      detail:
        "LA:Ao suggests mild left atrial enlargement versus a commonly used cut-point (1.6–1.8). Correlate with 2D volume, rhythm, and clinical signs.",
      severity: "caution",
    };
  }
  if (ratio <= 2.0) {
    return {
      id: "laa-mod",
      title: "LA:Ao screen",
      detail:
        "LA:Ao suggests moderate left atrial enlargement (1.8–2.0 by a commonly used scheme). Consider volume overload, atrial remodeling, or possible mitral disease in context.",
      severity: "caution",
    };
  }
  return {
    id: "laa-marked",
    title: "LA:Ao screen",
    detail:
      "LA:Ao suggests marked left atrial enlargement (> 2.0 in this simple scheme). Strong prompt to review for significant mitral regurgitation / volume overload and overall hemodynamics.",
    severity: "highlight",
  };
}

function fsFinding(fs: number | null): InterpretationFinding | null {
  if (fs === null) return null;
  if (fs >= 25 && fs <= 45) {
    return {
      id: "fs-expected",
      title: "FS% screen",
      detail:
        "FS% falls in a commonly referenced broad range (25–45%). FS is load-dependent; interpret with wall motion, outflow, and rhythm.",
      severity: "info",
    };
  }
  if (fs < 25) {
    return {
      id: "fs-low",
      title: "FS% screen",
      detail:
        "FS% is below a commonly used lower bound (< 25%), suggesting reduced systolic function. Consider loading conditions, arrhythmia, and imaging plane before inferring myocardial failure.",
      severity: "caution",
    };
  }
  return {
    id: "fs-high",
    title: "FS% screen",
    detail:
      "FS% is elevated (> 45–50% in this prompt). This may reflect hyperdynamic physiology, small cavity, or measurement artifact — interpret cautiously.",
    severity: "caution",
  };
}

/**
 * Rules-based screening prompts — not diagnoses.
 * TODO: extend with breed-specific wall thickness Z-scores or institution ranges.
 */
export function interpretEcho(
  m: Measurements,
  calc: CalculatedResults
): InterpretationBundle {
  const findings: InterpretationFinding[] = [];

  const laAo = laAoFinding(calc.laAoRatio);
  if (laAo) findings.push(laAo);

  const fs = fsFinding(calc.fsPercent);
  if (fs) findings.push(fs);

  const lvidD = m.lvidD;
  const lvidS = m.lvidS;
  const ivsD = m.ivsD;
  const lvpwD = m.lvpwD;
  const fsVal = calc.fsPercent;

  const meanWall =
    ivsD !== undefined && lvpwD !== undefined
      ? (ivsD + lvpwD) / 2
      : ivsD ?? lvpwD;

  const cavitySmall =
    lvidD !== undefined && lvidS !== undefined && lvidD > 0
      ? lvidS / lvidD < 0.35
      : false;

  if (
    meanWall !== undefined &&
    meanWall >= 0.6 &&
    cavitySmall &&
    fsVal !== null &&
    fsVal >= 45
  ) {
    findings.push({
      id: "pattern-hcm-like",
      title: "Possible HCM-like or pseudohypertrophy signal",
      detail:
        "Thick walls with a relatively small cavity and high FS can resemble hypertrophic physiology or reflect breed conformation, underfilling, or out-of-plane measurement. True HCM is uncommon in dogs — integrate breed, body size, and clinical context.",
      severity: "highlight",
    });
  }

  if (
    lvidD !== undefined &&
    lvidS !== undefined &&
    lvidD > 0 &&
    lvidS / lvidD > 0.75 &&
    fsVal !== null &&
    fsVal < 25
  ) {
    findings.push({
      id: "pattern-dcm-like",
      title: "Possible DCM-like signal",
      detail:
        "A dilated cavity with reduced FS suggests a dilated cardiomyopathy-like phenotype in this simple screen. Volume status, rhythm, and regional wall motion still require direct assessment.",
      severity: "highlight",
    });
  }

  const laAoRatio = calc.laAoRatio;
  if (laAoRatio !== null && laAoRatio >= 1.6) {
    findings.push({
      id: "pattern-mvd",
      title: "Possible MMVD / mitral regurgitation signal",
      detail:
        "LA enlargement on this index raises suspicion for chronic volume overload such as myxomatous mitral valve disease when combined with appropriate murmur/history. Valve morphology and color Doppler are not assessed here.",
      severity: "caution",
    });
  }

  return { findings, safetyCopy: SAFETY_COPY };
}
