"use client";

import Link from "next/link";
import { SuccessExamplesLibrary } from "../../src/presentation/components/SuccessExamplesLibrary";

export default function SuccessExamplesPage() {
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
                href="/success-examples"
                className="text-purple-600 font-medium"
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
        <SuccessExamplesLibrary
          onExampleSelect={(example) => {
            console.log("Selected example:", example);
            // ここで選択された成功事例の処理を行う
          }}
        />
      </main>
    </div>
  );
}
