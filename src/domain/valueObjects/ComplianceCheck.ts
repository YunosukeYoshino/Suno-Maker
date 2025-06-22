export type ComplianceLevel = "safe" | "caution" | "warning" | "unsafe";
export type ComplianceCategory =
  | "copyright"
  | "trademark"
  | "inappropriate_content"
  | "commercial_use"
  | "privacy"
  | "cultural_sensitivity";

export interface ComplianceIssue {
  category: ComplianceCategory;
  level: ComplianceLevel;
  title: string;
  description: string;
  suggestion?: string;
  references?: string[];
  affectedText?: string;
}

export interface ComplianceCheckProps {
  overallLevel: ComplianceLevel;
  issues: ComplianceIssue[];
  score: number; // 0-100 (100 = fully compliant)
  recommendations: string[];
  checkedAt: Date;
}

export class ComplianceCheck {
  private readonly _overallLevel: ComplianceLevel;
  private readonly _issues: ComplianceIssue[];
  private readonly _score: number;
  private readonly _recommendations: string[];
  private readonly _checkedAt: Date;

  private constructor(props: ComplianceCheckProps) {
    this._overallLevel = props.overallLevel;
    this._issues = [...props.issues];
    this._score = props.score;
    this._recommendations = [...props.recommendations];
    this._checkedAt = props.checkedAt;

    Object.freeze(this);
    Object.freeze(this._issues);
    Object.freeze(this._recommendations);
  }

  static create(props: ComplianceCheckProps): ComplianceCheck {
    // バリデーション
    if (props.score < 0 || props.score > 100) {
      throw new Error(
        "コンプライアンススコアは0-100の範囲である必要があります"
      );
    }

    const validLevels: ComplianceLevel[] = [
      "safe",
      "caution",
      "warning",
      "unsafe",
    ];
    if (!validLevels.includes(props.overallLevel)) {
      throw new Error("無効なコンプライアンスレベルです");
    }

    // issues配列の検証
    for (const issue of props.issues) {
      if (!validLevels.includes(issue.level)) {
        throw new Error(`無効な問題レベル: ${issue.level}`);
      }
      if (!issue.title || issue.title.trim() === "") {
        throw new Error("問題のタイトルは必須です");
      }
      if (!issue.description || issue.description.trim() === "") {
        throw new Error("問題の説明は必須です");
      }
    }

    return new ComplianceCheck(props);
  }

  // 空のコンプライアンスチェック（問題なし）
  static createSafe(): ComplianceCheck {
    return new ComplianceCheck({
      overallLevel: "safe",
      issues: [],
      score: 100,
      recommendations: ["コンプライアンス上の問題は検出されませんでした"],
      checkedAt: new Date(),
    });
  }

  // 重大な問題があるコンプライアンスチェック
  static createUnsafe(issues: ComplianceIssue[]): ComplianceCheck {
    const recommendations = [
      "重大なコンプライアンス問題が検出されました",
      "コンテンツの見直しを強く推奨します",
      "必要に応じて法的アドバイスを求めてください",
    ];

    return new ComplianceCheck({
      overallLevel: "unsafe",
      issues,
      score: Math.max(0, 50 - issues.length * 10),
      recommendations,
      checkedAt: new Date(),
    });
  }

  // ゲッター
  get overallLevel(): ComplianceLevel {
    return this._overallLevel;
  }

  get issues(): ComplianceIssue[] {
    return [...this._issues];
  }

  get score(): number {
    return this._score;
  }

  get recommendations(): string[] {
    return [...this._recommendations];
  }

  get checkedAt(): Date {
    return this._checkedAt;
  }

  // 分析メソッド
  hasIssues(): boolean {
    return this._issues.length > 0;
  }

  hasCriticalIssues(): boolean {
    return this._issues.some(
      (issue) => issue.level === "unsafe" || issue.level === "warning"
    );
  }

  getIssuesByCategory(category: ComplianceCategory): ComplianceIssue[] {
    return this._issues.filter((issue) => issue.category === category);
  }

  getIssuesByLevel(level: ComplianceLevel): ComplianceIssue[] {
    return this._issues.filter((issue) => issue.level === level);
  }

  getCategoryCount(): Record<ComplianceCategory, number> {
    const counts: Record<ComplianceCategory, number> = {
      copyright: 0,
      trademark: 0,
      inappropriate_content: 0,
      commercial_use: 0,
      privacy: 0,
      cultural_sensitivity: 0,
    };

    for (const issue of this._issues) {
      counts[issue.category]++;
    }

    return counts;
  }

  getLevelCount(): Record<ComplianceLevel, number> {
    const counts: Record<ComplianceLevel, number> = {
      safe: 0,
      caution: 0,
      warning: 0,
      unsafe: 0,
    };

    for (const issue of this._issues) {
      counts[issue.level]++;
    }

    return counts;
  }

  // 商用利用の安全性チェック
  isSafeForCommercialUse(): boolean {
    const commercialIssues = this.getIssuesByCategory("commercial_use");
    const copyrightIssues = this.getIssuesByCategory("copyright");
    const trademarkIssues = this.getIssuesByCategory("trademark");

    return (
      commercialIssues.length === 0 &&
      copyrightIssues.every(
        (issue) => issue.level === "safe" || issue.level === "caution"
      ) &&
      trademarkIssues.every(
        (issue) => issue.level === "safe" || issue.level === "caution"
      )
    );
  }

