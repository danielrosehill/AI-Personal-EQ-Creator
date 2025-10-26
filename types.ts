export interface VocalProfile {
  description: string;
  fundamentalRange: string;
  keyCharacteristics: string[];
}

export interface EQSetting {
  frequency: number;
  gain: number;
}

export interface GeminiAnalysisResult {
    vocalProfile: VocalProfile;
    eqPreset: EQSetting[];
    audacityXml: string;
}