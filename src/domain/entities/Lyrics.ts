import { z } from "zod";
import { generateUUID } from "~/utils/generateUUID";
import { Language } from "../valueObjects/Language";
import {
  type LyricSection,
  LyricsAnalytics,
  type LyricsStats,
} from "../valueObjects/LyricsAnalytics";
import { SongDuration } from "../valueObjects/SongDuration";

const LyricsSchema = z.object({
  id: z.string().min(1),
  title: z
    .string()
    .min(1, "タイトルは1文字以上100文字以内で入力してください")
    .max(100, "タイトルは1文字以上100文字以内で入力してください"),
  content: z
    .string()
    .min(1, "歌詞の内容は必須です")
    .max(3000, "歌詞は3000文字以内で入力してください"),
  language: z.custom<Language>((data) => data instanceof Language, {
    message: "Languageインスタンスである必要があります",
  }),
  tags: z.array(z.string()).default([]),
  description: z.string().default(""),
  isPublic: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type LyricsProps = z.infer<typeof LyricsSchema>;
export type { LyricSection, LyricsStats };

export interface LyricsValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface LyricsJSON {
  id: string;
  title: string;
  content: string;
  language: string;
  tags: string[];
  description: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
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

export class Lyrics {
  private constructor(private readonly props: LyricsProps) {
    Object.freeze(this);
    Object.freeze(props);
  }

  static create(
    input: Partial<LyricsProps> & {
      title: string;
      content: string;
      language: Language;
    }
  ): Lyrics {
    const now = new Date();
    const props: LyricsProps = {
      id: input.id || generateUUID(),
      title: input.title,
      content: input.content,
      language: input.language,
      tags: input.tags || [],
      description: input.description || "",
      isPublic: input.isPublic || false,
      createdAt: input.createdAt || now,
      updatedAt: input.updatedAt || now,
    };

    LyricsSchema.parse(props);
    return new Lyrics(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }
  get title(): string {
    return this.props.title;
  }
  get content(): string {
    return this.props.content;
  }
  get language(): Language {
    return this.props.language;
  }
  get tags(): readonly string[] {
    return this.props.tags;
  }
  get description(): string {
    return this.props.description;
  }
  get isPublic(): boolean {
    return this.props.isPublic;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // 更新メソッド
  updateTitle(title: string): Lyrics {
    return Lyrics.create({
      ...this.props,
      title,
      updatedAt: new Date(),
    });
  }

  updateContent(content: string): Lyrics {
    return Lyrics.create({
      ...this.props,
      content,
      updatedAt: new Date(),
    });
  }

  updateLanguage(language: Language): Lyrics {
    return Lyrics.create({
      ...this.props,
      language,
      updatedAt: new Date(),
    });
  }

  updateTags(tags: string[]): Lyrics {
    return Lyrics.create({
      ...this.props,
      tags,
      updatedAt: new Date(),
    });
  }

  makePublic(): Lyrics {
    return Lyrics.create({
      ...this.props,
      isPublic: true,
      updatedAt: new Date(),
    });
  }

  makePrivate(): Lyrics {
    return Lyrics.create({
      ...this.props,
      isPublic: false,
      updatedAt: new Date(),
    });
  }

  // 構造分析
  extractSections(): LyricSection[] {
    const analytics = this.getAnalytics();
    return [...analytics.getSections()];
  }

  getStats(): LyricsStats {
    const analytics = this.getAnalytics();
    return analytics.getStats();
  }

  private getAnalytics(): LyricsAnalytics {
    return LyricsAnalytics.create(this.content, this.language);
  }

  // バリデーション
  validate(): LyricsValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const stats = this.getStats();

    // 文字数チェック
    if (stats.totalCharacters > 3000) {
      errors.push("歌詞が3000文字を超えています");
    }

    // 構造タグのチェック
    if (!stats.hasStructureTags) {
      warnings.push("Verse や Chorus などの構造タグの使用を推奨します");
    }

    // 言語特有のバリデーション
    if (this.language.value === "ja") {
      const complexKanjiPattern = /[一-龯]{3,}/g;
      if (complexKanjiPattern.test(this.content)) {
        warnings.push(
          "複雑な漢字の連続使用は発音の問題を引き起こす可能性があります"
        );
      }
    }

    // 行の長さチェック
    if (stats.averageLineLength > 50) {
      warnings.push(
        "行が長すぎる可能性があります。短い行に分割することを推奨します"
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // 最適化提案
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    const stats = this.getStats();
    const validation = this.validate();

    // 言語特有の提案を常に含める
    const languageSuggestions = this.language.getOptimizationSuggestions();
    suggestions.push(...languageSuggestions);

    if (
      validation.isValid &&
      validation.warnings.length === 0 &&
      suggestions.length === 0
    ) {
      return ["現在の歌詞は最適化されています"];
    }

    // 構造提案
    if (!stats.hasStructureTags) {
      suggestions.push(
        "セクション構造を明確にするため、[Verse]、[Chorus]タグの使用を推奨します"
      );
    }

    // 長さに関する提案
    if (stats.totalCharacters > 2500) {
      suggestions.push(
        "歌詞が長すぎる可能性があります。重要な部分に絞り込むことを検討してください"
      );
    }

    if (stats.averageLineLength > 50) {
      suggestions.push("行の長さを短くすることで、歌いやすさが向上します");
    }

    return suggestions.length > 0
      ? suggestions
      : ["現在の歌詞は最適化されています"];
  }

  // フォーマット・変換
  formatForSuno(): string {
    // Suno用の最適化されたフォーマット
    let formatted = this.content;

    // 不要な空行を削除
    formatted = formatted.replace(/\n\n+/g, "\n\n");

    // 先頭と末尾の空行を削除
    formatted = formatted.trim();

    // 文字数制限チェック
    if (formatted.length > 3000) {
      // 必要に応じて切り詰め（セクション境界を考慮）
      const sections = this.extractSections();
      let truncated = "";
      let currentLength = 0;

      for (const section of sections) {
        const sectionText = `[${section.type}]\n${section.content}\n\n`;
        if (currentLength + sectionText.length <= 3000) {
          truncated += sectionText;
          currentLength += sectionText.length;
        } else {
          break;
        }
      }

      formatted = truncated.trim();
    }

    return formatted;
  }

  toPlainText(): string {
    // 構造タグを除去してプレーンテキストに変換
    return this.content
      .replace(/\[.+?\]/g, "") // 構造タグを削除
      .replace(/\n\n+/g, "\n") // 余分な改行を削除
      .trim();
  }

  // 等価性
  equals(other: Lyrics): boolean {
    return this.id === other.id;
  }

  // シリアライゼーション
  toJSON(): LyricsJSON {
    return {
      id: this.props.id,
      title: this.props.title,
      content: this.props.content,
      language: this.props.language.value,
      tags: [...this.props.tags],
      description: this.props.description,
      isPublic: this.props.isPublic,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }

  static fromJSON(json: LyricsJSON): Lyrics {
    return Lyrics.create({
      id: json.id,
      title: json.title,
      content: json.content,
      language: Language.create(json.language),
      tags: json.tags,
      description: json.description,
      isPublic: json.isPublic,
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt),
    });
  }

  // ユーティリティメソッド
  getWordCount(): number {
    const analytics = this.getAnalytics();
    return analytics.getWordCount();
  }

  getDuration(): number {
    const analytics = this.getAnalytics();
    const duration = SongDuration.estimateFromLyrics(analytics, this.language);
    return duration.getSeconds();
  }
}
