/**
 * テストデータ生成ユーティリティ
 *
 * ハードコードされた値の代わりに使用するテストデータを動的に生成します。
 * これにより、ビジネスルールの変更に対してテストが自動的に追従できます。
 */

import {
  BUSINESS_RULES,
  type QualityLevel,
  type SafetyLevel,
} from "~/config/business-rules";

/**
 * テストデータ生成クラス
 */
export class TestDataGenerator {
  /**
   * 有効なスタイルフィールドを生成
   */
  static generateValidStyleField(): string {
    const genres = ["Rock", "Pop", "Jazz", "Electronic"];
    const moods = ["energetic", "melancholic", "upbeat", "chill"];
    const instruments = ["guitar", "piano", "drums", "synthesizer"];

    const selectedGenre = genres[Math.floor(Math.random() * genres.length)];
    const selectedMood = moods[Math.floor(Math.random() * moods.length)];
    const selectedInstrument =
      instruments[Math.floor(Math.random() * instruments.length)];

    return `${selectedGenre}, ${selectedMood}, ${selectedInstrument}`;
  }

  /**
   * 指定した長さのスタイルフィールドを生成
   */
  static generateStyleFieldWithLength(length: number): string {
    if (length <= 0) return "";
    if (length === 1) return "A";

    const base = "Rock, energetic";
    if (length <= base.length) {
      return base.substring(0, length);
    }

    // 長さを調整するためにパディング
    const padding = "A".repeat(length - base.length);
    return base + padding;
  }

  /**
   * 最大長のスタイルフィールドを生成（境界値テスト用）
   */
  static generateMaxLengthStyleField(): string {
    return TestDataGenerator.generateStyleFieldWithLength(
      BUSINESS_RULES.STYLE_FIELD.MAX_LENGTH
    );
  }

  /**
   * 長すぎるスタイルフィールドを生成（エラーテスト用）
   */
  static generateTooLongStyleField(): string {
    return TestDataGenerator.generateStyleFieldWithLength(
      BUSINESS_RULES.STYLE_FIELD.MAX_LENGTH + 1
    );
  }

  /**
   * 品質レベルに応じたスコアを生成
   */
  static generateQualityScore(level: QualityLevel): number {
    const { HIGH_THRESHOLD, MEDIUM_THRESHOLD, MIN, MAX } =
      BUSINESS_RULES.QUALITY_SCORE;

    switch (level) {
      case "high":
        return (
          Math.floor(Math.random() * (MAX - HIGH_THRESHOLD + 1)) +
          HIGH_THRESHOLD
        );
      case "medium":
        return (
          Math.floor(Math.random() * (HIGH_THRESHOLD - MEDIUM_THRESHOLD)) +
          MEDIUM_THRESHOLD
        );
      case "low":
        return Math.floor(Math.random() * (MEDIUM_THRESHOLD - MIN)) + MIN;
      default:
        throw new Error(`Unknown quality level: ${level}`);
    }
  }

  /**
   * 完全なコンプライアンススコアを生成
   */
  static generatePerfectComplianceScore(): number {
    return BUSINESS_RULES.COMPLIANCE_SCORE.PERFECT_SCORE;
  }

  /**
   * 指定された安全レベルのコンプライアンススコアを生成
   */
  static generateComplianceScoreForLevel(level: SafetyLevel): number {
    const { LEVEL_THRESHOLDS } = BUSINESS_RULES.COMPLIANCE_SCORE;

    switch (level) {
      case "safe":
        return (
          Math.floor(Math.random() * (100 - LEVEL_THRESHOLDS.SAFE_MIN + 1)) +
          LEVEL_THRESHOLDS.SAFE_MIN
        );
      case "caution":
        return (
          Math.floor(
            Math.random() *
              (LEVEL_THRESHOLDS.SAFE_MIN - LEVEL_THRESHOLDS.CAUTION_MIN)
          ) + LEVEL_THRESHOLDS.CAUTION_MIN
        );
      case "warning":
        return (
          Math.floor(
            Math.random() *
              (LEVEL_THRESHOLDS.CAUTION_MIN - LEVEL_THRESHOLDS.WARNING_MIN)
          ) + LEVEL_THRESHOLDS.WARNING_MIN
        );
      case "unsafe":
        return Math.floor(Math.random() * (LEVEL_THRESHOLDS.UNSAFE_MAX + 1));
      default:
        throw new Error(`Unknown safety level: ${level}`);
    }
  }

  /**
   * ランダムなジャンル名を生成
   */
  static generateRandomGenre(): string {
    const { REQUIRED_GENRES } = BUSINESS_RULES.GENRE;
    return REQUIRED_GENRES[Math.floor(Math.random() * REQUIRED_GENRES.length)];
  }

  /**
   * 複数のランダムジャンルを生成
   */
  static generateMultipleGenres(count = 3): string[] {
    const { REQUIRED_GENRES, MAX_SELECTION } = BUSINESS_RULES.GENRE;
    const actualCount = Math.min(count, MAX_SELECTION);

    const shuffled = [...REQUIRED_GENRES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, actualCount);
  }

