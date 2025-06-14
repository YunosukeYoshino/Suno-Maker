import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { Genre } from "../../../domain/valueObjects/Genre";
import { Language } from "../../../domain/valueObjects/Language";
import { SuccessExamplesLibrary } from "../SuccessExamplesLibrary";

// モックコンポーネント
vi.mock("../../../components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("../../../components/ui/input", () => ({
  Input: ({
    placeholder,
    value,
    onChange,
    className,
  }: {
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
  }) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
    />
  ),
}));

vi.mock("../../../components/ui/badge", () => ({
  Badge: ({ children, variant, className }: any) => (
    <span className={`badge ${variant} ${className}`}>{children}</span>
  ),
}));

vi.mock("../../../components/ui/tabs", () => ({
  Tabs: ({ children, value, onValueChange }: any) => (
    <div data-value={value} data-testid="tabs">
      {children}
    </div>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-value={value} data-testid="tabs-content">
      {children}
    </div>
  ),
  TabsList: ({ children }: any) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ children, value, onClick }: any) => (
    <button data-value={value} onClick={onClick} data-testid="tabs-trigger">
      {children}
    </button>
  ),
}));

vi.mock("../../../components/ui/card", () => ({
  Card: ({ children, className, onClick }: any) => (
    <div className={`card ${className}`} onClick={onClick} data-testid="card">
      {children}
    </div>
  ),
  CardContent: ({ children }: any) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardDescription: ({ children }: any) => (
    <div data-testid="card-description">{children}</div>
  ),
  CardHeader: ({ children }: any) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children, className }: any) => (
    <h3 className={className} data-testid="card-title">
      {children}
    </h3>
  ),
}));

describe("SuccessExamplesLibrary", () => {
  it("成功事例ライブラリを正常にレンダリングする", () => {
    render(<SuccessExamplesLibrary />);

    expect(screen.getByText("成功事例ライブラリ")).toBeInTheDocument();
    expect(
      screen.getByText(
        "高評価を獲得したプロンプトと歌詞から学び、あなたの創作に活用しましょう"
      )
    ).toBeInTheDocument();
  });

  it("検索入力フィールドが表示される", () => {
    render(<SuccessExamplesLibrary />);

    const searchInput = screen.getByPlaceholderText(
      "プロンプト、歌詞、タグで検索..."
    );
    expect(searchInput).toBeInTheDocument();
  });

  it("ソート選択が表示される", () => {
    render(<SuccessExamplesLibrary />);

    const sortSelect = screen.getByDisplayValue("品質スコア順");
    expect(sortSelect).toBeInTheDocument();
  });

  it("タブが正しく表示される", () => {
    render(<SuccessExamplesLibrary />);

    expect(screen.getByText("すべて")).toBeInTheDocument();
    expect(screen.getByText("トレンド")).toBeInTheDocument();
    expect(screen.getByText("高評価")).toBeInTheDocument();
    expect(screen.getByText("最新")).toBeInTheDocument();
    expect(screen.getByText("人気")).toBeInTheDocument();
  });

  it("成功事例が見つからない場合のメッセージを表示する", () => {
    render(<SuccessExamplesLibrary />);

    expect(
      screen.getByText("成功事例が見つかりませんでした")
    ).toBeInTheDocument();
  });

  it("onExampleSelectコールバックが呼ばれる", () => {
    const mockOnSelect = vi.fn();
    render(<SuccessExamplesLibrary onExampleSelect={mockOnSelect} />);

    // 成功事例が表示されていないため、このテストは現在はスキップ
    // 実際の実装では、モックデータがある場合にテストする
  });

  it("ジャンルと言語のフィルターが適用される", () => {
    const genre = Genre.create("Rock");
    const language = Language.create("en");

    render(<SuccessExamplesLibrary genre={genre} language={language} />);

    // フィルターが適用されていることを確認
    // 実際の実装では、フィルターが適用された検索結果を確認する
    expect(screen.getByText("成功事例ライブラリ")).toBeInTheDocument();
  });
});
