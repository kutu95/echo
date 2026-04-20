"use client";

import type { CalculatedResults, InterpretationBundle } from "@/types/models";
import type { CaseRecord } from "@/types/models";
import { formatNumberOrDash } from "@/lib/calculations";
import { measurementGuideByKey, measurementGuides } from "@/data/measurementGuides";
import type { MeasurementKey } from "@/types/models";

type Props = {
  record: CaseRecord;
  calculated: CalculatedResults;
  interpretation: InterpretationBundle;
};

const measurementOrder: MeasurementKey[] = measurementGuides.map((g) => g.key);

export function ReportView({ record, calculated, interpretation }: Props) {
  const generatedAt = new Date().toLocaleString();

  return (
    <div id="printable-report" className="space-y-6 bg-white p-6 text-black">
      <header className="border-b pb-4">
        <h1 className="text-2xl font-semibold">Echocardiogram Recorder — Case summary</h1>
        <p className="text-sm text-neutral-600">Generated {generatedAt}</p>
      </header>

      <section>
        <h2 className="text-lg font-semibold">Patient / case</h2>
        <table className="mt-2 w-full text-sm">
          <tbody className="align-top">
            <tr>
              <td className="w-40 py-1 text-neutral-600">Patient</td>
              <td className="py-1">{record.patient.patientName || "—"}</td>
            </tr>
            <tr>
              <td className="py-1 text-neutral-600">ID</td>
              <td className="py-1">{record.patient.recordId || "—"}</td>
            </tr>
            <tr>
              <td className="py-1 text-neutral-600">Date</td>
              <td className="py-1">{record.patient.examDate || "—"}</td>
            </tr>
            <tr>
              <td className="py-1 text-neutral-600">Weight</td>
              <td className="py-1">
                {record.patient.weightKg ? `${record.patient.weightKg} kg` : "—"}
              </td>
            </tr>
            <tr>
              <td className="py-1 text-neutral-600">Breed</td>
              <td className="py-1">{record.patient.breed || "—"}</td>
            </tr>
            <tr>
              <td className="py-1 text-neutral-600">Sex</td>
              <td className="py-1">{record.patient.sex || "—"}</td>
            </tr>
            <tr>
              <td className="py-1 text-neutral-600">Heart rate</td>
              <td className="py-1">
                {record.patient.heartRate ? `${record.patient.heartRate} bpm` : "—"}
              </td>
            </tr>
            <tr>
              <td className="py-1 text-neutral-600">Notes</td>
              <td className="py-1 whitespace-pre-wrap">
                {record.patient.notes || "—"}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Measurements</h2>
        <table className="mt-2 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4">Parameter</th>
              <th className="py-2">Value</th>
            </tr>
          </thead>
          <tbody>
            {measurementOrder.map((key) => {
              const val = record.measurements[key];
              const g = measurementGuideByKey[key];
              return (
                <tr key={key} className="border-b border-neutral-200">
                  <td className="py-2 pr-4">
                    {g.title} ({g.unit})
                  </td>
                  <td className="py-2 tabular-nums">
                    {val === undefined ? "—" : String(val)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Calculated</h2>
        <ul className="mt-2 list-none space-y-1 text-sm">
          <li>LA:Ao — {formatNumberOrDash(calculated.laAoRatio)}</li>
          <li>FS% — {formatNumberOrDash(calculated.fsPercent, "%")}</li>
          <li>E:A — {formatNumberOrDash(calculated.eaRatio)}</li>
          <li>Wall thickness — {calculated.wallThicknessSummary ?? "—"}</li>
        </ul>
        {calculated.warnings.length > 0 ? (
          <div className="mt-3 rounded border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950">
            <p className="font-semibold">Warnings</p>
            <ul className="list-disc pl-4">
              {calculated.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Pattern recognition summary</h2>
        <p className="mt-1 text-xs text-neutral-600">
          Educational / decision support only — not a diagnosis.
        </p>
        <ul className="mt-2 space-y-2 text-sm">
          {interpretation.findings.map((f) => (
            <li key={f.id}>
              <span className="font-semibold">{f.title}: </span>
              {f.detail}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Report notes</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm">
          {record.reportNotes || "—"}
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Attached images</h2>
        {record.attachments?.length ? (
          <ul className="mt-2 space-y-1 text-sm">
            {record.attachments.map((img) => (
              <li key={img.id}>
                {img.fileName} — {img.url}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm">—</p>
        )}
      </section>

      <footer className="border-t pt-4 text-xs text-neutral-600">
        This app is for educational and clinical support purposes only and is not
        a substitute for specialist cardiology interpretation.
      </footer>
    </div>
  );
}
