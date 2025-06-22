import type { Genre } from "../valueObjects/Genre";
import type { Language } from "../valueObjects/Language";
import type { StyleField } from "../valueObjects/StyleField";
import { Prompt } from "./Prompt";

export type TemplateCategory =
  | "genre-specific"
  | "language-specific"
  | "mood-specific"
  | "custom";

export interface TemplateProps {
  name: string;
  description: string;
  genre: Genre;
  language: Language;
  styleField: StyleField;
  lyricsStructure: string;
  tags: string[];
  category: TemplateCategory;
  qualityScore: number;
  usageCount: number;
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TemplateMatchCriteria {
  genre?: Genre;
  language?: Language;
  category?: TemplateCategory;
  tags?: string[];
  minQualityScore?: number;
}

export class Template {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _description: string;
  private readonly _genre: Genre;
  private readonly _language: Language;
  private readonly _styleField: StyleField;
  private readonly _lyricsStructure: string;
  private readonly _tags: string[];
  private readonly _category: TemplateCategory;
  private readonly _qualityScore: number;
  private readonly _usageCount: number;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  private constructor(props: Required<TemplateProps>) {
    this._id = props.id;
    this._name = props.name;
    this._description = props.description;
    this._genre = props.genre;
    this._language = props.language;
    this._styleField = props.styleField;
    this._lyricsStructure = props.lyricsStructure;
    this._tags = [...props.tags];
    this._category = props.category;
    this._qualityScore = props.qualityScore;
    this._usageCount = props.usageCount;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;

    Object.freeze(this);
    Object.freeze(this._tags);
  }

  static create(props: TemplateProps): Template {
    // バリデーション
    if (!props.name || props.name.trim() === "") {
      throw new Error("テンプレート名は必須です");
    }

    if (!props.description || props.description.trim() === "") {
      throw new Error("テンプレート説明は必須です");
    }

    if (props.qualityScore < 0 || props.qualityScore > 100) {
      throw new Error("品質スコアは0-100の範囲である必要があります");
    }

    if (props.usageCount < 0) {
      throw new Error("使用回数は0以上である必要があります");
    }

    const validCategories: TemplateCategory[] = [
      "genre-specific",
      "language-specific",
      "mood-specific",
      "custom",
    ];
    if (!validCategories.includes(props.category)) {
      throw new Error("無効なカテゴリです");
    }

    const now = new Date();
    return new Template({
      id: props.id || crypto.randomUUID(),
      name: props.name.trim(),
      description: props.description.trim(),
      genre: props.genre,
      language: props.language,
      styleField: props.styleField,
      lyricsStructure: props.lyricsStructure,
      tags: props.tags || [],
      category: props.category,
      qualityScore: props.qualityScore,
      usageCount: props.usageCount,
      createdAt: props.createdAt || now,
      updatedAt: props.updatedAt || now,
    });
  }

  // ゲッター
  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
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

  get lyricsStructure(): string {
    return this._lyricsStructure;
  }

  get tags(): string[] {
    return [...this._tags];
  }

  get category(): TemplateCategory {
    return this._category;
  }

  get qualityScore(): number {
    return this._qualityScore;
  }

  get usageCount(): number {
    return this._usageCount;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // メソッド
  incrementUsage(): Template {
    return new Template({
      id: this._id,
      name: this._name,
      description: this._description,
      genre: this._genre,
      language: this._language,
      styleField: this._styleField,
      lyricsStructure: this._lyricsStructure,
      tags: this._tags,
      category: this._category,
      qualityScore: this._qualityScore,
      usageCount: this._usageCount + 1,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    });
  }

  updateQualityScore(newScore: number): Template {
    if (newScore < 0 || newScore > 100) {
      throw new Error("品質スコアは0-100の範囲である必要があります");
    }

    return new Template({
      id: this._id,
      name: this._name,
      description: this._description,
      genre: this._genre,
      language: this._language,
      styleField: this._styleField,
      lyricsStructure: this._lyricsStructure,
      tags: this._tags,
      category: this._category,
      qualityScore: newScore,
      usageCount: this._usageCount,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    });
  }

  matches(criteria: TemplateMatchCriteria): boolean {
    if (criteria.genre && !this._genre.equals(criteria.genre)) {
      return false;
    }

    if (criteria.language && !this._language.equals(criteria.language)) {
      return false;
    }

    if (criteria.category && this._category !== criteria.category) {
      return false;
    }

    if (criteria.tags && criteria.tags.length > 0) {
      const hasAllTags = criteria.tags.every((tag) =>
        this._tags.some(
          (templateTag) => templateTag.toLowerCase() === tag.toLowerCase()
        )
      );
      if (!hasAllTags) {
        return false;
      }
    }

    if (
      criteria.minQualityScore !== undefined &&
      this._qualityScore < criteria.minQualityScore
    ) {
      return false;
    }

    return true;
  }

  toPrompt(): Prompt {
    return Prompt.create({
      title: `Generated from ${this._name}`,
      genre: this._genre,
      language: this._language,
      styleField: this._styleField,
      description: this._description,
      tags: this._tags,
    });
  }

  equals(other: Template): boolean {
    return this._id === other._id;
  }
}
