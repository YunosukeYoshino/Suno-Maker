import { fireEvent, render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Import the component that uses useRouter
import Home from "../page";

// next/navigation is mocked by __mocks__/next/navigation.ts

describe("Home Page", () => {
  beforeEach(() => {
    const router = useRouter();
    // Now using vi.mocked to handle types correctly
    vi.mocked(router.push).mockClear();
    vi.mocked(router.back).mockClear();
    vi.mocked(router.forward).mockClear();
    vi.mocked(router.refresh).mockClear();
  });
  it("正常にレンダリングされる", () => {
    render(<Home />);

    expect(screen.getByText("Suno Maker")).toBeInTheDocument();
    expect(screen.getByText("AI音楽制作をもっと簡単に")).toBeInTheDocument();
  });

  it("ヘッダーナビゲーションが正しく表示される", () => {
    render(<Home />);

    // ヘッダーのリンクをテスト
    expect(screen.getByRole("link", { name: "成功事例" })).toHaveAttribute(
      "href",
      "/success-examples"
    );
    expect(
      screen.getByRole("link", { name: "コンプライアンス" })
    ).toHaveAttribute("href", "/compliance");
  });

  it("メインのCTAボタンが正しく表示される", () => {
    render(<Home />);

    const promptButton = screen.getByRole("link", { name: "プロンプトを作成" });
    const lyricsButton = screen.getByRole("link", { name: "歌詞を作成" });

    expect(promptButton).toBeInTheDocument();
    expect(lyricsButton).toBeInTheDocument();
  });

  it("プロンプト作成ボタンが正しいリンクを持つ", () => {
    render(<Home />);

    const promptButton = screen.getByRole("link", { name: "プロンプトを作成" });
    expect(promptButton).toHaveAttribute("href", "/prompt");
  });

  it("歌詞作成ボタンが正しいリンクを持つ", () => {
    render(<Home />);

    const lyricsButton = screen.getByRole("link", { name: "歌詞を作成" });
    expect(lyricsButton).toHaveAttribute("href", "/lyrics");
  });

  it("CTAボタンが正しいスタイルクラスを持つ", () => {
    render(<Home />);

    const promptButton = screen.getByRole("link", { name: "プロンプトを作成" });
    const lyricsButton = screen.getByRole("link", { name: "歌詞を作成" });

    // プロンプトボタンは gradient background
    const promptButtonElement = promptButton.querySelector("button");
    expect(promptButtonElement).toHaveClass(
      "bg-gradient-to-r",
      "from-purple-600",
      "to-blue-600"
    );

    // 歌詞ボタンは outline variant
    const lyricsButtonElement = lyricsButton.querySelector("button");
    expect(lyricsButtonElement).toHaveClass("w-full");
  });

  it("レスポンシブレイアウトが適用されている", () => {
    render(<Home />);

    const buttonContainer = screen.getByRole("link", {
      name: "プロンプトを作成",
    }).parentElement;
    expect(buttonContainer).toHaveClass(
      "flex",
      "flex-col",
      "sm:flex-row",
      "gap-4",
      "justify-center"
    );
  });

  it("ヒーローセクションのテキストが正しく表示される", () => {
    render(<Home />);

    expect(screen.getByText("AI音楽制作をもっと簡単に")).toBeInTheDocument();
    expect(
      screen.getByText(/Suno AI向けの最適化されたプロンプトと歌詞を生成/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/ジャンル特化、言語対応、120文字制限に完全対応/)
    ).toBeInTheDocument();
  });

  it("機能カードが表示される", () => {
    render(<Home />);

    expect(screen.getByText("インテリジェント生成")).toBeInTheDocument();
    expect(screen.getByText("多言語対応")).toBeInTheDocument();
    expect(screen.getByText("Suno完全対応")).toBeInTheDocument();
  });

  it("新機能セクションが表示される", () => {
    render(<Home />);

    expect(
      screen.getByText("新機能：コミュニティ＆コンプライアンス")
    ).toBeInTheDocument();
    expect(screen.getByText("成功事例ライブラリ")).toBeInTheDocument();
    expect(screen.getByText("リーガルコンプライアンス")).toBeInTheDocument();
  });

  it("新機能セクションのボタンが動作する", () => {
    const { push } = useRouter();
    render(<Home />);

    const successExamplesButton = screen.getByRole("button", {
      name: "成功事例を見る",
    });
    const complianceButton = screen.getByRole("button", {
      name: "コンプライアンスチェック",
    });

    fireEvent.click(successExamplesButton);
    expect(push).toHaveBeenCalledWith("/success-examples");

    fireEvent.click(complianceButton);
    expect(push).toHaveBeenCalledWith("/compliance");
  });

  it("統計セクションが表示される", () => {
    render(<Home />);

    expect(
      screen.getByText("Suno Makerで音楽制作をスマートに")
    ).toBeInTheDocument();
    expect(screen.getByText("120+")).toBeInTheDocument();
    expect(screen.getByText("サポートジャンル")).toBeInTheDocument();
    expect(screen.getByText("17")).toBeInTheDocument();
    expect(screen.getByText("対応言語")).toBeInTheDocument();
    expect(screen.getByText("95%")).toBeInTheDocument();
    expect(screen.getByText("最適化率")).toBeInTheDocument();
    expect(screen.getByText("3000")).toBeInTheDocument();
    expect(screen.getByText("最大文字数")).toBeInTheDocument();
  });

  it("フッターが表示される", () => {
    render(<Home />);

    expect(
      screen.getByText("© 2024 Suno Maker. AI音楽制作をもっと簡単に。")
    ).toBeInTheDocument();
  });

  it("アクセシビリティ属性が正しく設定されている", () => {
    render(<Home />);

    // ARIA labels for icons
    const icons = screen.getAllByRole("img");
    for (const icon of icons) {
      expect(icon).toHaveAttribute("aria-label");
    }
  });

  it("ダークモード対応のクラスが適用されている", () => {
    render(<Home />);

    const container = screen
      .getByText("AI音楽制作をもっと簡単に")
      .closest(".min-h-screen");
    expect(container).toHaveClass(
      "dark:from-purple-950/20",
      "dark:to-blue-950/20"
    );
  });

  it("グラデーション背景が適用されている", () => {
    render(<Home />);

    const heroTitle = screen.getByText("もっと簡単に");
    expect(heroTitle).toHaveClass(
      "bg-gradient-to-r",
      "from-purple-600",
      "to-blue-600",
      "bg-clip-text",
      "text-transparent"
    );
  });

  it("モバイル対応のナビゲーションメニューが表示される", () => {
    render(<Home />);

    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("hidden", "md:flex");
  });
});
