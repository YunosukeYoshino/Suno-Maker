import { beforeEach, describe, expect, it, vi } from "vitest";
import { Template } from "../../../domain/entities/Template";
import type { ITemplateRepository } from "../../../domain/repositories/ITemplateRepository";
import { Genre } from "../../../domain/valueObjects/Genre";
import { Language } from "../../../domain/valueObjects/Language";
import { StyleField } from "../../../domain/valueObjects/StyleField";
import { TemplateLibraryUseCase } from "../TemplateLibraryUseCase";

const createMockTemplateRepository = (): ITemplateRepository => ({
  save: vi.fn(),
  findById: vi.fn(),
  findByFilters: vi.fn(),
  findByMatch: vi.fn(),
  findPopular: vi.fn(),
  findHighQuality: vi.fn(),
  findRecent: vi.fn(),
  findByCategory: vi.fn(),
  findByGenre: vi.fn(),
  findByLanguage: vi.fn(),
  findByTags: vi.fn(),
  delete: vi.fn(),
  saveMany: vi.fn(),
  getStatistics: vi.fn(),
  exists: vi.fn(),
  count: vi.fn(),
  semanticSearch: vi.fn(),
  findSimilar: vi.fn(),
  incrementUsage: vi.fn(),
  updateQualityScore: vi.fn(),
});

// biome-ignore lint/suspicious/noExplicitAny: test helper function for flexibility
const createSampleTemplate = (overrides?: Partial<any>) => {
  return Template.create({
    name: "Rock Ballad Template",
    description: "Emotional rock ballad with powerful vocals",
    genre: Genre.create("Rock"),
    language: Language.create("en"),
    styleField: StyleField.create("emotional, powerful vocals, guitar solo"),
    lyricsStructure:
      "[Verse 1]\n{verse1}\n\n[Chorus]\n{chorus}\n\n[Verse 2]\n{verse2}\n\n[Chorus]\n{chorus}",
    tags: ["ballad", "emotional", "guitar"],
    category: "genre-specific",
    qualityScore: 85,
    usageCount: 150,
    ...overrides,
  });
};

