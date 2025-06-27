import { z } from "zod";

const MAX_LENGTH = 120;
const MIN_ELEMENTS = 2;
const MAX_ELEMENTS = 8;

const StyleFieldSchema = z
  .string()
  .min(1, "スタイルフィールドは空文字列にできません")
  .max(MAX_LENGTH, "スタイルフィールドは120文字以内で入力してください");

// 既知のジャンル、楽器、ムードのリスト
const KNOWN_GENRES = new Set([
  "Pop",
  "Rock",
  "Hip-Hop",
  "R&B",
  "Country",
  "Folk",
  "Blues",
  "Jazz",
  "Classical",
  "Electronic",
  "EDM",
  "House",
  "Techno",
  "Trance",
  "Drum & Bass",
  "Dubstep",
  "Ambient",
  "Chillout",
  "Downtempo",
  "Trip-Hop",
  "Indie",
  "Alternative",
  "Punk",
  "Metal",
  "Hard Rock",
  "Progressive Rock",
  "Psychedelic Rock",
  "Funk",
  "Soul",
  "Disco",
  "Reggae",
  "Ska",
  "Latin",
  "Salsa",
  "Bossa Nova",
  "World Music",
  "Celtic",
  "African",
  "Asian",
  "Middle Eastern",
  "Japanese",
  "J-Pop",
  "J-Rock",
  "Enka",
  "Shibuya-kei",
]);

const KNOWN_INSTRUMENTS = new Set([
  "guitar",
  "electric guitar",
  "acoustic guitar",
  "bass",
  "bass guitar",
  "electric bass",
  "piano",
  "keyboard",
  "synthesizer",
  "synth",
  "drums",
  "percussion",
  "violin",
  "cello",
  "saxophone",
  "trumpet",
  "flute",
  "harmonica",
  "organ",
  "mandolin",
  "banjo",
  "harp",
  "accordion",
  "harmonica",
  "xylophone",
  "marimba",
  "timpani",
  "tabla",
  "sitar",
  "808 drums",
  "analog synth",
  "digital piano",
  "string section",
  "brass section",
  "woodwinds",
  "choir",
  "vocals",
  "background vocals",
  "lead vocals",
  "harmonies",
]);

const KNOWN_MOODS = new Set([
  "energetic",
  "calm",
  "dark",
  "bright",
  "melancholic",
  "uplifting",
  "aggressive",
  "peaceful",
  "intense",
  "relaxed",
  "mysterious",
  "joyful",
  "sad",
  "angry",
  "romantic",
  "nostalgic",
  "dreamy",
  "atmospheric",
  "driving",
  "flowing",
  "pulsing",
  "groovy",
  "smooth",
  "rough",
  "polished",
  "raw",
  "clean",
  "distorted",
  "warm",
  "cool",
  "explosive",
  "subtle",
  "dramatic",
  "intimate",
  "epic",
  "minimalist",
  "complex",
  "simple",
  "layered",
  "sparse",
  "dense",
  "heavy",
  "light",
  "powerful",
  "gentle",
]);

export interface StyleStats {
  length: number;
  elementCount: number;
  averageElementLength: number;
  genreCount: number;
  instrumentCount: number;
  moodCount: number;
}

export interface StructuredStyle {
  genres: string[];
  instruments: string[];
  moods: string[];
  other: string[];
}

export class StyleField {
  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  static create(value: string): StyleField {
    const trimmedValue = value.trim();
    StyleFieldSchema.parse(trimmedValue);
    return new StyleField(trimmedValue);
  }

  get value(): string {
    return this._value;
  }

  // 要素を配列に分割
  toArray(): string[] {
    return this._value
      .split(",")
      .map((element) => element.trim())
      .filter((element) => element.length > 0);
  }

  // ジャンル要素を抽出
  extractGenres(): string[] {
    return this.toArray().filter(
      (element) =>
        KNOWN_GENRES.has(element) ||
        KNOWN_GENRES.has(element.toLowerCase()) ||
        element.toLowerCase().includes("rock") ||
        element.toLowerCase().includes("pop") ||
        element.toLowerCase().includes("jazz") ||
        element.toLowerCase().includes("electronic")
    );
  }

  // 楽器要素を抽出
  extractInstruments(): string[] {
    return this.toArray().filter((element) => {
      const lowerElement = element.toLowerCase();
      return Array.from(KNOWN_INSTRUMENTS).some((instrument) =>
        lowerElement.includes(instrument.toLowerCase())
      );
    });
  }

  // ムード要素を抽出
  extractMoods(): string[] {
    return this.toArray().filter((element) => {
      const lowerElement = element.toLowerCase();
      return (
        KNOWN_MOODS.has(lowerElement) ||
        Array.from(KNOWN_MOODS).some((mood) =>
          lowerElement.includes(mood.toLowerCase())
        )
      );
    });
  }

