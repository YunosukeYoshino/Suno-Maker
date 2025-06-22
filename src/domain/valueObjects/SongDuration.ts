import type { Genre } from "./Genre";
import type { Language } from "./Language";
import type { LyricsAnalytics } from "./LyricsAnalytics";

export class SongDuration {
  private constructor(private readonly seconds: number) {
    if (seconds < 0) {
      throw new Error("再生時間は0秒以上である必要があります");
    }
    if (seconds > 1800) {
      // 30分制限
      throw new Error("再生時間は30分以内である必要があります");
    }
    Object.freeze(this);
  }

  static fromSeconds(seconds: number): SongDuration {
    return new SongDuration(Math.round(seconds));
  }

  static estimateFromLyrics(
    lyricsAnalytics: LyricsAnalytics,
    language: Language
  ): SongDuration {
    const wordCount = lyricsAnalytics.getWordCount();

    // 言語別の読み上げ速度（words per second）
    let wordsPerSecond = 2.5; // デフォルト（英語）
    if (language.value === "ja") {
      wordsPerSecond = 4; // 日本語は文字ベースなので高速
    } else if (language.value === "ko") {
      wordsPerSecond = 3.5;
    } else if (["es", "fr", "it", "pt"].includes(language.value)) {
      wordsPerSecond = 3; // ロマンス語族
    }

    // セクション間の間隔を考慮
    const sections = lyricsAnalytics.getSections();
    const sectionPauseDuration = Math.max(0, sections.length - 1) * 2; // セクション間2秒

    // 基本時間計算
    const lyricsDuration = wordCount / wordsPerSecond;

    // 構造による補正
    const hasInstrumental = sections.some((section) =>
      ["Guitar Solo", "Piano Interlude", "Drum Break"].includes(section.type)
    );
    const instrumentalBonus = hasInstrumental ? 30 : 0; // インストゥルメンタル部分

    // イントロ・アウトロの時間
    const hasIntro = sections.some((section) => section.type === "Intro");
    const hasOutro = sections.some((section) => section.type === "Outro");
    const introOutroDuration = (hasIntro ? 15 : 8) + (hasOutro ? 20 : 8);

    const totalSeconds =
      lyricsDuration +
      sectionPauseDuration +
      instrumentalBonus +
      introOutroDuration;

    return new SongDuration(Math.max(60, Math.min(600, totalSeconds))); // 1分-10分の範囲
  }

  static estimateFromGenre(genre: Genre, baselineDuration = 180): SongDuration {
    let duration = baselineDuration;
    const genreValue = genre.value.toString().toLowerCase();

    // ジャンル別の調整
    if (["epic", "progressive", "metal"].some((g) => genreValue.includes(g))) {
      duration *= 1.5; // 長め
    } else if (
      ["pop", "dance", "electronic"].some((g) => genreValue.includes(g))
    ) {
      duration *= 0.85; // 短め
    } else if (
      ["classical", "ambient", "instrumental"].some((g) =>
        genreValue.includes(g)
      )
    ) {
      duration *= 2; // かなり長め
    } else if (
      ["punk", "hardcore", "grindcore"].some((g) => genreValue.includes(g))
    ) {
      duration *= 0.6; // かなり短め
    }

    return new SongDuration(Math.max(30, Math.min(1800, duration)));
  }

  static estimateComplete(
    lyricsAnalytics: LyricsAnalytics | null,
    genre: Genre,
    language: Language
  ): SongDuration {
    if (lyricsAnalytics) {
      // 歌詞がある場合は歌詞ベースの推定
      const lyricsBasedDuration = SongDuration.estimateFromLyrics(
        lyricsAnalytics,
        language
      );

      // ジャンルによる微調整
      const genreMultiplier = SongDuration.getGenreMultiplier(genre);
      const adjustedSeconds =
        lyricsBasedDuration.getSeconds() * genreMultiplier;

      return new SongDuration(Math.max(60, Math.min(600, adjustedSeconds)));
    }
    // 歌詞がない場合はジャンルベースの推定
    return SongDuration.estimateFromGenre(genre);
  }

  private static getGenreMultiplier(genre: Genre): number {
    const genreValue = genre.value.toString().toLowerCase();

    if (genreValue.includes("ballad")) return 1.2;
    if (genreValue.includes("singer-songwriter")) return 1.2;
    if (genreValue.includes("acoustic")) return 1.15;
    if (genreValue.includes("epic")) return 1.4;
    if (genreValue.includes("progressive")) return 1.3;
    if (genreValue.includes("pop")) return 0.9;
    if (genreValue.includes("dance")) return 0.95;
    if (genreValue.includes("punk")) return 0.7;

    return 1.0; // デフォルト
  }

  getSeconds(): number {
    return this.seconds;
  }

  getMinutes(): number {
    return Math.floor(this.seconds / 60);
  }

  getRemainingSeconds(): number {
    return this.seconds % 60;
  }

  getFormattedDuration(): string {
    const minutes = this.getMinutes();
    const seconds = this.getRemainingSeconds();
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  getTotalMinutes(): number {
    return Math.round((this.seconds / 60) * 100) / 100; // 小数点2桁まで
  }

  add(other: SongDuration): SongDuration {
    return new SongDuration(this.seconds + other.seconds);
  }

  subtract(other: SongDuration): SongDuration {
    return new SongDuration(Math.max(0, this.seconds - other.seconds));
  }

  multiply(factor: number): SongDuration {
    if (factor < 0) {
      throw new Error("乗数は0以上である必要があります");
    }
    return new SongDuration(this.seconds * factor);
  }

  isLongerThan(other: SongDuration): boolean {
    return this.seconds > other.seconds;
  }

  isShorterThan(other: SongDuration): boolean {
    return this.seconds < other.seconds;
  }

  equals(other: SongDuration): boolean {
    return this.seconds === other.seconds;
  }

  // 楽曲の長さのカテゴリ分類
  getCategory(): "very-short" | "short" | "standard" | "long" | "very-long" {
    if (this.seconds < 90) return "very-short";
    if (this.seconds < 150) return "short";
    if (this.seconds < 300) return "standard";
    if (this.seconds < 420) return "long";
    return "very-long";
  }

  // 商用利用での適性
  isCommerciallyViable(): boolean {
    // 商用楽曲として適切な長さ（1分半〜6分）
    return this.seconds >= 90 && this.seconds <= 360;
  }
}
