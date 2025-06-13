import type {
  Template,
  TemplateMatchCriteria,
  TemplateCategory,
} from "../entities/Template";
import type { Genre } from "../valueObjects/Genre";
import type { Language } from "../valueObjects/Language";

export interface TemplateSearchFilters {
  genre?: Genre;
  language?: Language;
  category?: TemplateCategory;
  tags?: string[];
  minQualityScore?: number;
  maxUsageCount?: number;
  textSearch?: string;
}

export interface TemplateSearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: "quality" | "usage" | "created" | "updated" | "name";
  sortOrder?: "asc" | "desc";
}

export interface TemplateSearchResult {
  templates: Template[];
  total: number;
  hasMore: boolean;
}

export interface TemplateStatistics {
  totalTemplates: number;
  averageQualityScore: number;
  totalUsage: number;
  topCategories: Array<{ category: TemplateCategory; count: number }>;
  topGenres: Array<{ genre: string; count: number }>;
  topTags: Array<{ tag: string; count: number }>;
}

export interface ITemplateRepository {
  /**
   * テンプレートを保存する
   */
  save(template: Template): Promise<Template>;

  /**
   * IDでテンプレートを取得する
   */
  findById(id: string): Promise<Template | null>;

  /**
   * 条件に一致するテンプレートを検索する
   */
  findByFilters(
    filters: TemplateSearchFilters,
    options?: TemplateSearchOptions
  ): Promise<TemplateSearchResult>;

  /**
   * 条件に一致する最初のテンプレートを取得する
   */
  findByMatch(criteria: TemplateMatchCriteria): Promise<Template | null>;

  /**
   * 人気のテンプレートを取得する（使用回数順）
   */
  findPopular(limit?: number): Promise<Template[]>;

  /**
   * 高品質なテンプレートを取得する（品質スコア順）
   */
  findHighQuality(minScore?: number, limit?: number): Promise<Template[]>;

  /**
   * 最近作成されたテンプレートを取得する
   */
  findRecent(limit?: number): Promise<Template[]>;

  /**
   * カテゴリ別のテンプレートを取得する
   */
  findByCategory(
    category: TemplateCategory,
    limit?: number
  ): Promise<Template[]>;

  /**
   * ジャンル別のテンプレートを取得する
   */
  findByGenre(genre: Genre, limit?: number): Promise<Template[]>;

  /**
   * 言語別のテンプレートを取得する
   */
  findByLanguage(language: Language, limit?: number): Promise<Template[]>;

  /**
   * タグでテンプレートを検索する
   */
  findByTags(tags: string[], limit?: number): Promise<Template[]>;

  /**
   * テンプレートを削除する
   */
  delete(id: string): Promise<void>;

  /**
   * 複数のテンプレートを一括保存する
   */
  saveMany(templates: Template[]): Promise<Template[]>;

  /**
   * テンプレートの統計情報を取得する
   */
  getStatistics(): Promise<TemplateStatistics>;

  /**
   * テンプレートが存在するかチェックする
   */
  exists(id: string): Promise<boolean>;

  /**
   * 条件に一致するテンプレートの数を取得する
   */
  count(filters?: TemplateSearchFilters): Promise<number>;

  /**
   * セマンティック検索（意味的類似性による検索）
   */
  semanticSearch(query: string, limit?: number): Promise<Template[]>;

  /**
   * 類似のテンプレートを検索する
   */
  findSimilar(template: Template, limit?: number): Promise<Template[]>;

  /**
   * テンプレートの使用回数を増加させる
   */
  incrementUsage(id: string): Promise<Template>;

  /**
   * テンプレートの品質スコアを更新する
   */
  updateQualityScore(id: string, score: number): Promise<Template>;
}
