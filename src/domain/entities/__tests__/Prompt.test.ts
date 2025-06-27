import { beforeEach, describe, expect, it } from "vitest";
import { Genre } from "../../valueObjects/Genre";
import { Language } from "../../valueObjects/Language";
import { StyleField } from "../../valueObjects/StyleField";
import { Prompt } from "../Prompt";

interface ValidPromptProps {
  id?: string;
  title: string;
  genre: Genre;
  language: Language;
  styleField: StyleField;
  tags?: string[];
  description?: string;
  isPublic?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

describe("Prompt", () => {
  let validProps: ValidPromptProps;

  beforeEach(() => {
    validProps = {
      id: "prompt-123",
      title: "Rock Ballad Prompt",
      genre: Genre.create("Rock"),
      language: Language.create("en"),
      styleField: StyleField.create(
        "Rock, emotional, electric guitar, powerful vocals"
      ),
      tags: ["ballad", "emotional"],
      description: "A powerful rock ballad prompt",
      isPublic: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    };
  });

  describe("作成", () => {
    it("有効なプロパティでPromptを作成できる", () => {
      const prompt = Prompt.create(validProps);

      expect(prompt.id).toBe("prompt-123");
      expect(prompt.title).toBe("Rock Ballad Prompt");
      expect(prompt.genre.value).toBe("Rock");
      expect(prompt.language.value).toBe("en");
      expect(prompt.isPublic).toBe(true);
    });

    it("IDが自動生成される", () => {
      const propsWithoutId = { ...validProps };
      propsWithoutId.id = undefined;

      const prompt = Prompt.create(propsWithoutId);
      expect(prompt.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
      expect(prompt.id.length).toBe(36);
    });

    it("作成日時が自動設定される", () => {
      const propsWithoutDates = { ...validProps };
      propsWithoutDates.createdAt = undefined;
      propsWithoutDates.updatedAt = undefined;

      const prompt = Prompt.create(propsWithoutDates);
      expect(prompt.createdAt).toBeInstanceOf(Date);
      expect(prompt.updatedAt).toBeInstanceOf(Date);
    });

    it("無効なタイトルでは作成できない", () => {
      const invalidProps = { ...validProps, title: "" };
      expect(() => Prompt.create(invalidProps)).toThrow(
        "タイトルは1文字以上100文字以内で入力してください"
      );
    });
  });

  describe("更新", () => {
    it("タイトルを更新できる", () => {
      const prompt = Prompt.create(validProps);
      const updatedPrompt = prompt.updateTitle("New Rock Title");

      expect(updatedPrompt.title).toBe("New Rock Title");
      expect(updatedPrompt.updatedAt.getTime()).toBeGreaterThan(
        prompt.updatedAt.getTime()
      );
    });

    it("ジャンルを更新できる", () => {
      const prompt = Prompt.create(validProps);
      const newGenre = Genre.create("Pop");
      const updatedPrompt = prompt.updateGenre(newGenre);

      expect(updatedPrompt.genre.value).toBe("Pop");
    });

    it("スタイルフィールドを更新できる", () => {
      const prompt = Prompt.create(validProps);
      const newStyleField = StyleField.create("Pop, upbeat, synthesizer");
      const updatedPrompt = prompt.updateStyleField(newStyleField);

      expect(updatedPrompt.styleField.value).toBe("Pop, upbeat, synthesizer");
    });

    it("公開設定を切り替えできる", () => {
      const prompt = Prompt.create(validProps);
      const privatePrompt = prompt.makePrivate();
      const publicPrompt = privatePrompt.makePublic();

      expect(privatePrompt.isPublic).toBe(false);
      expect(publicPrompt.isPublic).toBe(true);
    });
  });

  describe("生成", () => {
    it("完全なプロンプト文字列を生成できる", () => {
      const prompt = Prompt.create(validProps);
      const promptString = prompt.generatePromptString();

      expect(promptString.style).toBe(
        "Rock, emotional, electric guitar, powerful vocals"
      );
      expect(promptString.language).toBe("en");
      expect(promptString.fullPrompt).toContain("Rock");
      expect(promptString.fullPrompt).toContain("emotional");
    });

    it("Suno用に最適化されたプロンプトを生成できる", () => {
      const prompt = Prompt.create(validProps);
      const optimized = prompt.generateOptimizedPrompt();

      expect(optimized.styleField.length).toBeLessThanOrEqual(120);
      expect(optimized.optimizationApplied).toBeDefined();
    });

    it("言語特有の最適化が適用される", () => {
      const japaneseProps = {
        ...validProps,
        language: Language.create("ja"),
        styleField: StyleField.create(
          "J-Pop, 明るい, ピアノ, 透明感のある歌声"
        ),
      };

      const prompt = Prompt.create(japaneseProps);
      const optimized = prompt.generateOptimizedPrompt();

      expect(optimized.languageOptimizations).toContain("ひらがな表記を推奨");
    });
  });

  describe("検証", () => {
    it("有効性を検証できる", () => {
      const prompt = Prompt.create(validProps);
      const validation = prompt.validate();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("無効な状態を検出できる", () => {
      // StyleFieldの作成時点でエラーが発生することをテスト
      expect(() => StyleField.create("A".repeat(130))).toThrow(
        "スタイルフィールドは120文字以内で入力してください"
      );

      // 有効な範囲でのバリデーションテスト
      const promptWithIssues = Prompt.create({
        ...validProps,
        title: "AB", // 短すぎるタイトル
      });

      const validation = promptWithIssues.validate();
      expect(validation.warnings).toContain(
        "より具体的なタイトルの使用を推奨します"
      );
    });

    it("品質スコアを計算できる", () => {
      const prompt = Prompt.create(validProps);
      const score = prompt.calculateQualityScore();

      expect(score.overall).toBeGreaterThan(0);
      expect(score.overall).toBeLessThanOrEqual(100);
      expect(score.breakdown.genreClarity).toBeDefined();
      expect(score.breakdown.styleOptimization).toBeDefined();
      expect(score.breakdown.languageOptimization).toBeDefined();
    });
  });

  describe("統計", () => {
    it("使用統計を取得できる", () => {
      const prompt = Prompt.create(validProps);
      const stats = prompt.getUsageStats();

      expect(stats.generatedCount).toBe(0);
      expect(stats.successfulGenerations).toBe(0);
      expect(stats.averageRating).toBe(0);
    });

    it("生成回数を記録できる", () => {
      const prompt = Prompt.create(validProps);
      const updatedPrompt = prompt.recordGeneration(true, 4.5);

      expect(updatedPrompt.getUsageStats().generatedCount).toBe(1);
      expect(updatedPrompt.getUsageStats().successfulGenerations).toBe(1);
    });
  });

  describe("等価性", () => {
    it("同じIDのPromptは等価", () => {
      const prompt1 = Prompt.create(validProps);
      const prompt2 = Prompt.create(validProps);

      expect(prompt1.equals(prompt2)).toBe(true);
    });

    it("異なるIDのPromptは非等価", () => {
      const prompt1 = Prompt.create(validProps);
      const prompt2 = Prompt.create({ ...validProps, id: "different-id" });

      expect(prompt1.equals(prompt2)).toBe(false);
    });
  });

  describe("シリアライゼーション", () => {
    it("JSON形式にシリアライズできる", () => {
      const prompt = Prompt.create(validProps);
      const json = prompt.toJSON();

      expect(json.id).toBe(prompt.id);
      expect(json.title).toBe(prompt.title);
      expect(json.genre).toBe("Rock");
      expect(json.language).toBe("en");
    });

    it("JSONから復元できる", () => {
      const prompt = Prompt.create(validProps);
      const json = prompt.toJSON();
      const restored = Prompt.fromJSON(json);

      expect(restored.equals(prompt)).toBe(true);
    });
  });
});
