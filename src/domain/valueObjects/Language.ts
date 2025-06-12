import { z } from "zod";

const SUPPORTED_LANGUAGES = [
  "en",
  "ja",
  "es",
  "fr",
  "de",
  "it",
  "pt",
  "ru",
  "ko",
  "zh",
  "ar",
  "hi",
  "th",
  "vi",
  "id",
  "ms",
  "tl",
] as const;

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const LanguageSchema = z.enum(SUPPORTED_LANGUAGES);

type QualityLevel = "highest" | "high" | "medium" | "basic";
type ScriptType =
  | "latin"
  | "hiragana"
  | "katakana"
  | "kanji"
  | "cyrillic"
  | "arabic"
  | "devanagari"
  | "korean"
  | "chinese";

interface LanguageInfo {
  code: SupportedLanguage;
  displayName: string;
  nativeName: string;
  qualityLevel: QualityLevel;
  recommendedScript: ScriptType;
  optimizationSuggestions: string[];
  mixCompatible: readonly SupportedLanguage[];
}

const LANGUAGE_INFO: Record<SupportedLanguage, LanguageInfo> = {
  en: {
    code: "en",
    displayName: "English",
    nativeName: "English",
    qualityLevel: "highest",
    recommendedScript: "latin",
    optimizationSuggestions: [
      "クリアな発音のための単語選択",
      "リズムとメーターを考慮",
      "韻律パターンの最適化",
      "ボーカルフレージングに配慮",
    ],
    mixCompatible: ["ja", "es", "fr", "de", "it", "pt", "ko", "zh"],
  },
  ja: {
    code: "ja",
    displayName: "日本語",
    nativeName: "日本語",
    qualityLevel: "high",
    recommendedScript: "hiragana",
    optimizationSuggestions: [
      "ひらがな表記を推奨",
      "複雑な漢字は避ける",
      "助詞の読み方に注意（は→wa、へ→e）",
      "長音符の使用を控える",
      "カタカナは外来語のみ使用",
    ],
    mixCompatible: ["en", "ko", "zh"],
  },
  es: {
    code: "es",
    displayName: "Español",
    nativeName: "Español",
    qualityLevel: "high",
    recommendedScript: "latin",
    optimizationSuggestions: [
      "アクセント記号の省略を推奨",
      "クリアな子音の使用",
      "リズミカルな音節構造を活用",
    ],
    mixCompatible: ["en", "fr", "it", "pt"],
  },
  fr: {
    code: "fr",
    displayName: "Français",
    nativeName: "Français",
    qualityLevel: "high",
    recommendedScript: "latin",
    optimizationSuggestions: [
      "フランス語のリエゾンを考慮",
      "アクセント記号の省略を推奨",
      "鼻音の適切な表現",
    ],
    mixCompatible: ["en", "es", "it", "de"],
  },
  de: {
    code: "de",
    displayName: "Deutsch",
    nativeName: "Deutsch",
    qualityLevel: "high",
    recommendedScript: "latin",
    optimizationSuggestions: [
      "ウムラウトの省略を推奨",
      "複合語の分割を考慮",
      "強勢パターンの活用",
    ],
    mixCompatible: ["en", "fr", "it"],
  },
  it: {
    code: "it",
    displayName: "Italiano",
    nativeName: "Italiano",
    qualityLevel: "high",
    recommendedScript: "latin",
    optimizationSuggestions: [
      "イタリア語の流れるような音韻を活用",
      "アクセント記号の省略を推奨",
      "母音の明確な発音",
    ],
    mixCompatible: ["en", "es", "fr"],
  },
  pt: {
    code: "pt",
    displayName: "Português",
    nativeName: "Português",
    qualityLevel: "medium",
    recommendedScript: "latin",
    optimizationSuggestions: [
      "ポルトガル語の鼻音を考慮",
      "アクセント記号の省略を推奨",
    ],
    mixCompatible: ["en", "es"],
  },
  ru: {
    code: "ru",
    displayName: "Русский",
    nativeName: "Русский",
    qualityLevel: "medium",
    recommendedScript: "cyrillic",
    optimizationSuggestions: [
      "キリル文字のローマ字転写を検討",
      "語尾変化の簡略化",
    ],
    mixCompatible: ["en"],
  },
  ko: {
    code: "ko",
    displayName: "한국어",
    nativeName: "한국어",
    qualityLevel: "high",
    recommendedScript: "korean",
    optimizationSuggestions: [
      "ハングルの発音表記を明確に",
      "音韻変化を考慮した表記",
    ],
    mixCompatible: ["en", "ja"],
  },
  zh: {
    code: "zh",
    displayName: "中文",
    nativeName: "中文",
    qualityLevel: "medium",
    recommendedScript: "chinese",
    optimizationSuggestions: ["ピンイン表記を併用", "声調の考慮"],
    mixCompatible: ["en", "ja"],
  },
  ar: {
    code: "ar",
    displayName: "العربية",
    nativeName: "العربية",
    qualityLevel: "basic",
    recommendedScript: "arabic",
    optimizationSuggestions: [
      "ローマ字転写を推奨",
      "アラビア語の音韻特性を考慮",
    ],
    mixCompatible: ["en"],
  },
  hi: {
    code: "hi",
    displayName: "हिन्दी",
    nativeName: "हिन्दी",
    qualityLevel: "basic",
    recommendedScript: "devanagari",
    optimizationSuggestions: ["ローマ字転写を推奨", "ヒンディー語の音韻を考慮"],
    mixCompatible: ["en"],
  },
  th: {
    code: "th",
    displayName: "ไทย",
    nativeName: "ไทย",
    qualityLevel: "basic",
    recommendedScript: "latin",
    optimizationSuggestions: ["タイ語のトーンを考慮", "ローマ字表記を推奨"],
    mixCompatible: ["en"],
  },
  vi: {
    code: "vi",
    displayName: "Tiếng Việt",
    nativeName: "Tiếng Việt",
    qualityLevel: "basic",
    recommendedScript: "latin",
    optimizationSuggestions: [
      "ベトナム語のトーンマークを省略",
      "クリアな音韻構造",
    ],
    mixCompatible: ["en"],
  },
  id: {
    code: "id",
    displayName: "Bahasa Indonesia",
    nativeName: "Bahasa Indonesia",
    qualityLevel: "basic",
    recommendedScript: "latin",
    optimizationSuggestions: [
      "インドネシア語の音韻を活用",
      "シンプルな音節構造",
    ],
    mixCompatible: ["en", "ms"],
  },
  ms: {
    code: "ms",
    displayName: "Bahasa Melayu",
    nativeName: "Bahasa Melayu",
    qualityLevel: "basic",
    recommendedScript: "latin",
    optimizationSuggestions: ["マレー語の音韻を活用", "シンプルな音節構造"],
    mixCompatible: ["en", "id"],
  },
  tl: {
    code: "tl",
    displayName: "Filipino",
    nativeName: "Filipino",
    qualityLevel: "basic",
    recommendedScript: "latin",
    optimizationSuggestions: [
      "フィリピン語の音韻を活用",
      "スペイン語の影響を考慮",
    ],
    mixCompatible: ["en"],
  },
};