describe("TemplateLibraryUseCase", () => {
  let templateRepository: ITemplateRepository;
  let useCase: TemplateLibraryUseCase;

  beforeEach(() => {
    templateRepository = createMockTemplateRepository();
    useCase = new TemplateLibraryUseCase(templateRepository);
  });

  describe("getTemplatesByGenre", () => {
    it("指定したジャンルのテンプレートを取得できる", async () => {
      const rockTemplate = createSampleTemplate();
      const genre = Genre.create("Rock");

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (templateRepository.findByGenre as any as any).mockResolvedValue([
        rockTemplate,
      ]);

      const result = await useCase.getTemplatesByGenre(genre, 10);

      expect(result).toEqual([rockTemplate]);
      expect(templateRepository.findByGenre).toHaveBeenCalledWith(genre, 10);
    });

    it("ジャンルにマッチするテンプレートがない場合は空配列を返す", async () => {
      const genre = Genre.create("Jazz");

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (templateRepository.findByGenre as any as any).mockResolvedValue([]);

      const result = await useCase.getTemplatesByGenre(genre);

      expect(result).toEqual([]);
      expect(templateRepository.findByGenre).toHaveBeenCalledWith(
        genre,
        undefined
      );
    });
  });

  describe("getTemplatesByLanguage", () => {
    it("指定した言語のテンプレートを取得できる", async () => {
      const japaneseTemplate = createSampleTemplate({
        language: Language.create("ja"),
        name: "J-Pop Template",
      });
      const language = Language.create("ja");

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (templateRepository.findByLanguage as any).mockResolvedValue([
        japaneseTemplate,
      ]);

      const result = await useCase.getTemplatesByLanguage(language, 5);

      expect(result).toEqual([japaneseTemplate]);
      expect(templateRepository.findByLanguage).toHaveBeenCalledWith(
        language,
        5
      );
    });
  });

  describe("getPopularTemplates", () => {
    it("人気のテンプレートを取得できる", async () => {
      const popularTemplate = createSampleTemplate({
        name: "Popular Template",
        usageCount: 1000,
      });

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (templateRepository.findPopular as any).mockResolvedValue([
        popularTemplate,
      ]);

      const result = await useCase.getPopularTemplates(20);

      expect(result).toEqual([popularTemplate]);
      expect(templateRepository.findPopular).toHaveBeenCalledWith(20);
    });
  });

  describe("getHighQualityTemplates", () => {
    it("高品質なテンプレートを取得できる", async () => {
      const highQualityTemplate = createSampleTemplate({
        name: "High Quality Template",
        qualityScore: 95,
      });

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (templateRepository.findHighQuality as any).mockResolvedValue([
        highQualityTemplate,
      ]);

      const result = await useCase.getHighQualityTemplates(90, 15);

      expect(result).toEqual([highQualityTemplate]);
      expect(templateRepository.findHighQuality).toHaveBeenCalledWith(90, 15);
    });
  });

  describe("searchTemplates", () => {
    it("フィルター条件でテンプレートを検索できる", async () => {
      const template = createSampleTemplate();
      const searchResult = {
        templates: [template],
        total: 1,
        hasMore: false,
      };

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (templateRepository.findByFilters as any).mockResolvedValue(searchResult);

      const filters = {
        genre: Genre.create("Rock"),
        minQualityScore: 80,
      };
      const options = { limit: 10, sortBy: "quality" as const };

      const result = await useCase.searchTemplates(filters, options);

      expect(result).toEqual(searchResult);
      expect(templateRepository.findByFilters).toHaveBeenCalledWith(
        filters,
        options
      );
    });
  });

  describe("getTemplateById", () => {
    it("IDでテンプレートを取得できる", async () => {
      const template = createSampleTemplate();
      const templateId = template.id;

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (templateRepository.findById as any).mockResolvedValue(template);

      const result = await useCase.getTemplateById(templateId);

      expect(result).toEqual(template);
      expect(templateRepository.findById).toHaveBeenCalledWith(templateId);
    });

    it("存在しないIDの場合はnullを返す", async () => {
      const templateId = "non-existent-id";

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (templateRepository.findById as any).mockResolvedValue(null);

      const result = await useCase.getTemplateById(templateId);

      expect(result).toBeNull();
      expect(templateRepository.findById).toHaveBeenCalledWith(templateId);
    });
  });

  describe("useTemplate", () => {
    it("テンプレートの使用回数を増加させ、プロンプトを生成する", async () => {
      const template = createSampleTemplate();
      const updatedTemplate = template.incrementUsage();

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (templateRepository.incrementUsage as any).mockResolvedValue(
        updatedTemplate
      );

      const result = await useCase.useTemplate(template.id);

      expect(result.template.usageCount).toBe(template.usageCount + 1);
      expect(result.prompt).toBeDefined();
      expect(result.prompt.title).toBe(`Generated from ${template.name}`);
      expect(templateRepository.incrementUsage).toHaveBeenCalledWith(
        template.id
      );
    });
  });

  describe("recommendTemplates", () => {
    it("ジャンルと言語に基づいてテンプレートを推奨する", async () => {
      const matchingTemplate = createSampleTemplate();

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (templateRepository.findByMatch as any).mockResolvedValue(
        matchingTemplate
      );

      const criteria = {
        genre: Genre.create("Rock"),
        language: Language.create("en"),
      };

      const result = await useCase.recommendTemplates(criteria, 5);

      expect(result).toEqual([matchingTemplate]);
      expect(templateRepository.findByMatch).toHaveBeenCalledWith(criteria);
    });

    it("マッチするテンプレートがない場合は人気テンプレートを返す", async () => {
      const popularTemplate = createSampleTemplate();

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (templateRepository.findByMatch as any).mockResolvedValue(null);
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (templateRepository.findPopular as any).mockResolvedValue([
        popularTemplate,
      ]);

      const criteria = {
        genre: Genre.create("Classical"),
        language: Language.create("zh"),
      };

      const result = await useCase.recommendTemplates(criteria, 5);

      expect(result).toEqual([popularTemplate]);
      expect(templateRepository.findByMatch).toHaveBeenCalledWith(criteria);
      expect(templateRepository.findPopular).toHaveBeenCalledWith(5);
    });
  });

  describe("createCustomTemplate", () => {
    it("カスタムテンプレートを作成できる", async () => {
      const templateData = {
        name: "My Custom Template",
        description: "My custom description",
        genre: Genre.create("Pop"),
        language: Language.create("en"),
        styleField: StyleField.create("pop, upbeat"),
        lyricsStructure: "[Verse]\n{verse}",
        tags: ["custom", "pop"],
      };

      const template = Template.create({
        ...templateData,
        category: "custom",
        qualityScore: 75,
        usageCount: 0,
      });

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (templateRepository.save as any).mockResolvedValue(template);

      const result = await useCase.createCustomTemplate(templateData);

      expect(result.name).toBe(templateData.name);
      expect(result.category).toBe("custom");
      expect(result.qualityScore).toBe(75);
      expect(result.usageCount).toBe(0);
      expect(templateRepository.save).toHaveBeenCalled();
    });
  });

  describe("getTemplateStatistics", () => {
    it("テンプレートの統計情報を取得できる", async () => {
      const statistics = {
        totalTemplates: 100,
        averageQualityScore: 82.5,
        totalUsage: 5000,
        topCategories: [
          { category: "genre-specific" as const, count: 60 },
          { category: "custom" as const, count: 40 },
        ],
        topGenres: [
          { genre: "Pop", count: 25 },
          { genre: "Rock", count: 20 },
        ],
        topTags: [
          { tag: "emotional", count: 15 },
          { tag: "upbeat", count: 12 },
        ],
      };

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      (templateRepository.getStatistics as any).mockResolvedValue(statistics);

      const result = await useCase.getTemplateStatistics();

      expect(result).toEqual(statistics);
      expect(templateRepository.getStatistics).toHaveBeenCalled();
    });
  });
});
