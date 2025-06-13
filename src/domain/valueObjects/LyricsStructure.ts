import { z } from "zod";

export interface LyricsSection {
  type: LyricsSectionType;
  content: string;
  startLine: number;
  endLine: number;
  isOptional?: boolean;
}

export type LyricsSectionType =
  | "intro"
  | "verse"
  | "chorus"
  | "bridge"
  | "outro"
  | "pre-chorus"
  | "post-chorus"
  | "instrumental"
  | "ad-lib"
  | "hook";

export const LyricsSectionTypeSchema = z.enum([
  "intro",
  "verse",
  "chorus",
  "bridge",
  "outro",
  "pre-chorus",
  "post-chorus",
  "instrumental",
  "ad-lib",
  "hook",
]);

export interface StructureTemplate {
  name: string;
  description: string;
  sections: LyricsSectionType[];
  isPopular: boolean;
  genre?: string[];
}

export class LyricsStructure {
  private constructor(
    public readonly sections: LyricsSection[],
    public readonly template?: StructureTemplate
  ) {}

  static create(
    sections: LyricsSection[],
    template?: StructureTemplate
  ): LyricsStructure {
    LyricsStructure.validateStructure(sections);
    return new LyricsStructure(sections, template);
  }

  static fromText(text: string): LyricsStructure {
    const sections = LyricsStructure.parseStructureFromText(text);
    const detectedTemplate = LyricsStructure.detectTemplate(sections);
    return new LyricsStructure(sections, detectedTemplate);
  }

  static getRecommendedTemplates(): StructureTemplate[] {
    return [
      {
        name: "Pop Standard",
        description: "標準的なポップソング構造",
        sections: [
          "intro",
          "verse",
          "chorus",
          "verse",
          "chorus",
          "bridge",
          "chorus",
          "outro",
        ],
        isPopular: true,
        genre: ["Pop", "Rock"],
      },
      {
        name: "Simple Verse-Chorus",
        description: "シンプルなバース・コーラス構造",
        sections: ["verse", "chorus", "verse", "chorus", "bridge", "chorus"],
        isPopular: true,
        genre: ["Folk", "Country", "Indie"],
      },
      {
        name: "Extended Pop",
        description: "拡張されたポップ構造（プリコーラス付き）",
        sections: [
          "intro",
          "verse",
          "pre-chorus",
          "chorus",
          "verse",
          "pre-chorus",
          "chorus",
          "bridge",
          "chorus",
          "outro",
        ],
        isPopular: true,
        genre: ["Pop", "Dance", "Electronic"],
      },
      {
        name: "Rock Classic",
        description: "クラシックロック構造",
        sections: [
          "intro",
          "verse",
          "verse",
          "chorus",
          "verse",
          "chorus",
          "instrumental",
          "chorus",
          "outro",
        ],
        isPopular: true,
        genre: ["Rock", "Metal", "Hard Rock"],
      },
      {
        name: "Ballad Structure",
        description: "バラード向け構造",
        sections: [
          "intro",
          "verse",
          "chorus",
          "verse",
          "chorus",
          "bridge",
          "chorus",
          "post-chorus",
          "outro",
        ],
        isPopular: false,
        genre: ["Ballad", "R&B", "Soul"],
      },
      {
        name: "Hip-Hop Standard",
        description: "ヒップホップ標準構造",
        sections: [
          "intro",
          "verse",
          "hook",
          "verse",
          "hook",
          "bridge",
          "hook",
          "outro",
        ],
        isPopular: true,
        genre: ["Hip-Hop", "Rap", "Trap"],
      },
    ];
  }

  private static parseStructureFromText(text: string): LyricsSection[] {
    const lines = text.split("\n");
    const sections: LyricsSection[] = [];
    let currentSection: Partial<LyricsSection> | null = null;
    let lineNumber = 0;

    for (const line of lines) {
      lineNumber++;
      const trimmedLine = line.trim();

      // セクションタグを検出（例: [Verse], [Chorus], [Bridge]）
      const sectionMatch = trimmedLine.match(/^\[([^\]]+)\]$/i);

      if (sectionMatch) {
        // 前のセクションを完了
        if (
          currentSection?.content &&
          currentSection.type &&
          currentSection.startLine !== undefined
        ) {
          sections.push({
            type: currentSection.type,
            content: currentSection.content.trim(),
            startLine: currentSection.startLine,
            endLine: lineNumber - 1,
          });
        }

        // 新しいセクションを開始
        const sectionType = LyricsStructure.normalizeSectionType(
          sectionMatch[1]
        );
        currentSection = {
          type: sectionType,
          content: "",
          startLine: lineNumber,
          endLine: lineNumber,
        };
      } else if (currentSection && trimmedLine) {
        // セクション内容を追加
        currentSection.content +=
          (currentSection.content ? "\n" : "") + trimmedLine;
      }
    }

