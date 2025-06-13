import { describe, it, expect } from "vitest";
import { Template } from "../Template";
import { Genre } from "../../valueObjects/Genre";
import { Language } from "../../valueObjects/Language";
import { StyleField } from "../../valueObjects/StyleField";

describe("Template", () => {
  describe("create", () => {
    it("正常なパラメータでテンプレートを作成できる", () => {
      const template = Template.create({
        name: "Rock Ballad Template",
        description: "Emotional rock ballad with powerful vocals",
        genre: Genre.create("Rock"),
        language: Language.create("en"),
        styleField: StyleField.create(
          "emotional, powerful vocals, guitar solo"
        ),
        lyricsStructure:
          "[Verse 1]\n{verse1}\n\n[Chorus]\n{chorus}\n\n[Verse 2]\n{verse2}\n\n[Chorus]\n{chorus}",
        tags: ["ballad", "emotional", "guitar"],
        category: "genre-specific",
        qualityScore: 85,
        usageCount: 150,
      });

      expect(template.name).toBe("Rock Ballad Template");
      expect(template.description).toBe(
        "Emotional rock ballad with powerful vocals"
      );
      expect(template.genre.value).toBe("Rock");
      expect(template.language.value).toBe("en");
      expect(template.tags).toEqual(["ballad", "emotional", "guitar"]);
      expect(template.category).toBe("genre-specific");
      expect(template.qualityScore).toBe(85);
      expect(template.usageCount).toBe(150);
      expect(template.id).toBeDefined();
      expect(template.createdAt).toBeInstanceOf(Date);
      expect(template.updatedAt).toBeInstanceOf(Date);
    });

    it("空の名前でテンプレート作成時にエラーを投げる", () => {
      expect(() => {
        Template.create({
          name: "",
          description: "Test template",
          genre: Genre.create("Pop"),
          language: Language.create("en"),
          styleField: StyleField.create("pop, catchy"),
          lyricsStructure: "[Verse]\n{verse}",
          tags: ["pop"],
          category: "genre-specific",
          qualityScore: 80,
          usageCount: 0,
        });
      }).toThrow("テンプレート名は必須です");
    });

    it("空の説明でテンプレート作成時にエラーを投げる", () => {
      expect(() => {
        Template.create({
          name: "Test Template",
          description: "",
          genre: Genre.create("Pop"),
          language: Language.create("en"),
          styleField: StyleField.create("pop, catchy"),
          lyricsStructure: "[Verse]\n{verse}",
          tags: ["pop"],
          category: "genre-specific",
          qualityScore: 80,
          usageCount: 0,
        });
      }).toThrow("テンプレート説明は必須です");
    });

    it("無効な品質スコアでテンプレート作成時にエラーを投げる", () => {
      expect(() => {
        Template.create({
          name: "Test Template",
          description: "Test description",
          genre: Genre.create("Pop"),
          language: Language.create("en"),
          styleField: StyleField.create("pop, catchy"),
          lyricsStructure: "[Verse]\n{verse}",
          tags: ["pop"],
          category: "genre-specific",
          qualityScore: 101,
          usageCount: 0,
        });
      }).toThrow("品質スコアは0-100の範囲である必要があります");

      expect(() => {
        Template.create({
          name: "Test Template",
          description: "Test description",
          genre: Genre.create("Pop"),
          language: Language.create("en"),
          styleField: StyleField.create("pop, catchy"),
          lyricsStructure: "[Verse]\n{verse}",
          tags: ["pop"],
          category: "genre-specific",
          qualityScore: -1,
          usageCount: 0,
        });
      }).toThrow("品質スコアは0-100の範囲である必要があります");
    });

    it("負の使用回数でテンプレート作成時にエラーを投げる", () => {
      expect(() => {
        Template.create({
          name: "Test Template",
          description: "Test description",
          genre: Genre.create("Pop"),
          language: Language.create("en"),
          styleField: StyleField.create("pop, catchy"),
          lyricsStructure: "[Verse]\n{verse}",
          tags: ["pop"],
          category: "genre-specific",
          qualityScore: 80,
          usageCount: -1,
        });
      }).toThrow("使用回数は0以上である必要があります");
    });

    it("無効なカテゴリでテンプレート作成時にエラーを投げる", () => {
      expect(() => {
        Template.create({
          name: "Test Template",
          description: "Test description",
          genre: Genre.create("Pop"),
          language: Language.create("en"),
          styleField: StyleField.create("pop, catchy"),
          lyricsStructure: "[Verse]\n{verse}",
          tags: ["pop"],
          category: "invalid" as any,
          qualityScore: 80,
          usageCount: 0,
        });
      }).toThrow("無効なカテゴリです");
    });
  });

  describe("incrementUsage", () => {
    it("使用回数を1増加できる", async () => {
      const template = Template.create({
        name: "Test Template",
        description: "Test description",
        genre: Genre.create("Pop"),
        language: Language.create("en"),
        styleField: StyleField.create("pop, catchy"),
        lyricsStructure: "[Verse]\n{verse}",
        tags: ["pop"],
        category: "genre-specific",
        qualityScore: 80,
        usageCount: 5,
      });

      // 少し待って時間差を作る
      await new Promise((resolve) => setTimeout(resolve, 1));

      const updatedTemplate = template.incrementUsage();
      expect(updatedTemplate.usageCount).toBe(6);
      expect(updatedTemplate.updatedAt.getTime()).toBeGreaterThanOrEqual(
        template.updatedAt.getTime()
      );
    });
  });

  describe("updateQualityScore", () => {
    it("品質スコアを更新できる", async () => {
      const template = Template.create({
        name: "Test Template",
        description: "Test description",
        genre: Genre.create("Pop"),
        language: Language.create("en"),
        styleField: StyleField.create("pop, catchy"),
        lyricsStructure: "[Verse]\n{verse}",
        tags: ["pop"],
        category: "genre-specific",
        qualityScore: 80,
        usageCount: 0,
      });

      // 少し待って時間差を作る
      await new Promise((resolve) => setTimeout(resolve, 1));

      const updatedTemplate = template.updateQualityScore(90);
      expect(updatedTemplate.qualityScore).toBe(90);
      expect(updatedTemplate.updatedAt.getTime()).toBeGreaterThanOrEqual(
        template.updatedAt.getTime()
      );
    });

    it("無効な品質スコアで更新時にエラーを投げる", () => {
      const template = Template.create({
        name: "Test Template",
        description: "Test description",
        genre: Genre.create("Pop"),
        language: Language.create("en"),
        styleField: StyleField.create("pop, catchy"),
        lyricsStructure: "[Verse]\n{verse}",
        tags: ["pop"],
        category: "genre-specific",
        qualityScore: 80,
        usageCount: 0,
      });

      expect(() => template.updateQualityScore(101)).toThrow(
        "品質スコアは0-100の範囲である必要があります"
      );
      expect(() => template.updateQualityScore(-1)).toThrow(
        "品質スコアは0-100の範囲である必要があります"
      );
    });
  });

  describe("matches", () => {
    it("ジャンルが一致する場合trueを返す", () => {
      const template = Template.create({
        name: "Rock Template",
        description: "Rock template",
        genre: Genre.create("Rock"),
        language: Language.create("en"),
        styleField: StyleField.create("rock, energetic"),
        lyricsStructure: "[Verse]\n{verse}",
        tags: ["rock"],
        category: "genre-specific",
        qualityScore: 80,
        usageCount: 0,
      });

      expect(template.matches({ genre: Genre.create("Rock") })).toBe(true);
    });

    it("言語が一致する場合trueを返す", () => {
      const template = Template.create({
        name: "Japanese Template",
        description: "Japanese template",
        genre: Genre.create("Pop"),
        language: Language.create("ja"),
        styleField: StyleField.create("pop, japanese"),
        lyricsStructure: "[Verse]\n{verse}",
        tags: ["japanese"],
        category: "genre-specific",
        qualityScore: 80,
        usageCount: 0,
      });

      expect(template.matches({ language: Language.create("ja") })).toBe(true);
    });

    it("カテゴリが一致する場合trueを返す", () => {
      const template = Template.create({
        name: "Custom Template",
        description: "Custom template",
        genre: Genre.create("Pop"),
        language: Language.create("en"),
        styleField: StyleField.create("pop, custom"),
        lyricsStructure: "[Verse]\n{verse}",
        tags: ["custom"],
        category: "custom",
        qualityScore: 80,
        usageCount: 0,
      });

      expect(template.matches({ category: "custom" })).toBe(true);
    });

    it("複数の条件が全て一致する場合trueを返す", () => {
      const template = Template.create({
        name: "Rock English Template",
        description: "Rock English template",
        genre: Genre.create("Rock"),
        language: Language.create("en"),
        styleField: StyleField.create("rock, english"),
        lyricsStructure: "[Verse]\n{verse}",
        tags: ["rock", "english"],
        category: "genre-specific",
        qualityScore: 80,
        usageCount: 0,
      });

      expect(
        template.matches({
          genre: Genre.create("Rock"),
          language: Language.create("en"),
          category: "genre-specific",
        })
      ).toBe(true);
    });

    it("条件が一致しない場合falseを返す", () => {
      const template = Template.create({
        name: "Rock Template",
        description: "Rock template",
        genre: Genre.create("Rock"),
        language: Language.create("en"),
        styleField: StyleField.create("rock, energetic"),
        lyricsStructure: "[Verse]\n{verse}",
        tags: ["rock"],
        category: "genre-specific",
        qualityScore: 80,
        usageCount: 0,
      });

      expect(template.matches({ genre: Genre.create("Pop") })).toBe(false);
      expect(template.matches({ language: Language.create("ja") })).toBe(false);
      expect(template.matches({ category: "custom" })).toBe(false);
    });
  });

  describe("toPrompt", () => {
    it("テンプレートからプロンプトを生成できる", () => {
      const template = Template.create({
        name: "Rock Template",
        description: "Rock template",
        genre: Genre.create("Rock"),
        language: Language.create("en"),
        styleField: StyleField.create("rock, energetic, guitar"),
        lyricsStructure: "[Verse]\n{verse}\n[Chorus]\n{chorus}",
        tags: ["rock"],
        category: "genre-specific",
        qualityScore: 80,
        usageCount: 0,
      });

      const prompt = template.toPrompt();
      expect(prompt.title).toBe("Generated from Rock Template");
      expect(prompt.genre.value).toBe("Rock");
      expect(prompt.language.value).toBe("en");
      expect(prompt.styleField.value).toBe("rock, energetic, guitar");
    });
  });

  describe("equals", () => {
    it("同じIDのテンプレートはequalsでtrueを返す", () => {
      const template1 = Template.create({
        name: "Test Template",
        description: "Test description",
        genre: Genre.create("Pop"),
        language: Language.create("en"),
        styleField: StyleField.create("pop, catchy"),
        lyricsStructure: "[Verse]\n{verse}",
        tags: ["pop"],
        category: "genre-specific",
        qualityScore: 80,
        usageCount: 0,
      });

      const template2 = Template.create({
        name: "Different Template",
        description: "Different description",
        genre: Genre.create("Rock"),
        language: Language.create("ja"),
        styleField: StyleField.create("rock, powerful"),
        lyricsStructure: "[Verse]\n{verse}",
        tags: ["rock"],
        category: "custom",
        qualityScore: 90,
        usageCount: 10,
      });

      // 同じインスタンス
      expect(template1.equals(template1)).toBe(true);
      // 異なるインスタンス
      expect(template1.equals(template2)).toBe(false);
    });
  });
});
