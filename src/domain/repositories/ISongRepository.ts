import type { Song } from "../entities/Song";
import type { Genre } from "../valueObjects/Genre";
import type { Language } from "../valueObjects/Language";

export interface SongSearchFilters {
  genre?: string[];
  language?: string;
  tags?: string[];
  isPublic?: boolean;
  isGenerated?: boolean;
  hasLyrics?: boolean;
  minRating?: number;
  minPlayCount?: number;
  qualityScore?: {
    min?: number;
    max?: number;
  };
  createdAfter?: Date;
  createdBefore?: Date;
  userId?: string;
}

export interface SongSearchOptions {
  limit?: number;
  offset?: number;
  sortBy?:
    | "createdAt"
    | "updatedAt"
    | "title"
    | "rating"
    | "playCount"
    | "qualityScore";
  sortOrder?: "asc" | "desc";
}

export interface SongSearchResult {
  songs: Song[];
  total: number;
  hasMore: boolean;
}

export interface SongStats {
  totalSongs: number;
  generatedSongs: number;
  publicSongs: number;
  averageRating: number;
  totalPlayCount: number;
  languageDistribution: Record<string, number>;
  genreDistribution: Record<string, number>;
  qualityDistribution: {
    excellent: number; // 90-100
    good: number; // 70-89
    average: number; // 50-69
    poor: number; // 0-49
  };
}

export interface TrendingMetrics {
  song: Song;
  playCountIncrease: number;
  ratingTrend: number;
  shareCount: number;
  engagementScore: number;
}

export interface ISongRepository {
  // 基本CRUD操作
  save(song: Song): Promise<void>;
  findById(id: string): Promise<Song | null>;
  update(song: Song): Promise<void>;
  delete(id: string): Promise<void>;

  // 検索・フィルタリング
  findAll(options?: SongSearchOptions): Promise<SongSearchResult>;
  findByFilters(
    filters: SongSearchFilters,
    options?: SongSearchOptions
  ): Promise<SongSearchResult>;
  findByGenre(
    genre: Genre,
    options?: SongSearchOptions
  ): Promise<SongSearchResult>;
  findByLanguage(
    language: Language,
    options?: SongSearchOptions
  ): Promise<SongSearchResult>;
  findByTags(
    tags: string[],
    options?: SongSearchOptions
  ): Promise<SongSearchResult>;

  // 公開楽曲
  findPublicSongs(options?: SongSearchOptions): Promise<SongSearchResult>;
  findUserSongs(
    userId: string,
    options?: SongSearchOptions
  ): Promise<SongSearchResult>;

  // 生成状態別
  findGeneratedSongs(options?: SongSearchOptions): Promise<SongSearchResult>;
  findPendingSongs(
    userId?: string,
    options?: SongSearchOptions
  ): Promise<SongSearchResult>;
  findReadyForGeneration(
    options?: SongSearchOptions
  ): Promise<SongSearchResult>;

  // 人気・トレンド
  findTrendingSongs(
    timeframe: "day" | "week" | "month",
    options?: SongSearchOptions
  ): Promise<SongSearchResult>;
  findTopRated(options?: SongSearchOptions): Promise<SongSearchResult>;
  findMostPlayed(options?: SongSearchOptions): Promise<SongSearchResult>;
  findRecentlyGenerated(options?: SongSearchOptions): Promise<SongSearchResult>;

  // 推奨システム
  findRecommendedSongs(
    userId: string,
    options?: SongSearchOptions
  ): Promise<SongSearchResult>;
  findSimilarSongs(
    song: Song,
    options?: SongSearchOptions
  ): Promise<SongSearchResult>;
  findSongsLikedByUser(
    userId: string,
    options?: SongSearchOptions
  ): Promise<SongSearchResult>;

  // 統計・分析
  getStats(): Promise<SongStats>;
  getSongCount(): Promise<number>;
  getGeneratedSongCount(): Promise<number>;
  getPublicSongCount(): Promise<number>;
  getAverageRating(): Promise<number>;
  getTotalPlayCount(): Promise<number>;

  // トレンド分析
  getTrendingMetrics(
    timeframe: "day" | "week" | "month"
  ): Promise<TrendingMetrics[]>;
  getGenrePopularity(timeframe: "day" | "week" | "month"): Promise<
    Array<{
      genre: string;
      count: number;
      growth: number;
    }>
  >;
  getLanguageUsage(timeframe: "day" | "week" | "month"): Promise<
    Array<{
      language: string;
      count: number;
      growth: number;
    }>
  >;

  // バッチ操作
  saveBatch(songs: Song[]): Promise<void>;
  deleteBatch(ids: string[]): Promise<void>;
  findByIds(ids: string[]): Promise<Song[]>;
  updateBatch(songs: Song[]): Promise<void>;

  // 全文検索
  searchByTitle(
    query: string,
    options?: SongSearchOptions
  ): Promise<SongSearchResult>;
  searchByDescription(
    query: string,
    options?: SongSearchOptions
  ): Promise<SongSearchResult>;
  searchByContent(
    query: string,
    options?: SongSearchOptions
  ): Promise<SongSearchResult>;
  searchBySimilarity(
    song: Song,
    options?: SongSearchOptions
  ): Promise<SongSearchResult>;

  // 楽曲管理
  markAsGenerated(id: string, sunoUrl: string): Promise<void>;
  updateRating(id: string, rating: number): Promise<void>;
  incrementPlayCount(id: string): Promise<void>;
  togglePublicStatus(id: string): Promise<void>;

  // コラボレーション
  findCollaborativeSongs(
    userIds: string[],
    options?: SongSearchOptions
  ): Promise<SongSearchResult>;
  findSharedSongs(
    userId: string,
    options?: SongSearchOptions
  ): Promise<SongSearchResult>;

  // インポート・エクスポート
  exportSongs(
    ids: string[],
    format: "json" | "csv" | "playlist"
  ): Promise<string>;
  importSongs(
    content: string,
    format: "json" | "csv",
    userId: string
  ): Promise<Song[]>;

  // プレイリスト機能
  findSongsByPlaylist(
    playlistId: string,
    options?: SongSearchOptions
  ): Promise<SongSearchResult>;
  addToPlaylist(songId: string, playlistId: string): Promise<void>;
  removeFromPlaylist(songId: string, playlistId: string): Promise<void>;

  // キャッシュ・パフォーマンス
  warmCache(userId?: string): Promise<void>;
  clearCache(pattern?: string): Promise<void>;
  getPopularTags(limit?: number): Promise<string[]>;

  // メタデータ
  exists(id: string): Promise<boolean>;
  getLastUpdated(): Promise<Date | null>;
  cleanup(): Promise<void>;
  vacuum(): Promise<void>; // データベース最適化

  // 品質管理
  findLowQualitySongs(
    threshold: number,
    options?: SongSearchOptions
  ): Promise<SongSearchResult>;
  findInconsistentSongs(options?: SongSearchOptions): Promise<SongSearchResult>;
  findIncompleteSongs(options?: SongSearchOptions): Promise<SongSearchResult>;

  // 監査・ログ
  getCreationHistory(
    userId: string,
    timeframe: "day" | "week" | "month"
  ): Promise<
    Array<{
      date: Date;
      count: number;
      genres: string[];
    }>
  >;
  getUserActivity(
    userId: string,
    timeframe: "day" | "week" | "month"
  ): Promise<{
    songsCreated: number;
    songsGenerated: number;
    totalPlays: number;
    averageRating: number;
  }>;
}
