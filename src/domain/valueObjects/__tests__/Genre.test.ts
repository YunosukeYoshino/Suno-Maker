import { describe, expect, it } from "vitest";
import { Genre } from "../Genre";

describe("Genre", () => {
  describe("作成", () => {
    it("有効なジャンル名で作成できる", () => {
      const genre = Genre.create("Rock");
      expect(genre.value).toBe("Rock");
    });

    it("複合ジャンルを作成できる", () => {
      const genre = Genre.create(["Rock", "Pop"]);
      expect(genre.value).toEqual(["Rock", "Pop"]);
    });

    it("空文字列では作成できない", () => {
      expect(() => Genre.create("" as string)).toThrow(
        "ジャンル名は空文字列にできません"
      );
    });

    it("空配列では作成できない", () => {
      expect(() => Genre.create([])).toThrow(
        "ジャンル名は空文字列にできません"
      );
    });
  });

  describe("バリデーション", () => {
    it("サポートされているジャンルかどうかを判定できる", () => {
      expect(Genre.isSupported("Rock")).toBe(true);
      expect(Genre.isSupported("Pop")).toBe(true);
      expect(Genre.isSupported("InvalidGenre")).toBe(false);
    });

    it("複合ジャンルの組み合わせをバリデーションできる", () => {
      expect(Genre.isValidCombination(["Rock", "Pop"])).toBe(true);
      expect(Genre.isValidCombination(["Rock", "Rock"])).toBe(false); // 重複
    });
  });

  describe("プロンプト生成", () => {
    it("単一ジャンルのプロンプト文字列を生成できる", () => {
      const genre = Genre.create("Rock");
      expect(genre.toPromptString()).toBe("Rock");
    });

    it("複合ジャンルのプロンプト文字列を生成できる", () => {
      const genre = Genre.create(["Rock", "Pop"]);
      expect(genre.toPromptString()).toBe("Rock, Pop");
    });

    it("優先度付きプロンプト文字列を生成できる", () => {
      const genre = Genre.create("Rock");
      expect(genre.toPromptString({ priority: "high" })).toBe("ROCK");
    });
  });

  describe("等価性", () => {
    it("同じジャンルのインスタンスは等価", () => {
      const genre1 = Genre.create("Rock");
      const genre2 = Genre.create("Rock");
      expect(genre1.equals(genre2)).toBe(true);
    });

    it("異なるジャンルのインスタンスは非等価", () => {
      const genre1 = Genre.create("Rock");
      const genre2 = Genre.create("Pop");
      expect(genre1.equals(genre2)).toBe(false);
    });
  });

  describe("ジャンル数要件", () => {
    it("120種類以上のジャンルをサポートしている", () => {
      const supportedGenres = Genre.getSupportedGenres();
      expect(supportedGenres.length).toBeGreaterThanOrEqual(120);
    });

    it("階層化されたジャンル分類を提供している", () => {
      const mainGenres = Genre.getMainGenres();
      expect(mainGenres.length).toBeGreaterThan(15);

      // 各メインジャンルにサブジャンルが存在することを確認
      const hasSubGenres = mainGenres.some(
        (main) => Genre.getSubGenres(main).length > 0
      );
      expect(hasSubGenres).toBe(true);
    });

    it("地域別・文化的ジャンルを含んでいる", () => {
      const supportedGenres = Genre.getSupportedGenres();
      const culturalGenres = [
        "J-Pop",
        "K-Pop",
        "Afrobeat",
        "Reggaeton",
        "Flamenco",
      ] as const;

      for (const genre of culturalGenres) {
        expect(supportedGenres.includes(genre)).toBe(true);
      }
    });

    it("モダンなジャンルを含んでいる", () => {
      const supportedGenres = Genre.getSupportedGenres();
      const modernGenres = [
        "Future Bass",
        "Phonk",
        "Drill",
        "Hyperpop",
        "Vaporwave",
      ] as const;

      for (const genre of modernGenres) {
        expect(supportedGenres.includes(genre)).toBe(true);
      }
    });
  });
});
