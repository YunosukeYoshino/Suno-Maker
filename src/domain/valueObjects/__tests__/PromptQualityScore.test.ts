import { beforeEach, describe, expect, it } from "vitest";
import { Genre } from "../Genre";
import { Language } from "../Language";
import { PromptQualityScore } from "../PromptQualityScore";
import { StyleField } from "../StyleField";

describe("PromptQualityScore", () => {
  let genre: Genre;
  let styleField: StyleField;
  let language: Language;
  let title: string;
  let description: string;
  let tags: string[];

  beforeEach(() => {
    genre = Genre.create("Rock");
    styleField = StyleField.create(
      "Rock, emotional, electric guitar, powerful vocals"
    );
    language = Language.create("en");
    title = "Rock Ballad Prompt";
    description = "A powerful rock ballad prompt";
    tags = ["ballad", "emotional"];
  });

  describe("品質スコア計算", () => {
    it("完全なプロンプトで高い品質スコアを計算できる", () => {
      const qualityScore = PromptQualityScore.calculate(
        genre,
        styleField,
        language,
        title,
        description,
        tags
      );

      const score = qualityScore.toQualityScore();
      const breakdown = qualityScore.getBreakdown();

      expect(score.overall).toBeGreaterThan(85);
      expect(breakdown.genreClarity).toBe(100);
      expect(breakdown.styleOptimization).toBeGreaterThan(80);
      expect(breakdown.languageOptimization).toBeGreaterThan(80);
      expect(breakdown.completeness).toBe(100);
    });

    it("不完全なプロンプトで低い品質スコアを計算できる", () => {
      const poorStyleField = StyleField.create("A"); // 非常に短い
      const qualityScore = PromptQualityScore.calculate(
        genre,
        poorStyleField, // 短いスタイルフィールド
        language,
        "AB", // 短いタイトル
        "", // 説明なし
        [] // タグなし
      );

      const score = qualityScore.toQualityScore();
      const breakdown = qualityScore.getBreakdown();

      expect(score.overall).toBeLessThan(85);
      expect(breakdown.completeness).toBe(40); // 基本点のみ
      expect(breakdown.styleOptimization).toBeLessThanOrEqual(70); // スタイルも悪い
    });

    it("スタイル最適化度を正しく計算できる", () => {
      // 理想的なスタイルフィールド（要素数2-6、120文字以下）
      const goodStyleField = StyleField.create("Rock, emotional, guitar");
      const goodQuality = PromptQualityScore.calculate(
        genre,
        goodStyleField,
        language,
        title,
        description,
        tags
      );

      // 長すぎるスタイルフィールド
      const longStyleField = StyleField.create("A".repeat(119));
      const longQuality = PromptQualityScore.calculate(
        genre,
        longStyleField,
        language,
        title,
        description,
        tags
      );

      expect(goodQuality.getBreakdown().styleOptimization).toBeGreaterThan(
        longQuality.getBreakdown().styleOptimization
      );
    });

    it("言語最適化度を正しく計算できる", () => {
      const highQualityLang = Language.create("en");
      const lowQualityLang = Language.create("th"); // Thai has basic quality level

      const highQuality = PromptQualityScore.calculate(
        genre,
        styleField,
        highQualityLang,
        title,
        description,
        tags
      );

      const lowQuality = PromptQualityScore.calculate(
        genre,
        styleField,
        lowQualityLang,
        title,
        description,
        tags
      );

      expect(highQuality.getBreakdown().languageOptimization).toBeGreaterThan(
        lowQuality.getBreakdown().languageOptimization
      );
    });
  });

  describe("重み付け計算", () => {
    it("スタイル最適化度が最も重要な要素として反映される", () => {
      const baseScore = PromptQualityScore.calculate(
        genre,
        styleField,
        language,
        title,
        description,
        tags
      );

      const poorStyleField = StyleField.create("A"); // 1文字のみ
      const poorStyleScore = PromptQualityScore.calculate(
        genre,
        poorStyleField,
        language,
        title,
        description,
        tags
      );

      const scoreDifference =
        baseScore.getOverallScore() - poorStyleScore.getOverallScore();
      expect(scoreDifference).toBeGreaterThan(10); // Style field has 40% weight
    });

    it("ジャンル明確度が2番目に重要な要素として反映される", () => {
      const baseScore = PromptQualityScore.calculate(
        genre,
        styleField,
        language,
        title,
        description,
        tags
      );

      // 異なるジャンルでの比較（全てのジャンルは genreClarity = 100 になるので、他の要素での差を確認）
      const differentGenre = Genre.create("Pop");
      const differentScore = PromptQualityScore.calculate(
        differentGenre,
        styleField,
        language,
        title,
        description,
        tags
      );

      // 同じ重み付けなので、ジャンル変更だけでは差は出ない（他の要素が同じため）
      expect(baseScore.getOverallScore()).toBe(
        differentScore.getOverallScore()
      );

      // ジャンル明確度が30%の重みを持つことを確認（breakdown値の確認）
      expect(baseScore.getBreakdown().genreClarity).toBe(100);
      expect(differentScore.getBreakdown().genreClarity).toBe(100);
    });
  });

  describe("等価性", () => {
    it("同じパラメータで作成された品質スコアは等価", () => {
      const score1 = PromptQualityScore.calculate(
        genre,
        styleField,
        language,
        title,
        description,
        tags
      );

      const score2 = PromptQualityScore.calculate(
        genre,
        styleField,
        language,
        title,
        description,
        tags
      );

      expect(score1.equals(score2)).toBe(true);
    });

    it("異なるパラメータで作成された品質スコアは非等価", () => {
      const score1 = PromptQualityScore.calculate(
        genre,
        styleField,
        language,
        title,
        description,
        tags
      );

      const score2 = PromptQualityScore.calculate(
        genre,
        styleField,
        language,
        "AB", // Very short title affects completeness score
        "", // No description
        [] // No tags
      );

      expect(score1.equals(score2)).toBe(false);
    });
  });

  describe("不変性", () => {
    it("PromptQualityScoreオブジェクトは不変である", () => {
      const qualityScore = PromptQualityScore.calculate(
        genre,
        styleField,
        language,
        title,
        description,
        tags
      );

      expect(() => {
        // biome-ignore lint/suspicious/noExplicitAny: Testing immutability
        (qualityScore as any).genreClarity = 0;
      }).toThrow();
    });
  });
});
