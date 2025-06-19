import {
  type MockedFunction,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { BUSINESS_RULES } from "~/config/business-rules";
import type { Template } from "../../../domain/entities/Template";
import type { ITemplateRepository } from "../../../domain/repositories/ITemplateRepository";
import { DefaultTemplateSeederService } from "../TemplateSeederService";

const createMockTemplateRepository = () =>
  ({
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
  }) satisfies ITemplateRepository;

describe("DefaultTemplateSeederService", () => {
  let templateRepository: {
    [K in keyof ITemplateRepository]: MockedFunction<ITemplateRepository[K]>;
  };
  let seederService: DefaultTemplateSeederService;

  beforeEach(() => {
    templateRepository = createMockTemplateRepository();
    seederService = new DefaultTemplateSeederService(templateRepository);
  });

  describe("seedInitialTemplates", () => {
    it("初期テンプレートを正常に作成して保存する", async () => {
      const mockTemplates: Template[] = [];
      templateRepository.saveMany.mockResolvedValue(mockTemplates);

      const result = await seederService.seedInitialTemplates();

      expect(templateRepository.saveMany).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockTemplates);

      // saveManyが呼ばれた引数をチェック
      const savedTemplates = templateRepository.saveMany.mock
        .calls[0][0] as Template[];
      expect(Array.isArray(savedTemplates)).toBe(true);
      expect(savedTemplates.length).toBeGreaterThan(0);
    });

    it("ジャンル別、言語別、ムード別のテンプレートが含まれている", async () => {
      const mockTemplates: Template[] = [];
      templateRepository.saveMany.mockResolvedValue(mockTemplates);

      await seederService.seedInitialTemplates();

      const savedTemplates = templateRepository.saveMany.mock
        .calls[0][0] as Template[];

      // カテゴリ別にテンプレートが含まれているかチェック
      const categories = savedTemplates.map(
        (template: Template) => template.category
      );
      expect(categories).toContain("genre-specific");
      expect(categories).toContain("language-specific");
      expect(categories).toContain("mood-specific");
    });
  });

  describe("seedGenreSpecificTemplates", () => {
    it("ジャンル特化テンプレートを作成する", async () => {
      const mockTemplates: Template[] = [];
      templateRepository.saveMany.mockResolvedValue(mockTemplates);

      const result = await seederService.seedGenreSpecificTemplates();

      expect(templateRepository.saveMany).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockTemplates);

      const savedTemplates = templateRepository.saveMany.mock
        .calls[0][0] as Template[];

      // 全てのテンプレートがgenre-specificカテゴリであることを確認
      for (const template of savedTemplates) {
        expect(template.category).toBe("genre-specific");
      }
    });

    it("多様なジャンルのテンプレートが含まれている", async () => {
      const mockTemplates: Template[] = [];
      templateRepository.saveMany.mockResolvedValue(mockTemplates);

      await seederService.seedGenreSpecificTemplates();

      const savedTemplates = templateRepository.saveMany.mock
        .calls[0][0] as Template[];
      const genreNames = savedTemplates.map((template: Template) => {
        const genreValue = template.genre.value;
        return typeof genreValue === "string" ? genreValue : genreValue[0];
      });

      // 主要なジャンルが含まれていることを確認
      const requiredGenres = BUSINESS_RULES.GENRE.REQUIRED_GENRES;
      for (const genre of requiredGenres.slice(0, 5)) {
        expect(genreNames).toContain(genre);
      }
    });
  });

  describe("seedLanguageSpecificTemplates", () => {
    it("言語特化テンプレートを作成する", async () => {
      const mockTemplates: Template[] = [];
      templateRepository.saveMany.mockResolvedValue(mockTemplates);

      const result = await seederService.seedLanguageSpecificTemplates();

      expect(templateRepository.saveMany).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockTemplates);

      const savedTemplates = templateRepository.saveMany.mock
        .calls[0][0] as Template[];

      // 全てのテンプレートがlanguage-specificカテゴリであることを確認
      for (const template of savedTemplates) {
        expect(template.category).toBe("language-specific");
      }
    });

    it("多言語のテンプレートが含まれている", async () => {
      const mockTemplates: Template[] = [];
      templateRepository.saveMany.mockResolvedValue(mockTemplates);

      await seederService.seedLanguageSpecificTemplates();

      const savedTemplates = templateRepository.saveMany.mock
        .calls[0][0] as Template[];
      const languages = savedTemplates.map(
        (template: Template) => template.language.value
      );

      // 複数の言語が含まれていることを確認
      expect(languages).toContain("ja"); // 日本語
      expect(languages).toContain("ko"); // 韓国語
      expect(languages).toContain("es"); // スペイン語
      expect(languages).toContain("fr"); // フランス語
    });

    it("日本語テンプレートに適切な構造が含まれている", async () => {
      const mockTemplates: Template[] = [];
      templateRepository.saveMany.mockResolvedValue(mockTemplates);

      await seederService.seedLanguageSpecificTemplates();

      const savedTemplates = templateRepository.saveMany.mock
        .calls[0][0] as Template[];
      const japaneseTemplates = savedTemplates.filter(
        (template: Template) => template.language.value === "ja"
      );

      expect(japaneseTemplates.length).toBeGreaterThan(0);

      // 日本語特有の構造が含まれているかチェック
      const jpTemplate = japaneseTemplates[0];
      const jpStructureKeywords =
        BUSINESS_RULES.TEMPLATE.JAPANESE_STRUCTURE_KEYWORDS;
      const structureRegex = new RegExp(jpStructureKeywords.join("|"));
      expect(jpTemplate.lyricsStructure).toMatch(structureRegex);
    });
  });

  describe("seedMoodSpecificTemplates", () => {
    it("ムード特化テンプレートを作成する", async () => {
      const mockTemplates: Template[] = [];
      templateRepository.saveMany.mockResolvedValue(mockTemplates);

      const result = await seederService.seedMoodSpecificTemplates();

      expect(templateRepository.saveMany).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockTemplates);

      const savedTemplates = templateRepository.saveMany.mock
        .calls[0][0] as Template[];

      // 全てのテンプレートがmood-specificカテゴリであることを確認
      for (const template of savedTemplates) {
        expect(template.category).toBe("mood-specific");
      }
    });

    it("多様なムードのテンプレートが含まれている", async () => {
      const mockTemplates: Template[] = [];
      templateRepository.saveMany.mockResolvedValue(mockTemplates);

      await seederService.seedMoodSpecificTemplates();

      const savedTemplates = templateRepository.saveMany.mock
        .calls[0][0] as Template[];
      const allTags = savedTemplates.flatMap(
        (template: Template) => template.tags
      );

      // 様々なムードのタグが含まれていることを確認
      const requiredMoodTags = BUSINESS_RULES.TEMPLATE.REQUIRED_MOOD_TAGS;
      for (const moodTag of requiredMoodTags) {
        expect(allTags).toContain(moodTag);
      }
    });
  });

  describe("clearAllTemplates", () => {
    it("まだ実装されていないためエラーを投げる", async () => {
      await expect(seederService.clearAllTemplates()).rejects.toThrow(
        "clearAllTemplates not implemented - depends on repository implementation"
      );
    });
  });

  describe("テンプレートの品質", () => {
    it("全てのテンプレートが有効な品質スコアを持つ", async () => {
      const mockTemplates: Template[] = [];
      templateRepository.saveMany.mockResolvedValue(mockTemplates);

      await seederService.seedInitialTemplates();

      const savedTemplates = templateRepository.saveMany.mock
        .calls[0][0] as Template[];

      for (const template of savedTemplates) {
        expect(template.qualityScore).toBeGreaterThanOrEqual(0);
        expect(template.qualityScore).toBeLessThanOrEqual(100);
      }
    });

    it("全てのテンプレートが必要なプロパティを持つ", async () => {
      const mockTemplates: Template[] = [];
      templateRepository.saveMany.mockResolvedValue(mockTemplates);

      await seederService.seedInitialTemplates();

      const savedTemplates = templateRepository.saveMany.mock
        .calls[0][0] as Template[];

      for (const template of savedTemplates) {
        expect(template.name).toBeTruthy();
        expect(template.description).toBeTruthy();
        expect(template.genre).toBeDefined();
        expect(template.language).toBeDefined();
        expect(template.styleField).toBeDefined();
        expect(template.lyricsStructure).toBeTruthy();
        expect(Array.isArray(template.tags)).toBe(true);
        expect(template.category).toBeTruthy();
        expect(typeof template.usageCount).toBe("number");
      }
    });

    it("テンプレート名が一意である", async () => {
      const mockTemplates: Template[] = [];
      templateRepository.saveMany.mockResolvedValue(mockTemplates);

      await seederService.seedInitialTemplates();

      const savedTemplates = templateRepository.saveMany.mock
        .calls[0][0] as Template[];
      const templateNames = savedTemplates.map(
        (template: Template) => template.name
      );
      const uniqueNames = [...new Set(templateNames)];

      expect(templateNames.length).toBe(uniqueNames.length);
    });
  });
});
