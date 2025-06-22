export interface MusicParameters {
  energy: number; // 1-10 (低エネルギーから高エネルギー)
  complexity: number; // 1-10 (シンプルから複雑)
  tempo: number; // 1-10 (スローからファスト)
  emotional_intensity: number; // 1-10 (穏やかから激しい)
}

export const DEFAULT_MUSIC_PARAMETERS: MusicParameters = {
  energy: 5,
  complexity: 5,
  tempo: 5,
  emotional_intensity: 5,
};

/**
 * 音楽パラメータのバリデーション
 */
export function validateMusicParameters(
  parameters: Partial<MusicParameters>
): string[] {
  const errors: string[] = [];

  const validateRange = (value: number | undefined, name: string): void => {
    if (value !== undefined && (value < 1 || value > 10)) {
      errors.push(`${name}は1から10の範囲で設定してください`);
    }
  };

  validateRange(parameters.energy, "Energy");
  validateRange(parameters.complexity, "Complexity");
  validateRange(parameters.tempo, "Tempo");
  validateRange(parameters.emotional_intensity, "Emotional Intensity");

  return errors;
}

/**
 * 音楽パラメータの文字列表現生成
 */
export function musicParametersToStyleKeywords(
  parameters: Partial<MusicParameters>
): string[] {
  const keywords: string[] = [];

  const { energy, complexity, tempo, emotional_intensity } = parameters;

  // エネルギーレベルを追加
  if (energy !== undefined) {
    if (energy >= 8) {
      keywords.push("high energy", "intense");
    } else if (energy >= 6) {
      keywords.push("energetic");
    } else if (energy >= 4) {
      keywords.push("moderate");
    } else {
      keywords.push("calm", "relaxed");
    }
  }

  // 複雑さレベルを追加
  if (complexity !== undefined) {
    if (complexity >= 8) {
      keywords.push("complex", "intricate");
    } else if (complexity >= 6) {
      keywords.push("layered");
    } else if (complexity <= 3) {
      keywords.push("simple", "minimalist");
    }
  }

  // テンポを追加
  if (tempo !== undefined) {
    if (tempo >= 8) {
      keywords.push("fast tempo", "driving");
    } else if (tempo >= 6) {
      keywords.push("upbeat");
    } else if (tempo <= 3) {
      keywords.push("slow tempo", "ballad");
    }
  }

  // 感情的強度を追加
  if (emotional_intensity !== undefined) {
    if (emotional_intensity >= 8) {
      keywords.push("emotionally intense", "passionate");
    } else if (emotional_intensity >= 6) {
      keywords.push("expressive");
    } else if (emotional_intensity <= 3) {
      keywords.push("subtle", "understated");
    }
  }

  return keywords;
}
