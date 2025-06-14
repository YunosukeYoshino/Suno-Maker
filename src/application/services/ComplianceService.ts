import {
  type ComplianceCategory,
  ComplianceCheck,
  type ComplianceIssue,
  type ComplianceLevel,
} from "../../domain/valueObjects/ComplianceCheck";

export interface ComplianceCheckInput {
  title?: string;
  description?: string;
  prompt: string;
  lyrics?: string;
  tags?: string[];
  genre?: string;
  language?: string;
}

export interface ComplianceRule {
  category: ComplianceCategory;
  name: string;
  description: string;
  pattern?: RegExp;
  keywords?: string[];
  severity: ComplianceLevel;
  enabled: boolean;
}

export interface ComplianceServiceConfig {
  strictMode: boolean;
  enabledCategories: ComplianceCategory[];
  customRules?: ComplianceRule[];
}

export class ComplianceService {
  private readonly config: ComplianceServiceConfig;
  private readonly builtInRules: ComplianceRule[];

  constructor(config?: Partial<ComplianceServiceConfig>) {
    this.config = {
      strictMode: false,
      enabledCategories: [
        "copyright",
        "trademark",
        "inappropriate_content",
        "commercial_use",
        "privacy",
        "cultural_sensitivity",
      ],
      ...config,
    };

    this.builtInRules = this.initializeBuiltInRules();
  }

