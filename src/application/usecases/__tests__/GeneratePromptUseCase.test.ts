import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  GeneratePromptUseCase,
  type GeneratePromptInput,
  type PromptOptimizationService,
} from "../GeneratePromptUseCase";
import type { IPromptRepository } from "@/domain/repositories/IPromptRepository";
import { Prompt } from "@/domain/entities/Prompt";
import { Genre } from "@/domain/valueObjects/Genre";
import { Language } from "@/domain/valueObjects/Language";

describe("GeneratePromptUseCase", () => {
  let useCase: GeneratePromptUseCase;
  let mockRepository: jest.Mocked<IPromptRepository>;
  let mockOptimizationService: jest.Mocked<PromptOptimizationService>;

  beforeEach(() => {
    mockRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByFilters: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
    } as any;

    mockOptimizationService = {
      optimize: vi.fn(),
    } as any;

    useCase = new GeneratePromptUseCase(
      mockRepository,
      mockOptimizationService
    );
  });

  describe("プロンプト生成", () => {
    it("有効な入力でプロンプトを生成できる", async () => {
      const input: GeneratePromptInput = {
        genres: ["Rock"],
        language: "en",
        mood: ["energetic"],
        instruments: ["electric guitar"],
        parameters: {
          energy: 8,
          complexity: 6,
        },
      };

      mockOptimizationService.optimize.mockResolvedValue({
        optimizations: ["文字数最適化"],
        warnings: [],
      });

      const result = await useCase.execute(input);

      expect(result.prompt).toBeInstanceOf(Prompt);
      expect(result.qualityScore).toBeGreaterThan(0);
      expect(result.qualityScore).toBeLessThanOrEqual(100);
      expect(result.optimizations).toContain("文字数最適化");
      expect(mockRepository.save).toHaveBeenCalledWith(result.prompt);
    });

    it("複数ジャンルでプロンプトを生成できる", async () => {
      const input: GeneratePromptInput = {
        genres: ["Rock", "Blues"],
        language: "en",
      };

      mockOptimizationService.optimize.mockResolvedValue({
        optimizations: ["複合ジャンル最適化"],
        warnings: [],
      });

      const result = await useCase.execute(input);

      expect(result.prompt).toBeInstanceOf(Prompt);
      expect(result.prompt.genre.value).toEqual(["Rock", "Blues"]);
      expect(result.optimizations).toContain("複合ジャンル最適化");
    });

    it("日本語でプロンプトを生成できる", async () => {
      const input: GeneratePromptInput = {
        genres: ["J-Pop"],
        language: "ja",
      };

      mockOptimizationService.optimize.mockResolvedValue({
        optimizations: ["日本語最適化"],
        warnings: [],
      });

      const result = await useCase.execute(input);

      expect(result.prompt.language.value).toBe("ja");
      expect(result.optimizations).toContain("日本語最適化");
    });
  });

  describe("入力バリデーション", () => {
    it("ジャンルが空の場合エラーをスローする", async () => {
      const input: GeneratePromptInput = {
        genres: [],
        language: "en",
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        "ジャンルを選択してください"
      );
    });

    it("無効なジャンルでエラーをスローする", async () => {
      const input: GeneratePromptInput = {
        genres: ["InvalidGenre"],
        language: "en",
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        "無効なジャンルです"
      );
    });

    it("無効な言語でエラーをスローする", async () => {
      const input: GeneratePromptInput = {
        genres: ["Rock"],
        language: "invalid",
      };

      await expect(useCase.execute(input)).rejects.toThrow("無効な言語です");
    });

    it("ジャンルが5つを超える場合エラーをスローする", async () => {
      const input: GeneratePromptInput = {
        genres: ["Rock", "Pop", "Jazz", "Blues", "Classical", "Electronic"],
        language: "en",
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        "ジャンルは最大5つまで選択できます"
      );
    });
  });

  describe("品質スコア計算", () => {
    it("シングルジャンルは高スコアを得る", async () => {
      const input: GeneratePromptInput = {
        genres: ["Rock"],
        language: "en",
        mood: ["energetic"],
        instruments: ["guitar"],
        parameters: {
          energy: 7,
          complexity: 5,
          tempo: 6,
          emotional_intensity: 5,
        },
      };

      mockOptimizationService.optimize.mockResolvedValue({
        optimizations: [],
        warnings: [],
      });

      const result = await useCase.execute(input);
      expect(result.qualityScore).toBeGreaterThan(80);
    });

    it("複数ジャンルは中程度のスコアを得る", async () => {
      const input: GeneratePromptInput = {
        genres: ["Rock", "Blues"],
        language: "en",
      };

      mockOptimizationService.optimize.mockResolvedValue({
        optimizations: [],
        warnings: [],
      });

      const result = await useCase.execute(input);
      expect(result.qualityScore).toBeGreaterThan(60);
      expect(result.qualityScore).toBeLessThan(90);
    });
  });

  describe("最適化処理", () => {
    it("最適化サービスがない場合でも基本プロンプトを返す", async () => {
      const useCaseWithoutOptimization = new GeneratePromptUseCase(
        mockRepository
      );

      const input: GeneratePromptInput = {
        genres: ["Rock"],
        language: "en",
      };

      const result = await useCaseWithoutOptimization.execute(input);

      expect(result.prompt).toBeInstanceOf(Prompt);
      expect(result.optimizations).toContain("基本最適化を適用しました");
    });

    it("最適化に失敗した場合でもプロンプトを返す", async () => {
      const input: GeneratePromptInput = {
        genres: ["Rock"],
        language: "en",
      };

      mockOptimizationService.optimize.mockRejectedValue(
        new Error("最適化エラー")
      );

      const result = await useCase.execute(input);

      expect(result.prompt).toBeInstanceOf(Prompt);
      expect(result.warnings).toContain("最適化に失敗しました");
    });
  });

  describe("スタイルフィールド生成", () => {
    it("エネルギーレベルに応じて適切なキーワードを追加する", async () => {
      const input: GeneratePromptInput = {
        genres: ["Rock"],
        language: "en",
        parameters: {
          energy: 9,
        },
      };

      mockOptimizationService.optimize.mockResolvedValue({
        optimizations: [],
        warnings: [],
      });

      const result = await useCase.execute(input);

      expect(result.prompt.styleField.value).toContain("high energy");
      expect(result.prompt.styleField.value).toContain("intense");
    });

    it("ムード選択が適切にスタイルフィールドに反映される", async () => {
      const input: GeneratePromptInput = {
        genres: ["Pop"],
        language: "en",
        mood: ["energetic", "happy", "romantic"],
      };

      mockOptimizationService.optimize.mockResolvedValue({
        optimizations: [],
        warnings: [],
      });

      const result = await useCase.execute(input);

      expect(result.prompt.styleField.value).toContain("energetic");
      expect(result.prompt.styleField.value).toContain("happy");
      expect(result.prompt.styleField.value).toContain("romantic");
    });

    it("ムードマトリックス選択で複雑な感情表現を生成", async () => {
      const input: GeneratePromptInput = {
        genres: ["Alternative"],
        language: "en",
        mood: ["melancholic", "nostalgic", "contemplative"],
      };

      mockOptimizationService.optimize.mockResolvedValue({
        optimizations: ["ムード最適化"],
        warnings: [],
      });

      const result = await useCase.execute(input);

      expect(result.prompt.styleField.value).toContain("melancholic");
      expect(result.prompt.styleField.value).toContain("nostalgic");
      expect(result.prompt.styleField.value).toContain("contemplative");
      expect(result.optimizations).toContain("ムード最適化");
    });

    it("対照的なムードの組み合わせでも適切に処理される", async () => {
      const input: GeneratePromptInput = {
        genres: ["Electronic"],
        language: "en",
        mood: ["energetic", "melancholic"], // 対照的なムード
      };

      mockOptimizationService.optimize.mockResolvedValue({
        optimizations: [],
        warnings: ["対照的なムードの組み合わせです"],
      });

      const result = await useCase.execute(input);

      expect(result.prompt.styleField.value).toContain("energetic");
      expect(result.prompt.styleField.value).toContain("melancholic");
      expect(result.warnings).toContain("対照的なムードの組み合わせです");
    });

    it("複雑さレベルに応じて適切なキーワードを追加する", async () => {
      const input: GeneratePromptInput = {
        genres: ["Jazz"],
        language: "en",
        parameters: {
          complexity: 9,
        },
      };

      mockOptimizationService.optimize.mockResolvedValue({
        optimizations: [],
        warnings: [],
      });

      const result = await useCase.execute(input);

      expect(result.prompt.styleField.value).toContain("complex");
      expect(result.prompt.styleField.value).toContain("intricate");
    });

    it("カスタムスタイルを適切に追加する", async () => {
      const input: GeneratePromptInput = {
        genres: ["Electronic"],
        language: "en",
        customStyle: "atmospheric, dreamy",
      };

      mockOptimizationService.optimize.mockResolvedValue({
        optimizations: [],
        warnings: [],
      });

      const result = await useCase.execute(input);

      expect(result.prompt.styleField.value).toContain("atmospheric, dreamy");
    });

    it("テンポレベルに応じて適切なキーワードを追加する", async () => {
      const input: GeneratePromptInput = {
        genres: ["Electronic"],
        language: "en",
        parameters: {
          tempo: 9,
        },
      };

      mockOptimizationService.optimize.mockResolvedValue({
        optimizations: [],
        warnings: [],
      });

      const result = await useCase.execute(input);

      expect(result.prompt.styleField.value).toContain("fast tempo");
      expect(result.prompt.styleField.value).toContain("driving");
    });

    it("感情的強度に応じて適切なキーワードを追加する", async () => {
      const input: GeneratePromptInput = {
        genres: ["Pop"],
        language: "en",
        parameters: {
          emotional_intensity: 9,
        },
      };

      mockOptimizationService.optimize.mockResolvedValue({
        optimizations: [],
        warnings: [],
      });

      const result = await useCase.execute(input);

      expect(result.prompt.styleField.value).toContain("emotionally intense");
      expect(result.prompt.styleField.value).toContain("passionate");
    });

    it("楽器選択が適切にスタイルフィールドに反映される", async () => {
      const input: GeneratePromptInput = {
        genres: ["Rock"],
        language: "en",
        instruments: ["electric guitar", "drums", "bass"],
      };

      mockOptimizationService.optimize.mockResolvedValue({
        optimizations: [],
        warnings: [],
      });

      const result = await useCase.execute(input);

      expect(result.prompt.styleField.value).toContain("electric guitar");
      expect(result.prompt.styleField.value).toContain("drums");
      expect(result.prompt.styleField.value).toContain("bass");
    });

    it("多数の楽器選択でも適切に処理される", async () => {
      const input: GeneratePromptInput = {
        genres: ["Jazz"],
        language: "en",
        instruments: ["piano", "saxophone", "trumpet", "bass", "drums"],
      };

      mockOptimizationService.optimize.mockResolvedValue({
        optimizations: [],
        warnings: [],
      });

      const result = await useCase.execute(input);

      input.instruments?.forEach((instrument) => {
        expect(result.prompt.styleField.value).toContain(instrument);
      });
    });
  });
});
