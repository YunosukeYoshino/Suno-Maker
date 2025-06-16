"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useState } from "react";

export default function LyricsPage() {
  const [theme, setTheme] = useState("");
  const [language, setLanguage] = useState("japanese");
  const [structure, setStructure] = useState("verse-chorus");
  const [mood, setMood] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const handleGenerateLyrics = () => {
    // 歌詞生成ロジック（後で実装）
    console.log("Generating lyrics with:", {
      theme,
      language,
      structure,
      mood,
      genres: selectedGenres,
    });
  };

  const popularGenres = [
    "Rock",
    "Pop",
    "Jazz",
    "Blues",
    "Electronic",
    "Hip-Hop",
    "Country",
    "Folk",
  ];

  const lyricsStructures = [
    { value: "verse-chorus", label: "Verse-Chorus" },
    { value: "aaba", label: "AABA" },
    { value: "verse-bridge", label: "Verse-Bridge" },
    { value: "ballad", label: "Ballad" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
      {/* ヘッダー */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Suno Maker
              </h1>
            </div>
            <nav className="flex items-center space-x-6">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                ホーム
              </Link>
              <Link
                href="/prompt"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                プロンプト作成
              </Link>
              <Link
                href="/success-examples"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                成功事例
              </Link>
              <Link
                href="/compliance"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                コンプライアンス
              </Link>
              <Link href="/lyrics" className="text-purple-600 font-medium">
                歌詞作成
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* メイン */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            歌詞作成
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Suno
            AI向けの最適化された歌詞を生成します。テーマ、言語、構造を設定してください。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左カラム - 設定パネル */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本設定 */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                基本設定
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="theme-input"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    テーマ・コンセプト
                  </label>
                  <Input
                    id="theme-input"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="例: 恋愛、希望、挑戦、青春..."
                    className="w-full"
                  />
                </div>
                <div>
                  <label
                    htmlFor="mood-input"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    ムード・雰囲気
                  </label>
                  <Input
                    id="mood-input"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    placeholder="例: 明るい、切ない、エネルギッシュ、静か..."
                    className="w-full"
                  />
                </div>
              </div>
            </Card>

            {/* 言語・構造設定 */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                言語・構造設定
              </h3>
              <Tabs value={language} onValueChange={setLanguage}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="japanese">日本語</TabsTrigger>
                  <TabsTrigger value="english">英語</TabsTrigger>
                  <TabsTrigger value="mixed">ミックス</TabsTrigger>
                </TabsList>
                <TabsContent value="japanese" className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    日本語歌詞を生成。自然な語感と韻を重視します。
                  </p>
                </TabsContent>
                <TabsContent value="english" className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    英語歌詞を生成。グローバルスタンダードな表現を使用します。
                  </p>
                </TabsContent>
                <TabsContent value="mixed" className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    日英ミックス歌詞を生成。現代的でインターナショナルな仕上がりに。
                  </p>
                </TabsContent>
              </Tabs>

              <div className="mt-4">
                <label
                  htmlFor="structure-select"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  歌詞構造
                </label>
                <select
                  id="structure-select"
                  value={structure}
                  onChange={(e) => setStructure(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800"
                >
                  {lyricsStructures.map((struct) => (
                    <option key={struct.value} value={struct.value}>
                      {struct.label}
                    </option>
                  ))}
                </select>
              </div>
            </Card>

            {/* ジャンル選択 */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                ジャンル選択
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularGenres.map((genre) => (
                  <Badge
                    key={genre}
                    variant={
                      selectedGenres.includes(genre) ? "default" : "outline"
                    }
                    className="cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900"
                    onClick={() => {
                      if (selectedGenres.includes(genre)) {
                        setSelectedGenres(
                          selectedGenres.filter((g) => g !== genre)
                        );
                      } else if (selectedGenres.length < 3) {
                        setSelectedGenres([...selectedGenres, genre]);
                      }
                    }}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                最大3つまで選択可能
              </p>
            </Card>
          </div>

          {/* 右カラム - プレビュー & 生成ボタン */}
          <div className="space-y-6">
            {/* 設定プレビュー */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                設定プレビュー
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">テーマ:</span>{" "}
                  {theme || "未設定"}
                </div>
                <div>
                  <span className="font-medium">言語:</span>{" "}
                  {language === "japanese"
                    ? "日本語"
                    : language === "english"
                      ? "英語"
                      : "ミックス"}
                </div>
                <div>
                  <span className="font-medium">構造:</span>{" "}
                  {lyricsStructures.find((s) => s.value === structure)?.label}
                </div>
                <div>
                  <span className="font-medium">ムード:</span>{" "}
                  {mood || "未設定"}
                </div>
                <div>
                  <span className="font-medium">ジャンル:</span>{" "}
                  {selectedGenres.join(", ") || "未選択"}
                </div>
              </div>
            </Card>

            {/* 生成ボタン */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                歌詞生成
              </h3>
              <Button
                onClick={handleGenerateLyrics}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                size="lg"
              >
                歌詞を生成
              </Button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                設定に基づいて最適な歌詞を生成します
              </p>
            </Card>

            {/* ヒント */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                作詞のコツ
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>• 具体的なテーマを設定すると良い歌詞が生成されます</li>
                <li>• ジャンルに合ったムードを選択しましょう</li>
                <li>• 120文字制限を意識した構成になります</li>
                <li>• Suno AIの最新機能に最適化されています</li>
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
