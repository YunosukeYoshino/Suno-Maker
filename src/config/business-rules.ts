/**
 * ビジネスルール定数定義
 *
 * このファイルはビジネスロジックで使用される定数値を一元管理します。
 * テストコードでハードコードを使用する代わりに、これらの定数を参照してください。
 */

/**
 * スタイルフィールドに関するビジネスルール
 */
export const STYLE_FIELD_RULES = {
  /** 最大文字数 */
  MAX_LENGTH: 120,
  /** 最小文字数 */
  MIN_LENGTH: 1,
  /** 推奨文字数範囲 */
  RECOMMENDED_RANGE: {
    MIN: 20,
    MAX: 80,
  },
  /** 推奨要素数範囲 */
  RECOMMENDED_ELEMENT_COUNT: {
    MIN: 3,
    MAX: 7,
  },
} as const;

/**
 * 品質スコアに関するビジネスルール
 */
export const QUALITY_SCORE_RULES = {
  /** 最小値 */
  MIN: 0,
  /** 最大値 */
  MAX: 100,
  /** 高品質の閾値 */
  HIGH_THRESHOLD: 80,
  /** 中品質の閾値 */
  MEDIUM_THRESHOLD: 60,
  /** 低品質の閾値 */
  LOW_THRESHOLD: 40,
} as const;

/**
 * コンプライアンススコアに関するビジネスルール
 */
export const COMPLIANCE_SCORE_RULES = {
  /** 完全安全スコア */
  PERFECT_SCORE: 100,
  /** 安全レベル */
  SAFETY_LEVELS: {
    SAFE: "safe",
    CAUTION: "caution",
    WARNING: "warning",
    UNSAFE: "unsafe",
  },
  /** レベル別閾値 */
  LEVEL_THRESHOLDS: {
    SAFE_MIN: 90,
    CAUTION_MIN: 70,
    WARNING_MIN: 40,
    UNSAFE_MAX: 39,
  },
} as const;

/**
 * ジャンルに関するビジネスルール
 */
export const GENRE_RULES = {
  /** サポート必須ジャンル数（最小） */
  MIN_SUPPORTED_COUNT: 120,
  /** 1回の選択可能ジャンル数（最大） */
  MAX_SELECTION: 5,
  /** 主要ジャンル数（最小） */
  MIN_MAIN_GENRES: 15,
  /** 必須ジャンル例（テスト検証用） */
  REQUIRED_GENRES: [
    "Rock",
    "Pop",
    "Hip-Hop",
    "EDM",
    "Jazz",
    "Classical",
    "Blues",
    "Country",
    "Folk",
    "Reggae",
  ],
  /** 文化的・地域別必須ジャンル */
  CULTURAL_GENRES: ["J-Pop", "K-Pop", "Afrobeat", "Reggaeton", "Flamenco"],
  /** モダンジャンル */
  MODERN_GENRES: ["Future Bass", "Phonk", "Drill", "Hyperpop", "Vaporwave"],
} as const;

/**
 * 成功事例品質計算に関するビジネスルール
 */
export const SUCCESS_EXAMPLE_RULES = {
  /** レーティング係数 */
  RATING_MULTIPLIER: 20,
  /** 再生回数係数 */
  PLAY_COUNT_DIVISOR: 1000,
  PLAY_COUNT_MULTIPLIER: 10,
  PLAY_COUNT_MAX_SCORE: 10,
  /** いいね数係数 */
  LIKE_COUNT_DIVISOR: 100,
  LIKE_COUNT_MULTIPLIER: 5,
  LIKE_COUNT_MAX_SCORE: 5,
  /** 評価範囲 */
  RATING_RANGE: {
    MIN: 1,
    MAX: 5,
  },
} as const;

/**
 * 言語に関するビジネスルール
 */
export const LANGUAGE_RULES = {
  /** サポート言語コード */
  SUPPORTED_LANGUAGES: [
    "en", // English
    "ja", // Japanese
    "ko", // Korean
    "es", // Spanish
    "fr", // French
    "de", // German
    "it", // Italian
    "pt", // Portuguese
    "zh", // Chinese
    "ar", // Arabic
  ],
  /** デフォルト言語 */
  DEFAULT_LANGUAGE: "en",
} as const;

/**
 * テンプレートに関するビジネスルール
 */
export const TEMPLATE_RULES = {
  /** カテゴリ */
  CATEGORIES: {
    GENRE_SPECIFIC: "genre-specific",
    LANGUAGE_SPECIFIC: "language-specific",
    MOOD_SPECIFIC: "mood-specific",
  },
  /** 必須ムードタグ */
  REQUIRED_MOOD_TAGS: [
    "melancholic",
    "happy",
    "romantic",
    "intense",
    "chill",
    "motivational",
  ],
  /** 日本語特有構造キーワード */
  JAPANESE_STRUCTURE_KEYWORDS: [
    "Aメロ",
    "Bメロ",
    "サビ",
    "イントロ",
    "アウトロ",
  ],
} as const;

/**
 * 統計・カウントに関するビジネスルール
 */
export const STATISTICS_RULES = {
  /** 最小カウント値 */
  MIN_COUNT: 0,
  /** 検索ベクトル次元数 */
  SEARCH_VECTOR_DIMENSIONS: 100,
} as const;

/**
 * 全ビジネスルールの統合エクスポート
 */
export const BUSINESS_RULES = {
  STYLE_FIELD: STYLE_FIELD_RULES,
  QUALITY_SCORE: QUALITY_SCORE_RULES,
  COMPLIANCE_SCORE: COMPLIANCE_SCORE_RULES,
  GENRE: GENRE_RULES,
  SUCCESS_EXAMPLE: SUCCESS_EXAMPLE_RULES,
  LANGUAGE: LANGUAGE_RULES,
  TEMPLATE: TEMPLATE_RULES,
  STATISTICS: STATISTICS_RULES,
} as const;

/**
 * 型定義
 */
export type BusinessRules = typeof BUSINESS_RULES;
export type QualityLevel = "high" | "medium" | "low";
export type SafetyLevel =
  (typeof COMPLIANCE_SCORE_RULES.SAFETY_LEVELS)[keyof typeof COMPLIANCE_SCORE_RULES.SAFETY_LEVELS];
