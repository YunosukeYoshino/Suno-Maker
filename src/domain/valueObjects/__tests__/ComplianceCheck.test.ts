import { describe, it, expect } from "vitest";
import {
  ComplianceCheck,
  type ComplianceIssue,
  type ComplianceCheckProps,
} from "../ComplianceCheck";

describe("ComplianceCheck", () => {
  const validIssue: ComplianceIssue = {
    category: "copyright",
    level: "warning",
    title: "Potential copyright issue",
    description: "This content may contain copyrighted material",
    suggestion: "Consider using original content or obtaining proper licensing",
    references: ["https://example.com/copyright-info"],
    affectedText: "specific text that triggered the issue",
  };

  const validProps: ComplianceCheckProps = {
    overallLevel: "caution",
    issues: [validIssue],
    score: 75,
    recommendations: ["Review content for potential issues"],
    checkedAt: new Date("2024-01-01"),
  };

  describe("create", () => {
    it("正常なパラメータでComplianceCheckを作成できる", () => {
      const check = ComplianceCheck.create(validProps);

      expect(check.overallLevel).toBe("caution");
      expect(check.issues).toHaveLength(1);
      expect(check.issues[0]).toEqual(validIssue);
      expect(check.score).toBe(75);
      expect(check.recommendations).toEqual([
        "Review content for potential issues",
      ]);
      expect(check.checkedAt).toEqual(new Date("2024-01-01"));
    });

    it("無効なスコアでエラーを投げる", () => {
      expect(() => {
        ComplianceCheck.create({ ...validProps, score: -1 });
      }).toThrow("コンプライアンススコアは0-100の範囲である必要があります");

      expect(() => {
        ComplianceCheck.create({ ...validProps, score: 101 });
      }).toThrow("コンプライアンススコアは0-100の範囲である必要があります");
    });

    it("無効なコンプライアンスレベルでエラーを投げる", () => {
      expect(() => {
        ComplianceCheck.create({
          ...validProps,
          overallLevel: "invalid" as any,
        });
      }).toThrow("無効なコンプライアンスレベルです");
    });

    it("無効な問題レベルでエラーを投げる", () => {
      const invalidIssue = { ...validIssue, level: "invalid" as any };
      expect(() => {
        ComplianceCheck.create({ ...validProps, issues: [invalidIssue] });
      }).toThrow("無効な問題レベル: invalid");
    });

    it("空の問題タイトルでエラーを投げる", () => {
      const invalidIssue = { ...validIssue, title: "" };
      expect(() => {
        ComplianceCheck.create({ ...validProps, issues: [invalidIssue] });
      }).toThrow("問題のタイトルは必須です");
    });

    it("空の問題説明でエラーを投げる", () => {
      const invalidIssue = { ...validIssue, description: "" };
      expect(() => {
        ComplianceCheck.create({ ...validProps, issues: [invalidIssue] });
      }).toThrow("問題の説明は必須です");
    });
  });

  describe("createSafe", () => {
    it("安全なComplianceCheckを作成できる", () => {
      const check = ComplianceCheck.createSafe();

      expect(check.overallLevel).toBe("safe");
      expect(check.issues).toHaveLength(0);
      expect(check.score).toBe(100);
      expect(check.recommendations).toContain(
        "コンプライアンス上の問題は検出されませんでした"
      );
      expect(check.checkedAt).toBeInstanceOf(Date);
    });
  });

  describe("createUnsafe", () => {
    it("安全でないComplianceCheckを作成できる", () => {
      const unsafeIssues: ComplianceIssue[] = [
        { ...validIssue, level: "unsafe" },
        { ...validIssue, level: "warning", category: "inappropriate_content" },
      ];

      const check = ComplianceCheck.createUnsafe(unsafeIssues);

      expect(check.overallLevel).toBe("unsafe");
      expect(check.issues).toHaveLength(2);
      expect(check.score).toBeLessThan(50);
      expect(check.recommendations).toContain(
        "重大なコンプライアンス問題が検出されました"
      );
    });
  });

  describe("分析メソッド", () => {
    it("hasIssues() - 問題があるかどうかを判定できる", () => {
      const checkWithIssues = ComplianceCheck.create(validProps);
      const checkWithoutIssues = ComplianceCheck.createSafe();

      expect(checkWithIssues.hasIssues()).toBe(true);
      expect(checkWithoutIssues.hasIssues()).toBe(false);
    });

    it("hasCriticalIssues() - 重大な問題があるかどうかを判定できる", () => {
      const criticalIssue = { ...validIssue, level: "unsafe" as const };
      const checkWithCritical = ComplianceCheck.create({
        ...validProps,
        issues: [criticalIssue],
      });
      const checkWithoutCritical = ComplianceCheck.create({
        ...validProps,
        issues: [{ ...validIssue, level: "caution" }],
      });

      expect(checkWithCritical.hasCriticalIssues()).toBe(true);
      expect(checkWithoutCritical.hasCriticalIssues()).toBe(false);
    });

    it("getIssuesByCategory() - カテゴリ別に問題を取得できる", () => {
      const copyrightIssue = { ...validIssue, category: "copyright" as const };
      const trademarkIssue = { ...validIssue, category: "trademark" as const };
      const check = ComplianceCheck.create({
        ...validProps,
        issues: [copyrightIssue, trademarkIssue],
      });

      const copyrightIssues = check.getIssuesByCategory("copyright");
      const trademarkIssues = check.getIssuesByCategory("trademark");

      expect(copyrightIssues).toHaveLength(1);
      expect(trademarkIssues).toHaveLength(1);
      expect(copyrightIssues[0].category).toBe("copyright");
    });

    it("getIssuesByLevel() - レベル別に問題を取得できる", () => {
      const warningIssue = { ...validIssue, level: "warning" as const };
      const cautionIssue = { ...validIssue, level: "caution" as const };
      const check = ComplianceCheck.create({
        ...validProps,
        issues: [warningIssue, cautionIssue],
      });

      const warningIssues = check.getIssuesByLevel("warning");
      const cautionIssues = check.getIssuesByLevel("caution");

      expect(warningIssues).toHaveLength(1);
      expect(cautionIssues).toHaveLength(1);
      expect(warningIssues[0].level).toBe("warning");
    });

    it("getCategoryCount() - カテゴリ別の問題数を取得できる", () => {
      const issues: ComplianceIssue[] = [
        { ...validIssue, category: "copyright" },
        { ...validIssue, category: "copyright" },
        { ...validIssue, category: "trademark" },
      ];
      const check = ComplianceCheck.create({ ...validProps, issues });

      const counts = check.getCategoryCount();

      expect(counts.copyright).toBe(2);
      expect(counts.trademark).toBe(1);
      expect(counts.inappropriate_content).toBe(0);
    });

    it("getLevelCount() - レベル別の問題数を取得できる", () => {
      const issues: ComplianceIssue[] = [
        { ...validIssue, level: "warning" },
        { ...validIssue, level: "warning" },
        { ...validIssue, level: "caution" },
      ];
      const check = ComplianceCheck.create({ ...validProps, issues });

      const counts = check.getLevelCount();

      expect(counts.warning).toBe(2);
      expect(counts.caution).toBe(1);
      expect(counts.unsafe).toBe(0);
    });
  });

  describe("安全性チェック", () => {
    it("isSafeForCommercialUse() - 商用利用の安全性を判定できる", () => {
      const safeCheck = ComplianceCheck.create({
        ...validProps,
        issues: [
          { ...validIssue, category: "cultural_sensitivity", level: "caution" },
        ],
      });
      const unsafeCheck = ComplianceCheck.create({
        ...validProps,
        issues: [
          { ...validIssue, category: "commercial_use", level: "warning" },
        ],
      });

      expect(safeCheck.isSafeForCommercialUse()).toBe(true);
      expect(unsafeCheck.isSafeForCommercialUse()).toBe(false);
    });

    it("isSafeForPublicRelease() - 公開の安全性を判定できる", () => {
      const safeCheck = ComplianceCheck.create({
        ...validProps,
        overallLevel: "caution",
        issues: [{ ...validIssue, category: "copyright", level: "caution" }],
      });
      const unsafeCheck = ComplianceCheck.create({
        ...validProps,
        overallLevel: "unsafe",
        issues: [
          {
            ...validIssue,
            category: "inappropriate_content",
            level: "warning",
          },
        ],
      });

      expect(safeCheck.isSafeForPublicRelease()).toBe(true);
      expect(unsafeCheck.isSafeForPublicRelease()).toBe(false);
    });

    it("getLevelScore() - レベルの数値評価を取得できる", () => {
      const safeCheck = ComplianceCheck.createSafe();
      const cautionCheck = ComplianceCheck.create({
        ...validProps,
        overallLevel: "caution",
      });
      const warningCheck = ComplianceCheck.create({
        ...validProps,
        overallLevel: "warning",
      });
      const unsafeCheck = ComplianceCheck.create({
        ...validProps,
        overallLevel: "unsafe",
      });

      expect(safeCheck.getLevelScore()).toBe(100);
      expect(cautionCheck.getLevelScore()).toBe(75);
      expect(warningCheck.getLevelScore()).toBe(50);
      expect(unsafeCheck.getLevelScore()).toBe(25);
    });
  });

  describe("withResolvedIssue", () => {
    it("問題を解決した新しいComplianceCheckを作成できる", () => {
      const multipleIssues: ComplianceIssue[] = [
        { ...validIssue, level: "warning" },
        { ...validIssue, level: "caution", category: "trademark" },
      ];
      const check = ComplianceCheck.create({
        ...validProps,
        overallLevel: "warning",
        issues: multipleIssues,
      });

      const resolvedCheck = check.withResolvedIssue(0); // 最初の問題を解決

      expect(resolvedCheck.issues).toHaveLength(1);
      expect(resolvedCheck.issues[0].category).toBe("trademark");
      expect(resolvedCheck.overallLevel).toBe("caution");
      expect(resolvedCheck.score).toBeGreaterThan(check.score);
    });

    it("無効なインデックスでエラーを投げる", () => {
      const check = ComplianceCheck.create(validProps);

      expect(() => check.withResolvedIssue(-1)).toThrow(
        "無効な問題インデックスです"
      );
      expect(() => check.withResolvedIssue(10)).toThrow(
        "無効な問題インデックスです"
      );
    });
  });

  describe("toJSON", () => {
    it("JSON形式で出力できる", () => {
      const check = ComplianceCheck.create(validProps);
      const json = check.toJSON();

      expect(json).toHaveProperty("overallLevel", "caution");
      expect(json).toHaveProperty("issues");
      expect(json).toHaveProperty("score", 75);
      expect(json).toHaveProperty("recommendations");
      expect(json).toHaveProperty("checkedAt");
      expect(json).toHaveProperty("analysis");
      expect((json as any).analysis).toHaveProperty("hasIssues", true);
      expect((json as any).analysis).toHaveProperty("hasCriticalIssues", true);
    });
  });

  describe("equals", () => {
    it("同じ内容のComplianceCheckは等価", () => {
      const check1 = ComplianceCheck.create(validProps);
      const check2 = ComplianceCheck.create(validProps);

      expect(check1.equals(check2)).toBe(true);
    });

    it("異なる内容のComplianceCheckは非等価", () => {
      const check1 = ComplianceCheck.create(validProps);
      const check2 = ComplianceCheck.create({ ...validProps, score: 80 });

      expect(check1.equals(check2)).toBe(false);
    });
  });
});