  /**
   * 成功事例の品質スコアを計算（期待値生成用）
   */
  static calculateSuccessExampleQualityScore(
    rating: number,
    playCount: number,
    likeCount: number
  ): number {
    const {
      RATING_MULTIPLIER,
      PLAY_COUNT_DIVISOR,
      PLAY_COUNT_MULTIPLIER,
      PLAY_COUNT_MAX_SCORE,
      LIKE_COUNT_DIVISOR,
      LIKE_COUNT_MULTIPLIER,
      LIKE_COUNT_MAX_SCORE,
    } = BUSINESS_RULES.SUCCESS_EXAMPLE;

    const ratingScore = rating * RATING_MULTIPLIER;
    const playScore = Math.min(
      (playCount / PLAY_COUNT_DIVISOR) * PLAY_COUNT_MULTIPLIER,
      PLAY_COUNT_MAX_SCORE
    );
    const likeScore = Math.min(
      (likeCount / LIKE_COUNT_DIVISOR) * LIKE_COUNT_MULTIPLIER,
      LIKE_COUNT_MAX_SCORE
    );

    return Math.min(
      ratingScore + playScore + likeScore,
      BUSINESS_RULES.QUALITY_SCORE.MAX
    );
  }

  /**
   * 有効な評価値を生成
   */
  static generateValidRating(): number {
    const { MIN, MAX } = BUSINESS_RULES.SUCCESS_EXAMPLE.RATING_RANGE;
    return Math.random() * (MAX - MIN) + MIN;
  }

  /**
   * サポートされるジャンル数の最小値を取得
   */
  static getMinSupportedGenreCount(): number {
    return BUSINESS_RULES.GENRE.MIN_SUPPORTED_COUNT;
  }

  /**
   * 必須ムードタグのサンプルを生成
   */
  static generateMoodTags(count = 3): string[] {
    const { REQUIRED_MOOD_TAGS } = BUSINESS_RULES.TEMPLATE;
    const shuffled = [...REQUIRED_MOOD_TAGS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, REQUIRED_MOOD_TAGS.length));
  }

  /**
   * 日本語構造キーワードを含む歌詞構造を生成
   */
  static generateJapaneseLyricsStructure(): string {
    const { JAPANESE_STRUCTURE_KEYWORDS } = BUSINESS_RULES.TEMPLATE;
    const selected = JAPANESE_STRUCTURE_KEYWORDS.slice(0, 3); // 最初の3つ
    return selected.join(" - ");
  }

  /**
   * 検索ベクトルを生成（モック用）
   */
  static generateSearchVector(): number[] {
    const { SEARCH_VECTOR_DIMENSIONS } = BUSINESS_RULES.STATISTICS;
    return Array.from({ length: SEARCH_VECTOR_DIMENSIONS }, () =>
      Math.random()
    );
  }

  /**
   * 言語コードを生成
   */
  static generateRandomLanguageCode(): string {
    const { SUPPORTED_LANGUAGES } = BUSINESS_RULES.LANGUAGE;
    return SUPPORTED_LANGUAGES[
      Math.floor(Math.random() * SUPPORTED_LANGUAGES.length)
    ];
  }

  /**
   * テンプレートカテゴリを生成
   */
  static generateTemplateCategory(): string {
    const categories = Object.values(BUSINESS_RULES.TEMPLATE.CATEGORIES);
    return categories[Math.floor(Math.random() * categories.length)];
  }
}

/**
 * テスト期待値計算ユーティリティ
 */
export class TestExpectationCalculator {
  /**
   * 品質レベル範囲の期待値を取得
   */
  static getQualityScoreRange(level: QualityLevel): {
    min: number;
    max: number;
  } {
    const { HIGH_THRESHOLD, MEDIUM_THRESHOLD, MIN, MAX } =
      BUSINESS_RULES.QUALITY_SCORE;

    switch (level) {
      case "high":
        return { min: HIGH_THRESHOLD, max: MAX };
      case "medium":
        return { min: MEDIUM_THRESHOLD, max: HIGH_THRESHOLD - 1 };
      case "low":
        return { min: MIN, max: MEDIUM_THRESHOLD - 1 };
      default:
        throw new Error(`Unknown quality level: ${level}`);
    }
  }

  /**
   * コンプライアンスレベルの期待値を取得
   */
  static getExpectedComplianceLevel(score: number): string {
    const { LEVEL_THRESHOLDS, SAFETY_LEVELS } = BUSINESS_RULES.COMPLIANCE_SCORE;

    if (score >= LEVEL_THRESHOLDS.SAFE_MIN) return SAFETY_LEVELS.SAFE;
    if (score >= LEVEL_THRESHOLDS.CAUTION_MIN) return SAFETY_LEVELS.CAUTION;
    if (score >= LEVEL_THRESHOLDS.WARNING_MIN) return SAFETY_LEVELS.WARNING;
    return SAFETY_LEVELS.UNSAFE;
  }

  /**
   * 成功事例品質スコアの期待値を計算
   */
  static calculateExpectedSuccessExampleScore(
    rating: number,
    playCount: number,
    likeCount: number
  ): number {
    return TestDataGenerator.calculateSuccessExampleQualityScore(
      rating,
      playCount,
      likeCount
    );
  }
}
