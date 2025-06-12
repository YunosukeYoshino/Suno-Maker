import type { Prompt } from "../entities/Prompt";
import type { Genre } from "../valueObjects/Genre";
import type { Language } from "../valueObjects/Language";

export interface PromptSearchFilters {
  genre?: string[];
  language?: string;
  tags?: string[];
  isPublic?: boolean;
  minQualityScore?: number;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface PromptSearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: "createdAt" | "updatedAt" | "title" | "qualityScore" | "usage";
  sortOrder?: "asc" | "desc";
}

export interface PromptSearchResult {
  prompts: Prompt[];
  total: number;
  hasMore: boolean;
}

export interface IPromptRepository {
  // 基本CRUD操作
  save(prompt: Prompt): Promise<void>;
  findById(id: string): Promise<Prompt | null>;
  update(prompt: Prompt): Promise<void>;
  delete(id: string): Promise<void>;

  // 検索・フィルタリング
  findAll(options?: PromptSearchOptions): Promise<PromptSearchResult>;
  findByFilters(
    filters: PromptSearchFilters,
    options?: PromptSearchOptions
  ): Promise<PromptSearchResult>;
  findByGenre(
    genre: Genre,
    options?: PromptSearchOptions
  ): Promise<PromptSearchResult>;
  findByLanguage(
    language: Language,
    options?: PromptSearchOptions
  ): Promise<PromptSearchResult>;
  findByTags(
    tags: string[],
    options?: PromptSearchOptions
  ): Promise<PromptSearchResult>;

  // 公開プロンプト
  findPublicPrompts(options?: PromptSearchOptions): Promise<PromptSearchResult>;
  findUserPrompts(
    userId: string,
    options?: PromptSearchOptions
  ): Promise<PromptSearchResult>;

  // 人気・推奨
  findTrendingPrompts(
    timeframe: "day" | "week" | "month",
    options?: PromptSearchOptions
  ): Promise<PromptSearchResult>;
  findRecommendedPrompts(
    userId: string,
    options?: PromptSearchOptions
  ): Promise<PromptSearchResult>;

  // 統計・分析
  getPromptCount(): Promise<number>;
  getPublicPromptCount(): Promise<number>;
  getGenreDistribution(): Promise<Record<string, number>>;
  getLanguageDistribution(): Promise<Record<string, number>>;
  getQualityScoreDistribution(): Promise<{
    excellent: number; // 90-100
    good: number; // 70-89
    average: number; // 50-69
    poor: number; // 0-49
  }>;

  // バッチ操作
  saveBatch(prompts: Prompt[]): Promise<void>;
  deleteBatch(ids: string[]): Promise<void>;
  findByIds(ids: string[]): Promise<Prompt[]>;

  // 全文検索
  searchByText(
    query: string,
    options?: PromptSearchOptions
  ): Promise<PromptSearchResult>;
  searchBySimilarity(
    prompt: Prompt,
    options?: PromptSearchOptions
  ): Promise<PromptSearchResult>;

  // メタデータ
  exists(id: string): Promise<boolean>;
  getLastUpdated(): Promise<Date | null>;
  cleanup(): Promise<void>; // 古いデータの削除など
}