  private initializeBuiltInRules(): ComplianceRule[] {
    return [
      // 著作権関連
      {
        category: "copyright",
        name: "楽曲タイトル言及",
        description: "既存の楽曲タイトルが含まれている可能性があります",
        keywords: [
          "bohemian rhapsody",
          "imagine",
          "yesterday",
          "hey jude",
          "hotel california",
          "smells like teen spirit",
          "billie jean",
          "like a rolling stone",
          "purple haze",
          "stairway to heaven",
          "sweet child o mine",
        ],
        severity: "warning",
        enabled: true,
      },
      {
        category: "copyright",
        name: "アーティスト名言及",
        description: "著名なアーティスト名が含まれています",
        keywords: [
          "beatles",
          "elvis",
          "madonna",
          "michael jackson",
          "prince",
          "bob dylan",
          "rolling stones",
          "led zeppelin",
          "queen",
          "taylor swift",
          "beyonce",
          "eminem",
        ],
        severity: "caution",
        enabled: true,
      },
      {
        category: "copyright",
        name: "歌詞の直接引用",
        description: "既存楽曲の歌詞の直接引用の可能性があります",
        pattern: /["'].*["']/g,
        severity: "warning",
        enabled: true,
      },

      // 商標関連
      {
        category: "trademark",
        name: "企業ブランド名",
        description: "登録商標が含まれている可能性があります",
        keywords: [
          "coca-cola",
          "pepsi",
          "nike",
          "adidas",
          "apple",
          "google",
          "facebook",
          "instagram",
          "twitter",
          "youtube",
          "spotify",
          "netflix",
          "disney",
          "mcdonald",
          "starbucks",
        ],
        severity: "caution",
        enabled: true,
      },

      // 不適切なコンテンツ
      {
        category: "inappropriate_content",
        name: "暴力的表現",
        description: "暴力的な表現が含まれています",
        keywords: ["kill", "murder", "violence", "blood", "death", "hate"],
        severity: "warning",
        enabled: true,
      },
      {
        category: "inappropriate_content",
        name: "差別的表現",
        description: "差別的な表現が含まれている可能性があります",
        keywords: ["racist", "sexist", "discrimination", "prejudice"],
        severity: "unsafe",
        enabled: true,
      },
      {
        category: "inappropriate_content",
        name: "成人向けコンテンツ",
        description: "成人向けの内容が含まれている可能性があります",
        keywords: ["explicit", "adult", "sexual", "nsfw"],
        severity: "warning",
        enabled: true,
      },

      // 商用利用関連
      {
        category: "commercial_use",
        name: "商用利用制限",
        description: "商用利用に制限がある可能性があります",
        keywords: ["sample", "cover", "remix", "tribute", "parody"],
        severity: "caution",
        enabled: true,
      },

      // プライバシー関連
      {
        category: "privacy",
        name: "個人情報",
        description: "個人情報が含まれている可能性があります",
        pattern:
          /\b\d{3}-\d{4}-\d{4}\b|\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        severity: "unsafe",
        enabled: true,
      },

      // 文化的配慮
      {
        category: "cultural_sensitivity",
        name: "文化的ステレオタイプ",
        description: "文化的ステレオタイプを含む可能性があります",
        keywords: ["stereotype", "cultural appropriation", "offensive"],
        severity: "caution",
        enabled: true,
      },
      {
        category: "cultural_sensitivity",
        name: "宗教的配慮",
        description: "宗教的な配慮が必要な内容が含まれています",
        keywords: ["religious", "sacred", "holy", "blasphemy"],
        severity: "caution",
        enabled: true,
      },
    ];
  }

  async checkCompliance(input: ComplianceCheckInput): Promise<ComplianceCheck> {
    const issues: ComplianceIssue[] = [];

    // 全テキストを結合して検査
    const allText = [
      input.title || "",
      input.description || "",
      input.prompt,
      input.lyrics || "",
      ...(input.tags || []),
    ]
      .join(" ")
      .toLowerCase();

    // アクティブなルールを取得
    const activeRules = this.getActiveRules();

    // 各ルールでチェック
    for (const rule of activeRules) {
      const ruleIssues = await this.checkRule(rule, allText, input);
      issues.push(...ruleIssues);
    }

    // 全体的なレベルとスコアを計算
    const overallLevel = this.calculateOverallLevel(issues);
    const score = this.calculateComplianceScore(issues);
    const recommendations = this.generateRecommendations(issues, overallLevel);

    return ComplianceCheck.create({
      overallLevel,
      issues,
      score,
      recommendations,
      checkedAt: new Date(),
    });
  }

  private getActiveRules(): ComplianceRule[] {
    return [...this.builtInRules, ...(this.config.customRules || [])].filter(
      (rule) =>
        rule.enabled && this.config.enabledCategories.includes(rule.category)
    );
  }

  private async checkRule(
    rule: ComplianceRule,
    text: string,
    input: ComplianceCheckInput
  ): Promise<ComplianceIssue[]> {
    const issues: ComplianceIssue[] = [];

    // キーワードベースのチェック
    if (rule.keywords) {
      for (const keyword of rule.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          const affectedText = this.extractAffectedText(text, keyword);
          issues.push({
            category: rule.category,
            level: rule.severity,
            title: rule.name,
            description: `"${keyword}"が検出されました: ${rule.description}`,
            suggestion: this.generateSuggestion(rule.category, keyword),
            affectedText,
          });
        }
      }
    }

    // 正規表現ベースのチェック
    if (rule.pattern) {
      const matches = text.match(rule.pattern);
      if (matches) {
        for (const match of matches) {
          issues.push({
            category: rule.category,
            level: rule.severity,
            title: rule.name,
            description: rule.description,
            suggestion: this.generateSuggestion(rule.category, match),
            affectedText: match,
          });
        }
      }
    }

    return issues;
  }

  private extractAffectedText(text: string, keyword: string): string {
    const index = text.toLowerCase().indexOf(keyword.toLowerCase());
    if (index === -1) return keyword;

    const start = Math.max(0, index - 20);
    const end = Math.min(text.length, index + keyword.length + 20);
    const context = text.substring(start, end);

    return start > 0 ? `...${context}` : context;
  }

  private generateSuggestion(
    category: ComplianceCategory,
    trigger: string
  ): string {
    switch (category) {
      case "copyright":
        return `"${trigger}"の使用は著作権侵害の可能性があります。オリジナルの表現を使用するか、適切な許可を取得してください。`;

      case "trademark":
        return `"${trigger}"は登録商標の可能性があります。商標の使用を避けるか、適切な許可を取得してください。`;

      case "inappropriate_content":
        return `"${trigger}"は不適切なコンテンツとして認識される可能性があります。より適切な表現に変更してください。`;

      case "commercial_use":
        return `"${trigger}"は商用利用に制限がある可能性があります。ライセンス条件を確認してください。`;

      case "privacy":
        return "個人情報が含まれている可能性があります。個人を特定できる情報を削除してください。";

      case "cultural_sensitivity":
        return `"${trigger}"は文化的配慮が必要な表現です。より包括的で敬意を示す表現を検討してください。`;

      default:
        return `"${trigger}"について確認が必要です。`;
    }
  }

