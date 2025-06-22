import type { Genre } from "./Genre";
import type { Language } from "./Language";
import type { StyleField } from "./StyleField";

export interface QualityScoreBreakdown {
  genreClarity: number;
  styleOptimization: number;
  languageOptimization: number;
  completeness: number;
}

export interface QualityScore {
  overall: number;
  breakdown: QualityScoreBreakdown;
}

export class PromptQualityScore {
  private constructor(
    private readonly genreClarity: number,
    private readonly styleOptimization: number,
    private readonly languageOptimization: number,
    private readonly completeness: number
  ) {
    Object.freeze(this);
  }

  // Standardized factory method
  static create(
    genre: Genre,
    styleField: StyleField,
    language: Language,
    title: string,
    description: string,
    tags: readonly string[]
  ): PromptQualityScore {
    return PromptQualityScore.calculate(
      genre,
      styleField,
      language,
      title,
      description,
      tags
    );
  }

  static calculate(
    genre: Genre,
    styleField: StyleField,
    language: Language,
    title: string,
    description: string,
    tags: readonly string[]
  ): PromptQualityScore {
    // ジャンル明確度 (0-100)
    const genreClarity = genre.value ? 100 : 0;

    // スタイル最適化度 (0-100)
    const styleStats = styleField.getStats();
    let styleOptimization = 50;
    if (styleStats.elementCount >= 2 && styleStats.elementCount <= 6) {
      styleOptimization += 30;
    }
    if (styleStats.length <= 120) {
      styleOptimization += 20;
    }
    styleOptimization = Math.min(100, styleOptimization);

    // 言語最適化度 (0-100)
    const languageOptimization = language.isHighQuality() ? 100 : 60;

    // 完成度 (0-100)
    let completeness = 40;
    if (description.length > 0) completeness += 20;
    if (tags.length > 0) completeness += 20;
    if (title.length >= 5) completeness += 20;

    return new PromptQualityScore(
      genreClarity,
      styleOptimization,
      languageOptimization,
      completeness
    );
  }

  getOverallScore(): number {
    return Math.round(
      this.genreClarity * 0.3 +
        this.styleOptimization * 0.4 +
        this.languageOptimization * 0.2 +
        this.completeness * 0.1
    );
  }

  getBreakdown(): QualityScoreBreakdown {
    return {
      genreClarity: this.genreClarity,
      styleOptimization: this.styleOptimization,
      languageOptimization: this.languageOptimization,
      completeness: this.completeness,
    };
  }

  toQualityScore(): QualityScore {
    return {
      overall: this.getOverallScore(),
      breakdown: this.getBreakdown(),
    };
  }

  equals(other: PromptQualityScore): boolean {
    return (
      this.genreClarity === other.genreClarity &&
      this.styleOptimization === other.styleOptimization &&
      this.languageOptimization === other.languageOptimization &&
      this.completeness === other.completeness
    );
  }
}
