"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import { GenreSelector } from "~/presentation/components/GenreSelector";
import { InstrumentSelector } from "~/presentation/components/InstrumentSelector";
import { MoodMatrix } from "~/presentation/components/MoodMatrix";
import { ParameterSliders } from "~/presentation/components/ParameterSliders";
import { TemplateLibrary } from "~/presentation/components/TemplateLibrary";

export default function PromptPage() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [parameters, setParameters] = useState({
    energy: 5,
    tempo: 5,
    complexity: 5,
    emotional_intensity: 5,
  });

  const handleGeneratePrompt = () => {
    // プロンプト生成ロジック（後で実装）
    console.log("Generating prompt with:", {
      genres: selectedGenres,
      moods: selectedMoods,
      instruments: selectedInstruments,
      parameters,
    });
  };

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
                href="/lyrics"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                歌詞作成
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
              <Link href="/prompt" className="text-purple-600 font-medium">
                プロンプト作成
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* メイン */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            プロンプト作成
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Suno
            AI向けの最適化されたプロンプトを生成します。ジャンル、ムード、楽器を選択してください。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左カラム - 設定パネル */}
          <div className="lg:col-span-2 space-y-6">
            {/* ジャンル選択 */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                ジャンル選択
              </h3>
              <GenreSelector
                selectedGenres={selectedGenres}
                onGenreChange={setSelectedGenres}
                maxSelection={3}
              />
            </Card>

            {/* ムード選択 */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                ムード・雰囲気
              </h3>
              <MoodMatrix
                selectedMoods={selectedMoods}
                onMoodChange={setSelectedMoods}
                maxSelection={3}
              />
            </Card>

            {/* 楽器選択 */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                楽器選択
              </h3>
              <InstrumentSelector
                selectedInstruments={selectedInstruments}
                onInstrumentChange={setSelectedInstruments}
                maxSelection={5}
              />
            </Card>

            {/* パラメータ調整 */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                パラメータ調整
              </h3>
              <ParameterSliders
                parameters={parameters}
                onParameterChange={setParameters}
              />
            </Card>
          </div>

          {/* 右カラム - テンプレート & 生成ボタン */}
          <div className="space-y-6">
            {/* テンプレートライブラリ */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                テンプレート
              </h3>
              <TemplateLibrary
                templates={[]}
                onTemplateSelect={(template) => {
                  // テンプレート選択時の処理
                  console.log("Template selected:", template);
                }}
              />
            </Card>

            {/* 生成ボタン */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                プロンプト生成
              </h3>
              <Button
                onClick={handleGeneratePrompt}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                size="lg"
              >
                プロンプトを生成
              </Button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                選択した設定に基づいて最適なプロンプトを生成します
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