    // 最後のセクションを追加
    if (
      currentSection?.content &&
      currentSection.type &&
      currentSection.startLine !== undefined
    ) {
      sections.push({
        type: currentSection.type,
        content: currentSection.content.trim(),
        startLine: currentSection.startLine,
        endLine: lineNumber,
      });
    }

    return sections;
  }

  private static normalizeSectionType(sectionName: string): LyricsSectionType {
    const normalized = sectionName.toLowerCase().replace(/\s+/g, "-");

    const mappings: Record<string, LyricsSectionType> = {
      verse: "verse",
      "verse-1": "verse",
      "verse-2": "verse",
      v1: "verse",
      v2: "verse",
      chorus: "chorus",
      refrain: "chorus",
      hook: "hook",
      bridge: "bridge",
      "c-part": "bridge",
      intro: "intro",
      introduction: "intro",
      outro: "outro",
      ending: "outro",
      "pre-chorus": "pre-chorus",
      prechorus: "pre-chorus",
      "post-chorus": "post-chorus",
      postchorus: "post-chorus",
      instrumental: "instrumental",
      solo: "instrumental",
      "ad-lib": "ad-lib",
      adlib: "ad-lib",
    };

    return mappings[normalized] || "verse";
  }

  private static detectTemplate(
    sections: LyricsSection[]
  ): StructureTemplate | undefined {
    const sectionTypes = sections.map((s) => s.type);
    const templates = LyricsStructure.getRecommendedTemplates();

    // 完全一致を探す
    const exactMatch = templates.find((template) =>
      LyricsStructure.arraysEqual(template.sections, sectionTypes)
    );

    if (exactMatch) {
      return exactMatch;
    }

    // 部分一致を探す（80%以上の一致）
    const partialMatch = templates.find((template) => {
      const similarity = LyricsStructure.calculateSimilarity(
        template.sections,
        sectionTypes
      );
      return similarity >= 0.8;
    });

    return partialMatch;
  }

  private static arraysEqual<T>(a: T[], b: T[]): boolean {
    return a.length === b.length && a.every((val, index) => val === b[index]);
  }

  private static calculateSimilarity(
    template: LyricsSectionType[],
    actual: LyricsSectionType[]
  ): number {
    const maxLength = Math.max(template.length, actual.length);
    if (maxLength === 0) return 1;

    let matches = 0;
    const minLength = Math.min(template.length, actual.length);

    for (let i = 0; i < minLength; i++) {
      if (template[i] === actual[i]) {
        matches++;
      }
    }

    return matches / maxLength;
  }

  private static validateStructure(sections: LyricsSection[]): void {
    if (sections.length === 0) {
      throw new Error("歌詞構造には最低1つのセクションが必要です");
    }

    // 必須セクションのチェック（バースまたはコーラスは必須）
    const hasVerse = sections.some((s) => s.type === "verse");
    const hasChorus = sections.some((s) => s.type === "chorus");

    if (!hasVerse && !hasChorus) {
      throw new Error("歌詞にはバースまたはコーラスが必要です");
    }

    // セクションの順序検証
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];

      if (section.startLine > section.endLine) {
        throw new Error(`セクション ${section.type} の行番号が無効です`);
      }

      if (i > 0 && section.startLine <= sections[i - 1].endLine) {
        throw new Error(`セクション ${section.type} の行番号が重複しています`);
      }
    }
  }

  // 構造タグ付きテキストを生成
  formatWithTags(): string {
    return this.sections
      .map((section) => {
        const tagName = this.getSectionTagName(section.type);
        return `[${tagName}]\n${section.content}`;
      })
      .join("\n\n");
  }

  // プレーンテキストを生成（タグなし）
  formatPlainText(): string {
    return this.sections.map((section) => section.content).join("\n\n");
  }

  // Suno向けフォーマット
  formatForSuno(): string {
    return this.sections
      .map((section) => {
        const tagName = this.getSunoTagName(section.type);
        return `[${tagName}]\n${section.content}`;
      })
      .join("\n\n");
  }

  private getSectionTagName(type: LyricsSectionType): string {
    const tagNames: Record<LyricsSectionType, string> = {
      intro: "Intro",
      verse: "Verse",
      chorus: "Chorus",
      bridge: "Bridge",
      outro: "Outro",
      "pre-chorus": "Pre-Chorus",
      "post-chorus": "Post-Chorus",
      instrumental: "Instrumental",
      "ad-lib": "Ad-lib",
      hook: "Hook",
    };

    return tagNames[type];
  }

  private getSunoTagName(type: LyricsSectionType): string {
    // Sunoで推奨される標準的なタグ名
    const sunoTags: Record<LyricsSectionType, string> = {
      intro: "Intro",
      verse: "Verse",
      chorus: "Chorus",
      bridge: "Bridge",
      outro: "Outro",
      "pre-chorus": "Pre-Chorus",
      "post-chorus": "Post-Chorus",
      instrumental: "Instrumental",
      "ad-lib": "Ad-lib",
      hook: "Hook",
    };

    return sunoTags[type];
  }

  // 構造分析結果を取得
  getAnalysis(): {
    totalSections: number;
    sectionTypes: Record<LyricsSectionType, number>;
    estimatedDuration: number;
    template?: StructureTemplate;
    warnings: string[];
  } {
    const sectionTypes = this.sections.reduce(
      (acc, section) => {
        acc[section.type] = (acc[section.type] || 0) + 1;
        return acc;
      },
      {} as Record<LyricsSectionType, number>
    );

    // 推定時間計算（平均的な時間を仮定）
    const sectionDurations: Record<LyricsSectionType, number> = {
      intro: 15,
      verse: 30,
      chorus: 25,
      bridge: 20,
      outro: 15,
      "pre-chorus": 15,
      "post-chorus": 15,
      instrumental: 30,
      "ad-lib": 10,
      hook: 20,
    };

    const estimatedDuration = this.sections.reduce((total, section) => {
      return total + (sectionDurations[section.type] || 25);
    }, 0);

    const warnings = this.getStructureWarnings();

    return {
      totalSections: this.sections.length,
      sectionTypes,
      estimatedDuration,
      template: this.template,
      warnings,
    };
  }

  private getStructureWarnings(): string[] {
    const warnings: string[] = [];
    const sectionTypes = this.sections.map((s) => s.type);

    // 基本的な警告チェック
    if (!sectionTypes.includes("chorus") && !sectionTypes.includes("hook")) {
      warnings.push("コーラスまたはフックがありません");
    }

    if (this.sections.length > 12) {
      warnings.push("セクション数が多すぎます（推奨: 12以下）");
    }

    if (this.sections.length < 3) {
      warnings.push("セクション数が少なすぎます（推奨: 3以上）");
    }

    // 連続する同じセクション
    for (let i = 1; i < this.sections.length; i++) {
      if (
        this.sections[i].type === this.sections[i - 1].type &&
        this.sections[i].type === "verse"
      ) {
        warnings.push("連続するバースがあります");
        break;
      }
    }

    return warnings;
  }

  // セクション追加
  addSection(section: LyricsSection): LyricsStructure {
    const newSections = [...this.sections, section];
    return LyricsStructure.create(newSections, this.template);
  }

  // セクション削除
  removeSection(index: number): LyricsStructure {
    if (index < 0 || index >= this.sections.length) {
      throw new Error("無効なセクションインデックスです");
    }

    const newSections = this.sections.filter((_, i) => i !== index);
    return LyricsStructure.create(newSections, this.template);
  }

  // セクション並び替え
  reorderSection(fromIndex: number, toIndex: number): LyricsStructure {
    if (
      fromIndex < 0 ||
      fromIndex >= this.sections.length ||
      toIndex < 0 ||
      toIndex >= this.sections.length
    ) {
      throw new Error("無効なセクションインデックスです");
    }

    const newSections = [...this.sections];
    const [movedSection] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, movedSection);

    // 行番号を再計算
    let currentLine = 1;
    const reindexedSections = newSections.map((section) => {
      const lineCount = section.content.split("\n").length;
      const newSection = {
        ...section,
        startLine: currentLine,
        endLine: currentLine + lineCount - 1,
      };
      currentLine = newSection.endLine + 1;
      return newSection;
    });

    return new LyricsStructure(reindexedSections, this.template);
  }

  // 等価性チェック
  equals(other: LyricsStructure): boolean {
    if (this.sections.length !== other.sections.length) {
      return false;
    }

    return this.sections.every((section, index) => {
      const otherSection = other.sections[index];
      return (
        section.type === otherSection.type &&
        section.content === otherSection.content
      );
    });
  }

  // JSON化
  toJSON(): object {
    return {
      sections: this.sections,
      template: this.template,
    };
  }

  static fromJSON(data: {
    sections: unknown[];
    template?: StructureTemplate;
  }): LyricsStructure {
    const sections = data.sections.map((sectionData): LyricsSection => {
      const s = sectionData as {
        type: unknown;
        content: string;
        startLine: number;
        endLine: number;
        isOptional?: boolean;
      };
      return {
        type: LyricsSectionTypeSchema.parse(s.type),
        content: s.content,
        startLine: s.startLine,
        endLine: s.endLine,
        isOptional: s.isOptional,
      };
    });

    return new LyricsStructure(sections, data.template);
  }
}
