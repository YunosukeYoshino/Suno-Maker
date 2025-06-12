import type { IPromptRepository } from "@/domain/repositories/IPromptRepository";
import { Prompt } from "@/domain/entities/Prompt";
import { StyleField } from "@/domain/valueObjects/StyleField";
import { Genre } from "@/domain/valueObjects/Genre";
import { Language } from "@/domain/valueObjects/Language";

export interface OptimizePromptInput {
  prompt: Prompt;
  targetLength?: number; // デフォルト120文字
  optimizationMode: "suno" | "general" | "creative";
  preserveGenres: boolean;
  preserveLanguage: boolean;
  customPriorities?: {
    genres: number; // 1-10
    instruments: number; // 1-10
    mood: number; // 1-10
    technical: number; // 1-10
  };
}

export interface OptimizePromptOutput {
  optimizedPrompt: Prompt;
  originalLength: number;
  optimizedLength: number;
  compressionRatio: number;
  optimizations: Array<{
    type: "removed" | "shortened" | "reordered" | "merged";
    description: string;
    originalText?: string;
    optimizedText?: string;
  }>;
  warnings: string[];
  qualityScore: number;
  suggestions: string[];
}

export interface StyleFieldOptimizer {
  optimizeForLength(
    styleField: StyleField,
    targetLength: number,
    priorities: Record<string, number>
  ): Promise<{
    optimizedField: StyleField;
    changes: Array<{
      type: string;
      description: string;
      impact: number;
    }>;
  }>;
}

export interface GenreConflictDetector {
  detectConflicts(genres: string[]): Promise<{
    conflicts: Array<{
      genre1: string;
      genre2: string;
      severity: "high" | "medium" | "low";
      reason: string;
      suggestion: string;
    }>;
  }>;
}

export interface SuccessRatePredictor {
  predictSuccessRate(prompt: Prompt): Promise<{
    overallScore: number;
    factors: {
      genreCompatibility: number;
      styleCohesion: number;
      lengthOptimality: number;
      technicalCorrectness: number;
    };
    improvements: string[];
  }>;
}

export class OptimizePromptUseCase {
  constructor(
    private promptRepository: IPromptRepository,
    private styleFieldOptimizer?: StyleFieldOptimizer,
    private genreConflictDetector?: GenreConflictDetector,
    private successRatePredictor?: SuccessRatePredictor
  ) {}

  async execute(input: OptimizePromptInput): Promise<OptimizePromptOutput> {
    // 入力バリデーション
    this.validateInput(input);

    const originalPrompt = input.prompt;
    const targetLength = input.targetLength || 120;

    let optimizations: OptimizePromptOutput["optimizations"] = [];
    let warnings: string[] = [];
    let suggestions: string[] = [];

    // 1. 現在のスタイルフィールド分析
    const originalStyleField = originalPrompt.styleField;
    const originalLength = originalStyleField.value.length;

    // 2. ジャンル競合検出
    const genreConflicts = await this.detectGenreConflicts(
      originalPrompt.genre.value
    );
    if (genreConflicts.length > 0) {
      warnings.push(
        ...genreConflicts.map(
          (c) => `ジャンル競合: ${c.genre1} と ${c.genre2} (${c.reason})`
        )
      );
      suggestions.push(...genreConflicts.map((c) => c.suggestion));
    }

    // 3. スタイルフィールド最適化
    const priorities = {
      genres: 10,
      instruments: 8,
      mood: 7,
      technical: 6,
      ...input.customPriorities,
    };

    const optimizedStyleResult = await this.optimizeStyleField(
      originalStyleField,
      targetLength,
      priorities,
      input.optimizationMode
    );

    optimizations.push(...optimizedStyleResult.optimizations);

    // 4. メタタグ構造検証
    const metaTagValidation = this.validateMetaTagStructure(originalPrompt);
    warnings.push(...metaTagValidation.warnings);
    suggestions.push(...metaTagValidation.suggestions);

    // 5. 最適化されたプロンプト作成
    const optimizedPrompt = Prompt.create(
      originalPrompt.title + "_optimized",
      originalPrompt.genre,
      originalPrompt.language,
      optimizedStyleResult.styleField,
      originalPrompt.isPublic
    );

    // 6. 成功率予測
    const successPrediction = await this.predictSuccessRate(optimizedPrompt);
    suggestions.push(...successPrediction.improvements);

    // 7. 品質スコア計算
    const qualityScore = this.calculateOptimizationQuality(
      originalPrompt,
      optimizedPrompt,
      optimizations,
      warnings,
      successPrediction
    );

    // 8. リポジトリに保存
    await this.promptRepository.save(optimizedPrompt);

    const optimizedLength = optimizedPrompt.styleField.value.length;

    return {
      optimizedPrompt,
      originalLength,
      optimizedLength,
      compressionRatio:
        originalLength > 0 ? optimizedLength / originalLength : 1,
      optimizations,
      warnings,
      qualityScore,
      suggestions,
    };
  }

