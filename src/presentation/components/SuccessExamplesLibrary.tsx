"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import type { SuccessExample } from "../../domain/entities/SuccessExample";
import type {
  SuccessExampleSearchFilters,
  SuccessExampleSearchOptions,
} from "../../domain/repositories/ISuccessExampleRepository";
import type { Genre } from "../../domain/valueObjects/Genre";
import type { Language } from "../../domain/valueObjects/Language";

interface SuccessExamplesLibraryProps {
  onExampleSelect?: (example: SuccessExample) => void;
  genre?: Genre;
  language?: Language;
  className?: string;
}

// Mock data for demonstration - in real implementation, this would come from the use case
const mockExamples: SuccessExample[] = [];

export function SuccessExamplesLibrary({
  onExampleSelect,
  genre,
  language,
  className = "",
}: SuccessExamplesLibraryProps) {
  const [examples, setExamples] = useState<SuccessExample[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "rating" | "playCount" | "quality" | "date"
  >("quality");
  const [filters, setFilters] = useState<SuccessExampleSearchFilters>({});

  const searchExamples = useCallback(async () => {
    setLoading(true);
    try {
      // Mock implementation - in real app, use SuccessExampleLibraryUseCase
      const searchFilters: SuccessExampleSearchFilters = {
        ...filters,
        genre,
        language,
        textQuery: searchQuery || undefined,
      };

      const searchOptions: SuccessExampleSearchOptions = {
        sortBy,
        sortOrder: "desc",
        limit: 20,
      };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setExamples(mockExamples);
    } catch (error) {
      console.error("Failed to search examples:", error);
      setExamples([]);
    } finally {
      setLoading(false);
    }
  }, [filters, genre, language, searchQuery, sortBy]);

  useEffect(() => {
    searchExamples();
  }, [searchExamples]);

  const handleExampleClick = (example: SuccessExample) => {
    onExampleSelect?.(example);
  };

  const renderExample = (example: SuccessExample) => (
    <Card
      key={example.id}
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => handleExampleClick(example)}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{example.title}</CardTitle>
            <CardDescription className="mt-1">
              {example.description}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <div className="flex items-center space-x-1">
              <span className="text-yellow-500">★</span>
              <span className="text-sm font-medium">
                {example.rating.toFixed(1)}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              Q: {example.calculateQualityScore()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              プロンプト:
            </p>
            <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
              {example.prompt}
            </p>
          </div>

          {example.lyrics && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                歌詞（抜粋）:
              </p>
              <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded line-clamp-3">
                {example.lyrics.substring(0, 100)}...
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {example.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex justify-between items-center text-xs text-gray-500">
            <div className="flex space-x-4">
              <span>👂 {example.playCount.toLocaleString()}</span>
              <span>❤️ {example.likeCount.toLocaleString()}</span>
            </div>
            <div>
              <span>
                {example.genre.value} • {example.language.value}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const skeletonItems = Array.from({ length: 6 }, (_, i) => ({
    id: `skeleton-${i}`,
  }));

  return (
    <div className={`w-full max-w-6xl mx-auto ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          成功事例ライブラリ
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          高評価を獲得したプロンプトと歌詞から学び、あなたの創作に活用しましょう
        </p>
      </div>

      {/* 検索・フィルター */}
      <div className="mb-6 space-y-4">
        <div className="flex space-x-4">
          <Input
            placeholder="プロンプト、歌詞、タグで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as "rating" | "playCount" | "quality" | "date"
              )
            }
            className="px-3 py-2 border rounded-md"
          >
            <option value="quality">品質スコア順</option>
            <option value="rating">評価順</option>
            <option value="playCount">再生数順</option>
            <option value="date">新着順</option>
          </select>
        </div>
      </div>

      {/* タブ */}
      <Tabs
        value={selectedCategory}
        onValueChange={setSelectedCategory}
        className="mb-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">すべて</TabsTrigger>
          <TabsTrigger value="trending">トレンド</TabsTrigger>
          <TabsTrigger value="top-rated">高評価</TabsTrigger>
          <TabsTrigger value="recent">最新</TabsTrigger>
          <TabsTrigger value="popular">人気</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skeletonItems.map((item) => (
                <Card key={item.id} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-300 rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 rounded" />
                      <div className="h-3 bg-gray-300 rounded w-5/6" />
                      <div className="h-3 bg-gray-300 rounded w-4/6" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : examples.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {examples.map(renderExample)}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <title>検索結果なし</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                成功事例が見つかりませんでした
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                検索条件を変更するか、新しい成功事例の追加をお待ちください
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
