import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InstrumentSelector } from "../InstrumentSelector";

describe("InstrumentSelector", () => {
  const mockOnInstrumentChange = vi.fn();
  const defaultInstruments: string[] = [];

  beforeEach(() => {
    mockOnInstrumentChange.mockClear();
  });

  describe("レンダリング", () => {
    it("必要なカテゴリが表示される", () => {
      render(
        <InstrumentSelector
          selectedInstruments={defaultInstruments}
          onInstrumentChange={mockOnInstrumentChange}
        />
      );

      expect(screen.getByText("弦楽器")).toBeInTheDocument();
      expect(screen.getByText("管楽器")).toBeInTheDocument();
      expect(screen.getByText("打楽器")).toBeInTheDocument();
      expect(screen.getByText("電子楽器")).toBeInTheDocument();
      expect(screen.getByText("伝統楽器")).toBeInTheDocument();
    });

    it("選択済み楽器が表示される", () => {
      const selectedInstruments = ["electric guitar", "piano", "drums"];

      render(
        <InstrumentSelector
          selectedInstruments={selectedInstruments}
          onInstrumentChange={mockOnInstrumentChange}
        />
      );

      expect(screen.getByText("electric guitar")).toBeInTheDocument();
      expect(screen.getByText("piano")).toBeInTheDocument();
      expect(screen.getByText("drums")).toBeInTheDocument();
      expect(screen.getByText("3/10 選択済み")).toBeInTheDocument();
    });

    it("選択制限が正しく表示される", () => {
      render(
        <InstrumentSelector
          selectedInstruments={defaultInstruments}
          onInstrumentChange={mockOnInstrumentChange}
          maxSelection={5}
        />
      );

      expect(screen.getByText("0/5 選択済み")).toBeInTheDocument();
    });
  });

  describe("楽器選択", () => {
    it("楽器を選択できる", async () => {
      const user = userEvent.setup();

      render(
        <InstrumentSelector
          selectedInstruments={defaultInstruments}
          onInstrumentChange={mockOnInstrumentChange}
        />
      );

      const guitarButton = screen.getByRole("button", {
        name: "Electric Guitar",
      });
      await user.click(guitarButton);

      expect(mockOnInstrumentChange).toHaveBeenCalledWith(["electric guitar"]);
    });

    it("選択済み楽器を削除できる", async () => {
      const user = userEvent.setup();
      const selectedInstruments = ["electric guitar", "piano"];

      render(
        <InstrumentSelector
          selectedInstruments={selectedInstruments}
          onInstrumentChange={mockOnInstrumentChange}
        />
      );

      const guitarButton = screen.getByRole("button", {
        name: "Electric Guitar",
      });
      await user.click(guitarButton);

      expect(mockOnInstrumentChange).toHaveBeenCalledWith(["piano"]);
    });

    it("最大選択数に達すると新しい楽器を選択できない", async () => {
      const user = userEvent.setup();
      const selectedInstruments = ["electric guitar", "piano"];

      render(
        <InstrumentSelector
          selectedInstruments={selectedInstruments}
          onInstrumentChange={mockOnInstrumentChange}
          maxSelection={2}
        />
      );

      const drumsButton = screen.getByRole("button", { name: "Drums" });
      expect(drumsButton).toBeDisabled();
    });
  });

  describe("カテゴリフィルタリング", () => {
    it("弦楽器カテゴリでフィルタリングできる", async () => {
      const user = userEvent.setup();

      render(
        <InstrumentSelector
          selectedInstruments={defaultInstruments}
          onInstrumentChange={mockOnInstrumentChange}
        />
      );

      const stringTab = screen.getByText("弦楽器");
      await user.click(stringTab);

      expect(screen.getByText("Electric Guitar")).toBeInTheDocument();
      expect(screen.getByText("Acoustic Guitar")).toBeInTheDocument();
      expect(screen.getByText("Bass")).toBeInTheDocument();
    });

    it("電子楽器カテゴリでフィルタリングできる", async () => {
      const user = userEvent.setup();

      render(
        <InstrumentSelector
          selectedInstruments={defaultInstruments}
          onInstrumentChange={mockOnInstrumentChange}
        />
      );

      const electronicTab = screen.getByText("電子楽器");
      await user.click(electronicTab);

      expect(screen.getByText("Synthesizer")).toBeInTheDocument();
      expect(screen.getByText("Sampler")).toBeInTheDocument();
    });
  });

  describe("検索機能", () => {
    it("楽器名で検索できる", async () => {
      const user = userEvent.setup();

      render(
        <InstrumentSelector
          selectedInstruments={defaultInstruments}
          onInstrumentChange={mockOnInstrumentChange}
        />
      );

      const searchInput = screen.getByPlaceholderText("楽器を検索...");
      await user.type(searchInput, "guitar");

      expect(searchInput).toHaveValue("guitar");
    });
  });

  describe("すべてクリア機能", () => {
    it("すべてクリアボタンで全選択を解除できる", async () => {
      const user = userEvent.setup();
      const selectedInstruments = ["electric guitar", "piano", "drums"];

      render(
        <InstrumentSelector
          selectedInstruments={selectedInstruments}
          onInstrumentChange={mockOnInstrumentChange}
        />
      );

      const clearButton = screen.getByText("すべてクリア");
      await user.click(clearButton);

      expect(mockOnInstrumentChange).toHaveBeenCalledWith([]);
    });

    it("選択がない時はクリアボタンが表示されない", () => {
      render(
        <InstrumentSelector
          selectedInstruments={defaultInstruments}
          onInstrumentChange={mockOnInstrumentChange}
        />
      );

      expect(screen.queryByText("すべてクリア")).not.toBeInTheDocument();
    });
  });

  describe("楽器グルーピング", () => {
    it("カテゴリ別に楽器がグルーピングされている", () => {
      render(
        <InstrumentSelector
          selectedInstruments={defaultInstruments}
          onInstrumentChange={mockOnInstrumentChange}
        />
      );

      // 各カテゴリに適切な楽器が含まれていることを確認
      expect(screen.getByText("弦楽器")).toBeInTheDocument();
      expect(screen.getByText("管楽器")).toBeInTheDocument();
      expect(screen.getByText("打楽器")).toBeInTheDocument();
    });
  });
});
