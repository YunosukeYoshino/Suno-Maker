import {
  type MockedFunction,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { SuccessExample } from "../../../domain/entities/SuccessExample";
import type { ISuccessExampleRepository } from "../../../domain/repositories/ISuccessExampleRepository";
import { Genre } from "../../../domain/valueObjects/Genre";
import { Language } from "../../../domain/valueObjects/Language";
import { StyleField } from "../../../domain/valueObjects/StyleField";
import { SuccessExampleLibraryUseCase } from "../SuccessExampleLibraryUseCase";

const createMockSuccessExample = (overrides?: Partial<any>) => {
  return SuccessExample.create({
    title: "Amazing Rock Ballad",
    description: "A powerful rock ballad that went viral",
    prompt: "rock ballad, emotional, powerful vocals, electric guitar",
    lyrics:
      "[Verse]\nIn the darkness of the night\n[Chorus]\nWe will rise above",
    genre: Genre.create("Rock"),
    language: Language.create("en"),
    styleField: StyleField.create("rock ballad, emotional, powerful vocals"),
    sunoUrl: "https://suno.com/song/12345",
    audioUrl: "https://suno.com/audio/12345.mp3",
    rating: 4.5,
    playCount: 10000,
    likeCount: 500,
    tags: ["rock", "ballad", "viral"],
    metadata: {
      duration: 240,
      tempo: 120,
      key: "Am",
      mood: ["emotional", "powerful"],
      createdAt: new Date("2024-01-01"),
    },
    ...overrides,
  });
};

describe("SuccessExampleLibraryUseCase", () => {
  let useCase: SuccessExampleLibraryUseCase;
  let mockRepository: {
    [K in keyof ISuccessExampleRepository]: MockedFunction<
      ISuccessExampleRepository[K]
    >;
  };

  beforeEach(() => {
    mockRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
      findByFilters: vi.fn(),
      findByGenre: vi.fn(),
      findByLanguage: vi.fn(),
      findByRating: vi.fn(),
      findByPopularity: vi.fn(),
      findByTags: vi.fn(),
      searchByText: vi.fn(),
      searchBySimilarity: vi.fn(),
      findSimilarByPrompt: vi.fn(),
      findSimilarByLyrics: vi.fn(),
      findTrending: vi.fn(),
      findTopRated: vi.fn(),
      findMostPlayed: vi.fn(),
      findMostLiked: vi.fn(),
      findRecommended: vi.fn(),
      getStatistics: vi.fn(),
      getExampleCount: vi.fn(),
      getGenreDistribution: vi.fn(),
      getLanguageDistribution: vi.fn(),
      getRatingDistribution: vi.fn(),
      getPopularityTrends: vi.fn(),
      saveBatch: vi.fn(),
      deleteBatch: vi.fn(),
      findByIds: vi.fn(),
      incrementPlayCount: vi.fn(),
      incrementLikeCount: vi.fn(),
      exists: vi.fn(),
      getLastUpdated: vi.fn(),
      cleanup: vi.fn(),
    } as any;

    useCase = new SuccessExampleLibraryUseCase(mockRepository);
  });

  describe("getSuccessExampleById", () => {
    it("IDで成功事例を取得できる", async () => {
      const mockExample = createMockSuccessExample();
      (mockRepository.findById as any).mockResolvedValue(mockExample);

      const result = await useCase.getSuccessExampleById("test-id");

      expect(result).toBe(mockExample);
      expect(mockRepository.findById).toHaveBeenCalledWith("test-id");
    });

    it("存在しないIDの場合はnullを返す", async () => {
      (mockRepository.findById as any).mockResolvedValue(null);

      const result = await useCase.getSuccessExampleById("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("getSuccessExamplesByGenre", () => {
    it("指定したジャンルの成功事例を取得できる", async () => {
      const rockGenre = Genre.create("Rock");
      const mockExamples = [createMockSuccessExample()];
      (mockRepository.findByGenre as any).mockResolvedValue(mockExamples);

      const result = await useCase.getSuccessExamplesByGenre(rockGenre, 10);

      expect(result).toBe(mockExamples);
      expect(mockRepository.findByGenre).toHaveBeenCalledWith(rockGenre, 10);
    });
  });

  describe("getSuccessExamplesByLanguage", () => {
    it("指定した言語の成功事例を取得できる", async () => {
      const englishLanguage = Language.create("en");
      const mockExamples = [createMockSuccessExample()];
      (mockRepository.findByLanguage as any).mockResolvedValue(mockExamples);

      const result = await useCase.getSuccessExamplesByLanguage(
        englishLanguage,
        10
      );

      expect(result).toBe(mockExamples);
      expect(mockRepository.findByLanguage).toHaveBeenCalledWith(
        englishLanguage,
        10
      );
    });
  });

  describe("getTopRatedExamples", () => {
    it("高評価の成功事例を取得できる", async () => {
      const mockExamples = [createMockSuccessExample({ rating: 5 })];
      (mockRepository.findTopRated as any).mockResolvedValue(mockExamples);

      const result = await useCase.getTopRatedExamples(5);

      expect(result).toBe(mockExamples);
      expect(mockRepository.findTopRated).toHaveBeenCalledWith(5);
    });
  });

  describe("getMostPopularExamples", () => {
    it("人気の成功事例を取得できる", async () => {
      const mockExamples = [createMockSuccessExample({ playCount: 50000 })];
      (mockRepository.findMostPlayed as any).mockResolvedValue(mockExamples);

      const result = await useCase.getMostPopularExamples(5);

      expect(result).toBe(mockExamples);
      expect(mockRepository.findMostPlayed).toHaveBeenCalledWith(5);
    });
  });

  describe("getTrendingExamples", () => {
    it("トレンドの成功事例を取得できる", async () => {
      const mockExamples = [createMockSuccessExample()];
      (mockRepository.findTrending as any).mockResolvedValue(mockExamples);

      const result = await useCase.getTrendingExamples("week", 10);

      expect(result).toBe(mockExamples);
      expect(mockRepository.findTrending).toHaveBeenCalledWith("week", 10);
    });
  });

  describe("searchSuccessExamples", () => {
    it("フィルター条件で成功事例を検索できる", async () => {
      const filters = { minRating: 4 };
      const options = { sortBy: "rating" as const, limit: 10 };
      const mockResult = {
        examples: [createMockSuccessExample()],
        totalCount: 1,
        hasMore: false,
      };
      (mockRepository.findByFilters as any).mockResolvedValue(mockResult);

      const result = await useCase.searchSuccessExamples(filters, options);

      expect(result).toBe(mockResult);
      expect(mockRepository.findByFilters).toHaveBeenCalledWith(
        filters,
        options
      );
    });
  });

  describe("semanticSearch", () => {
    it("テキストクエリで成功事例をセマンティック検索できる", async () => {
      const query = "rock ballad emotional";
      const mockExamples = [createMockSuccessExample()];
      (mockRepository.searchByText as any).mockResolvedValue(mockExamples);

      const result = await useCase.semanticSearch(query, 10);

      expect(result.examples).toBe(mockExamples);
      expect(result.searchStats.totalFound).toBe(1);
      expect(result.searchStats.searchTerms).toEqual([
        "rock",
        "ballad",
        "emotional",
      ]);
      expect(result.searchStats.processingTime).toBeGreaterThan(0);
      expect(mockRepository.searchByText).toHaveBeenCalledWith(query, 10);
    });
  });

  describe("findSimilarExamples", () => {
    it("類似する成功事例を見つけることができる", async () => {
      const referenceExample = createMockSuccessExample();
      const mockSimilarExamples = [
        createMockSuccessExample({ title: "Similar Rock Song" }),
      ];
      (mockRepository.searchBySimilarity as any).mockResolvedValue(
        mockSimilarExamples
      );

      const result = await useCase.findSimilarExamples(referenceExample, 5);

      expect(result).toBe(mockSimilarExamples);
      expect(mockRepository.searchBySimilarity).toHaveBeenCalledWith(
        referenceExample,
        5
      );
    });
  });

  describe("getPersonalizedRecommendations", () => {
    it("ユーザーの好みに基づいて個人化された推奨を取得できる", async () => {
      const userPreferences = {
        favoriteGenres: [Genre.create("Rock"), Genre.create("Pop")],
        favoriteLanguages: [Language.create("en")],
        preferredTags: ["ballad", "emotional"],
        minRating: 4,
      };

      const rockExamples = [
        createMockSuccessExample({ genre: Genre.create("Rock") }),
      ];
      const popExamples = [
        createMockSuccessExample({ genre: Genre.create("Pop") }),
      ];
      const languageExamples = [createMockSuccessExample()];
      const tagExamples = [
        createMockSuccessExample({ tags: ["ballad", "emotional"] }),
      ];

      (mockRepository.findByGenre as any)
        .mockResolvedValueOnce(rockExamples)
        .mockResolvedValueOnce(popExamples);
      (mockRepository.findByLanguage as any).mockResolvedValue(
        languageExamples
      );
      (mockRepository.findByTags as any).mockResolvedValue(tagExamples);

      const result = await useCase.getPersonalizedRecommendations(
        userPreferences,
        10
      );

      expect(result.length).toBeGreaterThan(0);
      expect(mockRepository.findByGenre).toHaveBeenCalledTimes(2);
      expect(mockRepository.findByLanguage).toHaveBeenCalledTimes(1);
      expect(mockRepository.findByTags).toHaveBeenCalledWith(
        ["ballad", "emotional"],
        10
      );
    });
  });

  describe("analyzeSuccessExample", () => {
    it("成功事例を分析できる", async () => {
      const mockExample = createMockSuccessExample();
      const mockSimilarExamples = [
        createMockSuccessExample({ title: "Similar Song" }),
      ];

      (mockRepository.findById as any).mockResolvedValue(mockExample);
      (mockRepository.searchBySimilarity as any).mockResolvedValue(
        mockSimilarExamples
      );

      const result = await useCase.analyzeSuccessExample("test-id");

      expect(result).not.toBeNull();
      expect(result!.example).toBe(mockExample);
      expect(result!.insights.qualityScore).toBeGreaterThan(0);
      expect(result!.insights.popularityScore).toBeGreaterThan(0);
      expect(result!.insights.trendingPotential).toBeGreaterThan(0);
      expect(result!.insights.similarExamples).toBe(mockSimilarExamples);
      expect(Array.isArray(result!.insights.recommendations)).toBe(true);
    });

    it("存在しないIDの場合はnullを返す", async () => {
      (mockRepository.findById as any).mockResolvedValue(null);

      const result = await useCase.analyzeSuccessExample("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("playExample", () => {
    it("成功事例の再生回数を増加できる", async () => {
      const updatedExample = createMockSuccessExample({ playCount: 10001 });
      (mockRepository.incrementPlayCount as any).mockResolvedValue(
        updatedExample
      );

      const result = await useCase.playExample("test-id");

      expect(result).toBe(updatedExample);
      expect(mockRepository.incrementPlayCount).toHaveBeenCalledWith("test-id");
    });
  });

  describe("likeExample", () => {
    it("成功事例のいいね数を増加できる", async () => {
      const updatedExample = createMockSuccessExample({ likeCount: 501 });
      (mockRepository.incrementLikeCount as any).mockResolvedValue(
        updatedExample
      );

      const result = await useCase.likeExample("test-id");

      expect(result).toBe(updatedExample);
      expect(mockRepository.incrementLikeCount).toHaveBeenCalledWith("test-id");
    });
  });

  describe("createSuccessExample", () => {
    it("新しい成功事例を作成できる", async () => {
      const input = {
        title: "New Success Story",
        description: "A great example",
        prompt: "pop, catchy, upbeat",
        genre: Genre.create("Pop"),
        language: Language.create("en"),
        sunoUrl: "https://suno.com/song/67890",
        rating: 4,
        tags: ["pop", "catchy"],
      };

      (mockRepository.save as any).mockResolvedValue(undefined);

      const result = await useCase.createSuccessExample(input);

      expect(result.title).toBe("New Success Story");
      expect(result.rating).toBe(4);
      expect(result.playCount).toBe(0);
      expect(result.likeCount).toBe(0);
      expect(mockRepository.save).toHaveBeenCalledWith(result);
    });
  });

  describe("getStatistics", () => {
    it("統計情報を取得できる", async () => {
      const mockStats = {
        totalExamples: 100,
        averageRating: 4.2,
        averagePlayCount: 5000,
        averageLikeCount: 250,
        topGenres: [{ genre: "Rock", count: 30, averageRating: 4.5 }],
        topLanguages: [{ language: "en", count: 60, averageRating: 4.3 }],
        popularTags: [{ tag: "rock", count: 25, averageRating: 4.4 }],
        qualityDistribution: { excellent: 20, good: 50, average: 25, poor: 5 },
        trendingExamples: [createMockSuccessExample()],
      };

      (mockRepository.getStatistics as any).mockResolvedValue(mockStats);

      const result = await useCase.getStatistics();

      expect(result).toBe(mockStats);
      expect(mockRepository.getStatistics).toHaveBeenCalled();
    });
  });

  describe("getTrendAnalysis", () => {
    it("トレンド分析を取得できる", async () => {
      const mockTrending = [createMockSuccessExample()];
      const mockTrends = [
        {
          date: new Date("2024-01-01"),
          averageRating: 4.0,
          totalPlays: 1000,
          totalLikes: 100,
        },
        {
          date: new Date("2024-01-31"),
          averageRating: 4.2,
          totalPlays: 1200,
          totalLikes: 120,
        },
      ];
      const mockGenreAnalysis = [
        { genre: "Rock", count: 30, averageRating: 4.5 },
      ];
      const mockStats = {
        totalExamples: 100,
        averageRating: 4.2,
        averagePlayCount: 5000,
        averageLikeCount: 250,
        topGenres: [{ genre: "Rock", count: 30, averageRating: 4.5 }],
        topLanguages: [{ language: "en", count: 60, averageRating: 4.3 }],
        popularTags: [{ tag: "rock", count: 25, averageRating: 4.4 }],
        qualityDistribution: { excellent: 20, good: 50, average: 25, poor: 5 },
        trendingExamples: [createMockSuccessExample()],
      };

      (mockRepository.findTrending as any).mockResolvedValue(mockTrending);
      (mockRepository.getPopularityTrends as any).mockResolvedValue(mockTrends);
      (mockRepository.getGenreDistribution as any).mockResolvedValue(
        mockGenreAnalysis
      );
      (mockRepository.getStatistics as any).mockResolvedValue(mockStats);

      const result = await useCase.getTrendAnalysis("month");

      expect(result.trending).toBe(mockTrending);
      expect(result.insights.growthRate).toBeCloseTo(20, 1); // (1200-1000)/1000*100 = 20%
      expect(result.insights.popularGenres).toContain("Rock");
      expect(result.insights.emergingTags).toContain("rock");
      expect(Array.isArray(result.insights.recommendations)).toBe(true);
    });
  });
});
