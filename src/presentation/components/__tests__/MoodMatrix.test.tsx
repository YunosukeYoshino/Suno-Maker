import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MoodMatrix } from "../MoodMatrix";

describe.skip("MoodMatrix", () => {
  const mockOnMoodChange = vi.fn();
  const defaultMoods: string[] = [];

  beforeEach(() => {
    mockOnMoodChange.mockClear();
  });

  describe("レンダリング", () => {
    it("ムードマトリックスが表示される", () => {
      render(
        <MoodMatrix
          selectedMoods={defaultMoods}
          onMoodChange={mockOnMoodChange}
        />
      );

      expect(screen.getByText("ムードマトリックス")).toBeInTheDocument();
      expect(screen.getByText("エネルギー")).toBeInTheDocument();
      expect(screen.getByText("感情価")).toBeInTheDocument();
    });

    it("選択済みムードが表示される", () => {
      const selectedMoods = ["energetic", "happy", "calm"];

      render(
        <MoodMatrix
          selectedMoods={selectedMoods}
          onMoodChange={mockOnMoodChange}
        />
      );

      expect(screen.getByText("energetic")).toBeInTheDocument();
      expect(screen.getByText("happy")).toBeInTheDocument();
      expect(screen.getByText("calm")).toBeInTheDocument();
    });

    it("最大選択数が表示される", () => {
      render(
        <MoodMatrix
          selectedMoods={defaultMoods}
          onMoodChange={mockOnMoodChange}
          maxSelection={5}
        />
      );

      expect(screen.getByText("0/5 選択済み")).toBeInTheDocument();
    });
  });

  describe("ムード選択", () => {
    it("ムードをクリックして選択できる", async () => {
      const user = userEvent.setup();

      render(
        <MoodMatrix
          selectedMoods={defaultMoods}
          onMoodChange={mockOnMoodChange}
        />
      );

      const energeticMood = screen.getByText("Energetic");
      await user.click(energeticMood);

      expect(mockOnMoodChange).toHaveBeenCalledWith(["energetic"]);
    });

    it("選択済みムードをクリックして解除できる", async () => {
      const user = userEvent.setup();
      const selectedMoods = ["energetic", "happy"];

      render(
        <MoodMatrix
          selectedMoods={selectedMoods}
          onMoodChange={mockOnMoodChange}
        />
      );

      const energeticMood = screen.getByText("Energetic");
      await user.click(energeticMood);

      expect(mockOnMoodChange).toHaveBeenCalledWith(["happy"]);
    });

    it("最大選択数に達すると新しいムードを選択できない", () => {
      const selectedMoods = ["energetic", "happy"];

      render(
        <MoodMatrix
          selectedMoods={selectedMoods}
          onMoodChange={mockOnMoodChange}
          maxSelection={2}
        />
      );

      const calmButton = screen.getByText("Calm");
      expect(calmButton.closest("button")).toBeDisabled();
    });
  });

  describe("マトリックスナビゲーション", () => {
    it("エネルギー軸と感情価軸が表示される", () => {
      render(
        <MoodMatrix
          selectedMoods={defaultMoods}
          onMoodChange={mockOnMoodChange}
        />
      );

      expect(screen.getByText("高エネルギー")).toBeInTheDocument();
      expect(screen.getByText("低エネルギー")).toBeInTheDocument();
      expect(screen.getByText("ポジティブ")).toBeInTheDocument();
      expect(screen.getByText("ネガティブ")).toBeInTheDocument();
    });

    it("各象限に適切なムードが配置されている", () => {
      render(
        <MoodMatrix
          selectedMoods={defaultMoods}
          onMoodChange={mockOnMoodChange}
        />
      );

      // 高エネルギー + ポジティブ = Energetic, Happy
      expect(screen.getByText("Energetic")).toBeInTheDocument();
      expect(screen.getByText("Happy")).toBeInTheDocument();

      // 低エネルギー + ネガティブ = Sad, Melancholic
      expect(screen.getByText("Sad")).toBeInTheDocument();
      expect(screen.getByText("Melancholic")).toBeInTheDocument();
    });
  });

  describe("クリア機能", () => {
    it("すべてクリアボタンで全選択を解除できる", async () => {
      const user = userEvent.setup();
      const selectedMoods = ["energetic", "happy", "calm"];

      render(
        <MoodMatrix
          selectedMoods={selectedMoods}
          onMoodChange={mockOnMoodChange}
        />
      );

      const clearButton = screen.getByText("すべてクリア");
      await user.click(clearButton);

      expect(mockOnMoodChange).toHaveBeenCalledWith([]);
    });

    it("選択がない時はクリアボタンが表示されない", () => {
      render(
        <MoodMatrix
          selectedMoods={defaultMoods}
          onMoodChange={mockOnMoodChange}
        />
      );

      expect(screen.queryByText("すべてクリア")).not.toBeInTheDocument();
    });
  });

  describe("プリセット機能", () => {
    it("ムードプリセットを適用できる", async () => {
      const user = userEvent.setup();

      render(
        <MoodMatrix
          selectedMoods={defaultMoods}
          onMoodChange={mockOnMoodChange}
        />
      );

      const upbeatPreset = screen.getByText("Upbeat");
      await user.click(upbeatPreset);

      expect(mockOnMoodChange).toHaveBeenCalledWith(
        expect.arrayContaining(["energetic", "happy"])
      );
    });
  });
});
