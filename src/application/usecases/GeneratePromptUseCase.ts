import { Prompt } from "@/domain/entities/Prompt";
import type { IPromptRepository } from "@/domain/repositories/IPromptRepository";
import { Genre } from "@/domain/valueObjects/Genre";
import { Language } from "@/domain/valueObjects/Language";
import { StyleField } from "@/domain/valueObjects/StyleField";
import type { MusicParameters } from "@/presentation/components/ParameterSliders";

export interface GeneratePromptInput {
  genres: string[]; // Will be validated at runtime by Genre.create
  language: string; // Will be validated at runtime by Language.create
  mood?: string[];
  instruments?: string[];
  parameters?: Partial<MusicParameters>;
  customStyle?: string;
}

export interface GeneratePromptOutput {
  prompt: Prompt;
  qualityScore: number;
  optimizations: string[];
  warnings?: string[];
}

export class GeneratePromptUseCase {
  constructor(
    private readonly promptRepository: IPromptRepository,
    private readonly optimizationService?: PromptOptimizationService
  ) {}

  async execute(input: GeneratePromptInput): Promise<GeneratePromptOutput> {
    // 1. 入力バリデーション
    this.validateInput(input);

    // 2. ドメインオブジェクトの作成
    const genre = Genre.create(
      input.genres as Parameters<typeof Genre.create>[0]
    );
    const language = Language.create(
      input.language as Parameters<typeof Language.create>[0]
    );

    // 3. スタイルフィールドの生成
    const styleField = this.generateStyleField(input);

    // 4. プロンプトエンティティの作成
    const prompt = Prompt.create({
      title: this.generateTitle(input),
      genre,
      language,
      styleField,
      createdAt: new Date(),
    });

    // 5. 最適化処理
    const optimizationResult = await this.optimizePrompt(prompt, input);

    // 6. 品質スコア計算
    const qualityScore = this.calculateQualityScore(prompt, input);

    // 7. プロンプト保存
    await this.promptRepository.save(prompt);

    return {
      prompt,
      qualityScore,
      optimizations: optimizationResult.optimizations,
      warnings: optimizationResult.warnings,
    };
  }

  private validateInput(input: GeneratePromptInput): void {
    if (!input.genres || input.genres.length === 0) {
      throw new Error("ジャンルを選択してください");
    }

    if (input.genres.length > 5) {
      throw new Error("ジャンルは最大5つまで選択できます");
    }

    if (!input.language) {
      throw new Error("言語を選択してください");
    }

    // ジャンルの有効性チェック
    try {
      Genre.create(input.genres as Parameters<typeof Genre.create>[0]);
    } catch (error) {
      throw new Error(
        `無効なジャンルです: ${error instanceof Error ? error.message : "不明なエラー"}`
      );
    }

    // 言語の有効性チェック
    try {
      Language.create(input.language as Parameters<typeof Language.create>[0]);
    } catch (error) {
      throw new Error(
        `無効な言語です: ${error instanceof Error ? error.message : "不明なエラー"}`
      );
    }
  }

