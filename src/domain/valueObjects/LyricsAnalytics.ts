import type { Language } from "./Language";

export type LyricSectionType =
  | "Intro"
  | "Verse"
  | "Pre-Chorus"
  | "Chorus"
  | "Bridge"
  | "Hook"
  | "Outro"
  | "Big Finish"
  | "Guitar Solo"
  | "Piano Interlude"
  | "Drum Break"
  | "Whispered Verse"
  | "Powerful Chorus"
  | "Spoken Word"
  | "Unstructured";

export type LanguagePattern =
  | "hiragana-dominant"
  | "katakana-heavy"
  | "kanji-heavy"
  | "balanced"
  | "mixed"
  | "alphabetic";

export interface LyricSection {
  type: LyricSectionType;
  content: string;
  lineNumber: number;
}

export interface LyricsStats {
  totalCharacters: number;
  totalLines: number;
  sectionCount: number;
  averageLineLength: number;
  hasStructureTags: boolean;
}

const STRUCTURE_TAGS = [
  "Intro",
  "Verse",
  "Pre-Chorus",
  "Chorus",
  "Bridge",
  "Hook",
  "Outro",
  "Big Finish",
  "Guitar Solo",
  "Piano Interlude",
  "Drum Break",
  "Whispered Verse",
  "Powerful Chorus",
  "Spoken Word",
] as const;

export class LyricsAnalytics {
  private constructor(
    private readonly content: string,
    private readonly language: Language,
    private readonly cachedSections: readonly LyricSection[],
    private readonly cachedStats: LyricsStats
  ) {
    Object.freeze(this);
    Object.freeze(this.cachedSections);
    Object.freeze(this.cachedStats);
  }

  // Standardized factory method
  static create(content: string, language: Language): LyricsAnalytics {
    return LyricsAnalytics.analyze(content, language);
  }

  static analyze(content: string, language: Language): LyricsAnalytics {
    const sections = LyricsAnalytics.extractSections(content);
    const stats = LyricsAnalytics.calculateStats(content, sections);

    return new LyricsAnalytics(content, language, sections, stats);
  }

  private static extractSections(content: string): LyricSection[] {
    const lines = content.split("\n");
    const sections: LyricSection[] = [];
    let currentSection: LyricSection | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 構造タグを検出
      const tagMatch = line.match(/^\[(.+?)\]$/);
      if (tagMatch) {
        // 前のセクションを保存
        if (currentSection?.content.trim()) {
          sections.push(currentSection);
        }

        // 新しいセクションを開始
        const sectionType = tagMatch[1] as LyricSectionType;
        currentSection = {
          type: STRUCTURE_TAGS.includes(
            sectionType as (typeof STRUCTURE_TAGS)[number]
          )
            ? sectionType
            : "Unstructured",
          content: "",
          lineNumber: i + 1,
        };
      } else if (currentSection && line) {
        // 現在のセクションにコンテンツを追加
        currentSection.content += (currentSection.content ? "\n" : "") + line;
      } else if (!currentSection && line) {
        // セクションタグなしのコンテンツ
        currentSection = {
          type: "Unstructured",
          content: line,
          lineNumber: i + 1,
        };
      }
    }

    // 最後のセクションを保存
    if (currentSection?.content.trim()) {
      sections.push(currentSection);
    }

    return sections;
  }

  private static calculateStats(
    content: string,
    sections: readonly LyricSection[]
  ): LyricsStats {
    const lines = content.split("\n").filter((line) => line.trim());
    const hasStructureTags = sections.some((section) =>
      STRUCTURE_TAGS.includes(section.type as (typeof STRUCTURE_TAGS)[number])
    );

    const averageLineLength =
      lines.length > 0
        ? Math.round(
            lines.reduce((sum, line) => sum + line.length, 0) / lines.length
          )
        : 0;

    return {
      totalCharacters: content.length,
      totalLines: lines.length,
      sectionCount: sections.length,
      averageLineLength,
      hasStructureTags,
    };
  }

  getSections(): readonly LyricSection[] {
    return this.cachedSections;
  }

  getStats(): LyricsStats {
    return { ...this.cachedStats };
  }

  getWordCount(): number {
    if (this.language.value === "ja") {
      // 日本語：文字数をベースに推定
      return Math.round(this.content.length * 0.6);
    }
    // 英語など：スペース区切りで単語数をカウント
    return this.content.split(/\s+/).filter((word) => word.trim().length > 0)
      .length;
  }

  hasRequiredStructure(): boolean {
    const sections = this.getSections();
    const sectionTypes = sections.map((section) => section.type.toLowerCase());

    // 基本的な構造（Verse と Chorus）があるかチェック
    const hasVerse = sectionTypes.some((type) => type.includes("verse"));
    const hasChorus = sectionTypes.some((type) => type.includes("chorus"));

    return hasVerse && hasChorus;
  }

  getDominantLanguagePattern(): LanguagePattern {
    if (this.language.value === "ja") {
      // 日本語の特徴を分析
      const hiraganaCount = (this.content.match(/[\u3040-\u309F]/g) || [])
        .length;
      const katakanaCount = (this.content.match(/[\u30A0-\u30FF]/g) || [])
        .length;
      const kanjiCount = (this.content.match(/[\u4E00-\u9FAF]/g) || []).length;

      const total = hiraganaCount + katakanaCount + kanjiCount;
      if (total === 0) return "mixed";

      if (hiraganaCount / total > 0.5) return "hiragana-dominant";
      if (katakanaCount / total > 0.3) return "katakana-heavy";
      if (kanjiCount / total > 0.3) return "kanji-heavy";
      return "balanced";
    }

    return "alphabetic";
  }

  getComplexityScore(): number {
    const stats = this.getStats();
    let score = 0;

    // セクション数による複雑度 (0-30)
    if (stats.sectionCount >= 4) score += 30;
    else if (stats.sectionCount >= 2) score += 20;
    else score += 10;

    // 行数による複雑度 (0-25)
    if (stats.totalLines >= 20) score += 25;
    else if (stats.totalLines >= 10) score += 20;
    else if (stats.totalLines >= 5) score += 15;
    else score += 10;

    // 構造タグ使用による複雑度 (0-25)
    if (stats.hasStructureTags) score += 25;
    else score += 10;

    // 平均行長による複雑度 (0-20)
    if (stats.averageLineLength >= 50) score += 20;
    else if (stats.averageLineLength >= 30) score += 15;
    else if (stats.averageLineLength >= 15) score += 10;
    else score += 5;

    return Math.min(100, score);
  }

  equals(other: LyricsAnalytics): boolean {
    return (
      this.content === other.content && this.language.equals(other.language)
    );
  }
}