  private validateInput(input: OptimizePromptInput): void {
    if (!input.prompt) {
      throw new Error("プロンプトが指定されていません");
    }

    if (
      input.targetLength &&
      (input.targetLength < 20 || input.targetLength > 500)
    ) {
      throw new Error("目標文字数は20〜500文字の範囲で指定してください");
    }

    if (!["suno", "general", "creative"].includes(input.optimizationMode)) {
      throw new Error("無効な最適化モードです");
    }
  }

  private async detectGenreConflicts(genres: string[]): Promise<
    Array<{
      genre1: string;
      genre2: string;
      severity: "high" | "medium" | "low";
      reason: string;
      suggestion: string;
    }>
  > {
    if (this.genreConflictDetector) {
      const result = await this.genreConflictDetector.detectConflicts(genres);
      return result.conflicts;
    }

    // 基本的な競合検出
    const conflicts: any[] = [];
    const conflictPairs: Record<
      string,
      { conflictsWith: string[]; reason: string; suggestion: string }
    > = {
      Classical: {
        conflictsWith: ["Death Metal", "Hardcore", "Trap", "Dubstep"],
        reason: "クラシックと現代的な重いジャンルは音楽的に相反する",
        suggestion:
          "クラシカル・クロスオーバーや交響曲メタルを検討してください",
      },
      "Death Metal": {
        conflictsWith: ["Ambient", "Lullaby", "Easy Listening"],
        reason: "アグレッシブなジャンルと穏やかなジャンルは両立が困難",
        suggestion:
          "ダーク・アンビエントやプログレッシブ・メタルを検討してください",
      },
      Country: {
        conflictsWith: ["Techno", "Dubstep", "Hardcore Techno"],
        reason: "伝統的なカントリーと電子音楽は音楽的特徴が大きく異なる",
        suggestion:
          "エレクトロニック・カントリーやカントリー・ポップを検討してください",
      },
      Opera: {
        conflictsWith: ["Punk", "Grunge", "Noise"],
        reason: "オペラの形式美とパンクの反体制性は相反する",
        suggestion:
          "オペラティック・メタルやシアトリカル・ロックを検討してください",
      },
    };

    for (let i = 0; i < genres.length; i++) {
      for (let j = i + 1; j < genres.length; j++) {
        const genre1 = genres[i];
        const genre2 = genres[j];

        const config1 = conflictPairs[genre1];
        const config2 = conflictPairs[genre2];

        if (config1?.conflictsWith.includes(genre2)) {
          conflicts.push({
            genre1,
            genre2,
            severity: "high" as const,
            reason: config1.reason,
            suggestion: config1.suggestion,
          });
        } else if (config2?.conflictsWith.includes(genre1)) {
          conflicts.push({
            genre1: genre2,
            genre2: genre1,
            severity: "high" as const,
            reason: config2.reason,
            suggestion: config2.suggestion,
          });
        }
      }
    }

    return conflicts;
  }

