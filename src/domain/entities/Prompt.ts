import { z } from "zod";
import { generateUUID } from "~/utils/generateUUID";
import { Genre } from "../valueObjects/Genre";
import { Language } from "../valueObjects/Language";
import { PromptQualityScore } from "../valueObjects/PromptQualityScore";
import { StyleField } from "../valueObjects/StyleField";

const PromptSchema = z.object({
  id: z.string().min(1),
  title: z
    .string()
    .min(1, "タイトルは1文字以上100文字以内で入力してください")
    .max(100, "タイトルは1文字以上100文字以内で入力してください"),
  genre: z.custom<Genre>((data) => data instanceof Genre, {
    message: "Genreインスタンスである必要があります",
  }),
  language: z.custom<Language>((data) => data instanceof Language, {
    message: "Languageインスタンスである必要があります",
  }),
  styleField: z.custom<StyleField>((data) => data instanceof StyleField, {
    message: "StyleFieldインスタンスである必要があります",
  }),
  tags: z.array(z.string()).default([]),
  description: z.string().default(""),
  isPublic: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
  generatedCount: z.number().default(0),
  successfulGenerations: z.number().default(0),
  totalRating: z.number().default(0),
  ratingCount: z.number().default(0),
});

export type PromptProps = z.infer<typeof PromptSchema>;

export interface PromptString {
  style: string;
  language: string;
  fullPrompt: string;
  characterCount: number;
}

export interface OptimizedPrompt {
  styleField: string;
  optimizationApplied: string[];
  languageOptimizations: string[];
  qualityScore: number;
}

export type ValidationError =
  | { type: "STYLE_FIELD_TOO_LONG"; maxLength: number; currentLength: number }
  | { type: "TITLE_TOO_SHORT"; minLength: number; currentLength: number }
  | { type: "TITLE_TOO_LONG"; maxLength: number; currentLength: number }
  | {
      type: "INVALID_GENRE_LANGUAGE_COMBINATION";
      genre: string;
      language: string;
    };

export type ValidationWarning =
  | {
      type: "TITLE_TOO_SHORT_FOR_QUALITY";
      recommended: number;
      current: number;
    }
  | { type: "GENRE_LANGUAGE_MISMATCH"; suggestion: string }
  | { type: "STYLE_FIELD_COMPLEXITY_HIGH"; score: number };

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface QualityScore {
  overall: number;
  breakdown: {
    genreClarity: number;
    styleOptimization: number;
    languageOptimization: number;
    completeness: number;
  };
}

export interface UsageStats {
  generatedCount: number;
  successfulGenerations: number;
  averageRating: number;
  successRate: number;
}

export interface PromptJSON {
  id: string;
  title: string;
  genre: string;
  language: string;
  styleField: string;
  tags: string[];
  description: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  generatedCount: number;
  successfulGenerations: number;
  totalRating: number;
  ratingCount: number;
}

export class Prompt {
  private constructor(private readonly props: PromptProps) {
    Object.freeze(this);
    Object.freeze(props);
  }

