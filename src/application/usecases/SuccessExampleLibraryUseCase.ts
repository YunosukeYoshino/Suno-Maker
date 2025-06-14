import type {
  SuccessExample,
  SuccessExampleSearchCriteria,
} from "../../domain/entities/SuccessExample";
import type {
  ISuccessExampleRepository,
  SuccessExampleSearchFilters,
  SuccessExampleSearchOptions,
  SuccessExampleSearchResult,
  SuccessExampleStatistics,
} from "../../domain/repositories/ISuccessExampleRepository";
import type { Genre } from "../../domain/valueObjects/Genre";
import type { Language } from "../../domain/valueObjects/Language";

export interface CreateSuccessExampleInput {
  title: string;
  description: string;
  prompt: string;
  lyrics?: string;
  genre: Genre;
  language: Language;
  sunoUrl: string;
  audioUrl?: string;
  rating: number;
  tags?: string[];
  metadata?: {
    duration?: number;
    tempo?: number;
    key?: string;
    mood?: string[];
  };
}

export interface AnalyzeSuccessExampleResult {
  example: SuccessExample;
  insights: {
    popularityScore: number;
    qualityScore: number;
    trendingPotential: number;
    recommendations: string[];
    similarExamples: SuccessExample[];
  };
}

export interface SemanticSearchResult {
  examples: SuccessExample[];
  searchStats: {
    totalFound: number;
    relevanceScores: number[];
    processingTime: number;
    searchTerms: string[];
  };
}

export class SuccessExampleLibraryUseCase {
  constructor(
    private readonly successExampleRepository: ISuccessExampleRepository
  ) {}

  // 基本的な取得メソッド
  async getSuccessExampleById(id: string): Promise<SuccessExample | null> {
    return await this.successExampleRepository.findById(id);
  }

  async getSuccessExamplesByGenre(
    genre: Genre,
    limit?: number
  ): Promise<SuccessExample[]> {
    return await this.successExampleRepository.findByGenre(genre, limit);
  }

  async getSuccessExamplesByLanguage(
    language: Language,
    limit?: number
  ): Promise<SuccessExample[]> {
    return await this.successExampleRepository.findByLanguage(language, limit);
  }

  async getTopRatedExamples(limit?: number): Promise<SuccessExample[]> {
    return await this.successExampleRepository.findTopRated(limit);
  }

  async getMostPopularExamples(limit?: number): Promise<SuccessExample[]> {
    return await this.successExampleRepository.findMostPlayed(limit);
  }

  async getTrendingExamples(
    timeRange: "day" | "week" | "month" = "week",
    limit?: number
  ): Promise<SuccessExample[]> {
    return await this.successExampleRepository.findTrending(timeRange, limit);
  }

  // 高度な検索機能
  async searchSuccessExamples(
    filters: SuccessExampleSearchFilters,
    options?: SuccessExampleSearchOptions
  ): Promise<SuccessExampleSearchResult> {
    return await this.successExampleRepository.findByFilters(filters, options);
  }

  async semanticSearch(
    query: string,
    limit?: number
  ): Promise<SemanticSearchResult> {
    const startTime = performance.now();

    const examples = await this.successExampleRepository.searchByText(
      query,
      limit
    );

    const endTime = performance.now();
    const processingTime = endTime - startTime;

    // 簡易的な関連性スコア計算
    const relevanceScores = examples.map((example) => {
      const searchText = [
        example.title,
        example.description,
        example.prompt,
        example.lyrics || "",
        ...example.tags,
      ]
        .join(" ")
        .toLowerCase();

      const queryTerms = query.toLowerCase().split(/\s+/);
      let score = 0;
      for (const term of queryTerms) {
        if (searchText.includes(term)) {
          score += 1;
        }
      }
      return score / queryTerms.length;
    });

    return {
      examples,
      searchStats: {
        totalFound: examples.length,
        relevanceScores,
        processingTime,
        searchTerms: query.split(/\s+/),
      },
    };
  }

  async findSimilarExamples(
    referenceExample: SuccessExample,
    limit?: number
  ): Promise<SuccessExample[]> {
    return await this.successExampleRepository.searchBySimilarity(
      referenceExample,
      limit
    );
  }

  async findSimilarByPrompt(
    prompt: string,
    limit?: number
  ): Promise<SuccessExample[]> {
    return await this.successExampleRepository.findSimilarByPrompt(
      prompt,
      limit
    );
  }

  async findSimilarByLyrics(
    lyrics: string,
    limit?: number
  ): Promise<SuccessExample[]> {
    return await this.successExampleRepository.findSimilarByLyrics(
      lyrics,
      limit
    );
  }

  // 推奨システム
  async recommendExamples(
    criteria: SuccessExampleSearchCriteria,
    limit?: number
  ): Promise<SuccessExample[]> {
    return await this.successExampleRepository.findRecommended(criteria, limit);
  }

  async getPersonalizedRecommendations(
    userPreferences: {
      favoriteGenres: Genre[];
      favoriteLanguages: Language[];
      preferredTags: string[];
      minRating?: number;
    },
    limit?: number
  ): Promise<SuccessExample[]> {
    const recommendations: SuccessExample[] = [];

    // ジャンル別推奨
    for (const genre of userPreferences.favoriteGenres) {
      const genreExamples = await this.getSuccessExamplesByGenre(genre, 5);
      recommendations.push(...genreExamples);
    }

    // 言語別推奨
    for (const language of userPreferences.favoriteLanguages) {
      const languageExamples = await this.getSuccessExamplesByLanguage(
        language,
        5
      );
      recommendations.push(...languageExamples);
    }

    // タグベース推奨
    if (userPreferences.preferredTags.length > 0) {
      const tagExamples = await this.successExampleRepository.findByTags(
        userPreferences.preferredTags,
        10
      );
      recommendations.push(...tagExamples);
    }

    // 重複除去と評価フィルタリング
    const uniqueExamples = Array.from(
      new Map(recommendations.map((example) => [example.id, example])).values()
    );

    const filteredExamples = uniqueExamples.filter(
      (example) =>
        !userPreferences.minRating ||
        example.rating >= userPreferences.minRating
    );

    // 品質スコアでソート
    filteredExamples.sort(
      (a, b) => b.calculateQualityScore() - a.calculateQualityScore()
    );

    return filteredExamples.slice(0, limit);
  }