  private async optimizeStyleField(
    styleField: StyleField,
    targetLength: number,
    priorities: Record<string, number>,
    mode: "suno" | "general" | "creative"
  ): Promise<{
    styleField: StyleField;
    optimizations: OptimizePromptOutput["optimizations"];
  }> {
    const optimizations: OptimizePromptOutput["optimizations"] = [];

    if (this.styleFieldOptimizer) {
      const result = await this.styleFieldOptimizer.optimizeForLength(
        styleField,
        targetLength,
        priorities
      );

      const optimizationChanges = result.changes.map((change) => ({
        type: change.type as any,
        description: change.description,
        originalText: styleField.value,
        optimizedText: result.optimizedField.value,
      }));

      return {
        styleField: result.optimizedField,
        optimizations: optimizationChanges,
      };
    }

    // 基本的なスタイルフィールド最適化
    let optimizedValue = styleField.value;
    const originalValue = optimizedValue;

    if (optimizedValue.length <= targetLength) {
      return { styleField, optimizations };
    }

    // 1. 重複する単語の除去
    const words = optimizedValue.split(/[,\s]+/).filter((w) => w.length > 0);
    const uniqueWords = [...new Set(words)];

    if (uniqueWords.length < words.length) {
      optimizedValue = uniqueWords.join(", ");
      optimizations.push({
        type: "merged",
        description: `重複する単語を除去（${words.length - uniqueWords.length}個）`,
        originalText: originalValue,
        optimizedText: optimizedValue,
      });
    }

    // 2. 冗長な修飾語の除去
    const redundantTerms = [
      "very",
      "really",
      "extremely",
      "highly",
      "super",
      "amazing",
      "incredible",
      "fantastic",
      "awesome",
      "beautiful",
      "wonderful",
      "perfect",
    ];

    let shortenedValue = optimizedValue;
    redundantTerms.forEach((term) => {
      const regex = new RegExp(`\\b${term}\\s+`, "gi");
      if (regex.test(shortenedValue)) {
        shortenedValue = shortenedValue.replace(regex, "");
        optimizations.push({
          type: "removed",
          description: `冗長な修飾語 "${term}" を除去`,
          originalText: optimizedValue,
          optimizedText: shortenedValue,
        });
        optimizedValue = shortenedValue;
      }
    });

    // 3. 同義語の短縮
    const synonymReplacements: Record<string, string> = {
      electronic: "electro",
      energetic: "energy",
      beautiful: "pretty",
      powerful: "strong",
      melodic: "melody",
      rhythmic: "rhythm",
      emotional: "feel",
      atmospheric: "ambient",
      aggressive: "hard",
      peaceful: "calm",
    };

    Object.entries(synonymReplacements).forEach(([long, short]) => {
      const regex = new RegExp(`\\b${long}\\b`, "gi");
      if (regex.test(optimizedValue) && optimizedValue.length > targetLength) {
        const newValue = optimizedValue.replace(regex, short);
        if (newValue.length < optimizedValue.length) {
          optimizations.push({
            type: "shortened",
            description: `"${long}" を "${short}" に短縮`,
            originalText: optimizedValue,
            optimizedText: newValue,
          });
          optimizedValue = newValue;
        }
      }
    });

    // 4. 最終的な切り詰め（必要な場合のみ）
    if (optimizedValue.length > targetLength) {
      const truncatedValue =
        optimizedValue.substring(0, targetLength - 3) + "...";
      optimizations.push({
        type: "removed",
        description: `文字数制限のため末尾を切り詰め（${optimizedValue.length - targetLength + 3}文字削除）`,
        originalText: optimizedValue,
        optimizedText: truncatedValue,
      });
      optimizedValue = truncatedValue;
    }

    const optimizedStyleField = StyleField.create(optimizedValue);

    return {
      styleField: optimizedStyleField,
      optimizations,
    };
  }

  private validateMetaTagStructure(prompt: Prompt): {
    warnings: string[];
    suggestions: string[];
  } {
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // ジャンル数チェック
    const genreCount = prompt.genre.value.length;
    if (genreCount > 3) {
      warnings.push(`ジャンル数が多すぎます（${genreCount}個）`);
      suggestions.push("ジャンルは1-3個に絞ることを推奨します");
    }

    // スタイルフィールドの要素数チェック
    const styleElements = prompt.styleField.value.split(",").length;
    if (styleElements > 15) {
      warnings.push(`スタイル要素が多すぎます（${styleElements}個）`);
      suggestions.push("スタイル要素は10-15個に絞ることを推奨します");
    }

    // Suno固有のチェック
    const styleValue = prompt.styleField.value.toLowerCase();
    const sunoProblematicTerms = [
      "copyright",
      "copyrighted",
      "trademarked",
      "artist name",
      "band name",
      "song title",
    ];

    sunoProblematicTerms.forEach((term) => {
      if (styleValue.includes(term)) {
        warnings.push(`著作権に関わる可能性のある用語: "${term}"`);
        suggestions.push(
          "具体的なアーティスト名や楽曲名の使用は避けてください"
        );
      }
    });

    return { warnings, suggestions };
  }

