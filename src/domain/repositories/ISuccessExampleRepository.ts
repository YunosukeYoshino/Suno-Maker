import type {
  SuccessExample,
  SuccessExampleSearchCriteria,
} from "../entities/SuccessExample";
import type { Genre } from "../valueObjects/Genre";
import type { Language } from "../valueObjects/Language";

export interface SuccessExampleSearchFilters {
  genre?: Genre;
  language?: Language;
  minRating?: number;
  minPlayCount?: number;
  tags?: string[];
  mood?: string[];
  textQuery?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SuccessExampleSearchOptions {
  sortBy?:
    | "rating"
    | "playCount"
    | "likeCount"
    | "quality"
    | "relevance"
    | "date";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface SuccessExampleSearchResult {
  examples: SuccessExample[];
  totalCount: number;
  hasMore: boolean;
  searchStats?: {
    processingTime: number;
    matchedCriteria: string[];
    suggestions?: string[];
  };
}

export interface SuccessExampleStatistics {
  totalExamples: number;
  averageRating: number;
  averagePlayCount: number;
  averageLikeCount: number;
  topGenres: Array<{
    genre: string;
    count: number;
    averageRating: number;
  }>;
  topLanguages: Array<{
    language: string;
    count: number;
    averageRating: number;
  }>;
  popularTags: Array<{
    tag: string;
    count: number;
    averageRating: number;
  }>;
  qualityDistribution: {
    excellent: number; // 90-100
    good: number; // 70-89
    average: number; // 50-69
    poor: number; // 0-49
  };
  trendingExamples: SuccessExample[];
}

export interface ISuccessExampleRepository {
  // 基本CRUD操作
  save(example: SuccessExample): Promise<void>;
  findById(id: string): Promise<SuccessExample | null>;
  update(example: SuccessExample): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(): Promise<SuccessExample[]>;

  // フィルタリング・検索
  findByFilters(
    filters: SuccessExampleSearchFilters,
    options?: SuccessExampleSearchOptions
  ): Promise<SuccessExampleSearchResult>;

  findByGenre(genre: Genre, limit?: number): Promise<SuccessExample[]>;
  findByLanguage(language: Language, limit?: number): Promise<SuccessExample[]>;
  findByRating(minRating: number, limit?: number): Promise<SuccessExample[]>;
  findByPopularity(
    minPlayCount: number,
    limit?: number
  ): Promise<SuccessExample[]>;
  findByTags(tags: string[], limit?: number): Promise<SuccessExample[]>;

  // セマンティック検索
  searchByText(query: string, limit?: number): Promise<SuccessExample[]>;
  searchBySimilarity(
    referenceExample: SuccessExample,
    limit?: number
  ): Promise<SuccessExample[]>;
  findSimilarByPrompt(
    prompt: string,
    limit?: number
  ): Promise<SuccessExample[]>;
  findSimilarByLyrics(
    lyrics: string,
    limit?: number
  ): Promise<SuccessExample[]>;

  // 推奨・トレンド
  findTrending(
    timeRange?: "day" | "week" | "month",
    limit?: number
  ): Promise<SuccessExample[]>;
  findTopRated(limit?: number): Promise<SuccessExample[]>;
  findMostPlayed(limit?: number): Promise<SuccessExample[]>;
  findMostLiked(limit?: number): Promise<SuccessExample[]>;
  findRecommended(
    criteria: SuccessExampleSearchCriteria,
    limit?: number
  ): Promise<SuccessExample[]>;

  // 統計・分析
  getStatistics(): Promise<SuccessExampleStatistics>;
  getExampleCount(filters?: SuccessExampleSearchFilters): Promise<number>;
  getGenreDistribution(): Promise<Array<{ genre: string; count: number }>>;
  getLanguageDistribution(): Promise<
    Array<{ language: string; count: number }>
  >;
  getRatingDistribution(): Promise<Array<{ rating: number; count: number }>>;
  getPopularityTrends(timeRange: "week" | "month" | "year"): Promise<
    Array<{
      date: Date;
      averageRating: number;
      totalPlays: number;
      totalLikes: number;
    }>
  >;

  // バッチ操作
  saveBatch(examples: SuccessExample[]): Promise<void>;
  deleteBatch(ids: string[]): Promise<void>;
  findByIds(ids: string[]): Promise<SuccessExample[]>;

  // インクリメント操作
  incrementPlayCount(id: string): Promise<SuccessExample | null>;
  incrementLikeCount(id: string): Promise<SuccessExample | null>;

  // データ管理
  exists(id: string): Promise<boolean>;
  getLastUpdated(): Promise<Date | null>;
  cleanup(olderThan?: Date): Promise<number>; // 古いデータのクリーンアップ、削除された件数を返す
}