  // 構造化された形式に変換
  toStructured(): StructuredStyle {
    const elements = this.toArray();
    const genres = this.extractGenres();
    const instruments = this.extractInstruments();
    const moods = this.extractMoods();

    const categorized = new Set([...genres, ...instruments, ...moods]);
    const other = elements.filter((element) => !categorized.has(element));

    return { genres, instruments, moods, other };
  }

  // 重複要素を除去
  removeDuplicates(): StyleField {
    const elements = this.toArray();
    const uniqueElements = [...new Set(elements)];
    return StyleField.create(uniqueElements.join(", "));
  }

  // 優先度に基づいて要素を並び替え
  prioritize(
    priorities: ("genre" | "mood" | "instrument" | "other")[]
  ): string {
    const structured = this.toStructured();
    const sortedElements: string[] = [];

    for (const priority of priorities) {
      switch (priority) {
        case "genre":
          sortedElements.push(...structured.genres);
          break;
        case "mood":
          sortedElements.push(...structured.moods);
          break;
        case "instrument":
          sortedElements.push(...structured.instruments);
          break;
        case "other":
          sortedElements.push(...structured.other);
          break;
      }
    }

    return sortedElements.join(", ");
  }

  // 120文字制限に合わせて最適化
  optimize(): string {
    if (this._value.length <= MAX_LENGTH) {
      return this._value;
    }

    // 重複除去
    const optimized = this.removeDuplicates();

    if (optimized.value.length <= MAX_LENGTH) {
      return optimized.value;
    }

    // 優先度順に並び替え
    const prioritized = optimized.prioritize([
      "genre",
      "mood",
      "instrument",
      "other",
    ]);

    if (prioritized.length <= MAX_LENGTH) {
      return prioritized;
    }

    // 要素を順次削除して文字数制限内に収める
    const elements = prioritized.split(", ");
    let result = "";

    for (const element of elements) {
      const testResult = result ? `${result}, ${element}` : element;
      if (testResult.length <= MAX_LENGTH) {
        result = testResult;
      } else {
        break;
      }
    }

    return result || elements[0].substring(0, MAX_LENGTH);
  }

  // 文字数制限内かチェック
  isWithinLimit(): boolean {
    return this._value.length <= MAX_LENGTH;
  }

  // 要素数を取得
  getElementCount(): number {
    return this.toArray().length;
  }

  // 推奨される複雑さかチェック
  isRecommendedComplexity(): boolean {
    const count = this.getElementCount();
    return count >= MIN_ELEMENTS && count <= MAX_ELEMENTS;
  }

  // 統計情報を取得
  getStats(): StyleStats {
    const elements = this.toArray();
    const structured = this.toStructured();

    return {
      length: this._value.length,
      elementCount: elements.length,
      averageElementLength:
        elements.length > 0
          ? Math.round(
              elements.reduce((sum, el) => sum + el.length, 0) / elements.length
            )
          : 0,
      genreCount: structured.genres.length,
      instrumentCount: structured.instruments.length,
      moodCount: structured.moods.length,
    };
  }

  // 等価性チェック
  equals(other: StyleField): boolean {
    return this._value === other._value;
  }

  // バリデーション結果を取得
  getValidationIssues(): string[] {
    const issues: string[] = [];
    const stats = this.getStats();

    if (stats.length > MAX_LENGTH) {
      issues.push(
        `文字数が制限を超えています（${stats.length}/${MAX_LENGTH}文字）`
      );
    }

    if (stats.elementCount < MIN_ELEMENTS) {
      issues.push(`要素数が少なすぎます（最低${MIN_ELEMENTS}個推奨）`);
    }

    if (stats.elementCount > MAX_ELEMENTS) {
      issues.push(`要素数が多すぎます（最大${MAX_ELEMENTS}個推奨）`);
    }

    if (stats.genreCount === 0) {
      issues.push("ジャンル要素が含まれていません");
    }

    return issues;
  }

  // 最適化提案を取得
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    const stats = this.getStats();
    const issues = this.getValidationIssues();

    if (issues.length === 0) {
      return ["現在のスタイルフィールドは最適化されています"];
    }

    if (stats.length > MAX_LENGTH) {
      suggestions.push(
        "文字数を削減するため、重複要素の除去や要素の短縮を検討してください"
      );
    }

    if (stats.elementCount < MIN_ELEMENTS) {
      suggestions.push(
        "より詳細な音楽スタイルのため、ムードや楽器要素の追加を検討してください"
      );
    }

    if (stats.elementCount > MAX_ELEMENTS) {
      suggestions.push(
        "より焦点を絞るため、最も重要な要素のみに絞り込んでください"
      );
    }

    if (stats.genreCount === 0) {
      suggestions.push("楽曲の基本方向性を示すジャンル要素を追加してください");
    }

    if (stats.genreCount > 3) {
      suggestions.push("ジャンル要素を3個以下に絞り込むことを推奨します");
    }

    return suggestions;
  }
}
