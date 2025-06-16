import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Mock } from "vitest";
import PromptPage from "../prompt/page";

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

// Mock presentation components
vi.mock("~/presentation/components/GenreSelector", () => ({
  GenreSelector: ({ selectedGenres, onGenreChange, maxSelection }: any) => (
    <div data-testid="genre-selector">
      <div>Selected: {selectedGenres.join(", ")}</div>
      <div>Max: {maxSelection}</div>
      <button
        onClick={() => onGenreChange([...selectedGenres, "Rock"])}
        data-testid="add-genre"
      >
        Add Rock
      </button>
    </div>
  ),
}));

vi.mock("~/presentation/components/MoodMatrix", () => ({
  MoodMatrix: ({ selectedMoods, onMoodChange, maxSelection }: any) => (
    <div data-testid="mood-matrix">
      <div>Selected Moods: {selectedMoods.join(", ")}</div>
      <div>Max: {maxSelection}</div>
      <button
        onClick={() => onMoodChange([...selectedMoods, "Energetic"])}
        data-testid="add-mood"
      >
        Add Energetic
      </button>
    </div>
  ),
}));

vi.mock("~/presentation/components/InstrumentSelector", () => ({
  InstrumentSelector: ({
    selectedInstruments,
    onInstrumentChange,
    maxSelection,
  }: any) => (
    <div data-testid="instrument-selector">
      <div>Selected Instruments: {selectedInstruments.join(", ")}</div>
      <div>Max: {maxSelection}</div>
      <button
        onClick={() => onInstrumentChange([...selectedInstruments, "Guitar"])}
        data-testid="add-instrument"
      >
        Add Guitar
      </button>
    </div>
  ),
}));

vi.mock("~/presentation/components/ParameterSliders", () => ({
  ParameterSliders: ({ parameters, onParameterChange }: any) => (
    <div data-testid="parameter-sliders">
      <div>Energy: {parameters.energy}</div>
      <div>Tempo: {parameters.tempo}</div>
      <div>Complexity: {parameters.complexity}</div>
      <div>Emotional Intensity: {parameters.emotional_intensity}</div>
      <button
        onClick={() => onParameterChange({ ...parameters, energy: 8 })}
        data-testid="change-energy"
      >
        Change Energy
      </button>
    </div>
  ),
}));

vi.mock("~/presentation/components/TemplateLibrary", () => ({
  TemplateLibrary: ({ templates, onTemplateSelect }: any) => (
    <div data-testid="template-library">
      <div>Templates count: {templates.length}</div>
      <button
        onClick={() => onTemplateSelect({ id: "1", name: "Test Template" })}
        data-testid="select-template"
      >
        Select Template
      </button>
    </div>
  ),
}));

