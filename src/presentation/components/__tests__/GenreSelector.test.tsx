import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GenreSelector } from "../GenreSelector";

describe("GenreSelector", () => {
  const mockOnGenreChange = vi.fn();

  beforeEach(() => {
    mockOnGenreChange.mockClear();
  });

  describe("レンダリング", () => {
    it("必要な要素が表示される", () => {
      render(
        <GenreSelector selectedGenres={[]} onGenreChange={mockOnGenreChange} />
      );

      expect(screen.getByText("選択済みジャンル")).toBeInTheDocument();
      expect(screen.getByText("メインジャンル")).toBeInTheDocument();
      expect(screen.getByText("全ジャンル")).toBeInTheDocument();
      expect(screen.getByText("検索")).toBeInTheDocument();
    });

    it("選択済みジャンルが表示される", () => {
      render(
        <GenreSelector
          selectedGenres={["Rock", "Pop"]}
          onGenreChange={mockOnGenreChange}
        />
      );

      expect(screen.getByText("Rock")).toBeInTheDocument();
      expect(screen.getByText("Pop")).toBeInTheDocument();
      expect(screen.getByText("2/5 選択済み")).toBeInTheDocument();
    });

    it("選択制限が正しく表示される", () => {
      render(
        <GenreSelector
          selectedGenres={["Rock"]}
          onGenreChange={mockOnGenreChange}
          maxSelection={3}
        />
      );

      expect(screen.getByText("1/3 選択済み")).toBeInTheDocument();
    });
  });

  describe("ジャンル選択", () => {
    it("メインジャンルを選択できる", async () => {
      const user = userEvent.setup();

      render(
        <GenreSelector selectedGenres={[]} onGenreChange={mockOnGenreChange} />
      );

      const rockButton = screen.getByRole("button", { name: "Rock" });
      await user.click(rockButton);

      expect(mockOnGenreChange).toHaveBeenCalledWith(["Rock"]);
    });

    it("選択済みジャンルを削除できる", async () => {
      const user = userEvent.setup();

      render(
        <GenreSelector
          selectedGenres={["Rock", "Pop"]}
          onGenreChange={mockOnGenreChange}
        />
      );

      const rockButton = screen.getByRole("button", { name: "Rock" });
      await user.click(rockButton);

      expect(mockOnGenreChange).toHaveBeenCalledWith(["Pop"]);
    });

    it("最大選択数に達すると新しいジャンルを選択できない", async () => {
      const user = userEvent.setup();

      render(
        <GenreSelector
          selectedGenres={["Rock", "Pop"]}
          onGenreChange={mockOnGenreChange}
          maxSelection={2}
        />
      );

      const jazzButton = screen.getByRole("button", { name: "Jazz" });
      expect(jazzButton).toBeDisabled();
    });
  });

  describe("検索機能", () => {
    it("検索タブで検索できる", async () => {
      const user = userEvent.setup();

      render(
        <GenreSelector selectedGenres={[]} onGenreChange={mockOnGenreChange} />
      );

      // 検索タブに切り替え
      await user.click(screen.getByText("検索"));

      // 検索入力
      const searchInput = screen.getByPlaceholderText("ジャンルを検索...");
      await user.type(searchInput, "rock");

      expect(searchInput).toHaveValue("rock");
    });
  });

  describe("サブジャンル表示", () => {
    it("メインジャンル選択時にサブジャンルが表示される", () => {
      render(
        <GenreSelector
          selectedGenres={["Electronic"]}
          onGenreChange={mockOnGenreChange}
        />
      );

      expect(screen.getByText("Electronic サブジャンル")).toBeInTheDocument();
      expect(screen.getByText("EDM")).toBeInTheDocument();
      expect(screen.getByText("House")).toBeInTheDocument();
    });
  });

  describe("すべてクリア機能", () => {
    it("すべてクリアボタンで全選択を解除できる", async () => {
      const user = userEvent.setup();

      render(
        <GenreSelector
          selectedGenres={["Rock", "Pop", "Jazz"]}
          onGenreChange={mockOnGenreChange}
        />
      );

      const clearButton = screen.getByText("すべてクリア");
      await user.click(clearButton);

      expect(mockOnGenreChange).toHaveBeenCalledWith([]);
    });

    it("選択がない時はクリアボタンが表示されない", () => {
      render(
        <GenreSelector selectedGenres={[]} onGenreChange={mockOnGenreChange} />
      );

      expect(screen.queryByText("すべてクリア")).not.toBeInTheDocument();
    });
  });
});
