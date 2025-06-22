import { beforeEach, describe, expect, it } from "vitest";
import { Language } from "../../valueObjects/Language";
import { Lyrics, type LyricsProps } from "../Lyrics";

describe("Lyrics", () => {
  let validProps: Partial<LyricsProps> & {
    title: string;
    content: string;
    language: Language;
  };

  beforeEach(() => {
    validProps = {
      id: "lyrics-123",
      title: "Love Song Lyrics",
      content:
        "[Verse]\nLove is all around\n[Chorus]\nFeel the beat\n[Outro]\nEnd",
      language: Language.create("en"),
      tags: ["love", "upbeat"],
      isPublic: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    };
  });

  describe("作成", () => {
    it("有効なプロパティでLyricsを作成できる", () => {
      const lyrics = Lyrics.create(validProps);

      expect(lyrics.id).toBe("lyrics-123");
      expect(lyrics.title).toBe("Love Song Lyrics");
      expect(lyrics.language.value).toBe("en");
      expect(lyrics.isPublic).toBe(true);
    });

    it("IDが自動生成される", () => {
      const propsWithoutId = { ...validProps };
      propsWithoutId.id = undefined;

      const lyrics = Lyrics.create(propsWithoutId);
      expect(lyrics.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
      expect(lyrics.id.length).toBe(36);
    });

    it("日本語の歌詞を作成できる", () => {
      const japaneseProps = {
        ...validProps,
        content: "[Verse]\nあいしてる\n[Chorus]\nこころから",
        language: Language.create("ja"),
      };

      const lyrics = Lyrics.create(japaneseProps);
      expect(lyrics.language.value).toBe("ja");
    });

    it("空のコンテンツでは作成できない", () => {
      const invalidProps = { ...validProps, content: "" };
      expect(() => Lyrics.create(invalidProps)).toThrow("歌詞の内容は必須です");
    });
  });

  describe("構造分析", () => {
    it("セクションを抽出できる", () => {
      const lyrics = Lyrics.create(validProps);
      const sections = lyrics.extractSections();

      expect(sections).toHaveLength(3);
      expect(sections[0].type).toBe("Verse");
      expect(sections[1].type).toBe("Chorus");
      expect(sections[2].type).toBe("Outro");
    });

    it("歌詞の統計を取得できる", () => {
      const lyrics = Lyrics.create(validProps);
      const stats = lyrics.getStats();

      expect(stats.totalCharacters).toBeGreaterThan(0);
      expect(stats.totalLines).toBeGreaterThan(0);
      expect(stats.sectionCount).toBe(3);
    });

    it("日本語歌詞の最適化提案を取得できる", () => {
      const japaneseProps = {
        ...validProps,
        content: "[Verse]\n美しい世界で\n[Chorus]\n愛してる",
        language: Language.create("ja"),
      };

      const lyrics = Lyrics.create(japaneseProps);
      const suggestions = lyrics.getOptimizationSuggestions();

      expect(suggestions.some((s) => s.includes("ひらがな"))).toBe(true);
    });
  });

  describe("バリデーション", () => {
    it("歌詞の妥当性を検証できる", () => {
      const lyrics = Lyrics.create(validProps);
      const validation = lyrics.validate();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("文字数制限をチェックできる", () => {
      const longContent = "A".repeat(3001);
      const invalidProps = { ...validProps, content: longContent };

      expect(() => Lyrics.create(invalidProps)).toThrow(
        "歌詞は3000文字以内で入力してください"
      );
    });

    it("必要なセクションの不足を検出できる", () => {
      const invalidProps = {
        ...validProps,
        content: "Just some text without sections",
      };

      const lyrics = Lyrics.create(invalidProps);
      const validation = lyrics.validate();

      expect(validation.warnings).toContain(
        "Verse や Chorus などの構造タグの使用を推奨します"
      );
    });
  });

  describe("変換・フォーマット", () => {
    it("Suno用にフォーマットできる", () => {
      const lyrics = Lyrics.create(validProps);
      const formatted = lyrics.formatForSuno();

      expect(formatted).toContain("[Verse]");
      expect(formatted).toContain("[Chorus]");
      expect(formatted.length).toBeLessThanOrEqual(3000);
    });

    it("プレーンテキストに変換できる", () => {
      const lyrics = Lyrics.create(validProps);
      const plainText = lyrics.toPlainText();

      expect(plainText).not.toContain("[Verse]");
      expect(plainText).not.toContain("[Chorus]");
      expect(plainText).toContain("Love is all around");
    });
  });

  describe("等価性", () => {
    it("同じIDのLyricsは等価", () => {
      const lyrics1 = Lyrics.create(validProps);
      const lyrics2 = Lyrics.create(validProps);

      expect(lyrics1.equals(lyrics2)).toBe(true);
    });

    it("異なるIDのLyricsは非等価", () => {
      const lyrics1 = Lyrics.create(validProps);
      const lyrics2 = Lyrics.create({ ...validProps, id: "different-id" });

      expect(lyrics1.equals(lyrics2)).toBe(false);
    });
  });

  describe("シリアライゼーション", () => {
    it("JSON形式にシリアライズできる", () => {
      const lyrics = Lyrics.create(validProps);
      const json = lyrics.toJSON();

      expect(json.id).toBe(lyrics.id);
      expect(json.title).toBe(lyrics.title);
      expect(json.content).toBe(lyrics.content);
      expect(json.language).toBe("en");
    });

    it("JSONから復元できる", () => {
      const lyrics = Lyrics.create(validProps);
      const json = lyrics.toJSON();
      const restored = Lyrics.fromJSON(json);

      expect(restored.equals(lyrics)).toBe(true);
    });
  });
});
