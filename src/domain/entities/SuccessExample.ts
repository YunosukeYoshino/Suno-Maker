import type { Genre } from "../valueObjects/Genre";
import type { Language } from "../valueObjects/Language";
import type { StyleField } from "../valueObjects/StyleField";

export interface SuccessExampleProps {
  title: string;
  description: string;
  prompt: string;
  lyrics?: string;
  genre: Genre;
  language: Language;
  styleField: StyleField;
  sunoUrl: string;
  audioUrl?: string;
  rating: number; // 1-5 stars
  playCount: number;
  likeCount: number;
  tags: string[];
  metadata: {
    duration?: number; // seconds
    tempo?: number; // BPM
    key?: string; // Musical key
    mood?: string[];
    createdAt: Date;
    verifiedAt?: Date;
  };
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SuccessExampleSearchCriteria {
  genre?: Genre;
  language?: Language;
  minRating?: number;
  tags?: string[];
  minPlayCount?: number;
  mood?: string[];
  textQuery?: string;
}

export class SuccessExample {
  private readonly _id: string;
  private readonly _title: string;
  private readonly _description: string;
  private readonly _prompt: string;
  private readonly _lyrics?: string;
  private readonly _genre: Genre;
  private readonly _language: Language;
  private readonly _styleField: StyleField;
  private readonly _sunoUrl: string;
  private readonly _audioUrl?: string;
  private readonly _rating: number;
  private readonly _playCount: number;
  private readonly _likeCount: number;
  private readonly _tags: string[];
  private readonly _metadata: SuccessExampleProps["metadata"];
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  private constructor(
    props: Required<Omit<SuccessExampleProps, "lyrics" | "audioUrl">> & {
      lyrics?: string;
      audioUrl?: string;
    }
  ) {
    this._id = props.id;
    this._title = props.title;
    this._description = props.description;
    this._prompt = props.prompt;
    this._lyrics = props.lyrics;
    this._genre = props.genre;
    this._language = props.language;
    this._styleField = props.styleField;
    this._sunoUrl = props.sunoUrl;
    this._audioUrl = props.audioUrl;
    this._rating = props.rating;
    this._playCount = props.playCount;
    this._likeCount = props.likeCount;
    this._tags = [...props.tags];
    this._metadata = { ...props.metadata };
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: SuccessExampleProps): SuccessExample {
    // バリデーション
    if (!props.title || props.title.trim() === "") {
      throw new Error("タイトルは必須です");
    }

    if (!props.description || props.description.trim() === "") {
      throw new Error("説明は必須です");
    }

    if (!props.prompt || props.prompt.trim() === "") {
      throw new Error("プロンプトは必須です");
    }

    if (!props.sunoUrl || !this.isValidUrl(props.sunoUrl)) {
      throw new Error("有効なSuno URLは必須です");
    }

    if (props.rating < 1 || props.rating > 5) {
      throw new Error("評価は1-5の範囲である必要があります");
    }

    if (props.playCount < 0) {
      throw new Error("再生回数は0以上である必要があります");
    }

    if (props.likeCount < 0) {
      throw new Error("いいね数は0以上である必要があります");
    }

    const now = new Date();
    return new SuccessExample({
      id: props.id || crypto.randomUUID(),
      title: props.title.trim(),
      description: props.description.trim(),
      prompt: props.prompt.trim(),
      lyrics: props.lyrics?.trim(),
      genre: props.genre,
      language: props.language,
      styleField: props.styleField,
      sunoUrl: props.sunoUrl,
      audioUrl: props.audioUrl,
      rating: props.rating,
      playCount: props.playCount,
      likeCount: props.likeCount,
      tags: props.tags || [],
      metadata: {
        ...props.metadata,
        createdAt: props.metadata.createdAt || now,
      },
      createdAt: props.createdAt || now,
      updatedAt: props.updatedAt || now,
    });
  }

  private static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  }

