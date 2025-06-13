import { Lyrics } from "@/domain/entities/Lyrics";
import type { ILyricsRepository } from "@/domain/repositories/ILyricsRepository";
import { Language } from "@/domain/valueObjects/Language";
import {
  LyricsStructure,
  type StructureTemplate,
} from "@/domain/valueObjects/LyricsStructure";

export interface OptimizeLyricsInput {
  lyrics: string;
  language: string;
  targetStructure?: StructureTemplate;
  optimizationOptions?: {
    autoInsertTags: boolean;
    optimizeForJapanese: boolean;
    optimizeForSuno: boolean;
    maxLength: number;
    enforceStructure: boolean;
  };
}

export interface OptimizeLyricsOutput {
  optimizedLyrics: Lyrics;
  structure: LyricsStructure;
  optimizations: string[];
  warnings: string[];
  suggestions: string[];
  qualityScore: number;
}

export interface JapaneseOptimizationService {
  optimizeForPronunciation(text: string): Promise<{
    optimizedText: string;
    changes: Array<{
      original: string;
      optimized: string;
      reason: string;
    }>;
  }>;

  suggestHiraganaUsage(text: string): Promise<{
    suggestions: Array<{
      kanji: string;
      hiragana: string;
      position: number;
      recommendation: "strong" | "moderate" | "optional";
    }>;
  }>;
}

export interface SunoOptimizationService {
  validateForSuno(lyrics: Lyrics): Promise<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  }>;

  optimizeLength(lyrics: Lyrics): Promise<{
    optimizedLyrics: Lyrics;
    changes: string[];
  }>;
}

export class OptimizeLyricsUseCase {
  constructor(
    private lyricsRepository: ILyricsRepository,
    private japaneseOptimizationService?: JapaneseOptimizationService,
    private sunoOptimizationService?: SunoOptimizationService
  ) {}

  async execute(input: OptimizeLyricsInput): Promise<OptimizeLyricsOutput> {
    // 入力バリデーション
    this.validateInput(input);

    const language = Language.create(input.language);

    // デフォルトオプション設定
    const options = {
      autoInsertTags: true,
      optimizeForJapanese: language.value === "ja",
      optimizeForSuno: true,
      maxLength: 3000,
      enforceStructure: false,
      ...input.optimizationOptions,
    };

    const optimizations: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let processedText = input.lyrics;

    // 1. 構造タグの自動挿入
    if (options.autoInsertTags) {
      const tagResult = this.autoInsertStructureTags(
        processedText,
        input.targetStructure
      );
      processedText = tagResult.text;
      optimizations.push(...tagResult.optimizations);
      suggestions.push(...tagResult.suggestions);
    }

    // 2. 歌詞構造の解析
    const structure = LyricsStructure.fromText(processedText);
    const structureAnalysis = structure.getAnalysis();
    warnings.push(...structureAnalysis.warnings);

    // 3. 言語固有の最適化
    if (options.optimizeForJapanese && language.value === "ja") {
      const japaneseResult = await this.optimizeForJapanese(processedText);
      processedText = japaneseResult.text;
      optimizations.push(...japaneseResult.optimizations);
      suggestions.push(...japaneseResult.suggestions);
    }

    // 4. 文字数制限チェック
    if (processedText.length > options.maxLength) {
      warnings.push(
        `文字数が上限を超えています（${processedText.length}/${options.maxLength}文字）`
      );

      // 自動短縮を試行
      const shortenResult = this.shortenLyrics(
        processedText,
        options.maxLength
      );
      processedText = shortenResult.text;
      optimizations.push(...shortenResult.optimizations);
    }

    // 5. Suno特有の最適化
    let finalLyrics = Lyrics.create({
      title: `optimized_lyrics_${Date.now()}`,
      content: processedText,
      language: language,
    });

    if (options.optimizeForSuno) {
      const sunoResult = await this.optimizeForSuno(finalLyrics);
      finalLyrics = sunoResult.lyrics;
      optimizations.push(...sunoResult.optimizations);
      warnings.push(...sunoResult.warnings);
    }

    // 6. 品質スコア計算
    const qualityScore = this.calculateQualityScore(finalLyrics, structure, {
      hasOptimizations: optimizations.length > 0,
      warningCount: warnings.length,
      structureComplexity: structureAnalysis.totalSections,
    });

    // 7. リポジトリに保存
    await this.lyricsRepository.save(finalLyrics);

    return {
      optimizedLyrics: finalLyrics,
      structure,
      optimizations,
      warnings,
      suggestions,
      qualityScore,
    };
  }

  private validateInput(input: OptimizeLyricsInput): void {
    if (!input.lyrics || input.lyrics.trim().length === 0) {
      throw new Error("歌詞が入力されていません");
    }

    if (input.lyrics.length > 10000) {
      throw new Error("歌詞が長すぎます（最大10,000文字）");
    }

    try {
      Language.create(input.language);
    } catch (error) {
      throw new Error("無効な言語です");
    }
  }

