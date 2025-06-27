import { beforeEach, describe, expect, it } from "vitest";
import { Genre } from "../Genre";
import { Language } from "../Language";
import { LyricsAnalytics } from "../LyricsAnalytics";
import { SongDuration } from "../SongDuration";

describe("SongDuration", () => {
  let englishLanguage: Language;
  let japaneseLanguage: Language;
  let rockGenre: Genre;
  let popGenre: Genre;
  let singerSongwriterGenre: Genre;

  beforeEach(() => {
    englishLanguage = Language.create("en");
    japaneseLanguage = Language.create("ja");
    rockGenre = Genre.create("Rock");
    popGenre = Genre.create("Pop");
    singerSongwriterGenre = Genre.create("Singer-songwriter");
  });

  describe("基本作成", () => {
    it("秒数から正しく作成できる", () => {
      const duration = SongDuration.fromSeconds(180);

      expect(duration.getSeconds()).toBe(180);
      expect(duration.getMinutes()).toBe(3);
      expect(duration.getRemainingSeconds()).toBe(0);
    });

    it("負の秒数ではエラーになる", () => {
      expect(() => SongDuration.fromSeconds(-10)).toThrow(
        "再生時間は0秒以上である必要があります"
      );
    });

    it("30分を超える秒数ではエラーになる", () => {
      expect(() => SongDuration.fromSeconds(1801)).toThrow(
        "再生時間は30分以内である必要があります"
      );
    });

    it("小数点を含む秒数は四捨五入される", () => {
      const duration = SongDuration.fromSeconds(180.7);
      expect(duration.getSeconds()).toBe(181);
    });
  });

  describe("歌詞からの推定", () => {
    it("英語歌詞から適切な時間を推定できる", () => {
      const content = `[Verse]
Love is all around us in the air tonight
We can feel the magic everywhere we go
[Chorus]
Take my hand and let's dance together
Under the stars so bright forever
[Verse]
Every moment feels like a dream come true
When I'm here beside you`;

      const analytics = LyricsAnalytics.analyze(content, englishLanguage);
      const duration = SongDuration.estimateFromLyrics(
        analytics,
        englishLanguage
      );

      expect(duration.getSeconds()).toBeGreaterThanOrEqual(60);
      expect(duration.getSeconds()).toBeLessThan(600);
    });

    it("日本語歌詞から適切な時間を推定できる", () => {
      const content = `[Verse]
愛してる君のことを
いつも心で思ってる
[Chorus]
一緒に歩もう
永遠に続く道を`;

      const analytics = LyricsAnalytics.analyze(content, japaneseLanguage);
      const duration = SongDuration.estimateFromLyrics(
        analytics,
        japaneseLanguage
      );

      expect(duration.getSeconds()).toBeGreaterThanOrEqual(60);
      expect(duration.getSeconds()).toBeLessThan(600);
    });

    it("インストゥルメンタルセクションがある場合は時間が延長される", () => {
      const contentWithSolo = `[Verse]
This is a longer verse with more content to sing
We need more words to make the duration calculation work
[Guitar Solo]
Extended instrumental section with guitar playing
[Chorus]
This is a longer chorus with more lyrics to sing along
Repeat this chorus for better duration estimation`;

      const contentWithoutSolo = `[Verse]
This is a longer verse with more content to sing
We need more words to make the duration calculation work
[Chorus]
This is a longer chorus with more lyrics to sing along
Repeat this chorus for better duration estimation`;

      const analyticsWithSolo = LyricsAnalytics.analyze(
        contentWithSolo,
        englishLanguage
      );
      const analyticsWithoutSolo = LyricsAnalytics.analyze(
        contentWithoutSolo,
        englishLanguage
      );

      const durationWithSolo = SongDuration.estimateFromLyrics(
        analyticsWithSolo,
        englishLanguage
      );
      const durationWithoutSolo = SongDuration.estimateFromLyrics(
        analyticsWithoutSolo,
        englishLanguage
      );

      expect(durationWithSolo.getSeconds()).toBeGreaterThan(
        durationWithoutSolo.getSeconds()
      );
    });

    it("最小時間制限（1分）が適用される", () => {
      const shortContent = "Hi";
      const analytics = LyricsAnalytics.analyze(shortContent, englishLanguage);
      const duration = SongDuration.estimateFromLyrics(
        analytics,
        englishLanguage
      );

      expect(duration.getSeconds()).toBeGreaterThanOrEqual(60);
    });

    it("最大時間制限（10分）が適用される", () => {
      const longContent = "Very long lyrics content ".repeat(1000);
      const analytics = LyricsAnalytics.analyze(longContent, englishLanguage);
      const duration = SongDuration.estimateFromLyrics(
        analytics,
        englishLanguage
      );

      expect(duration.getSeconds()).toBeLessThanOrEqual(600);
    });
  });

  describe("ジャンルからの推定", () => {
    it("Popジャンルで短めの時間を推定する", () => {
      const popDuration = SongDuration.estimateFromGenre(popGenre);
      const baseDuration = SongDuration.fromSeconds(180);

      expect(popDuration.getSeconds()).toBeLessThan(baseDuration.getSeconds());
    });

    it("Progressiveジャンルで長めの時間を推定する", () => {
      const progressiveGenre = Genre.create("Progressive Rock");
      const progressiveDuration =
        SongDuration.estimateFromGenre(progressiveGenre);
      const baseDuration = SongDuration.fromSeconds(180);

      expect(progressiveDuration.getSeconds()).toBeGreaterThan(
        baseDuration.getSeconds()
      );
    });

    it("カスタムベースライン時間を使用できる", () => {
      const customBaseline = 240;
      const duration = SongDuration.estimateFromGenre(
        rockGenre,
        customBaseline
      );

      // Rockは特別な調整がないので、ベースライン付近の値になる
      expect(Math.abs(duration.getSeconds() - customBaseline)).toBeLessThan(50);
    });
  });

  describe("完全推定", () => {
    it("歌詞がある場合は歌詞ベースで推定する", () => {
      const content = `[Verse]
Test verse content here
[Chorus]
Test chorus content here`;

      const analytics = LyricsAnalytics.analyze(content, englishLanguage);
      const duration = SongDuration.estimateComplete(
        analytics,
        rockGenre,
        englishLanguage
      );

      expect(duration.getSeconds()).toBeGreaterThanOrEqual(60);
      expect(duration.getSeconds()).toBeLessThan(600);
    });

    it("歌詞がない場合はジャンルベースで推定する", () => {
      const duration = SongDuration.estimateComplete(
        null,
        rockGenre,
        englishLanguage
      );

      expect(duration.getSeconds()).toBeGreaterThan(30);
      expect(duration.getSeconds()).toBeLessThan(1800);
    });

    it("シンガーソングライタージャンルでは時間が延長される", () => {
      const content = `[Verse]
Test verse content
[Chorus]
Test chorus content`;

      const analytics = LyricsAnalytics.analyze(content, englishLanguage);
      const singerSongwriterDuration = SongDuration.estimateComplete(
        analytics,
        singerSongwriterGenre,
        englishLanguage
      );
      const normalDuration = SongDuration.estimateComplete(
        analytics,
        rockGenre,
        englishLanguage
      );

      expect(singerSongwriterDuration.getSeconds()).toBeGreaterThan(
        normalDuration.getSeconds()
      );
    });
  });

  describe("時間計算", () => {
    it("分と秒を正しく計算できる", () => {
      const duration = SongDuration.fromSeconds(245); // 4分5秒

      expect(duration.getMinutes()).toBe(4);
      expect(duration.getRemainingSeconds()).toBe(5);
      expect(duration.getTotalMinutes()).toBe(4.08);
    });

    it("フォーマットされた時間文字列を取得できる", () => {
      const duration1 = SongDuration.fromSeconds(125); // 2分5秒
      const duration2 = SongDuration.fromSeconds(605); // 10分5秒

      expect(duration1.getFormattedDuration()).toBe("2:05");
      expect(duration2.getFormattedDuration()).toBe("10:05");
    });
  });

  describe("算術演算", () => {
    it("時間を加算できる", () => {
      const duration1 = SongDuration.fromSeconds(120);
      const duration2 = SongDuration.fromSeconds(60);
      const result = duration1.add(duration2);

      expect(result.getSeconds()).toBe(180);
    });

    it("時間を減算できる", () => {
      const duration1 = SongDuration.fromSeconds(180);
      const duration2 = SongDuration.fromSeconds(60);
      const result = duration1.subtract(duration2);

      expect(result.getSeconds()).toBe(120);
    });

    it("負の結果にならないよう減算が制限される", () => {
      const duration1 = SongDuration.fromSeconds(60);
      const duration2 = SongDuration.fromSeconds(120);
      const result = duration1.subtract(duration2);

      expect(result.getSeconds()).toBe(0);
    });

    it("時間を乗算できる", () => {
      const duration = SongDuration.fromSeconds(60);
      const result = duration.multiply(2.5);

      expect(result.getSeconds()).toBe(150);
    });

    it("負の乗数ではエラーになる", () => {
      const duration = SongDuration.fromSeconds(60);

      expect(() => duration.multiply(-1)).toThrow(
        "乗数は0以上である必要があります"
      );
    });
  });

  describe("比較", () => {
    it("時間の長短を比較できる", () => {
      const short = SongDuration.fromSeconds(120);
      const long = SongDuration.fromSeconds(180);

      expect(long.isLongerThan(short)).toBe(true);
      expect(short.isShorterThan(long)).toBe(true);
      expect(short.isLongerThan(long)).toBe(false);
      expect(long.isShorterThan(short)).toBe(false);
    });

    it("等価性を判定できる", () => {
      const duration1 = SongDuration.fromSeconds(180);
      const duration2 = SongDuration.fromSeconds(180);
      const duration3 = SongDuration.fromSeconds(181);

      expect(duration1.equals(duration2)).toBe(true);
      expect(duration1.equals(duration3)).toBe(false);
    });
  });

  describe("カテゴリ分類", () => {
    it("時間の長さによって正しくカテゴリ分類される", () => {
      expect(SongDuration.fromSeconds(60).getCategory()).toBe("very-short");
      expect(SongDuration.fromSeconds(120).getCategory()).toBe("short");
      expect(SongDuration.fromSeconds(200).getCategory()).toBe("standard");
      expect(SongDuration.fromSeconds(350).getCategory()).toBe("long");
      expect(SongDuration.fromSeconds(450).getCategory()).toBe("very-long");
    });

    it("商用利用適性を正しく判定する", () => {
      expect(SongDuration.fromSeconds(60).isCommerciallyViable()).toBe(false); // 短すぎ
      expect(SongDuration.fromSeconds(180).isCommerciallyViable()).toBe(true); // 適切
      expect(SongDuration.fromSeconds(300).isCommerciallyViable()).toBe(true); // 適切
      expect(SongDuration.fromSeconds(400).isCommerciallyViable()).toBe(false); // 長すぎ
    });
  });

  describe("不変性", () => {
    it("SongDurationオブジェクトは不変である", () => {
      const duration = SongDuration.fromSeconds(180);

      expect(() => {
        // biome-ignore lint/suspicious/noExplicitAny: Testing immutability
        (duration as any).seconds = 200;
      }).toThrow();
    });
  });
});