  private calculateOverallLevel(issues: ComplianceIssue[]): ComplianceLevel {
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

  private calculateComplianceScore(issues: ComplianceIssue[]): number {
    let score = 100;

    const severityPenalties = {
      unsafe: 30,
      warning: 20,
      caution: 10,
      safe: 5,
    };

    for (const issue of issues) {
      score -= severityPenalties[issue.level];
    }

    // 厳格モードでは追加ペナルティ
    if (this.config.strictMode) {
      score -= issues.length * 5;
    }

    return Math.max(0, score);
  }

  private generateRecommendations(
    issues: ComplianceIssue[],
    level: ComplianceLevel
  ): string[] {
    const recommendations: string[] = [];

    if (issues.length === 0) {
      recommendations.push("コンプライアンス上の問題は検出されませんでした。");
      recommendations.push("安全に公開できる状態です。");
      return recommendations;
    }

    // レベル別の基本推奨事項
    switch (level) {
      case "unsafe":
        recommendations.push("🚨 重大なコンプライアンス問題が検出されました。");
        recommendations.push("公開前に必ず問題を解決してください。");
        recommendations.push(
          "必要に応じて法的アドバイスを求めることを強く推奨します。"
        );
        break;

      case "warning":
        recommendations.push("⚠️ 警告レベルの問題が検出されました。");
        recommendations.push("問題を解決してから公開することを推奨します。");
        break;

      case "caution":
        recommendations.push("⚡ 注意が必要な点が検出されました。");
        recommendations.push("内容を確認し、必要に応じて修正してください。");
        break;
    }

    // カテゴリ別の推奨事項
    const categoryCounts = issues.reduce(
      (counts, issue) => {
        counts[issue.category] = (counts[issue.category] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>
    );

    if (categoryCounts.copyright > 0) {
      recommendations.push(
        "📚 著作権: オリジナルコンテンツの使用を推奨します。"
      );
    }
    if (categoryCounts.trademark > 0) {
      recommendations.push(
        "🏷️ 商標: 商標権を侵害しない表現に変更してください。"
      );
    }
    if (categoryCounts.inappropriate_content > 0) {
      recommendations.push(
        "🚫 不適切コンテンツ: より適切な表現に修正してください。"
      );
    }
    if (categoryCounts.commercial_use > 0) {
      recommendations.push("💼 商用利用: ライセンス条件を確認してください。");
    }
    if (categoryCounts.privacy > 0) {
      recommendations.push("🔒 プライバシー: 個人情報を削除してください。");
    }
    if (categoryCounts.cultural_sensitivity > 0) {
      recommendations.push(
        "🌍 文化的配慮: より包括的な表現を検討してください。"
      );
    }

    // 一般的な推奨事項
    if (issues.length > 5) {
      recommendations.push(
        "多数の問題が検出されました。内容の全面的な見直しを推奨します。"
      );
    }

    return recommendations;
  }

  // 設定管理メソッド
  updateConfig(newConfig: Partial<ComplianceServiceConfig>): void {
    Object.assign(this.config, newConfig);
  }

  addCustomRule(rule: ComplianceRule): void {
    if (!this.config.customRules) {
      this.config.customRules = [];
    }
    this.config.customRules.push(rule);
  }

  removeCustomRule(name: string): void {
    if (this.config.customRules) {
      this.config.customRules = this.config.customRules.filter(
        (rule) => rule.name !== name
      );
    }
  }

  getActiveRulesInfo(): ComplianceRule[] {
    return this.getActiveRules();
  }

  // バッチ処理
  async checkMultipleContents(
    inputs: ComplianceCheckInput[]
  ): Promise<ComplianceCheck[]> {
    const results: ComplianceCheck[] = [];

    for (const input of inputs) {
      const check = await this.checkCompliance(input);
      results.push(check);
    }

    return results;
  }
}
