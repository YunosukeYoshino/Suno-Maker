import type { Lyrics } from "../entities/Lyrics";
import type { Language } from "../valueObjects/Language";

export interface LyricsSearchFilters {
  language?: string;
  tags?: string[];
  isPublic?: boolean;
  hasStructureTags?: boolean;
  minCharacters?: number;
  maxCharacters?: number;
  sectionTypes?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface LyricsSearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: "createdAt" | "updatedAt" | "title" | "characterCount";
  sortOrder?: "asc" | "desc";
}

export interface LyricsSearchResult {
  lyrics: Lyrics[];
  total: number;
  hasMore: boolean;
}

export interface LyricsStats {
  totalLyrics: number;
  publicLyrics: number;
  languageDistribution: Record<string, number>;
  averageCharacterCount: number;
  structuredLyricsCount: number;
}

export interface ILyricsRepository {
  // 基本CRUD操作
  save(lyrics: Lyrics): Promise<void>;
  findById(id: string): Promise<Lyrics | null>;
  update(lyrics: Lyrics): Promise<void>;
  delete(id: string): Promise<void>;

  // 検索・フィルタリング
  findAll(options?: LyricsSearchOptions): Promise<LyricsSearchResult>;
  findByFilters(
    filters: LyricsSearchFilters,
    options?: LyricsSearchOptions
  ): Promise<LyricsSearchResult>;
  findByLanguage(
    language: Language,
    options?: LyricsSearchOptions
  ): Promise<LyricsSearchResult>;
  findByTags(
    tags: string[],
    options?: LyricsSearchOptions
  ): Promise<LyricsSearchResult>;

  // 公開歌詞
  findPublicLyrics(options?: LyricsSearchOptions): Promise<LyricsSearchResult>;
  findUserLyrics(
    userId: string,
    options?: LyricsSearchOptions
  ): Promise<LyricsSearchResult>;

  // 構造・特徴別検索
  findStructuredLyrics(
    options?: LyricsSearchOptions
  ): Promise<LyricsSearchResult>;
  findByStructureTypes(
    sectionTypes: string[],
    options?: LyricsSearchOptions
  ): Promise<LyricsSearchResult>;
  findBySimilarLength(
    targetCharacterCount: number,
    tolerance: number,
    options?: LyricsSearchOptions
  ): Promise<LyricsSearchResult>;

  // 人気・推奨
  findTrendingLyrics(
    timeframe: "day" | "week" | "month",
    options?: LyricsSearchOptions
  ): Promise<LyricsSearchResult>;
  findRecommendedLyrics(
    userId: string,
    options?: LyricsSearchOptions
  ): Promise<LyricsSearchResult>;

  // 統計・分析
  getStats(): Promise<LyricsStats>;
  getLyricsCount(): Promise<number>;
  getPublicLyricsCount(): Promise<number>;
  getLanguageDistribution(): Promise<Record<string, number>>;
  getStructureTagDistribution(): Promise<Record<string, number>>;
  getCharacterCountDistribution(): Promise<{
    short: number; // 0-500文字
    medium: number; // 501-1500文字
    long: number; // 1501-3000文字
  }>;

  // バッチ操作
  saveBatch(lyrics: Lyrics[]): Promise<void>;
  deleteBatch(ids: string[]): Promise<void>;
  findByIds(ids: string[]): Promise<Lyrics[]>;

  // 全文検索
  searchByContent(
    query: string,
    options?: LyricsSearchOptions
  ): Promise<LyricsSearchResult>;
  searchByTitle(
    query: string,
    options?: LyricsSearchOptions
  ): Promise<LyricsSearchResult>;
  searchBySimilarity(
    lyrics: Lyrics,
    options?: LyricsSearchOptions
  ): Promise<LyricsSearchResult>;

  // 言語特化機能
  findByOptimizationLevel(
    language: Language,
    options?: LyricsSearchOptions
  ): Promise<LyricsSearchResult>;
  findProblematicLyrics(
    language: Language,
    options?: LyricsSearchOptions
  ): Promise<LyricsSearchResult>;

  // メタデータ
  exists(id: string): Promise<boolean>;
  getLastUpdated(): Promise<Date | null>;
  cleanup(): Promise<void>;

  // 歌詞分析
  analyzeLyricsComplexity(id: string): Promise<{
    readabilityScore: number;
    vocabularyComplexity: number;
    structureComplexity: number;
    languageOptimizationScore: number;
  }>;

  // インポート・エクスポート
  exportLyrics(ids: string[], format: "json" | "txt" | "srt"): Promise<string>;
  importLyrics(
    content: string,
    format: "json" | "txt",
    userId: string
  ): Promise<Lyrics[]>;
}
