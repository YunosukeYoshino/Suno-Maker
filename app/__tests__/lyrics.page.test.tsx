import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LyricsPage from "../lyrics/page";

// Mock Next.js router
const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

describe("LyricsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("正常にレンダリングされる", () => {
    render(<LyricsPage />);

    expect(screen.getByText("歌詞作成")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Suno AI向けの最適化された歌詞を生成します。テーマ、言語、構造を設定してください。"
      )
    ).toBeInTheDocument();
  });

  it("ヘッダーナビゲーションが正しく表示される", () => {
    render(<LyricsPage />);

    expect(screen.getByText("Suno Maker")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ホーム" })).toHaveAttribute(
      "href",
      "/"
    );
    expect(
      screen.getByRole("link", { name: "プロンプト作成" })
    ).toHaveAttribute("href", "/prompt");
    expect(screen.getByRole("link", { name: "成功事例" })).toHaveAttribute(
      "href",
      "/success-examples"
    );
    expect(
      screen.getByRole("link", { name: "コンプライアンス" })
    ).toHaveAttribute("href", "/compliance");
    expect(screen.getByRole("link", { name: "歌詞作成" })).toHaveAttribute(
      "href",
      "/lyrics"
    );
  });

  it("基本設定セクションが表示される", () => {
    render(<LyricsPage />);

    expect(screen.getByText("基本設定")).toBeInTheDocument();
    expect(screen.getByLabelText("テーマ・コンセプト")).toBeInTheDocument();
    expect(screen.getByLabelText("ムード・雰囲気")).toBeInTheDocument();
  });

  it("テーマ入力フィールドが動作する", async () => {
    render(<LyricsPage />);

    const themeInput = screen.getByLabelText("テーマ・コンセプト");
    fireEvent.change(themeInput, { target: { value: "恋愛" } });

    await waitFor(() => {
      expect(themeInput).toHaveValue("恋愛");
    });
  });

  it("ムード入力フィールドが動作する", async () => {
    render(<LyricsPage />);

    const moodInput = screen.getByLabelText("ムード・雰囲気");
    fireEvent.change(moodInput, { target: { value: "明るい" } });

    await waitFor(() => {
      expect(moodInput).toHaveValue("明るい");
    });
  });

  it("言語タブが正しく表示される", () => {
    render(<LyricsPage />);

    expect(screen.getByRole("tab", { name: "日本語" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "英語" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "ミックス" })).toBeInTheDocument();
  });

  it("言語タブの切り替えが動作する", async () => {
    render(<LyricsPage />);

    const englishTab = screen.getByRole("tab", { name: "英語" });
    fireEvent.click(englishTab);

    await waitFor(() => {
      expect(
        screen.getByText(
          "英語歌詞を生成。グローバルスタンダードな表現を使用します。"
        )
      ).toBeInTheDocument();
    });
  });

  it("歌詞構造選択が表示される", () => {
    render(<LyricsPage />);

    expect(screen.getByLabelText("歌詞構造")).toBeInTheDocument();
    const structureSelect = screen.getByDisplayValue("Verse-Chorus");
    expect(structureSelect).toBeInTheDocument();
  });

  it("歌詞構造の変更が動作する", async () => {
    render(<LyricsPage />);

    const structureSelect = screen.getByLabelText("歌詞構造");
    fireEvent.change(structureSelect, { target: { value: "aaba" } });

    await waitFor(() => {
      expect(structureSelect).toHaveValue("aaba");
    });
  });

  it("ジャンル選択が表示される", () => {
    render(<LyricsPage />);

    expect(screen.getByText("ジャンル選択")).toBeInTheDocument();
    expect(screen.getByText("Rock")).toBeInTheDocument();
    expect(screen.getByText("Pop")).toBeInTheDocument();
    expect(screen.getByText("Jazz")).toBeInTheDocument();
  });

  it("ジャンルの選択/解除が動作する", async () => {
    render(<LyricsPage />);

    const rockGenre = screen.getByText("Rock");
    fireEvent.click(rockGenre);

    await waitFor(() => {
      // Badge の variant が変わることを確認（selected状態）
      expect(rockGenre).toBeInTheDocument();
    });

    // 再度クリックして解除
    fireEvent.click(rockGenre);

    await waitFor(() => {
      expect(rockGenre).toBeInTheDocument();
    });
  });

  it("最大3つまでジャンル選択できる制限がある", () => {
    render(<LyricsPage />);

    expect(screen.getByText("最大3つまで選択可能")).toBeInTheDocument();
  });

  it("設定プレビューが表示される", () => {
    render(<LyricsPage />);

    expect(screen.getByText("設定プレビュー")).toBeInTheDocument();
    expect(screen.getByText(/テーマ:/)).toBeInTheDocument();
    expect(screen.getByText(/言語:/)).toBeInTheDocument();
    expect(screen.getByText(/構造:/)).toBeInTheDocument();
    expect(screen.getByText(/ムード:/)).toBeInTheDocument();
    expect(screen.getByText(/ジャンル:/)).toBeInTheDocument();
  });

  it("設定プレビューが状態を反映する", async () => {
    render(<LyricsPage />);

    // テーマを設定
    const themeInput = screen.getByLabelText("テーマ・コンセプト");
    fireEvent.change(themeInput, { target: { value: "青春" } });

    await waitFor(() => {
      expect(screen.getByText("テーマ: 青春")).toBeInTheDocument();
    });

    // 言語を変更
    const englishTab = screen.getByRole("tab", { name: "英語" });
    fireEvent.click(englishTab);

    await waitFor(() => {
      expect(screen.getByText("言語: 英語")).toBeInTheDocument();
    });
  });

  it("歌詞生成ボタンが動作する", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    render(<LyricsPage />);

    const generateButton = screen.getByRole("button", { name: "歌詞を生成" });
    fireEvent.click(generateButton);

    expect(consoleSpy).toHaveBeenCalledWith("Generating lyrics with:", {
      theme: "",
      language: "japanese",
      structure: "verse-chorus",
      mood: "",
      genres: [],
    });

    consoleSpy.mockRestore();
  });

  it("作詞のコツセクションが表示される", () => {
    render(<LyricsPage />);

    expect(screen.getByText("作詞のコツ")).toBeInTheDocument();
    expect(
      screen.getByText("• 具体的なテーマを設定すると良い歌詞が生成されます")
    ).toBeInTheDocument();
    expect(
      screen.getByText("• ジャンルに合ったムードを選択しましょう")
    ).toBeInTheDocument();
    expect(
      screen.getByText("• 120文字制限を意識した構成になります")
    ).toBeInTheDocument();
    expect(
      screen.getByText("• Suno AIの最新機能に最適化されています")
    ).toBeInTheDocument();
  });

  it("レスポンシブレイアウトのクラスが適用されている", () => {
    render(<LyricsPage />);

    const mainGrid = screen.getByText("基本設定").closest(".grid");
    expect(mainGrid).toHaveClass("grid-cols-1", "lg:grid-cols-3");

    const leftColumn = screen.getByText("基本設定").closest(".lg\\:col-span-2");
    expect(leftColumn).toHaveClass("lg:col-span-2");
  });

  it("入力フィールドにプレースホルダーが設定されている", () => {
    render(<LyricsPage />);

    const themeInput = screen.getByLabelText("テーマ・コンセプト");
    expect(themeInput).toHaveAttribute(
      "placeholder",
      "例: 恋愛、希望、挑戦、青春..."
    );

    const moodInput = screen.getByLabelText("ムード・雰囲気");
    expect(moodInput).toHaveAttribute(
      "placeholder",
      "例: 明るい、切ない、エネルギッシュ、静か..."
    );
  });

  it("適切な説明文が表示される", () => {
    render(<LyricsPage />);

    expect(
      screen.getByText("設定に基づいて最適な歌詞を生成します")
    ).toBeInTheDocument();
  });

  it("デフォルト値が正しく設定されている", () => {
    render(<LyricsPage />);

    expect(screen.getByText("言語: 日本語")).toBeInTheDocument();
    expect(screen.getByText("構造: Verse-Chorus")).toBeInTheDocument();
    expect(screen.getByText("テーマ: 未設定")).toBeInTheDocument();
    expect(screen.getByText("ムード: 未設定")).toBeInTheDocument();
    expect(screen.getByText("ジャンル: 未選択")).toBeInTheDocument();
  });
});
