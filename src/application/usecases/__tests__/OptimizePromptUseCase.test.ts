import { Prompt } from "@/domain/entities/Prompt";
import type { IPromptRepository } from "@/domain/repositories/IPromptRepository";
import { Genre } from "@/domain/valueObjects/Genre";
import { Language } from "@/domain/valueObjects/Language";
import { StyleField } from "@/domain/valueObjects/StyleField";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockedFunction,
} from "vitest";
import {
  type GenreConflictDetector,
  type OptimizePromptInput,
  OptimizePromptUseCase,
  type StyleFieldOptimizer,
  type SuccessRatePredictor,
} from "../OptimizePromptUseCase";

describe.skip("OptimizePromptUseCase", () => {
  let useCase: OptimizePromptUseCase;
  let mockRepository: {
    save: MockedFunction<IPromptRepository["save"]>;
    findById: MockedFunction<IPromptRepository["findById"]>;
  };
  let mockStyleOptimizer: {
    optimize: MockedFunction<StyleFieldOptimizer["optimize"]>;
  };
  let mockConflictDetector: {
    detectConflicts: MockedFunction<GenreConflictDetector["detectConflicts"]>;
  };
  let mockSuccessPredictor: {
    predict: MockedFunction<SuccessRatePredictor["predict"]>;
  };

  beforeEach(() => {
    mockRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByFilters: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
    } as IPromptRepository;

    mockStyleOptimizer = {
      optimizeForLength: vi.fn(),
    } as StyleFieldOptimizer;

    mockConflictDetector = {
      detectConflicts: vi.fn(),
    } as GenreConflictDetector;

    mockSuccessPredictor = {
      predictSuccessRate: vi.fn(),
    } as SuccessRatePredictor;

    useCase = new OptimizePromptUseCase(
      mockRepository,
      mockStyleOptimizer,
      mockConflictDetector,
      mockSuccessPredictor
    );
  });

  const createSamplePrompt = (
    styleFieldValue = "Rock, energetic, guitar"
  ): Prompt => {
    return Prompt.create(
      "Test Prompt",
      Genre.create(["Rock"]),
      Language.create("en"),
      StyleField.create(styleFieldValue)
    );
  };

  describe("基本的な最適化", () => {
    it("120文字制限に合わせてプロンプトを最適化する", async () => {
      // テスト用に長いスタイルフィールドを模擬
      const basePrompt = createSamplePrompt("Rock, energetic, guitar");
      // StyleFieldの値を直接変更してテスト用の長いフィールドを作成
      const longPrompt = {
        ...basePrompt,
        styleField: {
          value:
            "Rock, energetic, electric guitar, drums, bass, powerful, melodic, driving beat, intense, emotional",
          ...basePrompt.styleField,
        },
      } as Prompt;

      const input: OptimizePromptInput = {
        prompt: longPrompt,
        targetLength: 120,
        optimizationMode: "suno",
        preserveGenres: true,
        preserveLanguage: true,
      };

      mockStyleOptimizer.optimizeForLength.mockResolvedValue({
        optimizedField: StyleField.create(
          "Rock, energetic, guitar, drums, powerful"
        ),
        changes: [
          { type: "removed", description: "冗長な要素を除去", impact: 0.2 },
        ],
      });

      mockConflictDetector.detectConflicts.mockResolvedValue({ conflicts: [] });

      mockSuccessPredictor.predictSuccessRate.mockResolvedValue({
        overallScore: 85,
        factors: {
          genreCompatibility: 90,
          styleCohesion: 80,
          lengthOptimality: 85,
          technicalCorrectness: 85,
        },
        improvements: [],
      });

      const result = await useCase.execute(input);

      expect(result.optimizedLength).toBeLessThanOrEqual(120);
      expect(result.optimizations.length).toBeGreaterThan(0);
      expect(result.compressionRatio).toBeLessThan(1);
      expect(mockRepository.save).toHaveBeenCalledWith(result.optimizedPrompt);
    });

    it("短いプロンプトはそのまま保持する", async () => {
      const shortStyleField = "Rock, guitar, energetic";
      const prompt = createSamplePrompt(shortStyleField);

      const input: OptimizePromptInput = {
        prompt,
        targetLength: 120,
        optimizationMode: "suno",
        preserveGenres: true,
        preserveLanguage: true,
      };

      mockStyleOptimizer.optimizeForLength.mockResolvedValue({
        optimizedField: StyleField.create(shortStyleField),
        changes: [],
      });

      mockConflictDetector.detectConflicts.mockResolvedValue({ conflicts: [] });

      mockSuccessPredictor.predictSuccessRate.mockResolvedValue({
        overallScore: 90,
        factors: {
          genreCompatibility: 100,
          styleCohesion: 85,
          lengthOptimality: 90,
          technicalCorrectness: 85,
        },
        improvements: [],
      });

      const result = await useCase.execute(input);

      expect(result.optimizedLength).toBe(result.originalLength);
      expect(result.compressionRatio).toBe(1);
      expect(result.optimizations).toHaveLength(0);
    });
  });

  describe("ジャンル競合検出", () => {
    it("競合するジャンルを検出し警告を出す", async () => {
      const prompt = Prompt.create(
        "Conflicting Genres",
        Genre.create(["Classical", "Death Metal"]),
        Language.create("en"),
        StyleField.create(
          "classical orchestra, death metal, aggressive, peaceful"
        )
      );

      const input: OptimizePromptInput = {
        prompt,
        optimizationMode: "suno",
        preserveGenres: false,
        preserveLanguage: true,
      };

      mockStyleOptimizer.optimizeForLength.mockResolvedValue({
        optimizedField: prompt.styleField,
        changes: [],
      });

      mockConflictDetector.detectConflicts.mockResolvedValue({
        conflicts: [
          {
            genre1: "Classical",
            genre2: "Death Metal",
            severity: "high" as const,
            reason: "クラシックと現代的な重いジャンルは音楽的に相反する",
            suggestion:
              "クラシカル・クロスオーバーや交響曲メタルを検討してください",
          },
        ],
      });

      mockSuccessPredictor.predictSuccessRate.mockResolvedValue({
        overallScore: 60,
        factors: {
          genreCompatibility: 40,
          styleCohesion: 60,
          lengthOptimality: 80,
          technicalCorrectness: 80,
        },
        improvements: ["ジャンルの組み合わせを見直してください"],
      });

      const result = await useCase.execute(input);

      expect(result.warnings.some((w) => w.includes("ジャンル競合"))).toBe(
        true
      );
      expect(
        result.suggestions.some((s) => s.includes("クラシカル・クロスオーバー"))
      ).toBe(true);
    });

    it("サービスがない場合も基本的な競合検出を行う", async () => {
      const useCaseWithoutDetector = new OptimizePromptUseCase(
        mockRepository,
        mockStyleOptimizer,
        undefined,
        mockSuccessPredictor
      );

      const prompt = Prompt.create(
        "Conflicting Genres",
        Genre.create(["Classical", "Death Metal"]),
        Language.create("en"),
        StyleField.create("classical orchestra, death metal")
      );

      const input: OptimizePromptInput = {
        prompt,
        optimizationMode: "suno",
        preserveGenres: false,
        preserveLanguage: true,
      };

      mockStyleOptimizer.optimizeForLength.mockResolvedValue({
        optimizedField: prompt.styleField,
        changes: [],
      });

      mockSuccessPredictor.predictSuccessRate.mockResolvedValue({
        overallScore: 60,
        factors: {
          genreCompatibility: 40,
          styleCohesion: 60,
          lengthOptimality: 80,
          technicalCorrectness: 80,
        },
        improvements: [],
      });

      const result = await useCaseWithoutDetector.execute(input);

      expect(result.warnings.some((w) => w.includes("ジャンル競合"))).toBe(
        true
      );
    });
  });

  describe("スタイルフィールド最適化", () => {
    it("重複する単語を除去する", async () => {
      const duplicateStyleField =
        "Rock, rock, energetic, energetic, guitar, guitar, drums";
      const prompt = createSamplePrompt(duplicateStyleField);

      const useCaseWithoutOptimizer = new OptimizePromptUseCase(
        mockRepository,
        undefined,
        mockConflictDetector,
        mockSuccessPredictor
      );

      const input: OptimizePromptInput = {
        prompt,
        targetLength: 120,
        optimizationMode: "suno",
        preserveGenres: true,
        preserveLanguage: true,
      };

      mockConflictDetector.detectConflicts.mockResolvedValue({ conflicts: [] });

      mockSuccessPredictor.predictSuccessRate.mockResolvedValue({
        overallScore: 85,
        factors: {
          genreCompatibility: 90,
          styleCohesion: 80,
          lengthOptimality: 85,
          technicalCorrectness: 85,
        },
        improvements: [],
      });

      const result = await useCaseWithoutOptimizer.execute(input);

      expect(result.optimizations.some((o) => o.type === "merged")).toBe(true);
      expect(result.optimizedLength).toBeLessThan(result.originalLength);
    });

    it("冗長な修飾語を除去する", async () => {
      const redundantStyleField =
        "Rock, very energetic, really powerful, extremely melodic, super awesome";
      const prompt = createSamplePrompt(redundantStyleField);

      const useCaseWithoutOptimizer = new OptimizePromptUseCase(
        mockRepository,
        undefined,
        mockConflictDetector,
        mockSuccessPredictor
      );

      const input: OptimizePromptInput = {
        prompt,
        targetLength: 60,
        optimizationMode: "suno",
        preserveGenres: true,
        preserveLanguage: true,
      };

      mockConflictDetector.detectConflicts.mockResolvedValue({ conflicts: [] });

      mockSuccessPredictor.predictSuccessRate.mockResolvedValue({
        overallScore: 80,
        factors: {
          genreCompatibility: 90,
          styleCohesion: 75,
          lengthOptimality: 80,
          technicalCorrectness: 75,
        },
        improvements: [],
      });

      const result = await useCaseWithoutOptimizer.execute(input);

      expect(
        result.optimizations.some(
          (o) => o.type === "removed" && o.description.includes("冗長な修飾語")
        )
      ).toBe(true);
    });

    it("同義語を短縮する", async () => {
      const longWordsStyleField =
        "Electronic music, energetic beat, beautiful melody, powerful sound, atmospheric vibes";
      const prompt = createSamplePrompt(longWordsStyleField);

      const useCaseWithoutOptimizer = new OptimizePromptUseCase(
        mockRepository,
        undefined,
        mockConflictDetector,
        mockSuccessPredictor
      );

      const input: OptimizePromptInput = {
        prompt,
        targetLength: 60,
        optimizationMode: "suno",
        preserveGenres: true,
        preserveLanguage: true,
      };

      mockConflictDetector.detectConflicts.mockResolvedValue({ conflicts: [] });

      mockSuccessPredictor.predictSuccessRate.mockResolvedValue({
        overallScore: 80,
        factors: {
          genreCompatibility: 90,
          styleCohesion: 75,
          lengthOptimality: 80,
          technicalCorrectness: 75,
        },
        improvements: [],
      });

      const result = await useCaseWithoutOptimizer.execute(input);

      expect(result.optimizations.some((o) => o.type === "shortened")).toBe(
        true
      );
      expect(result.optimizedLength).toBeLessThan(result.originalLength);
    });
  });

  describe("メタタグ構造検証", () => {
    it("多すぎるジャンル数に対して警告を出す", async () => {
      const prompt = Prompt.create(
        "Too Many Genres",
        Genre.create(["Rock", "Jazz", "Electronic", "Classical", "Hip-Hop"]),
        Language.create("en"),
        StyleField.create("complex multi-genre fusion")
      );

      const input: OptimizePromptInput = {
        prompt,
        optimizationMode: "suno",
        preserveGenres: true,
        preserveLanguage: true,
      };

      mockStyleOptimizer.optimizeForLength.mockResolvedValue({
        optimizedField: prompt.styleField,
        changes: [],
      });

      mockConflictDetector.detectConflicts.mockResolvedValue({ conflicts: [] });

      mockSuccessPredictor.predictSuccessRate.mockResolvedValue({
        overallScore: 65,
        factors: {
          genreCompatibility: 50,
          styleCohesion: 70,
          lengthOptimality: 80,
          technicalCorrectness: 60,
        },
        improvements: [],
      });

      const result = await useCase.execute(input);

      expect(
        result.warnings.some((w) => w.includes("ジャンル数が多すぎます"))
      ).toBe(true);
      expect(
        result.suggestions.some((s) => s.includes("ジャンルは1-3個に絞る"))
      ).toBe(true);
    });

    it("著作権に関わる用語に対して警告を出す", async () => {
      const prompt = createSamplePrompt(
        "Beatles style, copyrighted material, artist name reference"
      );

      const input: OptimizePromptInput = {
        prompt,
        optimizationMode: "suno",
        preserveGenres: true,
        preserveLanguage: true,
      };

      mockStyleOptimizer.optimizeForLength.mockResolvedValue({
        optimizedField: prompt.styleField,
        changes: [],
      });

      mockConflictDetector.detectConflicts.mockResolvedValue({ conflicts: [] });

      mockSuccessPredictor.predictSuccessRate.mockResolvedValue({
        overallScore: 70,
        factors: {
          genreCompatibility: 90,
          styleCohesion: 75,
          lengthOptimality: 80,
          technicalCorrectness: 40,
        },
        improvements: [],
      });

      const result = await useCase.execute(input);

      expect(
        result.warnings.some((w) => w.includes("著作権に関わる可能性"))
      ).toBe(true);
      expect(
        result.suggestions.some((s) =>
          s.includes("具体的なアーティスト名や楽曲名の使用は避けて")
        )
      ).toBe(true);
    });
  });

  describe("成功率予測", () => {
    it("高品質なプロンプトは高い成功率を得る", async () => {
      const prompt = createSamplePrompt("Rock, guitar, energetic, melodic");

      const input: OptimizePromptInput = {
        prompt,
        optimizationMode: "suno",
        preserveGenres: true,
        preserveLanguage: true,
      };

      mockStyleOptimizer.optimizeForLength.mockResolvedValue({
        optimizedField: prompt.styleField,
        changes: [],
      });

      mockConflictDetector.detectConflicts.mockResolvedValue({ conflicts: [] });

      mockSuccessPredictor.predictSuccessRate.mockResolvedValue({
        overallScore: 92,
        factors: {
          genreCompatibility: 95,
          styleCohesion: 90,
          lengthOptimality: 90,
          technicalCorrectness: 93,
        },
        improvements: [],
      });

      const result = await useCase.execute(input);

      expect(result.qualityScore).toBeGreaterThan(85);
    });

    it("予測サービスがない場合も基本予測を行う", async () => {
      const useCaseWithoutPredictor = new OptimizePromptUseCase(
        mockRepository,
        mockStyleOptimizer,
        mockConflictDetector,
        undefined
      );

      const prompt = createSamplePrompt("Rock, guitar");

      const input: OptimizePromptInput = {
        prompt,
        optimizationMode: "suno",
        preserveGenres: true,
        preserveLanguage: true,
      };

      mockStyleOptimizer.optimizeForLength.mockResolvedValue({
        optimizedField: prompt.styleField,
        changes: [],
      });

      mockConflictDetector.detectConflicts.mockResolvedValue({ conflicts: [] });

      const result = await useCaseWithoutPredictor.execute(input);

      expect(result.qualityScore).toBeGreaterThan(0);
      expect(result.qualityScore).toBeLessThanOrEqual(100);
    });
  });

  describe("最適化モード", () => {
    it("Sunoモードで特定の最適化を適用する", async () => {
      const prompt = createSamplePrompt(
        "Rock music, energetic beat, electric guitar"
      );

      const input: OptimizePromptInput = {
        prompt,
        targetLength: 80,
        optimizationMode: "suno",
        preserveGenres: true,
        preserveLanguage: true,
      };

      mockStyleOptimizer.optimizeForLength.mockResolvedValue({
        optimizedField: StyleField.create("Rock, energy, electric guitar"),
        changes: [
          { type: "shortened", description: "Sunoモード最適化", impact: 0.3 },
        ],
      });

      mockConflictDetector.detectConflicts.mockResolvedValue({ conflicts: [] });

      mockSuccessPredictor.predictSuccessRate.mockResolvedValue({
        overallScore: 88,
        factors: {
          genreCompatibility: 90,
          styleCohesion: 85,
          lengthOptimality: 90,
          technicalCorrectness: 87,
        },
        improvements: [],
      });

      const result = await useCase.execute(input);

      expect(
        result.optimizations.some((o) => o.description.includes("Sunoモード"))
      ).toBe(true);
    });
  });

  describe("カスタム優先度", () => {
    it("カスタム優先度に基づいて最適化する", async () => {
      const prompt = createSamplePrompt(
        "Rock, jazz fusion, electric guitar, piano, energetic, complex"
      );

      const input: OptimizePromptInput = {
        prompt,
        targetLength: 60,
        optimizationMode: "creative",
        preserveGenres: true,
        preserveLanguage: true,
        customPriorities: {
          genres: 10,
          instruments: 9,
          mood: 5,
          technical: 3,
        },
      };

      mockStyleOptimizer.optimizeForLength.mockResolvedValue({
        optimizedField: StyleField.create(
          "Rock, jazz fusion, electric guitar, piano"
        ),
        changes: [
          { type: "removed", description: "低優先度要素を除去", impact: 0.4 },
        ],
      });

      mockConflictDetector.detectConflicts.mockResolvedValue({ conflicts: [] });

      mockSuccessPredictor.predictSuccessRate.mockResolvedValue({
        overallScore: 85,
        factors: {
          genreCompatibility: 80,
          styleCohesion: 85,
          lengthOptimality: 90,
          technicalCorrectness: 85,
        },
        improvements: [],
      });

      const result = await useCase.execute(input);

      expect(result.optimizedLength).toBeLessThanOrEqual(60);
      expect(mockStyleOptimizer.optimizeForLength).toHaveBeenCalledWith(
        prompt.styleField,
        60,
        expect.objectContaining({
          genres: 10,
          instruments: 9,
          mood: 5,
          technical: 3,
        })
      );
    });
  });

  describe("入力バリデーション", () => {
    it("プロンプトが指定されていない場合エラーを投げる", async () => {
      const input: OptimizePromptInput = {
        prompt: null as unknown as Prompt,
        optimizationMode: "suno",
        preserveGenres: true,
        preserveLanguage: true,
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        "プロンプトが指定されていません"
      );
    });

    it("無効な目標文字数でエラーを投げる", async () => {
      const prompt = createSamplePrompt();

      const input: OptimizePromptInput = {
        prompt,
        targetLength: 10, // 20未満
        optimizationMode: "suno",
        preserveGenres: true,
        preserveLanguage: true,
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        "目標文字数は20〜500文字の範囲で指定してください"
      );
    });

    it("無効な最適化モードでエラーを投げる", async () => {
      const prompt = createSamplePrompt();

      const input: OptimizePromptInput = {
        prompt,
        optimizationMode: "invalid" as "suno" | "general" | "creative",
        preserveGenres: true,
        preserveLanguage: true,
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        "無効な最適化モードです"
      );
    });
  });
});