  private generateStyleField(input: GeneratePromptInput): StyleField {
    const parts: string[] = [];

    // ジャンルを追加
    parts.push(...input.genres);

    // ムードを追加
    if (input.mood && input.mood.length > 0) {
      parts.push(...input.mood);
    }

    // 楽器を追加
    if (input.instruments && input.instruments.length > 0) {
      parts.push(...input.instruments);
    }

    // パラメータベースのキーワード追加
    if (input.parameters) {
      const { energy, complexity, tempo, emotional_intensity } =
        input.parameters;

      // エネルギーレベルを追加
      if (energy !== undefined) {
        if (energy >= 8) {
          parts.push("high energy", "intense");
        } else if (energy >= 6) {
          parts.push("energetic");
        } else if (energy >= 4) {
          parts.push("moderate");
        } else {
          parts.push("calm", "relaxed");
        }
      }

      // 複雑さレベルを追加
      if (complexity !== undefined) {
        if (complexity >= 8) {
          parts.push("complex", "intricate");
        } else if (complexity >= 6) {
          parts.push("layered");
        } else if (complexity <= 3) {
          parts.push("simple", "minimalist");
        }
      }

      // テンポを追加
      if (tempo !== undefined) {
        if (tempo >= 8) {
          parts.push("fast tempo", "driving");
        } else if (tempo >= 6) {
          parts.push("upbeat");
        } else if (tempo <= 3) {
          parts.push("slow tempo", "ballad");
        }
      }

      // 感情的強度を追加
      if (emotional_intensity !== undefined) {
        if (emotional_intensity >= 8) {
          parts.push("emotionally intense", "passionate");
        } else if (emotional_intensity >= 6) {
          parts.push("expressive");
        } else if (emotional_intensity <= 3) {
          parts.push("subtle", "understated");
        }
      }
    }

    // カスタムスタイルを追加
    if (input.customStyle?.trim()) {
      parts.push(input.customStyle.trim());
    }

    const styleFieldText = parts.join(", ");
    return StyleField.create(styleFieldText);
  }

  private generateTitle(input: GeneratePromptInput): string {
    const primaryGenre = input.genres[0];
    const timestamp = new Date().toISOString().slice(0, 10);
    return `${primaryGenre} Prompt - ${timestamp}`;
  }

  private async optimizePrompt(
    prompt: Prompt,
    input: GeneratePromptInput
  ): Promise<{ optimizations: string[]; warnings: string[] }> {
    const optimizations: string[] = [];
    const warnings: string[] = [];

    try {
      if (this.optimizationService) {
        const result = await this.optimizationService.optimize(prompt, input);
        optimizations.push(...result.optimizations);
        warnings.push(...result.warnings);
      } else {
        // フォールバック最適化
        optimizations.push("基本最適化を適用しました");
      }
    } catch (error) {
      warnings.push("最適化に失敗しました");
    }

    return { optimizations, warnings };
  }

  private calculateQualityScore(
    prompt: Prompt,
    input: GeneratePromptInput
  ): number {
    let score = 50; // ベーススコア

    // ジャンル数によるスコア
    if (input.genres.length === 1) {
      score += 20; // シングルジャンルは高品質
    } else if (input.genres.length <= 3) {
      score += 15; // 適度な組み合わせ
    } else {
      score += 5; // 複雑すぎる可能性
    }

    // スタイルフィールドの品質
    const styleFieldLength = prompt.styleField.value.length;
    if (styleFieldLength <= 120) {
      score += 20; // 適切な長さ
    } else {
      score -= 10; // 長すぎる
    }

    // ムードや楽器の追加情報
    if (input.mood && input.mood.length > 0) {
      score += 10;
    }
    if (input.instruments && input.instruments.length > 0) {
      score += 10;
    }

    // パラメータ設定によるスコア
    if (input.parameters) {
      const paramCount = Object.keys(input.parameters).length;
      score += paramCount * 3; // 各パラメータ3点

      // バランスの良いパラメータ設定にボーナス
      const { energy, complexity, tempo, emotional_intensity } =
        input.parameters;
      if (energy && complexity && tempo && emotional_intensity) {
        const variance =
          Math.abs(energy - 5) +
          Math.abs(complexity - 5) +
          Math.abs(tempo - 5) +
          Math.abs(emotional_intensity - 5);
        if (variance <= 8) {
          // 全体的にバランスが良い
          score += 10;
        }
      }
    }

    return Math.min(100, Math.max(0, score));
  }
}

// 最適化サービスのインターフェース
export interface PromptOptimizationService {
  optimize(
    prompt: Prompt,
    input: GeneratePromptInput
  ): Promise<{
    optimizations: string[];
    warnings: string[];
  }>;
}
