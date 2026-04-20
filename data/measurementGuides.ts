import type { MeasurementGuide, MeasurementKey } from "@/types/models";

/**
 * Instructional content for each measurement.
 * Drop PNG/JPEG assets into `public/guides/` and keep filenames stable.
 * When you replace an image, bump GUIDE_IMAGE_VERSION to refresh browser cache.
 */
const GUIDE_IMAGE_VERSION = "v1";
const guideImage = (fileName: string) => `/guides/${fileName}?v=${GUIDE_IMAGE_VERSION}`;

export const measurementGuides: MeasurementGuide[] = [
  {
    key: "ao",
    title: "Aorta diameter (Ao)",
    shortLabel: "Ao",
    unit: "cm",
    requiredView: "Right parasternal short-axis at the heart base",
    cardiacTiming: "Early diastole; same cine frame as LA measurement",
    landmarks:
      "Inner-edge to inner-edge of the aortic root in short-axis. Align the plane through the aortic valve commissures so the valve appears as a symmetric mercedes sign when possible.",
    pitfalls: [
      "Oblique plane can overestimate diameter.",
      "Confusing the pulmonary artery for the aorta.",
      "Measuring on systolic frames when LA:Ao is intended from early diastole.",
    ],
    clinicalWhy:
      "Ao serves as an internal body-size proxy on the same frame as LA so LA:Ao can be less affected by gain/zoom than LA alone.",
    significance:
      "LA:Ao is widely used as a quick screen for left atrial enlargement relative to body size, though breed-specific ranges may differ.",
    localImagePath: guideImage("ao.png"),
    diagramView: "heartBaseSax",
    diagramHighlight: "Ao",
  },
  {
    key: "la",
    title: "Left atrium diameter (LA)",
    shortLabel: "LA",
    unit: "cm",
    requiredView: "Right parasternal short-axis at the heart base",
    cardiacTiming: "Early diastole; same frame as Ao",
    landmarks:
      "Widest left atrial diameter in that short-axis plane, typically from the interatrial septum to the lateral LA wall (method should match your reference).",
    pitfalls: [
      "Off-axis cuts can falsely shrink or enlarge LA.",
      "Including pulmonary veins in the caliper line.",
      "Using a frame mis-matched to Ao timing.",
    ],
    clinicalWhy:
      "LA size reflects chronic volume overload (e.g., mitral regurgitation) and atrial pressure/remodeling.",
    significance:
      "LA:Ao > 1.6 is a common general cut-point for suspicion of enlargement; many institutions refine by breed.",
    localImagePath: guideImage("la.png"),
    diagramView: "heartBaseSax",
    diagramHighlight: "LA",
  },
  {
    key: "lvidD",
    title: "Left ventricular internal dimension in diastole (LVIDd)",
    shortLabel: "LVIDd",
    unit: "cm",
    requiredView:
      "Right parasternal short-axis at papillary muscle level (2D-guided M-mode)",
    cardiacTiming: "End-diastole — largest LV cavity dimension",
    landmarks:
      "Standard M-mode line through the center of LV cavity; caliper inner-edge septum to inner-edge posterior wall.",
    pitfalls: [
      "M-mode line not bisecting true minor axis.",
      "Including trabeculations in the cavity line.",
      "Measuring off-papillary level (basal or apical drift).",
    ],
    clinicalWhy:
      "LVIDd contextualizes chamber size for systolic function indices and wall thickness.",
    significance:
      "Used with LVIDs to compute FS% and to screen for dilation versus concentric remodeling.",
    localImagePath: guideImage("lvidd.png"),
    diagramView: "papillarySax",
    diagramHighlight: "LVIDd",
  },
  {
    key: "lvidS",
    title: "Left ventricular internal dimension in systole (LVIDs)",
    shortLabel: "LVIDs",
    unit: "cm",
    requiredView:
      "Right parasternal short-axis at papillary muscle level (2D-guided M-mode)",
    cardiacTiming: "End-systole — smallest LV cavity dimension",
    landmarks:
      "Same M-mode line as LVIDd; inner-edge to inner-edge at maximal septal thickening / minimal cavity width.",
    pitfalls: [
      "Choosing a premature systolic frame.",
      "Rhythm irregularity causing non-representative beat.",
    ],
    clinicalWhy:
      "Paired with LVIDd to estimate fractional shortening.",
    significance:
      "FS% is load- and heart-rate dependent; abnormal FS prompts review of image quality and loading conditions.",
    localImagePath: guideImage("lvids.png"),
    diagramView: "papillarySax",
    diagramHighlight: "LVIDs",
  },
  {
    key: "ivsD",
    title: "Interventricular septum in diastole (IVSd)",
    shortLabel: "IVSd",
    unit: "cm",
    requiredView:
      "Right parasternal short-axis papillary level — M-mode or 2D measurement",
    cardiacTiming: "Diastole (same timing as LVIDd)",
    landmarks:
      "Septal thickness at the standard M-mode cursor intersecting RV side of septum to LV cavity interface.",
    pitfalls: [
      "Right ventricular moderator band confusion.",
      "Gain settings that thicken trabecular echoes.",
    ],
    clinicalWhy:
      "Septal thickness helps classify concentric remodeling/hypertrophy.",
    significance:
      "Interpret with breed, body weight, and LV cavity size — dogs vary widely.",
    localImagePath: guideImage("ivsd.png"),
    diagramView: "papillarySax",
    diagramHighlight: "IVSd",
  },
  {
    key: "ivsS",
    title: "Interventricular septum in systole (IVSs)",
    shortLabel: "IVSs",
    unit: "cm",
    requiredView: "Same as IVSd",
    cardiacTiming: "Systole (peak thickening frame)",
    landmarks: "Same anatomic line as IVSd at maximal systolic thickness.",
    pitfalls: [
      "Off-axis systolic artifact.",
      "Post-extrasystolic potentiation changing thickness.",
    ],
    clinicalWhy: "Confirms expected systolic thickening and flags timing errors.",
    significance: "Should be ≥ IVSd; reversal suggests measurement error.",
    localImagePath: guideImage("ivss.png"),
    diagramView: "papillarySax",
    diagramHighlight: "IVSs",
  },
  {
    key: "lvpwD",
    title: "Left ventricular posterior wall in diastole (LVPWd)",
    shortLabel: "LVPWd",
    unit: "cm",
    requiredView: "Right parasternal short-axis papillary level",
    cardiacTiming: "Diastole (aligned with LVIDd)",
    landmarks:
      "Posterior wall thickness from epicardial/pericardial interface to endocardium — match your reference atlas convention.",
    pitfalls: [
      "Pericardial effusion stripe included in wall.",
      "Pleural fat mistaken for wall.",
    ],
    clinicalWhy:
      "Posterior wall thickness completes relative wall thickness thinking with IVSd.",
    significance:
      "Thick walls with small cavity may be normal for breed or suggest dynamic physiology; integrate FS and Doppler.",
    localImagePath: guideImage("lvpwd.png"),
    diagramView: "papillarySax",
    diagramHighlight: "LVPWd",
  },
  {
    key: "lvpwS",
    title: "Left ventricular posterior wall in systole (LVPWs)",
    shortLabel: "LVPWs",
    unit: "cm",
    requiredView: "Same as LVPWd",
    cardiacTiming: "Systole",
    landmarks: "Same line as LVPWd at maximal systolic thickness.",
    pitfalls: ["Same as LVPWd plus frame selection errors."],
    clinicalWhy: "Paired with LVPWd to sanity-check timing.",
    significance: "Should be ≥ LVPWd; reversal suggests measurement error.",
    localImagePath: guideImage("lvpws.png"),
    diagramView: "papillarySax",
    diagramHighlight: "LVPWs",
  },
  {
    key: "lvLength",
    title: "Optional LV length",
    shortLabel: "LV length",
    unit: "cm",
    requiredView: "Right parasternal long-axis or apical views (method-dependent)",
    cardiacTiming: "Diastole (method-dependent)",
    landmarks:
      "Length from mitral annulus plane to apex — exact landmarks depend on your chosen volumetric or linear method.",
    pitfalls: [
      "Foreshortened long-axis underestimates length.",
      "Different methods are not interchangeable.",
    ],
    clinicalWhy:
      "Optional adjunct for volume estimates or sphericity assessment when you use length-based methods.",
    significance:
      "Not required for FS% or LA:Ao in this tool; helpful for selected research or advanced indices.",
    localImagePath: guideImage("lv-length.png"),
    diagramView: "optionalSchematic",
    diagramHighlight: "LV",
  },
  {
    key: "mitralE",
    title: "Optional mitral E wave velocity",
    shortLabel: "Mitral E",
    unit: "m/s",
    requiredView: "Apical 4-chamber or RV-focused mitral inflow PW Doppler",
    cardiacTiming: "Peak early diastolic E wave",
    landmarks:
      "Sample volume at leaflet tips (or annulus per your protocol); measure peak E velocity.",
    pitfalls: [
      "Angle correction errors.",
      "Fusion of E and A at high heart rates.",
    ],
    clinicalWhy:
      "Provides diastolic filling information when paired with A wave.",
    significance:
      "E:A trends with relaxation and preload but is heart-rate dependent.",
    localImagePath: guideImage("mitral-e.png"),
    diagramView: "optionalSchematic",
    diagramHighlight: "MV",
  },
  {
    key: "mitralA",
    title: "Optional mitral A wave velocity",
    shortLabel: "Mitral A",
    unit: "m/s",
    requiredView: "Same PW mitral inflow trace as E wave",
    cardiacTiming: "Late diastolic A wave peak",
    landmarks: "Peak A velocity after atrial contraction.",
    pitfalls: [
      "Irregular rhythms invalidate a single-beat A measurement.",
      "Fusion with E wave.",
    ],
    clinicalWhy: "Combined with E for E:A ratio in this tool.",
    significance:
      "Very rough diastolic screen — specialist indices (E/e′, etc.) are not implemented here.",
    localImagePath: guideImage("mitral-a.png"),
    diagramView: "optionalSchematic",
    diagramHighlight: "MV",
  },
  {
    key: "aorticVelocity",
    title: "Optional aortic outflow velocity",
    shortLabel: "Ao Vmax",
    unit: "m/s",
    requiredView: "Left apical 5-chamber or subcostal continuous-wave as needed",
    cardiacTiming: "Systolic peak",
    landmarks:
      "Align Doppler with LV outflow; measure peak velocity; apply angle correction only when appropriate.",
    pitfalls: [
      "Subvalvular acceleration mistaken for valvular stenosis.",
      "Poor alignment underestimates velocity.",
    ],
    clinicalWhy:
      "Screens for dynamic obstruction or stenosis when clinically relevant.",
    significance:
      "Interpret with pressure gradients and 2D morphology — not a standalone diagnosis.",
    localImagePath: guideImage("ao-vmax.png"),
    diagramView: "optionalSchematic",
    diagramHighlight: "Ao",
  },
];

export const measurementGuideByKey: Record<
  MeasurementKey,
  MeasurementGuide
> = measurementGuides.reduce(
  (acc, g) => {
    acc[g.key] = g;
    return acc;
  },
  {} as Record<MeasurementKey, MeasurementGuide>
);
