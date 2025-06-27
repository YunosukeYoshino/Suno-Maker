import { describe, expect, it } from "vitest";
import { calculateExpectedSuccessExampleScore } from "~/test-utils/test-data-generators";
import { Genre } from "../../valueObjects/Genre";
import { Language } from "../../valueObjects/Language";
import { StyleField } from "../../valueObjects/StyleField";
import {
  type MoodCategory,
  type MusicalKey,
  SuccessExample,
} from "../SuccessExample";

describe("SuccessExample", () => {
  const validProps = {
    title: "Amazing Rock Ballad",
    description: "A powerful rock ballad that went viral",
    prompt: "rock ballad, emotional, powerful vocals, electric guitar",
    lyrics:
      "[Verse]\nIn the darkness of the night\n[Chorus]\nWe will rise above",
    genre: Genre.create("Rock"),
    language: Language.create("en"),
    styleField: StyleField.create("rock ballad, emotional, powerful vocals"),
    sunoUrl: "https://suno.com/song/12345",
    audioUrl: "https://suno.com/audio/12345.mp3",
    rating: 4.5,
    playCount: 10000,
    likeCount: 500,
    tags: ["rock", "ballad", "viral"],
    metadata: {
      duration: 240,
      tempo: 120,
      key: "Am" as MusicalKey,
      mood: ["intense", "energetic"] as MoodCategory[],
      createdAt: new Date("2024-01-01"),
      verifiedAt: new Date("2024-01-02"),
    },
  };

  describe("create", () => {
    it("正常なパラメータでSuccessExampleを作成できる", () => {
      const example = SuccessExample.create(validProps);

      expect(example.title).toBe("Amazing Rock Ballad");
      expect(example.description).toBe(
        "A powerful rock ballad that went viral"
      );
      expect(example.prompt).toBe(
        "rock ballad, emotional, powerful vocals, electric guitar"
      );
      expect(example.lyrics).toBe(
        "[Verse]\nIn the darkness of the night\n[Chorus]\nWe will rise above"
      );
      expect(example.genre.value).toBe("Rock");
      expect(example.language.value).toBe("en");
      expect(example.sunoUrl).toBe("https://suno.com/song/12345");
      expect(example.audioUrl).toBe("https://suno.com/audio/12345.mp3");
      expect(example.rating).toBe(4.5);
      expect(example.playCount).toBe(10000);
      expect(example.likeCount).toBe(500);
      expect(example.tags).toEqual(["rock", "ballad", "viral"]);
      expect(example.id).toBeDefined();
      expect(example.createdAt).toBeInstanceOf(Date);
      expect(example.updatedAt).toBeInstanceOf(Date);
    });

    it("歌詞なしでSuccessExampleを作成できる", () => {
      const { lyrics, ...propsWithoutLyrics } = validProps;

      const example = SuccessExample.create(propsWithoutLyrics);

      expect(example.lyrics).toBeUndefined();
      expect(example.title).toBe("Amazing Rock Ballad");
    });

    it("audioUrlなしでSuccessExampleを作成できる", () => {
      const { audioUrl, ...propsWithoutAudioUrl } = validProps;

      const example = SuccessExample.create(propsWithoutAudioUrl);

      expect(example.audioUrl).toBeUndefined();
      expect(example.sunoUrl).toBe("https://suno.com/song/12345");
    });

    it("空のタイトルでエラーを投げる", () => {
      expect(() => {
        SuccessExample.create({ ...validProps, title: "" });
      }).toThrow("タイトルは必須です");

      expect(() => {
        SuccessExample.create({ ...validProps, title: "   " });
      }).toThrow("タイトルは必須です");
    });

    it("空の説明でエラーを投げる", () => {
      expect(() => {
        SuccessExample.create({ ...validProps, description: "" });
      }).toThrow("説明は必須です");
    });

    it("空のプロンプトでエラーを投げる", () => {
      expect(() => {
        SuccessExample.create({ ...validProps, prompt: "" });
      }).toThrow("プロンプトは必須です");
    });

    it("無効なSuno URLでエラーを投げる", () => {
      expect(() => {
        SuccessExample.create({ ...validProps, sunoUrl: "" });
      }).toThrow("有効なSuno URLは必須です");

      expect(() => {
        SuccessExample.create({ ...validProps, sunoUrl: "invalid-url" });
      }).toThrow("有効なSuno URLは必須です");

      expect(() => {
        SuccessExample.create({ ...validProps, sunoUrl: "ftp://invalid.com" });
      }).toThrow("有効なSuno URLは必須です");
    });

    it("無効な評価でエラーを投げる", () => {
      expect(() => {
        SuccessExample.create({ ...validProps, rating: 0 });
      }).toThrow("評価は1-5の範囲である必要があります");

      expect(() => {
        SuccessExample.create({ ...validProps, rating: 6 });
      }).toThrow("評価は1-5の範囲である必要があります");
    });

    it("負の再生回数でエラーを投げる", () => {
      expect(() => {
        SuccessExample.create({ ...validProps, playCount: -1 });
      }).toThrow("再生回数は0以上である必要があります");
    });

    it("負のいいね数でエラーを投げる", () => {
      expect(() => {
        SuccessExample.create({ ...validProps, likeCount: -1 });
      }).toThrow("いいね数は0以上である必要があります");
    });
  });

  describe("incrementPlayCount", () => {
    it("再生回数を1増加できる", async () => {
      const example = SuccessExample.create(validProps);

      // 少し待って時間差を作る
      await new Promise((resolve) => setTimeout(resolve, 1));

      const updated = example.incrementPlayCount();

      expect(updated.playCount).toBe(example.playCount + 1);
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
        example.updatedAt.getTime()
      );
      expect(updated).not.toBe(example); // 新しいインスタンス
    });
  });

  describe("incrementLikeCount", () => {
    it("いいね数を1増加できる", async () => {
      const example = SuccessExample.create(validProps);

      await new Promise((resolve) => setTimeout(resolve, 1));

      const updated = example.incrementLikeCount();

      expect(updated.likeCount).toBe(example.likeCount + 1);
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
        example.updatedAt.getTime()
      );
      expect(updated).not.toBe(example);
    });
  });

  describe("updateRating", () => {
    it("評価を更新できる", async () => {
      const example = SuccessExample.create(validProps);

      await new Promise((resolve) => setTimeout(resolve, 1));

      const updated = example.updateRating(5);

      expect(updated.rating).toBe(5);
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
        example.updatedAt.getTime()
      );
      expect(updated).not.toBe(example);
    });

    it("無効な評価でエラーを投げる", () => {
      const example = SuccessExample.create(validProps);

      expect(() => example.updateRating(0)).toThrow(
        "評価は1-5の範囲である必要があります"
      );
      expect(() => example.updateRating(6)).toThrow(
        "評価は1-5の範囲である必要があります"
      );
    });
  });

  describe("matches", () => {
    it("ジャンルが一致する場合trueを返す", () => {
      const example = SuccessExample.create(validProps);

      expect(example.matches({ genre: Genre.create("Rock") })).toBe(true);
      expect(example.matches({ genre: Genre.create("Pop") })).toBe(false);
    });

    it("言語が一致する場合trueを返す", () => {
      const example = SuccessExample.create(validProps);

      expect(example.matches({ language: Language.create("en") })).toBe(true);
      expect(example.matches({ language: Language.create("ja") })).toBe(false);
    });

    it("最小評価が条件を満たす場合trueを返す", () => {
      const example = SuccessExample.create(validProps);

      expect(example.matches({ minRating: 4 })).toBe(true);
      expect(example.matches({ minRating: 5 })).toBe(false);
    });

    it("最小再生回数が条件を満たす場合trueを返す", () => {
      const example = SuccessExample.create(validProps);

      expect(example.matches({ minPlayCount: 5000 })).toBe(true);
      expect(example.matches({ minPlayCount: 15000 })).toBe(false);
    });

    it("タグが一致する場合trueを返す", () => {
      const example = SuccessExample.create(validProps);

      expect(example.matches({ tags: ["rock"] })).toBe(true);
      expect(example.matches({ tags: ["rock", "ballad"] })).toBe(true);
      expect(example.matches({ tags: ["pop"] })).toBe(false);
      expect(example.matches({ tags: ["rock", "pop"] })).toBe(false);
    });

    it("ムードが一致する場合trueを返す", () => {
      const example = SuccessExample.create(validProps);

      expect(example.matches({ mood: ["intense"] as MoodCategory[] })).toBe(
        true
      );
      expect(example.matches({ mood: ["joyful"] as MoodCategory[] })).toBe(
        false
      );
    });

    it("テキスト検索が一致する場合trueを返す", () => {
      const example = SuccessExample.create(validProps);

      expect(example.matches({ textQuery: "rock" })).toBe(true);
      expect(example.matches({ textQuery: "amazing" })).toBe(true);
      expect(example.matches({ textQuery: "darkness" })).toBe(true); // lyrics内
      expect(example.matches({ textQuery: "guitar" })).toBe(true); // prompt内
      expect(example.matches({ textQuery: "piano" })).toBe(false);
    });

    it("複数の条件が全て一致する場合trueを返す", () => {
      const example = SuccessExample.create(validProps);

      expect(
        example.matches({
          genre: Genre.create("Rock"),
          language: Language.create("en"),
          minRating: 4,
          tags: ["rock"],
          textQuery: "ballad",
        })
      ).toBe(true);

      expect(
        example.matches({
          genre: Genre.create("Rock"),
          minRating: 5, // これで失敗
        })
      ).toBe(false);
    });
  });

  describe("calculateQualityScore", () => {
    it("品質スコアを正しく計算する", () => {
      const example = SuccessExample.create(validProps);

      const score = example.calculateQualityScore();
      const expectedScore = calculateExpectedSuccessExampleScore(
        validProps.rating,
        validProps.playCount,
        validProps.likeCount
      );

      expect(score).toBe(expectedScore);
    });

    it("低い統計値での品質スコア計算", () => {
      const lowStatsProps = {
        ...validProps,
        rating: 3,
        playCount: 100,
        likeCount: 10,
      };
      const example = SuccessExample.create(lowStatsProps);

      const score = example.calculateQualityScore();
      const expectedScore = calculateExpectedSuccessExampleScore(
        lowStatsProps.rating,
        lowStatsProps.playCount,
        lowStatsProps.likeCount
      );

      expect(score).toBeCloseTo(expectedScore, 1);
    });
  });

  describe("generateSearchVector", () => {
    it("検索ベクトルを生成できる", () => {
      const example = SuccessExample.create(validProps);

      const vector = example.generateSearchVector();

      expect(vector).toHaveLength(100);
      expect(vector.every((val) => typeof val === "number")).toBe(true);
      expect(vector.some((val) => val > 0)).toBe(true); // 少なくとも一部の値が0より大きい
    });
  });

  describe("equals", () => {
    it("同じIDのSuccessExampleは等価", () => {
      const example1 = SuccessExample.create(validProps);
      const example2 = SuccessExample.create({
        ...validProps,
        title: "Different Title",
      });

      // 同じインスタンス
      expect(example1.equals(example1)).toBe(true);
      // 異なるインスタンス
      expect(example1.equals(example2)).toBe(false);
    });
  });
});
