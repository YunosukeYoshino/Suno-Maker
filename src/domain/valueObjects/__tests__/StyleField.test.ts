import { describe, expect, it } from "vitest";
import { BUSINESS_RULES } from "~/config/business-rules";
import {
  generateMaxLengthStyleField,
  generateStyleFieldWithLength,
  generateTooLongStyleField,
} from "~/test-utils/test-data-generators";
import { StyleField } from "../StyleField";

describe("StyleField", () => {
  describe("作成", () => {
    it("有効なスタイル文字列で作成できる", () => {
      const style = StyleField.create("Rock, energetic, electric guitar");
      expect(style.value).toBe("Rock, energetic, electric guitar");
    });

    it("最大文字数以内の文字列で作成できる", () => {
      const longStyle = generateMaxLengthStyleField();
      const style = StyleField.create(longStyle);
      expect(style.value).toBe(longStyle);
      expect(style.value.length).toBe(BUSINESS_RULES.STYLE_FIELD.MAX_LENGTH);
    });

    it("最大文字数を超える文字列では作成できない", () => {
      const tooLongStyle = generateTooLongStyleField();
      expect(() => StyleField.create(tooLongStyle)).toThrow(
        `スタイルフィールドは${BUSINESS_RULES.STYLE_FIELD.MAX_LENGTH}文字以内で入力してください`
      );
    });

    it("空文字列では作成できない", () => {
      expect(() => StyleField.create("")).toThrow(
        "スタイルフィールドは空文字列にできません"
      );
    });
  });

  describe("構造分析", () => {
    it("ジャンル要素を抽出できる", () => {
      const style = StyleField.create("Rock, Pop, energetic, electric guitar");
      const genres = style.extractGenres();
      expect(genres).toEqual(["Rock", "Pop"]);
    });

    it("楽器要素を抽出できる", () => {
      const style = StyleField.create("Rock, electric guitar, piano, drums");
      const instruments = style.extractInstruments();
      expect(instruments).toEqual(["electric guitar", "piano", "drums"]);
    });

    it("ムード要素を抽出できる", () => {
      const style = StyleField.create("Rock, energetic, melancholic, dark");
      const moods = style.extractMoods();
      expect(moods).toEqual(["energetic", "melancholic", "dark"]);
    });
  });

  describe("最適化", () => {
    it("文字数制限に合わせて最適化できる", () => {
      const longStyle = StyleField.create(
        "Rock, Progressive Rock, energetic, electric guitar, bass guitar, synthesizer, powerful vocals"
      );
      const optimized = longStyle.optimize();
      expect(optimized.length).toBeLessThanOrEqual(
        BUSINESS_RULES.STYLE_FIELD.MAX_LENGTH
      );
    });

    it("優先度に基づいて要素を並び替えできる", () => {
      const style = StyleField.create("energetic, Rock, electric guitar");
      const prioritized = style.prioritize(["genre", "mood", "instrument"]);
      expect(prioritized).toMatch(/^Rock/);
    });

    it("重複要素を除去できる", () => {
      const style = StyleField.create("Rock, Rock, energetic, energetic");
      const deduplicated = style.removeDuplicates();
      expect(deduplicated.value).toBe("Rock, energetic");
    });
  });

  describe("バリデーション", () => {
    it("文字数制限をチェックできる", () => {
      const validStyle = StyleField.create("Rock, energetic");
      const longButValidStyle = StyleField.create(
        `${generateStyleFieldWithLength(
          BUSINESS_RULES.STYLE_FIELD.MAX_LENGTH - 10
        )}, test`
      );

      expect(validStyle.isWithinLimit()).toBe(true);
      expect(longButValidStyle.isWithinLimit()).toBe(true);
    });

    it("推奨される要素数をチェックできる", () => {
      const simpleStyle = StyleField.create("Rock");
      const complexStyle = StyleField.create(
        "Rock, Pop, Jazz, energetic, dark, electric guitar, piano, drums, vocals"
      );

      expect(simpleStyle.getElementCount()).toBe(1);
      expect(complexStyle.getElementCount()).toBe(9);
      expect(simpleStyle.isRecommendedComplexity()).toBe(false);
      expect(complexStyle.isRecommendedComplexity()).toBe(false); // too complex
    });
  });

  describe("変換", () => {
    it("配列形式に変換できる", () => {
      const style = StyleField.create("Rock, energetic, electric guitar");
      expect(style.toArray()).toEqual(["Rock", "energetic", "electric guitar"]);
    });

    it("構造化オブジェクトに変換できる", () => {
      const style = StyleField.create(
        "Rock, Pop, energetic, electric guitar, piano"
      );
      const structured = style.toStructured();

      expect(structured.genres).toContain("Rock");
      expect(structured.moods).toContain("energetic");
      expect(structured.instruments).toContain("electric guitar");
    });
  });

  describe("統計", () => {
    it("文字数統計を取得できる", () => {
      const style = StyleField.create("Rock, energetic");
      const stats = style.getStats();

      expect(stats.length).toBe(15);
      expect(stats.elementCount).toBe(2);
      expect(stats.averageElementLength).toBe(7); // (4 + 9) / 2 = 6.5 → 7
    });
  });

  describe("等価性", () => {
    it("同じスタイルのインスタンスは等価", () => {
      const style1 = StyleField.create("Rock, energetic");
      const style2 = StyleField.create("Rock, energetic");
      expect(style1.equals(style2)).toBe(true);
    });

    it("異なるスタイルのインスタンスは非等価", () => {
      const style1 = StyleField.create("Rock, energetic");
      const style2 = StyleField.create("Pop, calm");
      expect(style1.equals(style2)).toBe(false);
    });
  });
});
