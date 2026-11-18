/**
 * The wizard's step order, in one place.
 *
 * `wizardState.step` is a number. Each flow lists its steps in order, with
 * a `skip` rule for any step that some answers make unnecessary. Back,
 * Continue, the step count and the progress bar all read these lists, so a
 * skip rule lives here and nowhere else.
 */

/** Standard flow step numbers. */
export const STEP = {
  APPLICATION: 0,
  TECHNOLOGY: 1,
  ACTION: 2,
  ENVIRONMENT: 3,
  DUTY: 4,
  CONNECTION: 5,
  CIRCUITS: 6,
  GUARD: 7,
  FEATURES: 8,
  /** Results page. Medical stock results use it too. */
  RESULTS: 9,
} as const;

/**
 * Medical flow step numbers. Stock and custom share the fork (1), then
 * number their own steps from 2.
 */
export const MEDICAL_STEP = {
  FORK: 1,
  // Stock path
  ACTION: 2,
  ENVIRONMENT: 3,
  // Custom builder path
  CHANNEL: 2,
  PEDAL: 3,
  BUTTONS: 4,
  OUTPUT: 5,
  WIRED: 6,
  TOE_LOOP: 7,
  TREADLE: 8,
  LABELING: 9,
  LEDS: 10,
  SUMMARY: 11,
} as const;

/** The answers that decide which steps are skipped. */
export interface StepContext {
  /** Selected technology id ('' when none). */
  technology: string;
  /** Medical custom builder channel ('' when none). */
  channel: string;
  /** The application offers a single technology, so it is answered for the user. */
  technologyAutoAnswered: boolean;
}

interface StepDef {
  step: number;
  skip?: (ctx: StepContext) => boolean;
}

/** Pneumatic and wireless switches have no wiring: no Connection or Circuits step. */
export const skipsWiringSteps = (technology: string) =>
  technology === 'pneumatic' || technology === 'wireless';

const STANDARD_STEPS: StepDef[] = [
  { step: STEP.APPLICATION },
  { step: STEP.TECHNOLOGY, skip: ctx => ctx.technologyAutoAnswered },
  { step: STEP.ACTION },
  { step: STEP.ENVIRONMENT },
  { step: STEP.DUTY },
  { step: STEP.CONNECTION, skip: ctx => skipsWiringSteps(ctx.technology) },
  { step: STEP.CIRCUITS, skip: ctx => skipsWiringSteps(ctx.technology) },
  { step: STEP.GUARD },
  { step: STEP.FEATURES },
  { step: STEP.RESULTS },
];

const MEDICAL_STOCK_STEPS: StepDef[] = [
  { step: MEDICAL_STEP.FORK },
  { step: MEDICAL_STEP.ACTION },
  { step: MEDICAL_STEP.ENVIRONMENT },
];

const MEDICAL_CUSTOM_STEPS: StepDef[] = [
  { step: MEDICAL_STEP.FORK },
  { step: MEDICAL_STEP.CHANNEL },
  { step: MEDICAL_STEP.PEDAL },
  { step: MEDICAL_STEP.BUTTONS },
  { step: MEDICAL_STEP.OUTPUT },
  { step: MEDICAL_STEP.WIRED },
  { step: MEDICAL_STEP.TOE_LOOP },
  // Crescent pedals have no treadle choice
  { step: MEDICAL_STEP.TREADLE, skip: ctx => ctx.channel === 'crescent' },
  { step: MEDICAL_STEP.LABELING },
  { step: MEDICAL_STEP.LEDS },
  { step: MEDICAL_STEP.SUMMARY },
];

export type StepSequenceKey = 'standard' | 'medicalStock' | 'medicalCustom';

const SEQUENCES: Record<StepSequenceKey, StepDef[]> = {
  standard: STANDARD_STEPS,
  medicalStock: MEDICAL_STOCK_STEPS,
  medicalCustom: MEDICAL_CUSTOM_STEPS,
};

/** Which step list applies to the current flow. */
export function getSequenceKey(flow: string, medicalPath: string): StepSequenceKey {
  if (flow !== 'medical') return 'standard';
  return medicalPath === 'custom' ? 'medicalCustom' : 'medicalStock';
}

/** Step numbers the user actually sees, in order. */
export function visibleSteps(key: StepSequenceKey, ctx: StepContext): number[] {
  return SEQUENCES[key].filter(d => !d.skip?.(ctx)).map(d => d.step);
}

/** The step Continue goes to. */
export function nextStep(key: StepSequenceKey, step: number, ctx: StepContext): number {
  return visibleSteps(key, ctx).find(s => s > step) ?? step + 1;
}

/** The step Back goes to. */
export function prevStep(key: StepSequenceKey, step: number, ctx: StepContext): number {
  const earlier = visibleSteps(key, ctx).filter(s => s < step);
  return earlier.length > 0 ? earlier[earlier.length - 1] : step - 1;
}

/**
 * How many visible steps come before `step`. This is the step's 0-based
 * position for the progress bar and "Step X of Y" counter.
 */
export function stepPosition(key: StepSequenceKey, step: number, ctx: StepContext): number {
  return visibleSteps(key, ctx).filter(s => s < step).length;
}
