/* ── Unit system types & conversion helpers ───────────────────── */

export type UnitSystem = 'imperial' | 'metric';

/* ── Weight ────────────────────────────────────────────────────── */

const LBS_PER_KG = 2.20462;

/** kg → lbs (rounded to 1 dp) */
export function kgToLbs(kg: number): number {
  return Math.round(kg * LBS_PER_KG * 10) / 10;
}

/** lbs → kg (rounded to 1 dp) */
export function lbsToKg(lbs: number): number {
  return Math.round((lbs / LBS_PER_KG) * 10) / 10;
}

/** Format weight for display */
export function formatWeight(kg: number, system: UnitSystem): string {
  return system === 'imperial'
    ? `${kgToLbs(kg)} lbs`
    : `${Math.round(kg * 10) / 10} kg`;
}

/* ── Height ────────────────────────────────────────────────────── */

const IN_PER_CM = 0.393701;

export type FtIn = { ft: number; inches: number };

/** cm → feet + inches (whole numbers) */
export function cmToFtIn(cm: number): FtIn {
  const totalIn = Math.round(cm * IN_PER_CM);
  return { ft: Math.floor(totalIn / 12), inches: totalIn % 12 };
}

/** feet + inches → cm (rounded to 1 dp) */
export function ftInToCm(ft: number, inches: number): number {
  return Math.round((ft * 12 + inches) / IN_PER_CM * 10) / 10;
}

/** cm → total inches */
export function cmToIn(cm: number): number {
  return Math.round(cm * IN_PER_CM);
}

/** Format height for display */
export function formatHeight(cm: number, system: UnitSystem): string {
  if (system === 'imperial') {
    const { ft, inches } = cmToFtIn(cm);
    return `${ft}′${inches}″`;
  }
  return `${Math.round(cm * 10) / 10} cm`;
}

/* ── Temperature ───────────────────────────────────────────────── */

/** Celsius → Fahrenheit (rounded to whole number) */
export function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

/** Fahrenheit → Celsius (rounded to 1 dp) */
export function fToC(f: number): number {
  return Math.round(((f - 32) * 5) / 9 * 10) / 10;
}

/** Format temperature for display */
export function formatTemp(tempC: number, system: UnitSystem): string {
  return system === 'imperial'
    ? `${cToF(tempC)}°F`
    : `${Math.round(tempC * 10) / 10}°C`;
}

/** Temperature unit label */
export function tempUnit(system: UnitSystem): string {
  return system === 'imperial' ? '°F' : '°C';
}

/** Display-ready temperature number (no unit suffix) */
export function tempValue(tempC: number, system: UnitSystem): number {
  return system === 'imperial' ? cToF(tempC) : Math.round(tempC * 10) / 10;
}
