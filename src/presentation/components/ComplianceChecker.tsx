"use client";

import { useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../components/ui/alert";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Progress } from "../../../components/ui/progress";
import type { ComplianceCheckInput } from "../../application/services/ComplianceService";
import type { ComplianceCheck } from "../../domain/valueObjects/ComplianceCheck";

interface ComplianceCheckerProps {
  content: {
    title?: string;
    description?: string;
    prompt: string;
    lyrics?: string;
    tags?: string[];
  };
  onCheckComplete?: (result: ComplianceCheck) => void;
  className?: string;
}

export function ComplianceChecker({
  content,
  onCheckComplete,
  className = "",
}: ComplianceCheckerProps) {
  const [checkResult, setCheckResult] = useState<ComplianceCheck | null>(null);
  const [loading, setLoading] = useState(false);

  const checkCompliance = async () => {
    setLoading(true);
    try {
      // Mock implementation - in real app, use ComplianceService
      const input: ComplianceCheckInput = {
        title: content.title,
        description: content.description,
        prompt: content.prompt,
        lyrics: content.lyrics,
        tags: content.tags,
      };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create mock result - in real implementation, use ComplianceService.checkCompliance(input)
      const { ComplianceCheck } = await import(
        "../../domain/valueObjects/ComplianceCheck"
      );

      const mockResult = ComplianceCheck.createSafe();
      setCheckResult(mockResult);
      onCheckComplete?.(mockResult);
    } catch (error) {
      console.error("Compliance check failed:", error);
      // Create error result
      const { ComplianceCheck } = await import(
        "../../domain/valueObjects/ComplianceCheck"
      );
      const errorResult = ComplianceCheck.createUnsafe([
        {
          category: "inappropriate_content",
          level: "unsafe",
          title: "チェックエラー",
          description: "コンプライアンスチェック中にエラーが発生しました",
          suggestion: "しばらくしてから再試行してください",
          affectedText: "",
        },
      ]);
      setCheckResult(errorResult);
    } finally {
      setLoading(false);
    }
  };

  const getAlertVariant = (level: string) => {
    switch (level) {
      case "unsafe":
        return "destructive";
      case "warning":
        return "default";
      case "caution":
        return "default";
      default:
        return "default";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 50) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className={`w-full max-w-4xl mx-auto space-y-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          リーガルコンプライアンスチェック
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          作成したコンテンツが法的・倫理的問題を含んでいないかを自動チェックします
        </p>
      </div>

      {/* チェック実行ボタン */}
      <Card>
        <CardHeader>
          <CardTitle>コンプライアンス分析</CardTitle>
          <CardDescription>
            著作権、商標権、不適切コンテンツ等の問題をAIが検出します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={checkCompliance}
            disabled={loading || !content.prompt}
            className="w-full"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="Loading"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                分析中...
              </>
            ) : (
              "コンプライアンスチェックを実行"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* チェック結果 */}
      {checkResult && (
        <div className="space-y-6">
          {/* 概要 */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>チェック結果</CardTitle>
                <Badge
                  variant={
                    checkResult.overallLevel === "safe"
                      ? "default"
                      : "destructive"
                  }
                  className="text-lg px-3 py-1"
                >
                  {checkResult.overallLevel === "safe"
                    ? "✅ 安全"
                    : checkResult.overallLevel === "caution"
                      ? "⚠️ 注意"
                      : checkResult.overallLevel === "warning"
                        ? "⚠️ 警告"
                        : "🚨 危険"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">
                      コンプライアンススコア
                    </span>
                    <span
                      className={`text-lg font-bold ${getScoreColor(checkResult.score)}`}
                    >
                      {checkResult.score}/100
                    </span>
                  </div>
                  <Progress value={checkResult.score} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">
                      商用利用:
                    </span>
                    <span
                      className={`ml-2 font-medium ${checkResult.isSafeForCommercialUse() ? "text-green-600" : "text-red-600"}`}
                    >
                      {checkResult.isSafeForCommercialUse() ? "可能" : "要注意"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">
                      公開:
                    </span>
                    <span
                      className={`ml-2 font-medium ${checkResult.isSafeForPublicRelease() ? "text-green-600" : "text-red-600"}`}
                    >
                      {checkResult.isSafeForPublicRelease() ? "可能" : "要注意"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 問題がある場合 */}
          {checkResult.hasIssues() && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="text-red-600 mr-2">⚠️</span>
                  検出された問題 ({checkResult.issues.length}件)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {checkResult.issues.map((issue, index) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: issues don't have stable unique IDs
                    <Alert key={index} variant={getAlertVariant(issue.level)}>
                      <AlertTitle className="flex items-center justify-between">
                        <span>{issue.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {issue.category}
                        </Badge>
                      </AlertTitle>
                      <AlertDescription className="mt-2 space-y-2">
                        <p>{issue.description}</p>
                        {issue.affectedText && (
                          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">
                            <strong>対象テキスト:</strong> {issue.affectedText}
                          </div>
                        )}
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-sm">
                          <strong>推奨:</strong> {issue.suggestion}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 推奨事項 */}
          {checkResult.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>推奨事項</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {checkResult.recommendations.map((recommendation, index) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: recommendations don't have stable unique IDs
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">•</span>
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* 分析詳細 */}
          <Card>
            <CardHeader>
              <CardTitle>分析詳細</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-300">
                    チェック日時:
                  </span>
                  <div className="font-mono">
                    {checkResult.checkedAt.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-300">
                    重大な問題:
                  </span>
                  <div className="font-medium">
                    {checkResult.hasCriticalIssues() ? "あり" : "なし"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-300">
                    カテゴリ数:
                  </span>
                  <div className="font-medium">
                    {Object.keys(checkResult.getCategoryCount()).length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
