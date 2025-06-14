import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ComplianceChecker } from "../ComplianceChecker";

// モックコンポーネント
vi.mock("../../../components/ui/button", () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("../../../components/ui/alert", () => ({
  Alert: ({ children, variant }: any) => (
    <div className={`alert ${variant}`} data-testid="alert">
      {children}
    </div>
  ),
  AlertTitle: ({ children }: any) => (
    <h4 data-testid="alert-title">{children}</h4>
  ),
  AlertDescription: ({ children }: any) => (
    <div data-testid="alert-description">{children}</div>
  ),
}));

vi.mock("../../../components/ui/badge", () => ({
  Badge: ({ children, variant, className }: any) => (
    <span className={`badge ${variant} ${className}`}>{children}</span>
  ),
}));

vi.mock("../../../components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div className={`card ${className}`} data-testid="card">
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
  CardTitle: ({ children }: any) => (
    <h3 data-testid="card-title">{children}</h3>
  ),
}));

vi.mock("../../../components/ui/progress", () => ({
  Progress: ({ value, className }: any) => (
    <div
      className={`progress ${className}`}
      data-value={value}
      data-testid="progress"
    >
      <div style={{ width: `${value}%` }} />
    </div>
  ),
}));

describe("ComplianceChecker", () => {
  const mockContent = {
    title: "Test Song",
    description: "A test song for compliance checking",
    prompt: "rock, energetic, guitar",
    lyrics: "This is a test song",
    tags: ["rock", "test"],
  };

  it("コンプライアンスチェッカーを正常にレンダリングする", () => {
    render(<ComplianceChecker content={mockContent} />);

    expect(
      screen.getByText("リーガルコンプライアンスチェック")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "作成したコンテンツが法的・倫理的問題を含んでいないかを自動チェックします"
      )
    ).toBeInTheDocument();
  });

  it("チェック実行ボタンが表示される", () => {
    render(<ComplianceChecker content={mockContent} />);

    const checkButton = screen.getByText("コンプライアンスチェックを実行");
    expect(checkButton).toBeInTheDocument();
    expect(checkButton).not.toBeDisabled();
  });

  it("プロンプトが空の場合はボタンが無効になる", () => {
    const emptyContent = { ...mockContent, prompt: "" };
    render(<ComplianceChecker content={emptyContent} />);

    const checkButton = screen.getByText("コンプライアンスチェックを実行");
    expect(checkButton).toBeDisabled();
  });

  it("チェック実行時にローディング状態が表示される", async () => {
    render(<ComplianceChecker content={mockContent} />);

    const checkButton = screen.getByText("コンプライアンスチェックを実行");
    fireEvent.click(checkButton);

    expect(screen.getByText("分析中...")).toBeInTheDocument();
  });

  it("チェック完了後に結果が表示される", async () => {
    render(<ComplianceChecker content={mockContent} />);

    const checkButton = screen.getByText("コンプライアンスチェックを実行");
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText("チェック結果")).toBeInTheDocument();
    });

    expect(screen.getByText("コンプライアンススコア")).toBeInTheDocument();
    expect(screen.getByText("商用利用:")).toBeInTheDocument();
    expect(screen.getByText("公開:")).toBeInTheDocument();
  });

  it("onCheckCompleteコールバックが呼ばれる", async () => {
    const mockOnComplete = vi.fn();
    render(
      <ComplianceChecker
        content={mockContent}
        onCheckComplete={mockOnComplete}
      />
    );

    const checkButton = screen.getByText("コンプライアンスチェックを実行");
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  it("カードの説明文が正しく表示される", () => {
    render(<ComplianceChecker content={mockContent} />);

    expect(screen.getByText("コンプライアンス分析")).toBeInTheDocument();
    expect(
      screen.getByText(
        "著作権、商標権、不適切コンテンツ等の問題をAIが検出します"
      )
    ).toBeInTheDocument();
  });
});
