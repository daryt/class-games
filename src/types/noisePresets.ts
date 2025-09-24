export type NoisePresetKey = "whisper" | "partner" | "group";

export interface CalibrationSummary {
  preset: NoisePresetKey;
  baseline: number;
  p80: number;
  yellow: number;
  red: number;
}
