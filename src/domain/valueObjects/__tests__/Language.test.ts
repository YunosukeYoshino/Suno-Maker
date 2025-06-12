import { describe, expect, it } from "vitest";
import { Language } from "../Language";

describe("Language", () => {
  describe("作成", () => {
    it("有効な言語コードで作成できる", () => {
      const language = Language.create("ja");
      expect(language.value).toBe("ja");
    });

    it("英語がデフォルト言語として作成できる", () => {
      const language = Language.createDefault();
      expect(language.value).toBe("en");
    });

    it("無効な言語コードでは作成できない", () => {
      expect(() => Language.create("invalid")).toThrow(
        "サポートされていない言語です"
      );
    });
  });

  describe("言語情報取得", () => {
    it("日本語の表示名を取得できる", () => {
      const language = Language.create("ja");
      expect(language.getDisplayName()).toBe("日本語");
    });

    it("英語の表示名を取得できる", () => {
      const language = Language.create("en");
      expect(language.getDisplayName()).toBe("English");
    });

    it("言語の音声品質レベルを取得できる", () => {
      const japanese = Language.create("ja");
      const english = Language.create("en");

      expect(english.getQualityLevel()).toBe("highest");
      expect(japanese.getQualityLevel()).toBe("high");
    });
  });

  describe("プロンプト最適化", () => {
    it("日本語用の最適化提案を取得できる", () => {
      const language = Language.create("ja");
      const suggestions = language.getOptimizationSuggestions();

      expect(suggestions).toContain("ひらがな表記を推奨");
      expect(suggestions).toContain("複雑な漢字は避ける");
    });

    it("英語用の最適化提案を取得できる", () => {
      const language = Language.create("en");
      const suggestions = language.getOptimizationSuggestions();

      expect(suggestions).toContain("クリアな発音のための単語選択");
      expect(suggestions).toContain("リズムとメーターを考慮");
    });
  });

  describe("文字体系", () => {
    it("推奨される文字体系を取得できる", () => {
      const japanese = Language.create("ja");
      const english = Language.create("en");

      expect(japanese.getRecommendedScript()).toBe("hiragana");
      expect(english.getRecommendedScript()).toBe("latin");
    });

    it("混在使用可能な言語を判定できる", () => {
      const japanese = Language.create("ja");
      const english = Language.create("en");

      expect(japanese.canMixWith(english)).toBe(true);
      expect(english.canMixWith(japanese)).toBe(true);
    });
  });

  describe("等価性", () => {
    it("同じ言語のインスタンスは等価", () => {
      const lang1 = Language.create("ja");
      const lang2 = Language.create("ja");
      expect(lang1.equals(lang2)).toBe(true);
    });

    it("異なる言語のインスタンスは非等価", () => {
      const lang1 = Language.create("ja");
      const lang2 = Language.create("en");
      expect(lang1.equals(lang2)).toBe(false);
    });
  });
});
