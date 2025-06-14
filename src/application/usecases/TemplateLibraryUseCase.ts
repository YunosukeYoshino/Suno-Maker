import type { Prompt } from "../../domain/entities/Prompt";
import { Template } from "../../domain/entities/Template";
import type {
  TemplateCategory,
  TemplateMatchCriteria,
} from "../../domain/entities/Template";
import type {
  ITemplateRepository,
  TemplateSearchFilters,
  TemplateSearchOptions,
  TemplateSearchResult,
  TemplateStatistics,
} from "../../domain/repositories/ITemplateRepository";
import { Genre } from "../../domain/valueObjects/Genre";
import { Language } from "../../domain/valueObjects/Language";
import { StyleField } from "../../domain/valueObjects/StyleField";

export interface CreateCustomTemplateInput {
  name: string;
  description: string;
  genre: Genre;
  language: Language;
  styleField: StyleField;
  lyricsStructure: string;
  tags: string[];
}

export interface UseTemplateResult {
  template: Template;
  prompt: Prompt;
}

export class TemplateLibraryUseCase {
  constructor(private readonly templateRepository: ITemplateRepository) {}

  /**
   * ジャンル別のテンプレートを取得する
   */
  async getTemplatesByGenre(genre: Genre, limit?: number): Promise<Template[]> {
    return await this.templateRepository.findByGenre(genre, limit);
  }

  /**
   * 言語別のテンプレートを取得する
   */
  async getTemplatesByLanguage(
    language: Language,
    limit?: number
  ): Promise<Template[]> {
    return await this.templateRepository.findByLanguage(language, limit);
  }

  /**
   * 人気のテンプレートを取得する（使用回数順）
   */
  async getPopularTemplates(limit?: number): Promise<Template[]> {
    return await this.templateRepository.findPopular(limit);
  }

  /**
   * 高品質なテンプレートを取得する（品質スコア順）
   */
  async getHighQualityTemplates(
    minScore?: number,
    limit?: number
  ): Promise<Template[]> {
    return await this.templateRepository.findHighQuality(minScore, limit);
  }

  /**
   * 最近作成されたテンプレートを取得する
   */
  async getRecentTemplates(limit?: number): Promise<Template[]> {
    return await this.templateRepository.findRecent(limit);
  }

  /**
   * カテゴリ別のテンプレートを取得する
   */
  async getTemplatesByCategory(
    category: TemplateCategory,
    limit?: number
  ): Promise<Template[]> {
    return await this.templateRepository.findByCategory(category, limit);
  }

  /**
   * タグでテンプレートを検索する
   */
  async getTemplatesByTags(
    tags: string[],
    limit?: number
  ): Promise<Template[]> {
    return await this.templateRepository.findByTags(tags, limit);
  }

  /**
   * フィルター条件でテンプレートを検索する
   */
  async searchTemplates(
    filters: TemplateSearchFilters,
    options?: TemplateSearchOptions
  ): Promise<TemplateSearchResult> {
    return await this.templateRepository.findByFilters(filters, options);
  }

  /**
   * セマンティック検索（意味的類似性による検索）
   */
  async semanticSearchTemplates(
    query: string,
    limit?: number
  ): Promise<Template[]> {
    return await this.templateRepository.semanticSearch(query, limit);
  }

  /**
   * IDでテンプレートを取得する
   */
  async getTemplateById(id: string): Promise<Template | null> {
    return await this.templateRepository.findById(id);
  }

  /**
   * テンプレートを使用してプロンプトを生成する
   * 使用回数も自動的に増加させる
   */
  async useTemplate(templateId: string): Promise<UseTemplateResult> {
    const updatedTemplate =
      await this.templateRepository.incrementUsage(templateId);
    const prompt = updatedTemplate.toPrompt();

    return {
      template: updatedTemplate,
      prompt: prompt,
    };
  }

  /**
   * 条件に基づいてテンプレートを推奨する
   */
  async recommendTemplates(
    criteria: TemplateMatchCriteria,
    limit = 5
  ): Promise<Template[]> {
    // まず完全マッチを試す
    const exactMatch = await this.templateRepository.findByMatch(criteria);
    if (exactMatch) {
      return [exactMatch];
    }

    // 完全マッチがない場合は人気テンプレートを返す
    return await this.templateRepository.findPopular(limit);
  }

  /**
   * 類似のテンプレートを検索する
   */
  async findSimilarTemplates(
    template: Template,
    limit?: number
  ): Promise<Template[]> {
    return await this.templateRepository.findSimilar(template, limit);
  }

  /**
   * カスタムテンプレートを作成する
   */
  async createCustomTemplate(
    input: CreateCustomTemplateInput
  ): Promise<Template> {
    const template = Template.create({
      name: input.name,
      description: input.description,
      genre: input.genre,
      language: input.language,
      styleField: input.styleField,
      lyricsStructure: input.lyricsStructure,
      tags: input.tags,
      category: "custom",
      qualityScore: 75, // 初期品質スコア
      usageCount: 0,
    });

    return await this.templateRepository.save(template);
  }

  /**
   * テンプレートを更新する
   */
  async updateTemplate(template: Template): Promise<Template> {
    return await this.templateRepository.save(template);
  }

  /**
   * テンプレートを削除する
   */
  async deleteTemplate(id: string): Promise<void> {
    await this.templateRepository.delete(id);
  }

  /**
   * テンプレートの品質スコアを更新する
   */
  async updateTemplateQuality(id: string, score: number): Promise<Template> {
    return await this.templateRepository.updateQualityScore(id, score);
  }

