import { beforeEach, describe, expect, it } from "vitest";
import {
  type ComplianceCheckInput,
  ComplianceService,
} from "../ComplianceService";

describe("ComplianceService", () => {
  let complianceService: ComplianceService;

  beforeEach(() => {
    complianceService = new ComplianceService();
  });

  describe("基本的なコンプライアンスチェック", () => {
    it("問題のないコンテンツは安全と判定される", async () => {
      const input: ComplianceCheckInput = {
        title: "Original Song",
        description: "An original composition",
        prompt: "original, creative, instrumental, peaceful",
        lyrics: "This is my original song\nWith my own words and melody",
        tags: ["original", "creative"],
      };

      const result = await complianceService.checkCompliance(input);

      expect(result.overallLevel).toBe("safe");
      expect(result.score).toBe(100);
      expect(result.hasIssues()).toBe(false);
      expect(result.isSafeForCommercialUse()).toBe(true);
      expect(result.isSafeForPublicRelease()).toBe(true);
    });

    it("既存楽曲名を含むコンテンツは警告される", async () => {
      const input: ComplianceCheckInput = {
        title: "My Version of Bohemian Rhapsody",
        prompt: "rock, queen style, bohemian rhapsody inspired",
        lyrics: "Just like Bohemian Rhapsody but different",
      };

      const result = await complianceService.checkCompliance(input);

      expect(result.overallLevel).toBe("warning");
      expect(result.hasIssues()).toBe(true);
      expect(result.hasCriticalIssues()).toBe(true);

      const copyrightIssues = result.getIssuesByCategory("copyright");
      expect(copyrightIssues.length).toBeGreaterThan(0);
      expect(copyrightIssues[0].level).toBe("warning");
    });

    it("アーティスト名を含むコンテンツは注意される", async () => {
      const input: ComplianceCheckInput = {
        prompt: "beatles style, paul mccartney vocals",
        description: "Inspired by The Beatles",
      };

      const result = await complianceService.checkCompliance(input);

      expect(result.overallLevel).toBe("caution");
      expect(result.hasIssues()).toBe(true);

      const copyrightIssues = result.getIssuesByCategory("copyright");
      expect(copyrightIssues.length).toBeGreaterThan(0);
      expect(copyrightIssues[0].level).toBe("caution");
    });

    it("商標を含むコンテンツは注意される", async () => {
      const input: ComplianceCheckInput = {
        prompt: "coca-cola jingle style",
        lyrics: "Drinking Pepsi while listening to Spotify",
      };

      const result = await complianceService.checkCompliance(input);

      expect(result.hasIssues()).toBe(true);

      const trademarkIssues = result.getIssuesByCategory("trademark");
      expect(trademarkIssues.length).toBeGreaterThan(0);
    });

    it("不適切なコンテンツは警告される", async () => {
      const input: ComplianceCheckInput = {
        prompt: "violent music",
        lyrics: "Violence and hate in the world",
        tags: ["explicit", "violent"],
      };

      const result = await complianceService.checkCompliance(input);

      expect(result.overallLevel).toBe("warning");
      expect(result.isSafeForPublicRelease()).toBe(false);

      const inappropriateIssues = result.getIssuesByCategory(
        "inappropriate_content"
      );
      expect(inappropriateIssues.length).toBeGreaterThan(0);
    });

    it("差別的表現は危険と判定される", async () => {
      const input: ComplianceCheckInput = {
        prompt: "racist content music",
        lyrics: "This contains racist content",
      };

      const result = await complianceService.checkCompliance(input);

      expect(result.overallLevel).toBe("unsafe");
      expect(result.isSafeForPublicRelease()).toBe(false);

      const inappropriateIssues = result.getIssuesByCategory(
        "inappropriate_content"
      );
      expect(
        inappropriateIssues.some((issue) => issue.level === "unsafe")
      ).toBe(true);
    });

    it("個人情報を含むコンテンツは危険と判定される", async () => {
      const input: ComplianceCheckInput = {
        prompt: "personal information song",
        lyrics: "Call me at 123-456-7890 or email test@example.com",
      };

      const result = await complianceService.checkCompliance(input);

      expect(result.overallLevel).toBe("unsafe");
      expect(result.isSafeForPublicRelease()).toBe(false);

      const privacyIssues = result.getIssuesByCategory("privacy");
      expect(privacyIssues.length).toBeGreaterThan(0);
      expect(privacyIssues[0].level).toBe("unsafe");
    });

    it("商用利用制限があるコンテンツは注意される", async () => {
      const input: ComplianceCheckInput = {
        prompt: "remix cover sample music",
        description: "A remix of existing track",
        tags: ["cover", "sample"],
      };

      const result = await complianceService.checkCompliance(input);

      expect(result.isSafeForCommercialUse()).toBe(false);

      const commercialIssues = result.getIssuesByCategory("commercial_use");
      expect(commercialIssues.length).toBeGreaterThan(0);
    });
  });

  describe("設定とカスタマイゼーション", () => {
    it("厳格モードではスコアがより厳しくなる", async () => {
      const strictService = new ComplianceService({ strictMode: true });
      const normalService = new ComplianceService({ strictMode: false });

      const input: ComplianceCheckInput = {
        prompt: "beatles style music",
      };

      const strictResult = await strictService.checkCompliance(input);
      const normalResult = await normalService.checkCompliance(input);

      expect(strictResult.score).toBeLessThan(normalResult.score);
    });

    it("特定カテゴリを無効にできる", async () => {
      const limitedService = new ComplianceService({
        enabledCategories: ["copyright"], // 著作権のみチェック
      });

      const input: ComplianceCheckInput = {
        prompt: "beatles style with coca-cola reference",
      };

      const result = await limitedService.checkCompliance(input);

      expect(result.getIssuesByCategory("copyright").length).toBeGreaterThan(0);
      expect(result.getIssuesByCategory("trademark").length).toBe(0);
    });

    it("カスタムルールを追加できる", async () => {
      complianceService.addCustomRule({
        category: "copyright",
        name: "Custom Song Check",
        description: "Custom song reference",
        keywords: ["my-custom-song"],
        severity: "warning",
        enabled: true,
      });

      const input: ComplianceCheckInput = {
        prompt: "inspired by my-custom-song",
      };

      const result = await complianceService.checkCompliance(input);

      expect(result.hasIssues()).toBe(true);
      const issues = result.getIssuesByCategory("copyright");
      expect(issues.some((issue) => issue.title === "Custom Song Check")).toBe(
        true
      );
    });

    it("カスタムルールを削除できる", async () => {
      complianceService.addCustomRule({
        category: "copyright",
        name: "Removable Rule",
        keywords: ["test-keyword"],
        severity: "caution",
        enabled: true,
        description: "Test rule",
      });

      complianceService.removeCustomRule("Removable Rule");

      const input: ComplianceCheckInput = {
        prompt: "test-keyword included",
      };

      const result = await complianceService.checkCompliance(input);
      expect(result.hasIssues()).toBe(false);
    });
  });

  describe("推奨事項とガイダンス", () => {
    it("問題なしの場合は適切な推奨事項を提供する", async () => {
      const input: ComplianceCheckInput = {
        prompt: "original peaceful instrumental",
      };

      const result = await complianceService.checkCompliance(input);

      expect(result.recommendations).toContain(
        "コンプライアンス上の問題は検出されませんでした。"
      );
      expect(result.recommendations).toContain("安全に公開できる状態です。");
    });

    it("重大な問題がある場合は緊急性を示す推奨事項を提供する", async () => {
      const input: ComplianceCheckInput = {
        prompt: "racist discriminatory music",
        lyrics: "racist and discriminatory content",
      };

      const result = await complianceService.checkCompliance(input);

      expect(result.recommendations.some((rec) => rec.includes("🚨"))).toBe(
        true
      );
      expect(
        result.recommendations.some((rec) => rec.includes("法的アドバイス"))
      ).toBe(true);
    });

    it("カテゴリ別の推奨事項を提供する", async () => {
      const input: ComplianceCheckInput = {
        prompt: "beatles style with coca-cola jingle",
      };

      const result = await complianceService.checkCompliance(input);

      const recommendations = result.recommendations.join(" ");
      expect(recommendations).toContain("著作権");
      expect(recommendations).toContain("商標");
    });

    it("多数の問題がある場合は全面見直しを推奨する", async () => {
      const input: ComplianceCheckInput = {
        title: "Beatles Coca-Cola Violent Song",
        prompt: "beatles coca-cola violent hate explicit murder",
        lyrics: "violence hate kill murder explicit racist content",
        tags: ["violent", "explicit", "racist"],
      };

      const result = await complianceService.checkCompliance(input);

      expect(
        result.recommendations.some((rec) => rec.includes("全面的な見直し"))
      ).toBe(true);
    });
  });

  describe("バッチ処理", () => {
    it("複数のコンテンツを一括チェックできる", async () => {
      const inputs: ComplianceCheckInput[] = [
        {
          prompt: "original peaceful music",
        },
        {
          prompt: "beatles style music",
        },
        {
          prompt: "violent and explicit content",
        },
      ];

      const results = await complianceService.batchCheckCompliance(inputs);

      expect(results).toHaveLength(3);
      expect(results[0].overallLevel).toBe("safe");
      expect(results[1].overallLevel).toBe("caution");
      expect(results[2].overallLevel).toBe("warning");
    });
  });

  describe("統計と分析", () => {
    it("アクティブなルール情報を取得できる", () => {
      const activeRules = complianceService.getActiveRulesInfo();

      expect(activeRules.length).toBeGreaterThan(0);
      expect(activeRules.every((rule) => rule.enabled)).toBe(true);
      expect(activeRules.some((rule) => rule.category === "copyright")).toBe(
        true
      );
      expect(activeRules.some((rule) => rule.category === "trademark")).toBe(
        true
      );
    });

    it("設定を更新できる", () => {
      complianceService.updateConfig({
        strictMode: true,
        enabledCategories: ["copyright", "trademark"],
      });

      const activeRules = complianceService.getActiveRulesInfo();
      const categories = new Set(activeRules.map((rule) => rule.category));

      expect(categories.has("copyright")).toBe(true);
      expect(categories.has("trademark")).toBe(true);
      expect(categories.has("inappropriate_content")).toBe(false);
    });
  });
});
