"use client";

import Link from "next/link";
import { ComplianceChecker } from "../../src/presentation/components/ComplianceChecker";

export default function CompliancePage() {
  // Mock content for demonstration
  const mockContent = {
    title: "Amazing Rock Ballad",
    description: "A powerful rock ballad with emotional vocals",
    prompt:
      "rock ballad, emotional, powerful vocals, electric guitar, dramatic, heartfelt",
    lyrics:
      "[Verse]\nIn the darkness of the night\nI search for something real\n[Chorus]\nWe will rise above the pain\nTogether we will heal",
    tags: ["rock", "ballad", "emotional", "powerful"],
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
                href="/success-examples"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                成功事例
              </Link>
              <Link href="/compliance" className="text-purple-600 font-medium">
                コンプライアンス
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* メイン */}
      <main className="container mx-auto px-4 py-12">
        <ComplianceChecker
          content={mockContent}
          onCheckComplete={(result) => {
            console.log("Compliance check completed:", result);
            // ここでコンプライアンスチェック結果の処理を行う
          }}
        />
      </main>
    </div>
  );
}