  // 成功事例の分析
  async analyzeSuccessExample(
    id: string
  ): Promise<AnalyzeSuccessExampleResult | null> {
    const example = await this.successExampleRepository.findById(id);
    if (!example) {
      return null;
    }

    const qualityScore = example.calculateQualityScore();

    // 人気度スコア計算
    const popularityScore = Math.min(
      (example.playCount / 1000) * 10 + (example.likeCount / 100) * 5,
      100
    );

    // トレンド性分析（簡易版）
    const recentPlays = example.playCount; // 実際の実装では日付範囲を考慮
    const trendingPotential = Math.min((recentPlays / 500) * 10, 100);

    // 類似事例の取得
    const similarExamples = await this.findSimilarExamples(example, 5);

    // 推奨事項の生成
    const recommendations: string[] = [];
    if (qualityScore < 70) {
      recommendations.push("プロンプトの詳細度を上げることを検討してください");
    }
    if (example.playCount < 1000) {
      recommendations.push("より魅力的なタイトルの使用を検討してください");
    }
    if (example.tags.length < 3) {
      recommendations.push("より多くの関連タグを追加してください");
    }

    return {
      example,
      insights: {
        popularityScore,
        qualityScore,
        trendingPotential,
        recommendations,
        similarExamples,
      },
    };
  }

  // 統計・分析
  async getStatistics(): Promise<SuccessExampleStatistics> {
    return await this.successExampleRepository.getStatistics();
  }

  async getExampleCount(
    filters?: SuccessExampleSearchFilters
  ): Promise<number> {
    return await this.successExampleRepository.getExampleCount(filters);
  }

  async getGenreAnalysis(): Promise<
    Array<{ genre: string; count: number; averageRating: number }>
  > {
    const distribution =
      await this.successExampleRepository.getGenreDistribution();
    const stats = await this.getStatistics();

    return distribution.map((item) => {
      const genreStats = stats.topGenres.find((g) => g.genre === item.genre);
      return {
        ...item,
        averageRating: genreStats?.averageRating || 0,
      };
    });
  }

  async getLanguageAnalysis(): Promise<
    Array<{ language: string; count: number; averageRating: number }>
  > {
    const distribution =
      await this.successExampleRepository.getLanguageDistribution();
    const stats = await this.getStatistics();

    return distribution.map((item) => {
      const languageStats = stats.topLanguages.find(
        (l) => l.language === item.language
      );
      return {
        ...item,
        averageRating: languageStats?.averageRating || 0,
      };
    });
  }

  // 成功事例の操作
  async playExample(id: string): Promise<SuccessExample | null> {
    return await this.successExampleRepository.incrementPlayCount(id);
  }

  async likeExample(id: string): Promise<SuccessExample | null> {
    return await this.successExampleRepository.incrementLikeCount(id);
  }

  async createSuccessExample(
    input: CreateSuccessExampleInput
  ): Promise<SuccessExample> {
    const { SuccessExample } = await import(
      "../../domain/entities/SuccessExample"
    );
    const { StyleField } = await import("../../domain/valueObjects/StyleField");

    const styleField = StyleField.create(input.prompt);

    const example = SuccessExample.create({
      title: input.title,
      description: input.description,
      prompt: input.prompt,
      lyrics: input.lyrics,
      genre: input.genre,
      language: input.language,
      styleField,
      sunoUrl: input.sunoUrl,
      audioUrl: input.audioUrl,
      rating: input.rating,
      playCount: 0,
      likeCount: 0,
      tags: input.tags || [],
      metadata: {
        ...input.metadata,
        createdAt: new Date(),
      },
    });

    await this.successExampleRepository.save(example);
    return example;
  }

  // トレンド分析
  async getTrendAnalysis(
    timeRange: "week" | "month" | "year" = "month"
  ): Promise<{
    trending: SuccessExample[];
    insights: {
      growthRate: number;
      popularGenres: string[];
      emergingTags: string[];
      recommendations: string[];
    };
  }> {
    const trending = await this.getTrendingExamples(
      timeRange === "week" ? "week" : timeRange === "month" ? "month" : "day",
      10
    );

    const trends =
      await this.successExampleRepository.getPopularityTrends(timeRange);

    // 成長率計算
    const growthRate =
      trends.length > 1
        ? ((trends[trends.length - 1].totalPlays - trends[0].totalPlays) /
            trends[0].totalPlays) *
          100
        : 0;

    // 人気ジャンル分析
    const genreAnalysis = await this.getGenreAnalysis();
    const popularGenres = genreAnalysis
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((g) => g.genre);

    // 新興タグ分析（簡易版）
    const stats = await this.getStatistics();
    const emergingTags = stats.popularTags.slice(0, 10).map((t) => t.tag);

    const recommendations = [
      `最も人気のジャンルは${popularGenres[0]}です`,
      `成長率は${growthRate.toFixed(1)}%です`,
      emergingTags.length > 0
        ? `注目のタグ: ${emergingTags.slice(0, 3).join(", ")}`
        : "",
    ].filter(Boolean);

    return {
      trending,
      insights: {
        growthRate,
        popularGenres,
        emergingTags,
        recommendations,
      },
    };
  }
}