  private autoInsertStructureTags(
    text: string,
    targetStructure?: StructureTemplate
  ): { text: string; optimizations: string[]; suggestions: string[] } {
    const lines = text.split("\n");
    const optimizations: string[] = [];
    const suggestions: string[] = [];

    // 既にタグがある場合はスキップ
    if (text.includes("[") && text.includes("]")) {
      return { text, optimizations, suggestions };
    }

    // シンプルな構造推定アルゴリズム
    const sections: string[] = [];
    let currentSection: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine === "") {
        if (currentSection.length > 0) {
          sections.push(currentSection.join("\n"));
          currentSection = [];
        }
      } else {
        currentSection.push(trimmedLine);
      }
    }

    if (currentSection.length > 0) {
      sections.push(currentSection.join("\n"));
    }

    // 構造タグの自動挿入
    let taggedText = "";

    if (targetStructure) {
      // 指定テンプレートに基づく挿入
      const templateSections = targetStructure.sections;

      for (
        let i = 0;
        i < Math.min(sections.length, templateSections.length);
        i++
      ) {
        const sectionType = templateSections[i];
        const tagName = this.getSectionTagName(sectionType);
        taggedText += `[${tagName}]\n${sections[i]}`;

        if (i < sections.length - 1) {
          taggedText += "\n\n";
        }
      }

      optimizations.push(
        `${targetStructure.name}テンプレートに基づいてタグを挿入しました`
      );
    } else {
      // 自動推定による挿入
      for (let i = 0; i < sections.length; i++) {
        let sectionType: string;

        if (i === 0) {
          sectionType = sections.length > 3 ? "Intro" : "Verse";
        } else if (i === sections.length - 1 && sections.length > 3) {
          sectionType = "Outro";
        } else if (i % 2 === 1) {
          sectionType = "Chorus";
        } else if (
          i === Math.floor(sections.length * 0.7) &&
          sections.length > 4
        ) {
          sectionType = "Bridge";
        } else {
          sectionType = "Verse";
        }

        taggedText += `[${sectionType}]\n${sections[i]}`;

        if (i < sections.length - 1) {
          taggedText += "\n\n";
        }
      }

      optimizations.push("歌詞構造を分析してタグを自動挿入しました");
      suggestions.push(
        "構造をより正確にするため、手動でタグを調整することを推奨します"
      );
    }

    return { text: taggedText, optimizations, suggestions };
  }

  private getSectionTagName(type: string): string {
    const tagNames: Record<string, string> = {
      intro: "Intro",
      verse: "Verse",
      chorus: "Chorus",
      bridge: "Bridge",
      outro: "Outro",
      "pre-chorus": "Pre-Chorus",
      "post-chorus": "Post-Chorus",
      instrumental: "Instrumental",
      "ad-lib": "Ad-lib",
      hook: "Hook",
    };

    return tagNames[type] || "Verse";
  }

  private async optimizeForJapanese(text: string): Promise<{
    text: string;
    optimizations: string[];
    suggestions: string[];
  }> {
    const optimizations: string[] = [];
    const suggestions: string[] = [];
    let optimizedText = text;

    if (this.japaneseOptimizationService) {
      // 発音最適化
      const pronunciationResult =
        await this.japaneseOptimizationService.optimizeForPronunciation(text);
      optimizedText = pronunciationResult.optimizedText;

      if (pronunciationResult.changes.length > 0) {
        optimizations.push(
          `発音最適化: ${pronunciationResult.changes.length}箇所を修正`
        );
      }

      // ひらがな使用提案
      const hiraganaResult =
        await this.japaneseOptimizationService.suggestHiraganaUsage(
          optimizedText
        );

      const strongRecommendations = hiraganaResult.suggestions.filter(
        (s) => s.recommendation === "strong"
      );
      if (strongRecommendations.length > 0) {
        suggestions.push(
          `以下の漢字をひらがなに変更することを強く推奨: ${strongRecommendations.map((s) => s.kanji).join(", ")}`
        );
      }
    } else {
      // 基本的な日本語最適化
      optimizedText = this.basicJapaneseOptimization(text);
      optimizations.push("基本的な日本語最適化を適用しました");
    }

    return { text: optimizedText, optimizations, suggestions };
  }

  private basicJapaneseOptimization(text: string): string {
    // 基本的な日本語最適化ルール
    let optimized = text;

    // 一般的に歌詞でひらがな推奨の単語
    const kanjiToHiragana: Record<string, string> = {
      私: "わたし",
      貴方: "あなた",
      何時: "いつ",
      何処: "どこ",
      何故: "なぜ",
      大丈夫: "だいじょうぶ",
      有難う: "ありがとう",
      御免: "ごめん",
      沢山: "たくさん",
      一杯: "いっぱい",
    };

    for (const [kanji, hiragana] of Object.entries(kanjiToHiragana)) {
      optimized = optimized.replace(new RegExp(kanji, "g"), hiragana);
    }

    // 促音・長音の調整
    optimized = optimized.replace(/っっ+/g, "っ"); // 重複促音の除去
    optimized = optimized.replace(/ーー+/g, "ー"); // 重複長音の除去

    return optimized;
  }

  private async optimizeForSuno(lyrics: Lyrics): Promise<{
    lyrics: Lyrics;
    optimizations: string[];
    warnings: string[];
  }> {
    const optimizations: string[] = [];
    const warnings: string[] = [];

    if (this.sunoOptimizationService) {
      // Suno検証
      const validation =
        await this.sunoOptimizationService.validateForSuno(lyrics);
      warnings.push(...validation.issues);

      // 長さ最適化
      const lengthOptimization =
        await this.sunoOptimizationService.optimizeLength(lyrics);
      const optimizedLyrics = lengthOptimization.optimizedLyrics;
      optimizations.push(...lengthOptimization.changes);

      return { lyrics: optimizedLyrics, optimizations, warnings };
    }

    // 基本的なSuno最適化
    const content = lyrics.content;

    // Sunoで推奨される形式チェック
    if (!content.includes("[") || !content.includes("]")) {
      warnings.push("構造タグが不足しています");
    }

    // 行の長さチェック
    const lines = content.split("\n");
    const longLines = lines.filter((line) => line.length > 50);
    if (longLines.length > 0) {
      warnings.push(`長すぎる行があります（${longLines.length}行）`);
    }

    return {
      lyrics: Lyrics.create({
        title: lyrics.title,
        content: content,
        language: lyrics.language,
      }),
      optimizations,
      warnings,
    };
  }

  private shortenLyrics(
    text: string,
    maxLength: number
  ): {
    text: string;
    optimizations: string[];
  } {
    const optimizations: string[] = [];

    if (text.length <= maxLength) {
      return { text, optimizations };
    }

    // 段階的短縮アプローチ
    let shortened = text;

    // 1. 空行の削除
    shortened = shortened.replace(/\n\s*\n\s*\n/g, "\n\n");
    if (shortened.length <= maxLength) {
      optimizations.push("余分な空行を削除しました");
      return { text: shortened, optimizations };
    }

    // 2. 繰り返しセクションの簡略化
    // [Chorus] が3回以上出現する場合、最後の1つを除いて削除
    const chorusMatches = shortened.match(/\[Chorus\][\s\S]*?(?=\[|$)/g);
    if (chorusMatches && chorusMatches.length > 2) {
      const firstChorus = chorusMatches[0];
      shortened = shortened.replace(
        /\[Chorus\][\s\S]*?(?=\[|$)/g,
        (match, index) => {
          return index === 0 ? match : "[Chorus]\n(Repeat)\n\n";
        }
      );

      if (shortened.length <= maxLength) {
        optimizations.push("重複するコーラスを簡略化しました");
        return { text: shortened, optimizations };
      }
    }

    // 3. 最後の手段：文字数で切り詰め
    if (shortened.length > maxLength) {
      shortened = `${shortened.substring(0, maxLength - 3)}...`;
      optimizations.push("文字数制限のため歌詞を切り詰めました");
    }

    return { text: shortened, optimizations };
  }

  private calculateQualityScore(
    lyrics: Lyrics,
    structure: LyricsStructure,
    factors: {
      hasOptimizations: boolean;
      warningCount: number;
      structureComplexity: number;
    }
  ): number {
    let score = 100;

    // 歌詞の基本品質（60点満点）
    const lyricsStats = lyrics.getStats();

    // 文字数適正性（20点）
    const lengthOptimal =
      lyricsStats.totalCharacters >= 200 && lyricsStats.totalCharacters <= 2000;
    score += lengthOptimal ? 0 : -20;

    // 行数適正性（20点）
    const lineOptimal =
      lyricsStats.totalLines >= 8 && lyricsStats.totalLines <= 40;
    score += lineOptimal ? 0 : -20;

    // セクション数適正性（20点）
    const sectionOptimal =
      factors.structureComplexity >= 3 && factors.structureComplexity <= 10;
    score += sectionOptimal ? 0 : -20;

    // 構造品質（25点満点）
    const structureAnalysis = structure.getAnalysis();

    // 基本構造の完成度（15点）
    const hasBasicSections =
      structureAnalysis.sectionTypes.verse &&
      structureAnalysis.sectionTypes.chorus;
    score += hasBasicSections ? 0 : -15;

    // 警告の影響（10点）
    score -= Math.min(factors.warningCount * 2, 10);

    // 最適化の恩恵（15点満点）
    if (factors.hasOptimizations) {
      score += 15;
    }

    // 下限設定
    score = Math.max(score, 0);

    return Math.round(score);
  }
}