  /**
   * テンプレートの統計情報を取得する
   */
  async getTemplateStatistics(): Promise<TemplateStatistics> {
    return await this.templateRepository.getStatistics();
  }

  /**
   * テンプレートの総数を取得する
   */
  async getTemplateCount(filters?: TemplateSearchFilters): Promise<number> {
    return await this.templateRepository.count(filters);
  }

  /**
   * テンプレートが存在するかチェックする
   */
  async templateExists(id: string): Promise<boolean> {
    return await this.templateRepository.exists(id);
  }

  /**
   * 複数のテンプレートを一括保存する
   */
  async bulkSaveTemplates(templates: Template[]): Promise<Template[]> {
    return await this.templateRepository.saveMany(templates);
  }

  /**
   * 初期テンプレートデータを生成する
   */
  async generateInitialTemplates(): Promise<Template[]> {
    const initialTemplates = [
      // Rock Templates
      Template.create({
        name: "Classic Rock Anthem",
        description:
          "High-energy rock anthem with powerful guitars and driving drums",
        genre: Genre.create("Rock"),
        language: Language.create("en"),
        styleField: StyleField.create(
          "classic rock, anthemic, guitar-driven, powerful drums"
        ),
        lyricsStructure:
          "[Intro]\n{intro}\n\n[Verse 1]\n{verse1}\n\n[Pre-Chorus]\n{prechorus}\n\n[Chorus]\n{chorus}\n\n[Verse 2]\n{verse2}\n\n[Pre-Chorus]\n{prechorus}\n\n[Chorus]\n{chorus}\n\n[Bridge]\n{bridge}\n\n[Chorus]\n{chorus}\n\n[Outro]\n{outro}",
        tags: ["rock", "anthem", "guitar", "powerful"],
        category: "genre-specific",
        qualityScore: 88,
        usageCount: 0,
      }),

      // Pop Templates
      Template.create({
        name: "Modern Pop Hit",
        description:
          "Catchy pop song with contemporary production and memorable hooks",
        genre: Genre.create("Pop"),
        language: Language.create("en"),
        styleField: StyleField.create(
          "modern pop, catchy, hook-driven, contemporary"
        ),
        lyricsStructure:
          "[Verse 1]\n{verse1}\n\n[Pre-Chorus]\n{prechorus}\n\n[Chorus]\n{chorus}\n\n[Verse 2]\n{verse2}\n\n[Pre-Chorus]\n{prechorus}\n\n[Chorus]\n{chorus}\n\n[Bridge]\n{bridge}\n\n[Chorus]\n{chorus}",
        tags: ["pop", "catchy", "modern", "hook"],
        category: "genre-specific",
        qualityScore: 90,
        usageCount: 0,
      }),

      // Japanese Templates
      Template.create({
        name: "J-Pop バラード",
        description: "感動的な日本語バラード、美しいメロディーと心に響く歌詞",
        genre: Genre.create("J-Pop"),
        language: Language.create("ja"),
        styleField: StyleField.create(
          "j-pop, ballad, emotional, beautiful melody"
        ),
        lyricsStructure:
          "[イントロ]\n{intro}\n\n[Aメロ]\n{verse1}\n\n[Bメロ]\n{bridge1}\n\n[サビ]\n{chorus}\n\n[Aメロ]\n{verse2}\n\n[Bメロ]\n{bridge2}\n\n[サビ]\n{chorus}\n\n[Cメロ]\n{bridge3}\n\n[サビ]\n{chorus}\n\n[アウトロ]\n{outro}",
        tags: ["j-pop", "ballad", "emotional", "japanese"],
        category: "language-specific",
        qualityScore: 85,
        usageCount: 0,
      }),

      // Electronic Templates
      Template.create({
        name: "EDM Festival Banger",
        description:
          "High-energy EDM track perfect for festival crowds with massive drops",
        genre: Genre.create("EDM"),
        language: Language.create("en"),
        styleField: StyleField.create(
          "edm, festival, high-energy, massive drop, electronic"
        ),
        lyricsStructure:
          "[Build-up]\n{buildup}\n\n[Drop]\n{drop}\n\n[Breakdown]\n{breakdown}\n\n[Build-up 2]\n{buildup2}\n\n[Drop]\n{drop}\n\n[Outro]\n{outro}",
        tags: ["edm", "festival", "electronic", "drop"],
        category: "genre-specific",
        qualityScore: 87,
        usageCount: 0,
      }),

      // Hip-Hop Templates
      Template.create({
        name: "Modern Hip-Hop Flow",
        description:
          "Contemporary hip-hop with modern flow patterns and trap influences",
        genre: Genre.create("Hip-Hop"),
        language: Language.create("en"),
        styleField: StyleField.create(
          "hip-hop, modern flow, trap, contemporary, rhythmic"
        ),
        lyricsStructure:
          "[Intro]\n{intro}\n\n[Verse 1]\n{verse1}\n\n[Hook]\n{hook}\n\n[Verse 2]\n{verse2}\n\n[Hook]\n{hook}\n\n[Bridge]\n{bridge}\n\n[Hook]\n{hook}\n\n[Outro]\n{outro}",
        tags: ["hip-hop", "trap", "modern", "flow"],
        category: "genre-specific",
        qualityScore: 89,
        usageCount: 0,
      }),
    ];

    return await this.bulkSaveTemplates(initialTemplates);
  }
}
