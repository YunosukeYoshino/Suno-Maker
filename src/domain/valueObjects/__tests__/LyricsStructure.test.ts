import { describe, expect, it } from "vitest";
import {
  type LyricsSection,
  LyricsStructure,
  type StructureTemplate,
} from "../LyricsStructure";

describe("LyricsStructure", () => {
  const sampleSections: LyricsSection[] = [
    {
      type: "verse",
      content: "Walking down the street\nFeeling the beat",
      startLine: 1,
      endLine: 2,
    },
    {
      type: "chorus",
      content: "This is the chorus\nSing it with us",
      startLine: 3,
      endLine: 4,
    },
  ];

  describe("作成", () => {
    it("有効なセクションで構造を作成できる", () => {
      const structure = LyricsStructure.create(sampleSections);

      expect(structure.sections).toEqual(sampleSections);
      expect(structure.template).toBeUndefined();
    });

    it("テンプレート付きで構造を作成できる", () => {
      const template: StructureTemplate = {
        name: "Test Template",
        description: "テスト用テンプレート",
        sections: ["verse", "chorus"],
        isPopular: true,
      };

      const structure = LyricsStructure.create(sampleSections, template);

      expect(structure.template).toEqual(template);
    });

    it("空のセクション配列では作成できない", () => {
      expect(() => LyricsStructure.create([])).toThrow(
        "歌詞構造には最低1つのセクションが必要です"
      );
    });

    it("バースもコーラスもない場合は作成できない", () => {
      const invalidSections: LyricsSection[] = [
        {
          type: "intro",
          content: "Just intro",
          startLine: 1,
          endLine: 1,
        },
      ];

      expect(() => LyricsStructure.create(invalidSections)).toThrow(
        "歌詞にはバースまたはコーラスが必要です"
      );
    });
  });

  describe("テキスト解析", () => {
    it("タグ付きテキストから構造を解析できる", () => {
      const text = `[Verse]
Walking down the street
Feeling the beat

[Chorus]
This is the chorus
Sing it with us

[Bridge]
Here comes the bridge
Over the ridge`;

      const structure = LyricsStructure.fromText(text);

      expect(structure.sections).toHaveLength(3);
      expect(structure.sections[0].type).toBe("verse");
      expect(structure.sections[1].type).toBe("chorus");
      expect(structure.sections[2].type).toBe("bridge");
    });

    it("様々なセクションタグを正しく認識する", () => {
      const text = `[Verse 1]
First verse

[Pre-Chorus]
Building up

[Chorus]
Main chorus

[Verse 2]
Second verse

[Bridge]
The bridge

[Outro]
Final part`;

      const structure = LyricsStructure.fromText(text);

      expect(structure.sections[0].type).toBe("verse");
      expect(structure.sections[1].type).toBe("pre-chorus");
      expect(structure.sections[2].type).toBe("chorus");
      expect(structure.sections[3].type).toBe("verse");
      expect(structure.sections[4].type).toBe("bridge");
      expect(structure.sections[5].type).toBe("outro");
    });

    it("タグのない場合は単一バースとして扱う", () => {
      const text = `Just some lyrics
Without any tags
Still should work`;

      const structure = LyricsStructure.fromText(text);

      expect(structure.sections).toHaveLength(0); // タグがないと解析されない
    });
  });

  describe("推奨テンプレート", () => {
    it("推奨テンプレートを取得できる", () => {
      const templates = LyricsStructure.getRecommendedTemplates();

      expect(templates.length).toBeGreaterThan(0);
      expect(templates[0]).toHaveProperty("name");
      expect(templates[0]).toHaveProperty("description");
      expect(templates[0]).toHaveProperty("sections");
      expect(templates[0]).toHaveProperty("isPopular");
    });

    it("人気テンプレートが含まれている", () => {
      const templates = LyricsStructure.getRecommendedTemplates();
      const popularTemplates = templates.filter((t) => t.isPopular);

      expect(popularTemplates.length).toBeGreaterThan(0);
    });

    it("異なるジャンル向けテンプレートがある", () => {
      const templates = LyricsStructure.getRecommendedTemplates();
      const withGenres = templates.filter((t) => t.genre && t.genre.length > 0);

      expect(withGenres.length).toBeGreaterThan(0);
    });
  });

  describe("フォーマット出力", () => {
    it("タグ付きフォーマットを生成できる", () => {
      const structure = LyricsStructure.create(sampleSections);
      const formatted = structure.formatWithTags();

      expect(formatted).toContain("[Verse]");
      expect(formatted).toContain("[Chorus]");
      expect(formatted).toContain("Walking down the street");
      expect(formatted).toContain("This is the chorus");
    });

    it("プレーンテキストフォーマットを生成できる", () => {
      const structure = LyricsStructure.create(sampleSections);
      const formatted = structure.formatPlainText();

      expect(formatted).not.toContain("[Verse]");
      expect(formatted).not.toContain("[Chorus]");
      expect(formatted).toContain("Walking down the street");
      expect(formatted).toContain("This is the chorus");
    });

    it("Suno向けフォーマットを生成できる", () => {
      const structure = LyricsStructure.create(sampleSections);
      const formatted = structure.formatForSuno();

      expect(formatted).toContain("[Verse]");
      expect(formatted).toContain("[Chorus]");
      expect(formatted).toContain("Walking down the street");
    });
  });

  describe("構造分析", () => {
    it("基本的な分析結果を提供する", () => {
      const structure = LyricsStructure.create(sampleSections);
      const analysis = structure.getAnalysis();

      expect(analysis.totalSections).toBe(2);
      expect(analysis.sectionTypes.verse).toBe(1);
      expect(analysis.sectionTypes.chorus).toBe(1);
      expect(analysis.estimatedDuration).toBeGreaterThan(0);
    });

    it("構造の警告を検出する", () => {
      const shortSections: LyricsSection[] = [
        {
          type: "verse",
          content: "Only one section",
          startLine: 1,
          endLine: 1,
        },
      ];

      const structure = LyricsStructure.create(shortSections);
      const analysis = structure.getAnalysis();

      expect(analysis.warnings).toContain(
        "セクション数が少なすぎます（推奨: 3以上）"
      );
    });

    it("コーラスがない場合の警告を出す", () => {
      const noChorusSections: LyricsSection[] = [
        {
          type: "verse",
          content: "First verse",
          startLine: 1,
          endLine: 1,
        },
        {
          type: "verse",
          content: "Second verse",
          startLine: 2,
          endLine: 2,
        },
        {
          type: "bridge",
          content: "A bridge",
          startLine: 3,
          endLine: 3,
        },
      ];

      const structure = LyricsStructure.create(noChorusSections);
      const analysis = structure.getAnalysis();

      expect(analysis.warnings).toContain("コーラスまたはフックがありません");
    });
  });

  describe("構造操作", () => {
    it("セクションを追加できる", () => {
      const structure = LyricsStructure.create(sampleSections);
      const newSection: LyricsSection = {
        type: "bridge",
        content: "New bridge section",
        startLine: 5,
        endLine: 5,
      };

      const newStructure = structure.addSection(newSection);

      expect(newStructure.sections).toHaveLength(3);
      expect(newStructure.sections[2]).toEqual(newSection);
    });

    it("セクションを削除できる", () => {
      const structure = LyricsStructure.create(sampleSections);
      const newStructure = structure.removeSection(0);

      expect(newStructure.sections).toHaveLength(1);
      expect(newStructure.sections[0].type).toBe("chorus");
    });

    it("無効なインデックスでの削除はエラーになる", () => {
      const structure = LyricsStructure.create(sampleSections);

      expect(() => structure.removeSection(-1)).toThrow(
        "無効なセクションインデックスです"
      );
      expect(() => structure.removeSection(10)).toThrow(
        "無効なセクションインデックスです"
      );
    });

    it("セクションを並び替えできる", () => {
      const structure = LyricsStructure.create(sampleSections);
      const newStructure = structure.reorderSection(0, 1);

      expect(newStructure.sections[0].type).toBe("chorus");
      expect(newStructure.sections[1].type).toBe("verse");
    });
  });

  describe("等価性", () => {
    it("同じ構造は等価である", () => {
      const structure1 = LyricsStructure.create(sampleSections);
      const structure2 = LyricsStructure.create(sampleSections);

      expect(structure1.equals(structure2)).toBe(true);
    });

    it("異なる構造は等価でない", () => {
      const structure1 = LyricsStructure.create(sampleSections);
      const differentSections = [sampleSections[0]]; // 一つ少ない
      const structure2 = LyricsStructure.create(differentSections);

      expect(structure1.equals(structure2)).toBe(false);
    });
  });

  describe("シリアライゼーション", () => {
    it("JSONにシリアライズできる", () => {
      const structure = LyricsStructure.create(sampleSections);
      const json = structure.toJSON();

      expect(json).toHaveProperty("sections");
      expect(json).toHaveProperty("template");
    });

    it("JSONから復元できる", () => {
      const structure = LyricsStructure.create(sampleSections);
      const json = structure.toJSON();
      const restored = LyricsStructure.fromJSON(json);

      expect(restored.equals(structure)).toBe(true);
    });
  });
});
