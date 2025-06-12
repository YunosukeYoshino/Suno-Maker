import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ParameterSliders } from "../ParameterSliders";

describe("ParameterSliders", () => {
  const mockOnParameterChange = vi.fn();
  const defaultParameters = {
    energy: 5,
    complexity: 5,
    tempo: 5,
    emotional_intensity: 5,
  };

  beforeEach(() => {
    mockOnParameterChange.mockClear();
  });

  describe("レンダリング", () => {
    it("必要なスライダーが表示される", () => {
      render(
        <ParameterSliders
          parameters={defaultParameters}
          onParameterChange={mockOnParameterChange}
        />
      );

      expect(screen.getByText("Energy")).toBeInTheDocument();
      expect(screen.getByText("Complexity")).toBeInTheDocument();
      expect(screen.getByText("Tempo")).toBeInTheDocument();
      expect(screen.getByText("Emotional Intensity")).toBeInTheDocument();
    });

    it("初期値が正しく表示される", () => {
      const customParameters = {
        energy: 8,
        complexity: 3,
        tempo: 7,
        emotional_intensity: 6,
      };

      render(
        <ParameterSliders
          parameters={customParameters}
          onParameterChange={mockOnParameterChange}
        />
      );

      expect(screen.getByDisplayValue("8")).toBeInTheDocument();
      expect(screen.getByDisplayValue("3")).toBeInTheDocument();
      expect(screen.getByDisplayValue("7")).toBeInTheDocument();
      expect(screen.getByDisplayValue("6")).toBeInTheDocument();
    });

    it("スライダーの範囲が正しく設定されている", () => {
      render(
        <ParameterSliders
          parameters={defaultParameters}
          onParameterChange={mockOnParameterChange}
        />
      );

      const sliders = screen.getAllByRole("slider");
      sliders.forEach((slider) => {
        expect(slider).toHaveAttribute("min", "1");
        expect(slider).toHaveAttribute("max", "10");
      });
    });
  });

  describe("パラメータ変更", () => {
    it("Energyスライダーの値を変更できる", async () => {
      const user = userEvent.setup();

      render(
        <ParameterSliders
          parameters={defaultParameters}
          onParameterChange={mockOnParameterChange}
        />
      );

      const energySlider = screen.getByLabelText("Energy");
      await user.clear(energySlider);
      await user.type(energySlider, "8");

      expect(mockOnParameterChange).toHaveBeenCalledWith(
        expect.objectContaining({ energy: 8 })
      );
    });

    it("Complexityスライダーの値を変更できる", async () => {
      const user = userEvent.setup();

      render(
        <ParameterSliders
          parameters={defaultParameters}
          onParameterChange={mockOnParameterChange}
        />
      );

      const complexitySlider = screen.getByLabelText("Complexity");
      await user.clear(complexitySlider);
      await user.type(complexitySlider, "3");

      expect(mockOnParameterChange).toHaveBeenCalledWith(
        expect.objectContaining({ complexity: 3 })
      );
    });
  });

  describe("パラメータ表示", () => {
    it("Energyレベルに応じて適切な説明が表示される", () => {
      const highEnergyParams = { ...defaultParameters, energy: 9 };

      render(
        <ParameterSliders
          parameters={highEnergyParams}
          onParameterChange={mockOnParameterChange}
        />
      );

      expect(screen.getByText("Very High")).toBeInTheDocument();
    });

    it("Complexityレベルに応じて適切な説明が表示される", () => {
      const lowComplexityParams = { ...defaultParameters, complexity: 2 };

      render(
        <ParameterSliders
          parameters={lowComplexityParams}
          onParameterChange={mockOnParameterChange}
        />
      );

      expect(screen.getByText("Very Simple")).toBeInTheDocument();
    });
  });

  describe("リセット機能", () => {
    it("リセットボタンで全パラメータをデフォルト値に戻せる", async () => {
      const user = userEvent.setup();
      const customParameters = {
        energy: 9,
        complexity: 2,
        tempo: 8,
        emotional_intensity: 3,
      };

      render(
        <ParameterSliders
          parameters={customParameters}
          onParameterChange={mockOnParameterChange}
        />
      );

      const resetButton = screen.getByText("リセット");
      await user.click(resetButton);

      expect(mockOnParameterChange).toHaveBeenCalledWith({
        energy: 5,
        complexity: 5,
        tempo: 5,
        emotional_intensity: 5,
      });
    });
  });

  describe("プリセット機能", () => {
    it("プリセットを適用できる", async () => {
      const user = userEvent.setup();

      render(
        <ParameterSliders
          parameters={defaultParameters}
          onParameterChange={mockOnParameterChange}
        />
      );

      const relaxedPreset = screen.getByText("Relaxed");
      await user.click(relaxedPreset);

      expect(mockOnParameterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          energy: expect.any(Number),
          complexity: expect.any(Number),
          tempo: expect.any(Number),
          emotional_intensity: expect.any(Number),
        })
      );
    });
  });
});
