"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";

export default function Home() {
  const router = useRouter();

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
            <nav className="hidden md:flex items-center space-x-6">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                機能
              </a>
              <a
                href="#templates"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                テンプレート
              </a>
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
            </nav>
          </div>
        </div>
      </header>

      {/* メイン */}
      <main className="container mx-auto px-4 py-12">
        {/* ヒーローセクション */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            AI音楽制作を
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              もっと簡単に
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Suno AI向けの最適化されたプロンプトと歌詞を生成。
            <br />
            ジャンル特化、言語対応、120文字制限に完全対応。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              プロンプトを作成
            </Button>
            <Button size="lg" variant="outline">
              歌詞を作成
            </Button>
          </div>
        </div>

        {/* 機能カード */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          id="features"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                role="img"
                aria-label="アイデア"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              インテリジェント生成
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              120種類以上のジャンル対応。AI駆動の最適化で高品質なプロンプトを自動生成。
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                role="img"
                aria-label="音楽"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              多言語対応
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              日本語・英語完全対応。発音最適化とミックス言語機能で理想的な歌詞作成。
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                role="img"
                aria-label="品質保証"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Suno完全対応
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              120文字制限、メタタグ、v4.5新機能まで完全対応。最高品質の楽曲生成を実現。
            </p>
          </div>
        </div>

        {/* Phase 3 新機能 */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            新機能：コミュニティ＆コンプライアンス
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="h-12 w-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  role="img"
                  aria-label="成功事例ライブラリアイコン"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V9l6 3v8"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                成功事例ライブラリ
              </h4>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                高評価を獲得したプロンプトと歌詞を分析。セマンティック検索とトレンド分析で最適な創作をサポート。
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  router.push("/success-examples");
                }}
              >
                成功事例を見る
              </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="h-12 w-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  role="img"
                  aria-label="リーガルコンプライアンスアイコン"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                リーガルコンプライアンス
              </h4>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                著作権・商標権・不適切コンテンツを自動検出。AIによる4段階リスク評価で安全な音楽制作を保証。
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  router.push("/compliance");
                }}
              >
                コンプライアンスチェック
              </Button>
            </div>
          </div>
        </div>

        {/* 統計セクション */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Suno Makerで音楽制作をスマートに
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                120+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                サポートジャンル
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">17</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                対応言語
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                最適化率
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                3000
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                最大文字数
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="border-t bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600 dark:text-gray-300">
            <p>© 2024 Suno Maker. AI音楽制作をもっと簡単に。</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