  private async predictSuccessRate(prompt: Prompt): Promise<{
    overallScore: number;
    factors: {
      genreCompatibility: number;
      styleCohesion: number;
      lengthOptimality: number;
      technicalCorrectness: number;
    };
    improvements: string[];
  }> {
    if (this.successRatePredictor) {
      return await this.successRatePredictor.predictSuccessRate(prompt);
    }

    // 基本的な成功率予測
    const factors = {
      genreCompatibility: this.calculateGenreCompatibility(prompt.genre.value),
      styleCohesion: this.calculateStyleCohesion(prompt.styleField.value),
      lengthOptimality: this.calculateLengthOptimality(
        prompt.styleField.value.length
      ),
      technicalCorrectness: this.calculateTechnicalCorrectness(prompt),
    };

    const overallScore =
      Object.values(factors).reduce((sum, score) => sum + score, 0) / 4;

    const improvements: string[] = [];
    if (factors.genreCompatibility < 70) {
      improvements.push("ジャンルの組み合わせを見直してください");
    }
    if (factors.styleCohesion < 70) {
      improvements.push("スタイル要素の一貫性を高めてください");
    }
    if (factors.lengthOptimality < 80) {
      improvements.push("スタイルフィールドの長さを調整してください");
    }
    if (factors.technicalCorrectness < 80) {
      improvements.push("技術的な表記を確認してください");
    }

    return { overallScore, factors, improvements };
  }

  private calculateGenreCompatibility(genres: string[]): number {
    if (genres.length === 1) return 100;
    if (genres.length <= 3) return 85;
    if (genres.length <= 5) return 65;
    return 40;
  }

  private calculateStyleCohesion(styleValue: string): number {
    const elements = styleValue.split(",").map((e) => e.trim().toLowerCase());
    const totalElements = elements.length;

    if (totalElements === 0) return 0;

    // 関連性のあるグループ
    const cohesionGroups = [
      ["rock", "guitar", "drums", "bass", "electric"],
      ["electronic", "synth", "digital", "techno", "edm"],
      ["classical", "orchestra", "piano", "violin", "symphony"],
      ["jazz", "saxophone", "improvisation", "swing", "blues"],
      ["acoustic", "folk", "organic", "natural", "unplugged"],
    ];

    let cohesionScore = 0;
    for (const group of cohesionGroups) {
      const matchingElements = elements.filter((element) =>
        group.some((keyword) => element.includes(keyword))
      );
      if (matchingElements.length > 1) {
        cohesionScore += matchingElements.length / totalElements;
      }
    }

    return Math.min(100, cohesionScore * 100);
  }

  private calculateLengthOptimality(length: number): number {
    if (length >= 80 && length <= 120) return 100;
    if (length >= 60 && length <= 140) return 85;
    if (length >= 40 && length <= 160) return 70;
    if (length >= 20 && length <= 200) return 55;
    return 30;
  }

  private calculateTechnicalCorrectness(prompt: Prompt): number {
    let score = 100;
    const styleValue = prompt.styleField.value;

    // 基本的な技術チェック
    if (styleValue.includes("  ")) score -= 5; // 重複スペース
    if (styleValue.startsWith(",") || styleValue.endsWith(",")) score -= 10; // 不適切なカンマ
    if (styleValue.includes(",,")) score -= 10; // 重複カンマ
    if (!/^[a-zA-Z0-9\s,.-]+$/.test(styleValue)) score -= 15; // 特殊文字

    // 大文字小文字の一貫性
    const words = styleValue.split(/[,\s]+/);
    const inconsistentCase = words.filter((word) => {
      return (
        word.length > 1 &&
        word !== word.toLowerCase() &&
        word !== word.toUpperCase()
      );
    });
    score -= inconsistentCase.length * 5;

    return Math.max(0, score);
  }

  private calculateOptimizationQuality(
    originalPrompt: Prompt,
    optimizedPrompt: Prompt,
    optimizations: OptimizePromptOutput["optimizations"],
    warnings: string[],
    successPrediction: any
  ): number {
    let score = 100;

    // 最適化の効果性（40点満点）
    const lengthReduction =
      originalPrompt.styleField.value.length -
      optimizedPrompt.styleField.value.length;
    const reductionRatio =
      lengthReduction / originalPrompt.styleField.value.length;

    if (reductionRatio > 0.1) score += 20; // 10%以上の短縮
    if (reductionRatio > 0.2) score += 10; // 20%以上の短縮
    if (optimizations.length > 0) score += 10; // 最適化実行

    // 成功率予測スコア（30点満点）
    score += (successPrediction.overallScore / 100) * 30;

    // 警告の影響（-30点まで）
    score -= Math.min(warnings.length * 5, 30);

    // 下限設定
    score = Math.max(0, score);

    return Math.round(score);
  }
}
