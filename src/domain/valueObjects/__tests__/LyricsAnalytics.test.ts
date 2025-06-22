import { beforeEach, describe, expect, it } from "vitest";
import { Language } from "../Language";
import { LyricsAnalytics } from "../LyricsAnalytics";

describe("LyricsAnalytics", () => {
  let englishLanguage: Language;
  let japaneseLanguage: Language;
  let structuredContent: string;
  let unstructuredContent: string;
  let japaneseContent: string;

  beforeEach(() => {
    englishLanguage = Language.create("en");
    japaneseLanguage = Language.create("ja");

    structuredContent = `[Verse]
Love is all around
In the air tonight
[Chorus]
Feel the beat
Let it take you high
[Outro]
End of song`;

    unstructuredContent = `Love is all around
In the air tonight
Feel the beat
Let it take you high`;

    japaneseContent = `[Verse]
愛してる
君のことを
[Chorus]
心から愛してる
ずっと一緒にいよう`;
  });

  describe("セクション分析", () => {
    it("構造化された歌詞のセクションを正しく抽出できる", () => {
      const analytics = LyricsAnalytics.analyze(
        structuredContent,
        englishLanguage
      );
      const sections = analytics.getSections();

      expect(sections).toHaveLength(3);
      expect(sections[0].type).toBe("Verse");
      expect(sections[0].content).toBe(
        "Love is all around\nIn the air tonight"
      );
      expect(sections[1].type).toBe("Chorus");
      expect(sections[1].content).toBe("Feel the beat\nLet it take you high");
      expect(sections[2].type).toBe("Outro");
      expect(sections[2].content).toBe("End of song");
    });

    it("構造タグのない歌詞を Unstructured として扱う", () => {
      const analytics = LyricsAnalytics.analyze(
        unstructuredContent,
        englishLanguage
      );
      const sections = analytics.getSections();

      expect(sections).toHaveLength(1);
      expect(sections[0].type).toBe("Unstructured");
      expect(sections[0].content).toContain("Love is all around");
    });

    it("必要な構造があるかを正しく判定できる", () => {
      const structuredAnalytics = LyricsAnalytics.analyze(
        structuredContent,
        englishLanguage
      );
      const unstructuredAnalytics = LyricsAnalytics.analyze(
        unstructuredContent,
        englishLanguage
      );

      expect(structuredAnalytics.hasRequiredStructure()).toBe(true);
      expect(unstructuredAnalytics.hasRequiredStructure()).toBe(false);
    });
  });

  describe("統計計算", () => {
    it("歌詞の統計を正しく計算できる", () => {
      const analytics = LyricsAnalytics.analyze(
        structuredContent,
        englishLanguage
      );
      const stats = analytics.getStats();

      expect(stats.totalCharacters).toBe(structuredContent.length);
      expect(stats.totalLines).toBeGreaterThan(0);
      expect(stats.sectionCount).toBe(3);
      expect(stats.averageLineLength).toBeGreaterThan(0);
      expect(stats.hasStructureTags).toBe(true);
    });

    it("構造タグなしの歌詞でhasStructureTagsがfalseになる", () => {
      const analytics = LyricsAnalytics.analyze(
        unstructuredContent,
        englishLanguage
      );
      const stats = analytics.getStats();

      expect(stats.hasStructureTags).toBe(false);
    });

    it("空行を除外して行数を計算する", () => {
      const contentWithEmptyLines = `[Verse]
Love is all around

In the air tonight

[Chorus]
Feel the beat`;

      const analytics = LyricsAnalytics.analyze(
        contentWithEmptyLines,
        englishLanguage
      );
      const stats = analytics.getStats();

      expect(stats.totalLines).toBe(5); // [Verse], Love is all around, In the air tonight, [Chorus], Feel the beat
    });
  });

  describe("単語数計算", () => {
    it("英語の単語数を正しく計算できる", () => {
      const analytics = LyricsAnalytics.analyze(
        "Hello world this is a test",
        englishLanguage
      );
      const wordCount = analytics.getWordCount();

      expect(wordCount).toBe(6);
    });

    it("日本語の文字数ベース単語数を計算できる", () => {
      const analytics = LyricsAnalytics.analyze(
        "愛してる君のこと",
        japaneseLanguage
      );
      const wordCount = analytics.getWordCount();

      expect(wordCount).toBe(Math.round("愛してる君のこと".length * 0.6));
    });

    it("空文字列で0を返す", () => {
      const analytics = LyricsAnalytics.analyze("", englishLanguage);
      const wordCount = analytics.getWordCount();

      expect(wordCount).toBe(0);
    });
  });

  describe("言語パターン分析", () => {
    it("日本語のひらがな主体パターンを検出できる", () => {
      const hiraganaContent = "あいしてる きみのこころ";
      const analytics = LyricsAnalytics.analyze(
        hiraganaContent,
        japaneseLanguage
      );
      const pattern = analytics.getDominantLanguagePattern();

      expect(pattern).toBe("hiragana-dominant");
    });

    it("日本語のカタカナ重用パターンを検出できる", () => {
      const katakanaContent = "ラブ ソング ミュージック エモーション";
      const analytics = LyricsAnalytics.analyze(
        katakanaContent,
        japaneseLanguage
      );
      const pattern = analytics.getDominantLanguagePattern();

      expect(pattern).toBe("katakana-heavy");
    });

    it("日本語の漢字重用パターンを検出できる", () => {
      const kanjiContent = "愛情 感情 音楽 歌詞";
      const analytics = LyricsAnalytics.analyze(kanjiContent, japaneseLanguage);
      const pattern = analytics.getDominantLanguagePattern();

      expect(pattern).toBe("kanji-heavy");
    });

    it("英語でalphabeticパターンを返す", () => {
      const analytics = LyricsAnalytics.analyze("Hello world", englishLanguage);
      const pattern = analytics.getDominantLanguagePattern();

      expect(pattern).toBe("alphabetic");
    });
  });

  describe("複雑度スコア", () => {
    it("構造化された歌詞で高い複雑度スコアを計算できる", () => {
      const complexContent = `[Intro]
Beginning of the song
[Verse]
This is a very long line with many words to increase complexity
Another line in the verse
[Pre-Chorus]
Building up the energy
[Chorus]
Main hook with memorable lyrics here
Catchy chorus line that people will sing
[Bridge]
Different melody and lyrics here
[Guitar Solo]
Instrumental section
[Chorus]
Main hook with memorable lyrics here
Catchy chorus line that people will sing
[Outro]
End of the song with fade out`;

      const analytics = LyricsAnalytics.analyze(
        complexContent,
        englishLanguage
      );
      const complexityScore = analytics.getComplexityScore();

      expect(complexityScore).toBeGreaterThan(80);
    });

    it("シンプルな歌詞で低い複雑度スコアを計算できる", () => {
      const simpleContent = "Hello\nWorld";
      const analytics = LyricsAnalytics.analyze(simpleContent, englishLanguage);
      const complexityScore = analytics.getComplexityScore();

      expect(complexityScore).toBeLessThan(50);
    });

    it("複雑度スコアが100を超えない", () => {
      const veryComplexContent = `[Intro]${"Very long line with many many words ".repeat(10)}
[Verse]${"Another very long line ".repeat(20)}
[Pre-Chorus]${"Building up ".repeat(15)}
[Chorus]${"Main hook ".repeat(25)}
[Bridge]${"Different melody ".repeat(30)}
[Guitar Solo]${"Instrumental ".repeat(10)}
[Outro]${"End of song ".repeat(20)}`;

      const analytics = LyricsAnalytics.analyze(
        veryComplexContent,
        englishLanguage
      );
      const complexityScore = analytics.getComplexityScore();

      expect(complexityScore).toBeLessThanOrEqual(100);
    });
  });

  describe("等価性", () => {
    it("同じコンテンツと言語で作成された分析は等価", () => {
      const analytics1 = LyricsAnalytics.analyze(
        structuredContent,
        englishLanguage
      );
      const analytics2 = LyricsAnalytics.analyze(
        structuredContent,
        englishLanguage
      );

      expect(analytics1.equals(analytics2)).toBe(true);
    });

    it("異なるコンテンツで作成された分析は非等価", () => {
      const analytics1 = LyricsAnalytics.analyze(
        structuredContent,
        englishLanguage
      );
      const analytics2 = LyricsAnalytics.analyze(
        unstructuredContent,
        englishLanguage
      );

      expect(analytics1.equals(analytics2)).toBe(false);
    });

    it("異なる言語で作成された分析は非等価", () => {
      const analytics1 = LyricsAnalytics.analyze(
        structuredContent,
        englishLanguage
      );
      const analytics2 = LyricsAnalytics.analyze(
        structuredContent,
        japaneseLanguage
      );

      expect(analytics1.equals(analytics2)).toBe(false);
    });
  });

  describe("不変性", () => {
    it("LyricsAnalyticsオブジェクトは不変である", () => {
      const analytics = LyricsAnalytics.analyze(
        structuredContent,
        englishLanguage
      );

      expect(() => {
        // biome-ignore lint/suspicious/noExplicitAny: Testing immutability
        (analytics as any).content = "modified";
      }).toThrow();
    });

    it("セクション配列は不変である", () => {
      const analytics = LyricsAnalytics.analyze(
        structuredContent,
        englishLanguage
      );
      const sections = analytics.getSections();

      expect(() => {
        // biome-ignore lint/suspicious/noExplicitAny: Testing immutability
        (sections as any).push({ type: "New", content: "Test", lineNumber: 1 });
      }).toThrow();
    });
  });
});