  // 公開の安全性チェック
  isSafeForPublicRelease(): boolean {
    const inappropriateIssues = this.getIssuesByCategory(
      "inappropriate_content"
    );
    const culturalIssues = this.getIssuesByCategory("cultural_sensitivity");
    const privacyIssues = this.getIssuesByCategory("privacy");

    return (
      inappropriateIssues.length === 0 &&
      culturalIssues.every(
        (issue) => issue.level === "safe" || issue.level === "caution"
      ) &&
      privacyIssues.length === 0 &&
      this._overallLevel !== "unsafe"
    );
  }

  // コンプライアンスレベルの数値評価
  getLevelScore(): number {
    switch (this._overallLevel) {
      case "safe":
        return 100;
      case "caution":
        return 75;
      case "warning":
        return 50;
      case "unsafe":
        return 25;
      default:
        return 0;
    }
  }

  // 改善された判定での新しいComplianceCheckを作成
  withResolvedIssue(issueIndex: number): ComplianceCheck {
    if (issueIndex < 0 || issueIndex >= this._issues.length) {
      throw new Error("無効な問題インデックスです");
    }

    const newIssues = this._issues.filter((_, index) => index !== issueIndex);
    const newScore = this.calculateScoreFromIssues(newIssues);
    const newLevel = this.calculateLevelFromIssues(newIssues);
    const newRecommendations = this.generateRecommendations(
      newIssues,
      newLevel
    );

    return new ComplianceCheck({
      overallLevel: newLevel,
      issues: newIssues,
      score: newScore,
      recommendations: newRecommendations,
      checkedAt: new Date(),
    });
  }

  private calculateScoreFromIssues(issues: ComplianceIssue[]): number {
    let score = 100;

    for (const issue of issues) {
      switch (issue.level) {
        case "unsafe":
          score -= 30;
          break;
        case "warning":
          score -= 20;
          break;
        case "caution":
          score -= 10;
          break;
        case "safe":
          // Safe issues don't reduce score
          break;
      }
    }

    return Math.max(0, score);
  }

  private calculateLevelFromIssues(issues: ComplianceIssue[]): ComplianceLevel {
    if (issues.some((issue) => issue.level === "unsafe")) {
      return "unsafe";
    }
    if (issues.some((issue) => issue.level === "warning")) {
      return "warning";
    }
    if (issues.some((issue) => issue.level === "caution")) {
      return "caution";
    }
    return "safe";
  }

  private generateRecommendations(
    issues: ComplianceIssue[],
    level: ComplianceLevel
  ): string[] {
    const recommendations: string[] = [];

    if (issues.length === 0) {
      recommendations.push("コンプライアンス上の問題は検出されませんでした");
      return recommendations;
    }

    const categoryCounts = issues.reduce(
      (counts, issue) => {
        counts[issue.category] = (counts[issue.category] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>
    );

    // カテゴリ別の推奨事項
    if (categoryCounts.copyright > 0) {
      recommendations.push(
        "著作権に関する問題を確認し、必要に応じて権利者の許可を取得してください"
      );
    }
    if (categoryCounts.trademark > 0) {
      recommendations.push(
        "商標権に関する問題を確認し、商標の使用を避けるか適切な許可を取得してください"
      );
    }
    if (categoryCounts.inappropriate_content > 0) {
      recommendations.push("不適切なコンテンツを修正または削除してください");
    }
    if (categoryCounts.commercial_use > 0) {
      recommendations.push(
        "商用利用に関する制限を確認し、必要な手続きを行ってください"
      );
    }
    if (categoryCounts.privacy > 0) {
      recommendations.push(
        "プライバシーに関する問題を解決し、個人情報の取り扱いを適切に行ってください"
      );
    }
    if (categoryCounts.cultural_sensitivity > 0) {
      recommendations.push(
        "文化的配慮に関する問題を見直し、より適切な表現に変更してください"
      );
    }

    // レベル別の推奨事項
    switch (level) {
      case "unsafe":
        recommendations.push(
          "重大な問題があります。公開前に必ず修正してください"
        );
        break;
      case "warning":
        recommendations.push(
          "警告レベルの問題があります。可能な限り修正することを推奨します"
        );
        break;
      case "caution":
        recommendations.push(
          "注意が必要な点があります。確認して判断してください"
        );
        break;
    }

    return recommendations;
  }

  // JSON形式での出力
  toJSON(): object {
    return {
      overallLevel: this._overallLevel,
      issues: this._issues,
      score: this._score,
      recommendations: this._recommendations,
      checkedAt: this._checkedAt.toISOString(),
      analysis: {
        hasIssues: this.hasIssues(),
        hasCriticalIssues: this.hasCriticalIssues(),
        isSafeForCommercialUse: this.isSafeForCommercialUse(),
        isSafeForPublicRelease: this.isSafeForPublicRelease(),
        categoryCount: this.getCategoryCount(),
        levelCount: this.getLevelCount(),
      },
    };
  }

  equals(other: ComplianceCheck): boolean {
    return (
      this._overallLevel === other._overallLevel &&
      this._score === other._score &&
      this._issues.length === other._issues.length &&
      this._issues.every(
        (issue, index) =>
          JSON.stringify(issue) === JSON.stringify(other._issues[index])
      )
    );
  }
}