describe("PromptPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("正常にレンダリングされる", () => {
    render(<PromptPage />);

    expect(screen.getByText("プロンプト作成")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Suno AI向けの最適化されたプロンプトを生成します。ジャンル、ムード、楽器を選択してください。"
      )
    ).toBeInTheDocument();
  });

  it("ヘッダーナビゲーションが正しく表示される", () => {
    render(<PromptPage />);

    expect(screen.getByText("Suno Maker")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ホーム" })).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByRole("link", { name: "歌詞作成" })).toHaveAttribute(
      "href",
      "/lyrics"
    );
    expect(screen.getByRole("link", { name: "成功事例" })).toHaveAttribute(
      "href",
      "/success-examples"
    );
    expect(
      screen.getByRole("link", { name: "コンプライアンス" })
    ).toHaveAttribute("href", "/compliance");
    expect(
      screen.getByRole("link", { name: "プロンプト作成" })
    ).toHaveAttribute("href", "/prompt");
  });

  it("全てのコンポーネントセクションが表示される", () => {
    render(<PromptPage />);

    expect(screen.getByText("ジャンル選択")).toBeInTheDocument();
    expect(screen.getByText("ムード・雰囲気")).toBeInTheDocument();
    expect(screen.getByText("楽器選択")).toBeInTheDocument();
    expect(screen.getByText("パラメータ調整")).toBeInTheDocument();
    expect(screen.getByText("テンプレート")).toBeInTheDocument();
    expect(screen.getByText("プロンプト生成")).toBeInTheDocument();
  });

  it("ジャンル選択機能が動作する", async () => {
    render(<PromptPage />);

    const genreSelector = screen.getByTestId("genre-selector");
    expect(genreSelector).toBeInTheDocument();
    expect(screen.getByText("Max: 3")).toBeInTheDocument();

    const addGenreButton = screen.getByTestId("add-genre");
    fireEvent.click(addGenreButton);

    await waitFor(() => {
      expect(screen.getByText("Selected: Rock")).toBeInTheDocument();
    });
  });

  it("ムード選択機能が動作する", async () => {
    render(<PromptPage />);

    const moodMatrix = screen.getByTestId("mood-matrix");
    expect(moodMatrix).toBeInTheDocument();
    expect(screen.getByText("Max: 3")).toBeInTheDocument();

    const addMoodButton = screen.getByTestId("add-mood");
    fireEvent.click(addMoodButton);

    await waitFor(() => {
      expect(screen.getByText("Selected Moods: Energetic")).toBeInTheDocument();
    });
  });

  it("楽器選択機能が動作する", async () => {
    render(<PromptPage />);

    const instrumentSelector = screen.getByTestId("instrument-selector");
    expect(instrumentSelector).toBeInTheDocument();
    expect(screen.getByText("Max: 5")).toBeInTheDocument();

    const addInstrumentButton = screen.getByTestId("add-instrument");
    fireEvent.click(addInstrumentButton);

    await waitFor(() => {
      expect(
        screen.getByText("Selected Instruments: Guitar")
      ).toBeInTheDocument();
    });
  });

  it("パラメータ調整機能が動作する", async () => {
    render(<PromptPage />);

    const parameterSliders = screen.getByTestId("parameter-sliders");
    expect(parameterSliders).toBeInTheDocument();
    expect(screen.getByText("Energy: 5")).toBeInTheDocument();
    expect(screen.getByText("Tempo: 5")).toBeInTheDocument();
    expect(screen.getByText("Complexity: 5")).toBeInTheDocument();
    expect(screen.getByText("Emotional Intensity: 5")).toBeInTheDocument();

    const changeEnergyButton = screen.getByTestId("change-energy");
    fireEvent.click(changeEnergyButton);

    await waitFor(() => {
      expect(screen.getByText("Energy: 8")).toBeInTheDocument();
    });
  });

  it("テンプレートライブラリが表示される", () => {
    render(<PromptPage />);

    const templateLibrary = screen.getByTestId("template-library");
    expect(templateLibrary).toBeInTheDocument();
    expect(screen.getByText("Templates count: 0")).toBeInTheDocument();
  });

  it("テンプレート選択機能が動作する", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    render(<PromptPage />);

    const selectTemplateButton = screen.getByTestId("select-template");
    fireEvent.click(selectTemplateButton);

    expect(consoleSpy).toHaveBeenCalledWith("Template selected:", {
      id: "1",
      name: "Test Template",
    });

    consoleSpy.mockRestore();
  });

  it("プロンプト生成ボタンが動作する", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    render(<PromptPage />);

    const generateButton = screen.getByRole("button", {
      name: "プロンプトを生成",
    });
    fireEvent.click(generateButton);

    expect(consoleSpy).toHaveBeenCalledWith("Generating prompt with:", {
      genres: [],
      moods: [],
      instruments: [],
      parameters: {
        energy: 5,
        tempo: 5,
        complexity: 5,
        emotional_intensity: 5,
      },
    });

    consoleSpy.mockRestore();
  });

  it("レスポンシブレイアウトのクラスが適用されている", () => {
    render(<PromptPage />);

    const mainGrid = screen.getByText("ジャンル選択").closest(".grid");
    expect(mainGrid).toHaveClass("grid-cols-1", "lg:grid-cols-3");

    const leftColumn = screen
      .getByText("ジャンル選択")
      .closest(".lg\\:col-span-2");
    expect(leftColumn).toHaveClass("lg:col-span-2");
  });

  it("適切な説明文が表示される", () => {
    render(<PromptPage />);

    expect(
      screen.getByText("選択した設定に基づいて最適なプロンプトを生成します")
    ).toBeInTheDocument();
  });
});