  // ゲッター
  get id(): string {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get prompt(): string {
    return this._prompt;
  }

  get lyrics(): string | undefined {
    return this._lyrics;
  }

  get genre(): Genre {
    return this._genre;
  }

  get language(): Language {
    return this._language;
  }

  get styleField(): StyleField {
    return this._styleField;
  }

  get sunoUrl(): string {
    return this._sunoUrl;
  }

  get audioUrl(): string | undefined {
    return this._audioUrl;
  }

  get rating(): number {
    return this._rating;
  }

  get playCount(): number {
    return this._playCount;
  }

  get likeCount(): number {
    return this._likeCount;
  }

  get tags(): string[] {
    return [...this._tags];
  }

  get metadata(): SuccessExampleProps["metadata"] {
    return { ...this._metadata };
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // メソッド
  incrementPlayCount(): SuccessExample {
    return new SuccessExample({
      id: this._id,
      title: this._title,
      description: this._description,
      prompt: this._prompt,
      lyrics: this._lyrics,
      genre: this._genre,
      language: this._language,
      styleField: this._styleField,
      sunoUrl: this._sunoUrl,
      audioUrl: this._audioUrl,
      rating: this._rating,
      playCount: this._playCount + 1,
      likeCount: this._likeCount,
      tags: this._tags,
      metadata: this._metadata,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    });
  }

  incrementLikeCount(): SuccessExample {
    return new SuccessExample({
      id: this._id,
      title: this._title,
      description: this._description,
      prompt: this._prompt,
      lyrics: this._lyrics,
      genre: this._genre,
      language: this._language,
      styleField: this._styleField,
      sunoUrl: this._sunoUrl,
      audioUrl: this._audioUrl,
      rating: this._rating,
      playCount: this._playCount,
      likeCount: this._likeCount + 1,
      tags: this._tags,
      metadata: this._metadata,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    });
  }

  updateRating(newRating: number): SuccessExample {
    if (newRating < 1 || newRating > 5) {
      throw new Error("評価は1-5の範囲である必要があります");
    }

    return new SuccessExample({
      id: this._id,
      title: this._title,
      description: this._description,
      prompt: this._prompt,
      lyrics: this._lyrics,
      genre: this._genre,
      language: this._language,
      styleField: this._styleField,
      sunoUrl: this._sunoUrl,
      audioUrl: this._audioUrl,
      rating: newRating,
      playCount: this._playCount,
      likeCount: this._likeCount,
      tags: this._tags,
      metadata: this._metadata,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    });
  }

  matches(criteria: SuccessExampleSearchCriteria): boolean {
    if (criteria.genre && !this._genre.equals(criteria.genre)) {
      return false;
    }

    if (criteria.language && !this._language.equals(criteria.language)) {
      return false;
    }

    if (criteria.minRating !== undefined && this._rating < criteria.minRating) {
      return false;
    }

    if (
      criteria.minPlayCount !== undefined &&
      this._playCount < criteria.minPlayCount
    ) {
      return false;
    }

    if (criteria.tags && criteria.tags.length > 0) {
      const hasAllTags = criteria.tags.every((tag) =>
        this._tags.some(
          (exampleTag) => exampleTag.toLowerCase() === tag.toLowerCase()
        )
      );
      if (!hasAllTags) {
        return false;
      }
    }

    if (criteria.mood && criteria.mood.length > 0) {
      const hasMatchingMood = criteria.mood.some((mood) =>
        this._metadata.mood?.some(
          (exampleMood) => exampleMood.toLowerCase() === mood.toLowerCase()
        )
      );
      if (!hasMatchingMood) {
        return false;
      }
    }

    if (criteria.textQuery) {
      const query = criteria.textQuery.toLowerCase();
      const searchableText = [
        this._title,
        this._description,
        this._prompt,
        this._lyrics || "",
        ...this._tags,
        ...(this._metadata.mood || []),
      ]
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(query)) {
        return false;
      }
    }

    return true;
  }

  // 品質スコア計算
  calculateQualityScore(): number {
    const baseScore = this._rating * 20; // 1-5 stars to 20-100
    const popularityBonus = Math.min((this._playCount / 1000) * 10, 10); // Max 10 points
    const engagementBonus = Math.min((this._likeCount / 100) * 5, 5); // Max 5 points

    return Math.min(baseScore + popularityBonus + engagementBonus, 100);
  }

  // セマンティック検索用のベクトル生成（簡易版）
  generateSearchVector(): number[] {
    // 実際の実装では、より高度な自然言語処理ライブラリを使用
    const text = [
      this._title,
      this._description,
      this._prompt,
      this._lyrics || "",
      ...this._tags,
    ]
      .join(" ")
      .toLowerCase();

    // 簡易的なTF-IDF風のベクトル生成
    const commonWords = [
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
    ];
    const words = text
      .split(/\s+/)
      .filter((word) => word.length > 2 && !commonWords.includes(word));

    const wordFreq: Record<string, number> = {};
    words.forEach((word) => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // 単純な100次元ベクトル（実際の実装ではより高次元）
    const vector = new Array(100).fill(0);
    Object.keys(wordFreq).forEach((word, index) => {
      if (index < 100) {
        vector[index] = wordFreq[word] / words.length;
      }
    });

    return vector;
  }

  equals(other: SuccessExample): boolean {
    return this._id === other._id;
  }
}