export class Language {
  private constructor(private readonly _value: SupportedLanguage) {}

  static create(value: string): Language {
    try {
      const validatedValue = LanguageSchema.parse(value);
      return new Language(validatedValue);
    } catch {
      throw new Error("サポートされていない言語です");
    }
  }

  static createDefault(): Language {
    return new Language("en");
  }

  get value(): SupportedLanguage {
    return this._value;
  }

  getDisplayName(): string {
    return LANGUAGE_INFO[this._value].displayName;
  }

  getNativeName(): string {
    return LANGUAGE_INFO[this._value].nativeName;
  }

  getQualityLevel(): QualityLevel {
    return LANGUAGE_INFO[this._value].qualityLevel;
  }

  getRecommendedScript(): ScriptType {
    return LANGUAGE_INFO[this._value].recommendedScript;
  }

  getOptimizationSuggestions(): readonly string[] {
    return LANGUAGE_INFO[this._value].optimizationSuggestions;
  }

  canMixWith(other: Language): boolean {
    return LANGUAGE_INFO[this._value].mixCompatible.includes(other._value);
  }

  equals(other: Language): boolean {
    return this._value === other._value;
  }

  static getSupportedLanguages(): readonly SupportedLanguage[] {
    return SUPPORTED_LANGUAGES;
  }

  static getHighQualityLanguages(): readonly SupportedLanguage[] {
    return SUPPORTED_LANGUAGES.filter(
      (lang) =>
        LANGUAGE_INFO[lang].qualityLevel === "highest" ||
        LANGUAGE_INFO[lang].qualityLevel === "high"
    );
  }

  static getLanguageInfo(code: SupportedLanguage): LanguageInfo {
    return LANGUAGE_INFO[code];
  }

  isHighQuality(): boolean {
    return (
      this.getQualityLevel() === "highest" || this.getQualityLevel() === "high"
    );
  }

  getOptimalMixRatio(other: Language): { primary: number; secondary: number } {
    // 英語との組み合わせの最適比率
    if (this._value === "en" && other._value === "ja") {
      return { primary: 70, secondary: 30 };
    }
    if (this._value === "ja" && other._value === "en") {
      return { primary: 70, secondary: 30 };
    }

    // その他の組み合わせのデフォルト比率
    return { primary: 80, secondary: 20 };
  }
}
