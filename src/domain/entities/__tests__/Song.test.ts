import { beforeEach, describe, expect, it } from "vitest";
import { Genre } from "../../valueObjects/Genre";
import { Language } from "../../valueObjects/Language";
import { StyleField } from "../../valueObjects/StyleField";
import { Lyrics } from "../Lyrics";
import { Prompt } from "../Prompt";
import { Song } from "../Song";

describe("Song", () => {
  let validProps: any;
  let testPrompt: Prompt;
  let testLyrics: Lyrics;

  beforeEach(() => {
    testPrompt = Prompt.create({
      title: "Rock Ballad Prompt",
      genre: Genre.create("Rock"),
      language: Language.create("en"),
      styleField: StyleField.create(
        "Rock, emotional, electric guitar, powerful vocals"
      ),
    });

    testLyrics = Lyrics.create({
      title: "Love Song Lyrics",
      content: "[Verse]\nLove is all around\n[Chorus]\nFeel the beat",
      language: Language.create("en"),
    });

    validProps = {
      id: "song-123",
      title: "My Love Song",
      prompt: testPrompt,
      lyrics: testLyrics,
      sunoUrl: "https://suno.com/song/abc123",
      tags: ["love", "rock"],
      isGenerated: true,
      isPublic: true,
      rating: 4.5,
      playCount: 100,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    };
  });

  describe("作成", () => {
    it("有効なプロパティでSongを作成できる", () => {
      const song = Song.create(validProps);

      expect(song.id).toBe("song-123");
      expect(song.title).toBe("My Love Song");
      expect(song.prompt.id).toBe(testPrompt.id);
      expect(song.lyrics.id).toBe(testLyrics.id);
      expect(song.isGenerated).toBe(true);
      expect(song.isPublic).toBe(true);
      expect(song.rating).toBe(4.5);
    });

    it("IDが自動生成される", () => {
      const propsWithoutId = { ...validProps };
      propsWithoutId.id = undefined;

      const song = Song.create(propsWithoutId);
      expect(song.id).toMatch(/^song-/);
      expect(song.id.length).toBeGreaterThan(10);
    });

    it("プロンプトのみでSongを作成できる", () => {
      const minimalProps = {
        title: "Minimal Song",
        prompt: testPrompt,
      };

      const song = Song.create(minimalProps);
      expect(song.title).toBe("Minimal Song");
      expect(song.prompt.id).toBe(testPrompt.id);
      expect(song.lyrics).toBeNull();
      expect(song.isGenerated).toBe(false);
    });

    it("プロンプトと言語の整合性をチェックできる", () => {
      const japanesePrompt = Prompt.create({
        title: "Japanese Prompt",
        genre: Genre.create("J-Pop"),
        language: Language.create("ja"),
        styleField: StyleField.create("J-Pop, 明るい"),
      });

      const englishLyrics = Lyrics.create({
        title: "English Lyrics",
        content: "[Verse]\nHello world",
        language: Language.create("en"),
      });

      const inconsistentProps = {
        title: "Inconsistent Song",
        prompt: japanesePrompt,
        lyrics: englishLyrics,
      };

      const song = Song.create(inconsistentProps);
      const validation = song.validate();

      expect(validation.warnings).toContain(
        "プロンプトと歌詞の言語が異なります"
      );
    });
  });

  describe("更新", () => {
    it("タイトルを更新できる", () => {
      const song = Song.create(validProps);
      const updatedSong = song.updateTitle("New Song Title");

      expect(updatedSong.title).toBe("New Song Title");
      expect(updatedSong.updatedAt.getTime()).toBeGreaterThan(
        song.updatedAt.getTime()
      );
    });

    it("歌詞を追加できる", () => {
      const songWithoutLyrics = Song.create({
        title: "Song Without Lyrics",
        prompt: testPrompt,
      });

      const updatedSong = songWithoutLyrics.addLyrics(testLyrics);

      expect(updatedSong.lyrics?.id).toBe(testLyrics.id);
      expect(updatedSong.isGenerated).toBe(false); // まだ生成されていない
    });

    it("生成状態を更新できる", () => {
      const song = Song.create({ ...validProps, isGenerated: false });
      const generatedSong = song.markAsGenerated("https://suno.com/new");

      expect(generatedSong.isGenerated).toBe(true);
      expect(generatedSong.sunoUrl).toBe("https://suno.com/new");
    });

    it("評価を記録できる", () => {
      const song = Song.create(validProps);
      const ratedSong = song.updateRating(3.5);

      expect(ratedSong.rating).toBe(3.5);
    });

    it("再生回数を増加できる", () => {
      const song = Song.create(validProps);
      const playedSong = song.incrementPlayCount();

      expect(playedSong.playCount).toBe(101);
    });
  });

  describe("分析", () => {
    it("楽曲の統計を取得できる", () => {
      const song = Song.create(validProps);
      const stats = song.getStats();

      expect(stats.hasLyrics).toBe(true);
      expect(stats.hasPrompt).toBe(true);
      expect(stats.isComplete).toBe(true);
      expect(stats.languageConsistency).toBe(true);
      expect(stats.promptQualityScore).toBeGreaterThan(0);
    });

    it("楽曲の品質スコアを計算できる", () => {
      const song = Song.create(validProps);
      const qualityScore = song.calculateQualityScore();

      expect(qualityScore.overall).toBeGreaterThan(0);
      expect(qualityScore.overall).toBeLessThanOrEqual(100);
      expect(qualityScore.breakdown.promptQuality).toBeDefined();
      expect(qualityScore.breakdown.lyricsQuality).toBeDefined();
      expect(qualityScore.breakdown.consistency).toBeDefined();
    });

    it("推定再生時間を計算できる", () => {
      const song = Song.create(validProps);
      const duration = song.getEstimatedDuration();

      expect(duration).toBeGreaterThan(0);
      expect(duration).toBeLessThanOrEqual(600); // 10分以内
    });
  });

  describe("バリデーション", () => {
    it("完全な楽曲の妥当性を検証できる", () => {
      const song = Song.create(validProps);
      const validation = song.validate();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("不完全な楽曲の警告を検出できる", () => {
      const incompleteProps = {
        title: "Incomplete Song",
        prompt: testPrompt,
        // lyrics なし
      };

      const song = Song.create(incompleteProps);
      const validation = song.validate();

      expect(validation.warnings).toContain(
        "歌詞が設定されていません。完全な楽曲にするために歌詞の追加を検討してください"
      );
    });
  });

  describe("等価性", () => {
    it("同じIDのSongは等価", () => {
      const song1 = Song.create(validProps);
      const song2 = Song.create(validProps);

      expect(song1.equals(song2)).toBe(true);
    });

    it("異なるIDのSongは非等価", () => {
      const song1 = Song.create(validProps);
      const song2 = Song.create({ ...validProps, id: "different-id" });

      expect(song1.equals(song2)).toBe(false);
    });
  });

  describe("シリアライゼーション", () => {
    it("JSON形式にシリアライズできる", () => {
      const song = Song.create(validProps);
      const json = song.toJSON();

      expect(json.id).toBe(song.id);
      expect(json.title).toBe(song.title);
      expect(json.prompt).toBeDefined();
      expect(json.lyrics).toBeDefined();
      expect(json.isGenerated).toBe(true);
    });

    it("JSONから復元できる", () => {
      const song = Song.create(validProps);
      const json = song.toJSON();
      const restored = Song.fromJSON(json);

      expect(restored.equals(song)).toBe(true);
    });
  });
});
