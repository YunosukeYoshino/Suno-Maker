import { Lyrics } from "@/domain/entities/Lyrics";
import type { ILyricsRepository } from "@/domain/repositories/ILyricsRepository";
import { Language } from "@/domain/valueObjects/Language";
import {
  type MockedFunction,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  type JapaneseOptimizationService,
  type OptimizeLyricsInput,
  OptimizeLyricsUseCase,
  type SunoOptimizationService,
} from "../OptimizeLyricsUseCase";

describe("OptimizeLyricsUseCase", () => {
  let useCase: OptimizeLyricsUseCase;
  let mockRepository: ILyricsRepository;
  let mockJapaneseService: JapaneseOptimizationService;
  let mockSunoService: SunoOptimizationService;

  beforeEach(() => {
    mockRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByFilters: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
      findByLanguage: vi.fn(),
      findByTags: vi.fn(),
      findPublicLyrics: vi.fn(),
      findUserLyrics: vi.fn(),
      findStructuredLyrics: vi.fn(),
      findByStructureTypes: vi.fn(),
      findBySimilarLength: vi.fn(),
      findTrendingLyrics: vi.fn(),
      findRecommendedLyrics: vi.fn(),
      getStats: vi.fn(),
      getLyricsCount: vi.fn(),
      getPublicLyricsCount: vi.fn(),
      getLanguageDistribution: vi.fn(),
      getStructureTagDistribution: vi.fn(),
      getCharacterCountDistribution: vi.fn(),
      saveBatch: vi.fn(),
      deleteBatch: vi.fn(),
      findByIds: vi.fn(),
      searchByContent: vi.fn(),
      searchByTitle: vi.fn(),
      searchBySimilarity: vi.fn(),
      findByOptimizationLevel: vi.fn(),
      findProblematicLyrics: vi.fn(),
      exists: vi.fn(),
      getLastUpdated: vi.fn(),
      cleanup: vi.fn(),
      analyzeLyricsComplexity: vi.fn(),
      exportLyrics: vi.fn(),
      importLyrics: vi.fn(),
    } as ILyricsRepository;

    mockJapaneseService = {
      optimizeStructure: vi.fn(),
      checkGrammar: vi.fn(),
      suggestImprovements: vi.fn(),
      optimizeForPronunciation: vi.fn(),
      suggestHiraganaUsage: vi.fn(),
    } as JapaneseOptimizationService;

    mockSunoService = {
      optimizeForSuno: vi.fn(),
      validateStructure: vi.fn(),
      suggestStructureChanges: vi.fn(),
      validateForSuno: vi.fn(),
      optimizeLength: vi.fn(),
    } as SunoOptimizationService;

    useCase = new OptimizeLyricsUseCase(
      mockRepository,
      mockJapaneseService,
      mockSunoService
    );
  });

  describe("基本的な歌詞最適化", () => {
    it("構造タグを自動挿入する", async () => {
      const input: OptimizeLyricsInput = {
        lyrics: `Walking down the street
Feeling the beat

This is the chorus
Sing it with us

Here comes the bridge
Over the ridge`,
        language: "en",
        optimizationOptions: {
          autoInsertTags: true,
          optimizeForJapanese: false,
          optimizeForSuno: false,
          maxLength: 3000,
          enforceStructure: false,
        },
      };

      // サービスのモック設定を修正
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (mockSunoService.validateForSuno as any).mockResolvedValue({
        isValid: true,
        issues: [],
        suggestions: [],
      });

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (mockSunoService.optimizeLength as any).mockResolvedValue({
        // biome-ignore lint/suspicious/noExplicitAny: test data
        optimizedLyrics: null as any,
        changes: [],
      });

      const result = await useCase.execute(input);

      expect(result.optimizedLyrics.content).toContain("[Verse]");
      expect(result.optimizedLyrics.content).toContain("[Chorus]");
      expect(result.optimizations).toContain(
        "歌詞構造を分析してタグを自動挿入しました"
      );
    });

    it("既にタグが存在する場合は挿入をスキップする", async () => {
      const input: OptimizeLyricsInput = {
        lyrics: `[Verse]
Walking down the street
Feeling the beat

[Chorus]
This is the chorus
Sing it with us`,
        language: "en",
      };

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (mockSunoService.validateForSuno as any).mockResolvedValue({
        isValid: true,
        issues: [],
        suggestions: [],
      });

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (mockSunoService.optimizeLength as any).mockResolvedValue({
        optimizedLyrics: null,
        changes: [],
      });

      const result = await useCase.execute(input);

      expect(result.optimizedLyrics.content).toContain("[Verse]");
      expect(result.optimizedLyrics.content).toContain("[Chorus]");
      expect(result.optimizations).not.toContain(
        "歌詞構造を分析してタグを自動挿入しました"
      );
    });

    it("文字数制限を超過した場合に警告を出す", async () => {
      const longLyrics = "A".repeat(4000);
      const input: OptimizeLyricsInput = {
        lyrics: longLyrics,
        language: "en",
        optimizationOptions: {
          maxLength: 3000,
          autoInsertTags: false,
          optimizeForJapanese: false,
          optimizeForSuno: false,
          enforceStructure: false,
        },
      };

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (mockSunoService.validateForSuno as any).mockResolvedValue({
        isValid: true,
        issues: [],
        suggestions: [],
      });

      const result = await useCase.execute(input);

      expect(
        result.warnings.some((w) => w.includes("文字数が上限を超えています"))
      ).toBe(true);
      expect(
        result.optimizations.some((o) =>
          o.includes("文字数制限のため歌詞を切り詰めました")
        )
      ).toBe(true);
    });
  });

  describe("日本語最適化", () => {
    it("日本語歌詞の発音最適化を実行する", async () => {
      const input: OptimizeLyricsInput = {
        lyrics: `私はあなたを愛している
何時までも一緒にいよう`,
        language: "ja",
        optimizationOptions: {
          optimizeForJapanese: true,
          autoInsertTags: false,
          optimizeForSuno: false,
          maxLength: 3000,
          enforceStructure: false,
        },
      };

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (mockJapaneseService.optimizeForPronunciation as any).mockResolvedValue({
        optimizedText: `わたしはあなたを愛している
いつまでも一緒にいよう`,
        changes: [
          { original: "私", optimized: "わたし", reason: "歌詞での読みやすさ" },
          { original: "何時", optimized: "いつ", reason: "歌詞での読みやすさ" },
        ],
      });

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (mockJapaneseService.suggestHiraganaUsage as any).mockResolvedValue({
        suggestions: [],
      });

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (mockSunoService.validateForSuno as any).mockResolvedValue({
        isValid: true,
        issues: [],
        suggestions: [],
      });

      const result = await useCase.execute(input);

      expect(result.optimizedLyrics.content).toContain("わたし");
      expect(result.optimizedLyrics.content).toContain("いつ");
      expect(result.optimizations).toContain("発音最適化: 2箇所を修正");
    });

    it("ひらがな使用の提案を生成する", async () => {
      const input: OptimizeLyricsInput = {
        lyrics: "大丈夫だよ、有難う",
        language: "ja",
      };

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (mockJapaneseService.optimizeForPronunciation as any).mockResolvedValue({
        optimizedText: "大丈夫だよ、有難う",
        changes: [],
      });

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (mockJapaneseService.suggestHiraganaUsage as any).mockResolvedValue({
        suggestions: [
          {
            kanji: "大丈夫",
            hiragana: "だいじょうぶ",
            position: 0,
            recommendation: "strong",
          },
          {
            kanji: "有難う",
            hiragana: "ありがとう",
            position: 5,
            recommendation: "strong",
          },
        ],
      });

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (mockSunoService.validateForSuno as any).mockResolvedValue({
        isValid: true,
        issues: [],
        suggestions: [],
      });

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (mockSunoService.optimizeLength as any).mockResolvedValue({
        optimizedLyrics: null,
        changes: [],
      });

      const result = await useCase.execute(input);

      expect(result.suggestions.some((s) => s.includes("大丈夫"))).toBe(true);
      expect(result.suggestions.some((s) => s.includes("有難う"))).toBe(true);
    });

    it("日本語最適化サービスがない場合は基本最適化を適用する", async () => {
      const useCaseWithoutJapanese = new OptimizeLyricsUseCase(
        mockRepository,
        undefined,
        mockSunoService
      );

      const input: OptimizeLyricsInput = {
        lyrics: "私は貴方を愛している",
        language: "ja",
        optimizationOptions: {
          optimizeForJapanese: true,
          autoInsertTags: false,
          optimizeForSuno: false,
          maxLength: 3000,
          enforceStructure: false,
        },
      };

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (mockSunoService.validateForSuno as any).mockResolvedValue({
        isValid: true,
        issues: [],
        suggestions: [],
      });

      const result = await useCaseWithoutJapanese.execute(input);

      expect(result.optimizedLyrics.content).toContain("わたし");
      expect(result.optimizedLyrics.content).toContain("あなた");
      expect(result.optimizations).toContain(
        "基本的な日本語最適化を適用しました"
      );
    });
  });

  describe("Suno最適化", () => {
    it("Suno検証を実行し問題を報告する", async () => {
      const input: OptimizeLyricsInput = {
        lyrics: "Simple lyrics without tags",
        language: "en",
      };

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (mockSunoService.validateForSuno as any).mockResolvedValue({
        isValid: false,
        issues: ["構造タグが不足しています", "セクションが短すぎます"],
        suggestions: ["コーラスを追加してください"],
      });

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (mockSunoService.optimizeLength as any).mockResolvedValue({
        optimizedLyrics: Lyrics.create({
          title: "test_title",
          content: "Simple lyrics without tags",
          language: Language.create("en"),
        }),
        changes: [],
      });

      const result = await useCase.execute(input);

      expect(result.warnings).toContain("構造タグが不足しています");
      expect(result.warnings).toContain("セクションが短すぎます");
    });

    it("Suno最適化サービスがない場合は基本チェックを実行する", async () => {
      const useCaseWithoutSuno = new OptimizeLyricsUseCase(
        mockRepository,
        mockJapaneseService
      );

      const input: OptimizeLyricsInput = {
        lyrics: "Simple lyrics without any structure tags at all",
        language: "en",
      };

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (mockJapaneseService.optimizeForPronunciation as any).mockResolvedValue({
        optimizedText: "Simple lyrics without any structure tags at all",
        changes: [],
      });

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (mockJapaneseService.suggestHiraganaUsage as any).mockResolvedValue({
        suggestions: [],
      });

      const result = await useCaseWithoutSuno.execute(input);

      expect(result.warnings).toContain("コーラスまたはフックがありません");
    });
  });

  describe("歌詞短縮機能", () => {
    it("重複するコーラスを簡略化する", async () => {
      const input: OptimizeLyricsInput = {
        lyrics: `[Verse]
First verse

[Chorus]
This is the chorus
Sing it loud

[Verse]
Second verse

[Chorus]
This is the chorus
Sing it loud

[Bridge]
Bridge section

[Chorus]
This is the chorus
Sing it loud`,
        language: "en",
        optimizationOptions: {
          maxLength: 150, // 短い制限で強制的に短縮
          autoInsertTags: false,
          optimizeForJapanese: false,
          optimizeForSuno: false,
          enforceStructure: false,
        },
      };

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (mockSunoService.validateForSuno as any).mockResolvedValue({
        isValid: true,
        issues: [],
        suggestions: [],
      });

      const result = await useCase.execute(input);

      expect(
        result.optimizations.some((o) => o.includes("重複するコーラスを簡略化"))
      ).toBe(true);
    });
  });

  describe("品質スコア計算", () => {
    it("最適化された歌詞は高スコアを得る", async () => {
      const input: OptimizeLyricsInput = {
        lyrics: `[Verse]
Walking down the street in the morning light
Feeling every beat of my heart tonight

[Chorus]
This is our moment, this is our time
Everything's perfect, everything's fine

[Verse]
Looking at the sky, stars shining bright
Dancing through the night until sunrise

[Chorus]
This is our moment, this is our time
Everything's perfect, everything's fine

[Bridge]
When the world gets heavy and the road gets long
We'll find our way back home with this song

[Chorus]
This is our moment, this is our time
Everything's perfect, everything's fine`,
        language: "en",
      };

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (mockSunoService.validateForSuno as any).mockResolvedValue({
        isValid: true,
        issues: [],
        suggestions: [],
      });

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (mockSunoService.optimizeLength as any).mockResolvedValue({
        optimizedLyrics: Lyrics.create({
          title: "test_title",
          content: input.lyrics,
          language: Language.create("en"),
        }),
        changes: ["Suno最適化を適用しました"],
      });

      const result = await useCase.execute(input);

      expect(result.qualityScore).toBeGreaterThan(80);
    });

    it("警告が多い歌詞は低スコアになる", async () => {
      const input: OptimizeLyricsInput = {
        lyrics: "A", // 極端に短い歌詞
        language: "en",
      };

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (mockSunoService.validateForSuno as any).mockResolvedValue({
        isValid: false,
        issues: [
          "構造タグが不足しています",
          "歌詞が短すぎます",
          "セクションがありません",
        ],
        suggestions: [],
      });

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (mockSunoService.optimizeLength as any).mockResolvedValue({
        optimizedLyrics: Lyrics.create({
          title: "test_title",
          content: "A",
          language: Language.create("en"),
        }),
        changes: [],
      });

      const result = await useCase.execute(input);

      expect(result.qualityScore).toBeLessThan(50);
    });
  });

  describe("入力バリデーション", () => {
    it("空の歌詞でエラーを投げる", async () => {
      const input: OptimizeLyricsInput = {
        lyrics: "",
        language: "en",
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        "歌詞が入力されていません"
      );
    });

    it("長すぎる歌詞でエラーを投げる", async () => {
      const input: OptimizeLyricsInput = {
        lyrics: "A".repeat(10001),
        language: "en",
      };

      await expect(useCase.execute(input)).rejects.toThrow("歌詞が長すぎます");
    });

    it("無効な言語でエラーを投げる", async () => {
      const input: OptimizeLyricsInput = {
        lyrics: "Some lyrics",
        language: "invalid",
      };

      await expect(useCase.execute(input)).rejects.toThrow("無効な言語です");
    });
  });

  describe("テンプレート適用", () => {
    it("指定されたテンプレートに基づいてタグを挿入する", async () => {
      const input: OptimizeLyricsInput = {
        lyrics: `Walking down the street
Feeling the beat

This is the chorus
Sing it with us

Here comes the bridge
Over the ridge`,
        language: "en",
        targetStructure: {
          name: "Simple Structure",
          description: "シンプルな構造",
          sections: ["verse", "chorus", "bridge"],
          isPopular: true,
        },
      };

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (mockSunoService.validateForSuno as any).mockResolvedValue({
        isValid: true,
        issues: [],
        suggestions: [],
      });

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (mockSunoService.optimizeLength as any).mockResolvedValue({
        optimizedLyrics: null,
        changes: [],
      });

      const result = await useCase.execute(input);

      expect(result.optimizedLyrics.content).toContain("[Verse]");
      expect(result.optimizedLyrics.content).toContain("[Chorus]");
      expect(result.optimizedLyrics.content).toContain("[Bridge]");
      expect(result.optimizations).toContain(
        "Simple Structureテンプレートに基づいてタグを挿入しました"
      );
    });
  });
});
