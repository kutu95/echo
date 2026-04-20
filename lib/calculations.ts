import type { CalculatedResults, Measurements } from "@/types/models";

function fmt(n: number, digits = 2) {
  return Number(n.toFixed(digits));
}

/**
 * Pure calculation helpers for echocardiography-derived indices.
 * TODO: plug in breed- or weight-specific reference adjustments here if needed.
 */
export function calculateResults(m: Measurements): CalculatedResults {
  const warnings: string[] = [];
  const geometryFlags = {
    lvidInconsistent: false,
    ivsInconsistent: false,
    lvpwInconsistent: false,
  };

  const ao = m.ao;
  const la = m.la;
  const lvidD = m.lvidD;
  const lvidS = m.lvidS;
  const ivsD = m.ivsD;
  const ivsS = m.ivsS;
  const lvpwD = m.lvpwD;
  const lvpwS = m.lvpwS;
  const mitralE = m.mitralE;
  const mitralA = m.mitralA;

  let laAoRatio: number | null = null;
  if (ao !== undefined && la !== undefined) {
    if (ao === 0) {
      warnings.push("LA:Ao cannot be calculated (aorta diameter is zero).");
    } else {
      laAoRatio = fmt(la / ao, 2);
    }
  }

  let fsPercent: number | null = null;
  if (lvidD !== undefined && lvidS !== undefined) {
    if (lvidD === 0) {
      warnings.push("FS% cannot be calculated (LVIDd is zero).");
    } else {
      fsPercent = fmt(((lvidD - lvidS) / lvidD) * 100, 1);
    }
  }

  if (
    lvidD !== undefined &&
    lvidS !== undefined &&
    lvidS > lvidD * 1.02
  ) {
    geometryFlags.lvidInconsistent = true;
    warnings.push(
      "LVIDs is larger than LVIDd — check caliper placement or data entry."
    );
  }

  if (ivsD !== undefined && ivsS !== undefined && ivsS < ivsD * 0.95) {
    geometryFlags.ivsInconsistent = true;
    warnings.push(
      "IVSs is less than IVSd — verify systolic/diastolic timing and landmarks."
    );
  }

  if (lvpwD !== undefined && lvpwS !== undefined && lvpwS < lvpwD * 0.95) {
    geometryFlags.lvpwInconsistent = true;
    warnings.push(
      "LVPWs is less than LVPWd — verify systolic/diastolic timing and landmarks."
    );
  }

  let eaRatio: number | null = null;
  if (mitralE !== undefined && mitralA !== undefined) {
    if (mitralA === 0) {
      warnings.push("E:A ratio cannot be calculated (A wave is zero).");
    } else {
      eaRatio = fmt(mitralE / mitralA, 2);
    }
  }

  let wallThicknessSummary: string | null = null;
  if (ivsD !== undefined || lvpwD !== undefined) {
    const parts: string[] = [];
    if (ivsD !== undefined) parts.push(`IVSd ${fmt(ivsD, 2)} cm`);
    if (lvpwD !== undefined) parts.push(`LVPWd ${fmt(lvpwD, 2)} cm`);
    wallThicknessSummary = parts.join(" · ");
  }

  return {
    laAoRatio,
    fsPercent,
    eaRatio,
    wallThicknessSummary,
    warnings,
    geometryFlags,
  };
}

export function formatNumberOrDash(
  n: number | null | undefined,
  suffix = ""
) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return `${n}${suffix}`;
}
