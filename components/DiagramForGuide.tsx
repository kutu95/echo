"use client";

import type { DiagramViewId } from "@/types/models";
import { HeartBaseShortAxisSvg } from "@/components/diagrams/HeartBaseShortAxisSvg";
import { PapillaryShortAxisSvg } from "@/components/diagrams/PapillaryShortAxisSvg";
import { OptionalSchematicSvg } from "@/components/diagrams/OptionalSchematicSvg";

type Props = {
  view: DiagramViewId;
  highlight?: string | null;
};

export function DiagramForGuide({ view, highlight }: Props) {
  if (view === "heartBaseSax")
    return <HeartBaseShortAxisSvg highlight={highlight} />;
  if (view === "papillarySax")
    return <PapillaryShortAxisSvg highlight={highlight} />;
  return <OptionalSchematicSvg highlight={highlight} />;
}
