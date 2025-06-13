import { z } from "zod";
import { Lyrics, type LyricsJSON } from "./Lyrics";
import { Prompt, type PromptJSON } from "./Prompt";

const SongSchema = z.object({
  id: z.string().min(1),
  title: z
    .string()
    .min(1, "タイトルは1文字以上100文字以内で入力してください")
    .max(100, "タイトルは1文字以上100文字以内で入力してください"),
  prompt: z.custom<Prompt>((data) => data instanceof Prompt, {
    message: "Promptインスタンスである必要があります",
  }),
  lyrics: z
    .custom<Lyrics>((data) => data instanceof Lyrics, {
      message: "Lyricsインスタンスである必要があります",
    })
    .nullable()
    .default(null),
  sunoUrl: z.string().url().nullable().default(null),
  tags: z.array(z.string()).default([]),
  description: z.string().default(""),
  isGenerated: z.boolean().default(false),
  isPublic: z.boolean().default(false),
  rating: z.number().min(0).max(5).nullable().default(null),
  playCount: z.number().min(0).default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SongProps = z.infer<typeof SongSchema>;

export interface SongStats {
  hasLyrics: boolean;
  hasPrompt: boolean;
  isComplete: boolean;
  languageConsistency: boolean;
  promptQualityScore: number;
  lyricsQualityScore?: number;
  estimatedDuration: number;
}

export interface SongQualityScore {
  overall: number;
  breakdown: {
    promptQuality: number;
    lyricsQuality: number;
    consistency: number;
    completeness: number;
  };
}

export interface SongValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SongJSON {
  id: string;
  title: string;
  prompt: PromptJSON;
  lyrics: LyricsJSON | null;
  sunoUrl: string | null;
  tags: string[];
  description: string;
  isGenerated: boolean;
  isPublic: boolean;
  rating: number | null;
  playCount: number;
  createdAt: string;
  updatedAt: string;
}

export class Song {
  private constructor(private readonly props: SongProps) {}

  static create(
    input: Partial<SongProps> & {
      title: string;
      prompt: Prompt;
    }
  ): Song {
    const now = new Date();
    const props: SongProps = {
      id:
        input.id ||
        `song-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: input.title,
      prompt: input.prompt,
      lyrics: input.lyrics || null,
      sunoUrl: input.sunoUrl || null,
      tags: input.tags || [],
      description: input.description || "",
      isGenerated: input.isGenerated || false,
      isPublic: input.isPublic || false,
      rating: input.rating || null,
      playCount: input.playCount || 0,
      createdAt: input.createdAt || now,
      updatedAt: input.updatedAt || now,
    };

    SongSchema.parse(props);
    return new Song(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }
  get title(): string {
    return this.props.title;
  }
  get prompt(): Prompt {
    return this.props.prompt;
  }
  get lyrics(): Lyrics | null {
    return this.props.lyrics;
  }
  get sunoUrl(): string | null {
    return this.props.sunoUrl;
  }
  get tags(): readonly string[] {
    return this.props.tags;
  }
  get description(): string {
    return this.props.description;
  }
  get isGenerated(): boolean {
    return this.props.isGenerated;
  }
  get isPublic(): boolean {
    return this.props.isPublic;
  }
  get rating(): number | null {
    return this.props.rating;
  }
  get playCount(): number {
    return this.props.playCount;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // 更新メソッド
  updateTitle(title: string): Song {
    return Song.create({
      ...this.props,
      title,
      updatedAt: new Date(),
    });
  }

  updatePrompt(prompt: Prompt): Song {
    return Song.create({
      ...this.props,
      prompt,
      updatedAt: new Date(),
    });
  }

  addLyrics(lyrics: Lyrics): Song {
    return Song.create({
      ...this.props,
      lyrics,
      updatedAt: new Date(),
    });
  }

  removeLyrics(): Song {
    return Song.create({
      ...this.props,
      lyrics: null,
      updatedAt: new Date(),
    });
  }

  updateTags(tags: string[]): Song {
    return Song.create({
      ...this.props,
      prompt: this.props.prompt,
      tags,
      updatedAt: new Date(),
    });
  }

  updateDescription(description: string): Song {
    return Song.create({
      ...this.props,
      prompt: this.props.prompt,
      description,
      updatedAt: new Date(),
    });
  }

  markAsGenerated(sunoUrl?: string): Song {
    return Song.create({
      ...this.props,
      prompt: this.props.prompt,
      isGenerated: true,
      sunoUrl: sunoUrl || this.props.sunoUrl,
      updatedAt: new Date(),
    });
  }

  markAsNotGenerated(): Song {
    return Song.create({
      ...this.props,
      prompt: this.props.prompt,
      isGenerated: false,
      sunoUrl: null,
      updatedAt: new Date(),
    });
  }

  makePublic(): Song {
    return Song.create({
      ...this.props,
      prompt: this.props.prompt,
      isPublic: true,
      updatedAt: new Date(),
    });
  }

  makePrivate(): Song {
    return Song.create({
      ...this.props,
      prompt: this.props.prompt,
      isPublic: false,
      updatedAt: new Date(),
    });
  }

  updateRating(rating: number): Song {
    return Song.create({
      ...this.props,
      prompt: this.props.prompt,
      rating: Math.max(0, Math.min(5, rating)),
      updatedAt: new Date(),
    });
  }

  incrementPlayCount(): Song {
    return Song.create({
      ...this.props,
      prompt: this.props.prompt,
      playCount: this.props.playCount + 1,
      updatedAt: new Date(),
    });
  }

  // 分析・統計
  getStats(): SongStats {
    const hasLyrics = this.props.lyrics !== null;
    const hasPrompt = this.props.prompt !== null;
    const languageConsistency =
      !hasLyrics ||
      !this.props.lyrics ||
      this.props.prompt.language.equals(this.props.lyrics.language);

    const promptQualityScore =
      this.props.prompt.calculateQualityScore().overall;
    const lyricsQualityScore = hasLyrics ? 85 : undefined; // 簡易実装

    return {
      hasLyrics,
      hasPrompt,
      isComplete: hasLyrics && hasPrompt && this.props.isGenerated,
      languageConsistency,
      promptQualityScore,
      lyricsQualityScore,
      estimatedDuration: this.getEstimatedDuration(),
    };
  }

  calculateQualityScore(): SongQualityScore {
    const stats = this.getStats();

    // プロンプト品質 (0-100)
    const promptQuality = stats.promptQualityScore;

    // 歌詞品質 (0-100)
    const lyricsQuality = stats.lyricsQualityScore || 0;

    // 一貫性 (0-100)
    let consistency = 50;
    if (stats.languageConsistency) consistency += 30;
    if (this.props.tags.length > 0) consistency += 20;

    // 完成度 (0-100)
    let completeness = 40;
    if (stats.hasLyrics) completeness += 20;
    if (this.props.isGenerated) completeness += 20;
    if (this.props.description.length > 0) completeness += 10;
    if (this.props.sunoUrl) completeness += 10;

    const overall = Math.round(
      promptQuality * 0.4 +
        lyricsQuality * 0.3 +
        consistency * 0.2 +
        completeness * 0.1
    );

    return {
      overall,
      breakdown: {
        promptQuality,
        lyricsQuality,
        consistency,
        completeness,
      },
    };
  }

  getEstimatedDuration(): number {
    if (this.props.lyrics) {
      return this.props.lyrics.getDuration();
    }

    // 歌詞がない場合の推定（プロンプトから推測）
    const styleStats = this.props.prompt.styleField.getStats();

    // 基本時間（秒）
    let baseDuration = 180; // 3分

    // ジャンルによる調整
    const genreValue = this.props.prompt.genre.value.toString().toLowerCase();
    if (genreValue.includes("ballad")) {
      baseDuration += 60; // バラードは長め
    } else if (genreValue.includes("punk") || genreValue.includes("hardcore")) {
      baseDuration -= 60; // パンクは短め
    }

    // 複雑さによる調整
    if (styleStats.elementCount > 6) {
      baseDuration += 30; // 複雑な楽曲は長め
    }

    return Math.max(60, Math.min(600, baseDuration)); // 1分-10分の範囲
  }

  // バリデーション
  validate(): SongValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const stats = this.getStats();

    // エラー（致命的な問題）
    if (!this.props.prompt) {
      errors.push("プロンプトは必須です");
    }

    // 警告（推奨事項）
    if (!stats.hasLyrics) {
      warnings.push(
        "歌詞が設定されていません。完全な楽曲にするために歌詞の追加を検討してください"
      );
    }

    if (!stats.languageConsistency) {
      warnings.push("プロンプトと歌詞の言語が異なります");
    }

    if (this.props.tags.length === 0) {
      warnings.push("タグを追加することで発見しやすくなります");
    }

    if (stats.promptQualityScore < 70) {
      warnings.push("プロンプトの品質を向上させることをお勧めします");
    }

    if (!this.props.isGenerated && stats.hasLyrics && stats.hasPrompt) {
      warnings.push("楽曲の生成準備が整いました");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // 等価性
  equals(other: Song): boolean {
    return this.id === other.id;
  }

  // シリアライゼーション
  toJSON(): SongJSON {
    return {
      id: this.props.id,
      title: this.props.title,
      prompt: this.props.prompt.toJSON(),
      lyrics: this.props.lyrics?.toJSON() || null,
      sunoUrl: this.props.sunoUrl,
      tags: [...this.props.tags],
      description: this.props.description,
      isGenerated: this.props.isGenerated,
      isPublic: this.props.isPublic,
      rating: this.props.rating,
      playCount: this.props.playCount,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }

  static fromJSON(json: SongJSON): Song {
    return Song.create({
      id: json.id,
      title: json.title,
      prompt: Prompt.fromJSON(json.prompt),
      lyrics: json.lyrics ? Lyrics.fromJSON(json.lyrics) : null,
      sunoUrl: json.sunoUrl,
      tags: json.tags,
      description: json.description,
      isGenerated: json.isGenerated,
      isPublic: json.isPublic,
      rating: json.rating,
      playCount: json.playCount,
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt),
    });
  }

  // ユーティリティメソッド
  isReadyForGeneration(): boolean {
    const stats = this.getStats();
    return stats.hasPrompt && stats.hasLyrics && !this.props.isGenerated;
  }

  getRecommendedTags(): string[] {
    const tags: string[] = [];

    // ジャンルベースのタグ
    const genreValue = this.props.prompt.genre.value;
    if (Array.isArray(genreValue)) {
      tags.push(...genreValue);
    } else {
      tags.push(genreValue);
    }

    // 言語ベースのタグ
    tags.push(this.props.prompt.language.value);

    // スタイルベースのタグ
    const structured = this.props.prompt.styleField.toStructured();
    tags.push(...structured.moods);

    // 歌詞ベースのタグ（もしある場合）
    if (this.props.lyrics) {
      tags.push(...this.props.lyrics.tags);
    }

    // 重複除去と小文字化
    return [...new Set(tags.map((tag) => tag.toLowerCase()))];
  }

  clone(): Song {
    return Song.fromJSON(this.toJSON());
  }
}