  static create(
    input: Partial<PromptProps> & {
      genre: Genre;
      language: Language;
      styleField: StyleField;
      title: string;
    }
  ): Prompt {
    const now = new Date();
    const props: PromptProps = {
      id: input.id || generateUUID(),
      title: input.title,
      genre: input.genre,
      language: input.language,
      styleField: input.styleField,
      tags: input.tags || [],
      description: input.description || "",
      isPublic: input.isPublic || false,
      createdAt: input.createdAt || now,
      updatedAt: input.updatedAt || now,
      generatedCount: input.generatedCount || 0,
      successfulGenerations: input.successfulGenerations || 0,
      totalRating: input.totalRating || 0,
      ratingCount: input.ratingCount || 0,
    };

    PromptSchema.parse(props);
    return new Prompt(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }
  get title(): string {
    return this.props.title;
  }
  get genre(): Genre {
    return this.props.genre;
  }
  get language(): Language {
    return this.props.language;
  }
  get styleField(): StyleField {
    return this.props.styleField;
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
  updateTitle(title: string): Prompt {
    return Prompt.create({
      ...this.props,
      title,
      updatedAt: new Date(),
    });
  }

  updateGenre(genre: Genre): Prompt {
    return Prompt.create({
      ...this.props,
      genre,
      updatedAt: new Date(),
    });
  }

  updateStyleField(styleField: StyleField): Prompt {
    return Prompt.create({
      ...this.props,
      styleField,
      updatedAt: new Date(),
    });
  }

  updateLanguage(language: Language): Prompt {
    return Prompt.create({
      ...this.props,
      language,
      updatedAt: new Date(),
    });
  }

  updateTags(tags: string[]): Prompt {
    return Prompt.create({
      ...this.props,
      tags,
      updatedAt: new Date(),
    });
  }

  updateDescription(description: string): Prompt {
    return Prompt.create({
      ...this.props,
      description,
      updatedAt: new Date(),
    });
  }

  makePublic(): Prompt {
    return Prompt.create({
      ...this.props,
      isPublic: true,
      updatedAt: new Date(),
    });
  }

  makePrivate(): Prompt {
    return Prompt.create({
      ...this.props,
      isPublic: false,
      updatedAt: new Date(),
    });
  }

  // プロンプト生成
  generatePromptString(): PromptString {
    const style = this.styleField.value;
    const language = this.language.value;
    const fullPrompt = `${style} [Language: ${language}]`;

    return {
      style,
      language,
      fullPrompt,
      characterCount: fullPrompt.length,
    };
  }

  generateOptimizedPrompt(): OptimizedPrompt {
    const optimizations: string[] = [];
    const languageOptimizations = this.language.getOptimizationSuggestions();

    // スタイルフィールドの最適化
    const optimizedStyle = this.styleField.optimize();
    if (optimizedStyle !== this.styleField.value) {
      optimizations.push("文字数制限に合わせて最適化");
    }

    // 言語特有の最適化
    if (this.language.value === "ja") {
      optimizations.push("日本語用音声最適化適用");
    }

    if (!this.language.isHighQuality()) {
      optimizations.push("低品質言語の補正適用");
    }

    const qualityScore = this.calculateQualityScore().overall;

    return {
      styleField: optimizedStyle,
      optimizationApplied: optimizations,
      languageOptimizations: [...languageOptimizations],
      qualityScore,
    };
  }

  // 検証
  validate(): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // スタイルフィールドの検証
    const styleStats = this.styleField.getStats();
    if (styleStats.length > 120) {
      errors.push({
        type: "STYLE_FIELD_TOO_LONG",
        maxLength: 120,
        currentLength: styleStats.length,
      });
    }

    // タイトルの検証
    if (this.title.length < 1) {
      errors.push({
        type: "TITLE_TOO_SHORT",
        minLength: 1,
        currentLength: this.title.length,
      });
    } else if (this.title.length > 100) {
      errors.push({
        type: "TITLE_TOO_LONG",
        maxLength: 100,
        currentLength: this.title.length,
      });
    }

    // ジャンルと言語の組み合わせ検証
    if (
      this.language.value === "ja" &&
      !this.genre.value.toString().includes("J-")
    ) {
      warnings.push({
        type: "GENRE_LANGUAGE_MISMATCH",
        suggestion: "日本語歌詞にはJ-PopやJ-Rockジャンルの使用を推奨します",
      });
    }

    // タイトルの品質検証
    if (this.title.length < 5) {
      warnings.push({
        type: "TITLE_TOO_SHORT_FOR_QUALITY",
        recommended: 5,
        current: this.title.length,
      });
    }

    // スタイルフィールドの複雑度チェック（要素数ベース）
    if (styleStats.elementCount > 8) {
      warnings.push({
        type: "STYLE_FIELD_COMPLEXITY_HIGH",
        score: styleStats.elementCount,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  calculateQualityScore(): QualityScore {
    const qualityScore = PromptQualityScore.create(
      this.genre,
      this.styleField,
      this.language,
      this.title,
      this.description,
      this.tags
    );

    return qualityScore.toQualityScore();
  }

  // 使用統計
  getUsageStats(): UsageStats {
    const successRate =
      this.props.generatedCount > 0
        ? (this.props.successfulGenerations / this.props.generatedCount) * 100
        : 0;

    const averageRating =
      this.props.ratingCount > 0
        ? this.props.totalRating / this.props.ratingCount
        : 0;

    return {
      generatedCount: this.props.generatedCount,
      successfulGenerations: this.props.successfulGenerations,
      averageRating: Math.round(averageRating * 10) / 10,
      successRate: Math.round(successRate * 10) / 10,
    };
  }

  recordGeneration(successful: boolean, rating?: number): Prompt {
    const newProps = {
      ...this.props,
      generatedCount: this.props.generatedCount + 1,
      successfulGenerations:
        this.props.successfulGenerations + (successful ? 1 : 0),
      updatedAt: new Date(),
    };

    if (rating !== undefined) {
      newProps.totalRating = this.props.totalRating + rating;
      newProps.ratingCount = this.props.ratingCount + 1;
    }

    return Prompt.create(newProps);
  }

  // 等価性
  equals(other: Prompt): boolean {
    return this.id === other.id;
  }

  // シリアライゼーション
  toJSON(): PromptJSON {
    return {
      id: this.props.id,
      title: this.props.title,
      genre: Array.isArray(this.props.genre.value)
        ? this.props.genre.value.join(", ")
        : this.props.genre.value,
      language: this.props.language.value,
      styleField: this.props.styleField.value,
      tags: [...this.props.tags],
      description: this.props.description,
      isPublic: this.props.isPublic,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
      generatedCount: this.props.generatedCount,
      successfulGenerations: this.props.successfulGenerations,
      totalRating: this.props.totalRating,
      ratingCount: this.props.ratingCount,
    };
  }

  static fromJSON(json: PromptJSON): Prompt {
    return Prompt.create({
      id: json.id,
      title: json.title,
      genre: Genre.create(
        (json.genre.includes(",")
          ? json.genre.split(", ")
          : json.genre) as Parameters<typeof Genre.create>[0]
      ),
      language: Language.create(
        json.language as Parameters<typeof Language.create>[0]
      ),
      styleField: StyleField.create(json.styleField),
      tags: json.tags,
      description: json.description,
      isPublic: json.isPublic,
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt),
      generatedCount: json.generatedCount,
      successfulGenerations: json.successfulGenerations,
      totalRating: json.totalRating,
      ratingCount: json.ratingCount,
    });
  }
}
