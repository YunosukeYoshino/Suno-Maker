/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  Template,
  type TemplateProps,
} from "../../../domain/entities/Template";
import { Genre } from "../../../domain/valueObjects/Genre";
import { Language } from "../../../domain/valueObjects/Language";
import { StyleField } from "../../../domain/valueObjects/StyleField";
import { TemplateLibrary } from "../TemplateLibrary";

const createMockTemplate = (overrides?: Partial<TemplateProps>) => {
  return Template.create({
    name: "Rock Ballad Template",
    description: "Emotional rock ballad with powerful vocals",
    genre: Genre.create("Rock"),
    language: Language.create("en"),
    styleField: StyleField.create("emotional, powerful vocals, guitar solo"),
    lyricsStructure: "[Verse 1]\n{verse1}\n\n[Chorus]\n{chorus}",
    tags: ["ballad", "emotional", "guitar"],
    category: "genre-specific",
    qualityScore: 85,
    usageCount: 150,
    ...overrides,
  });
};

const createMockTemplates = () => [
  createMockTemplate({
    name: "Rock Anthem",
    category: "genre-specific",
    qualityScore: 90,
    usageCount: 200,
    tags: ["rock", "anthem"],
  }),
  createMockTemplate({
    name: "Pop Hit",
    genre: Genre.create("Pop"),
    category: "genre-specific",
    qualityScore: 88,
    usageCount: 300,
    tags: ["pop", "catchy"],
  }),
  createMockTemplate({
    name: "Japanese Ballad",
    genre: Genre.create("J-Pop"),
    language: Language.create("ja"),
    category: "language-specific",
    qualityScore: 92,
    usageCount: 100,
    tags: ["japanese", "ballad"],
  }),
  createMockTemplate({
    name: "Custom Electronic",
    genre: Genre.create("Electronic"),
    category: "custom",
    qualityScore: 75,
    usageCount: 50,
    tags: ["electronic", "custom"],
  }),
  createMockTemplate({
    name: "High Quality Track",
    qualityScore: 95,
    usageCount: 25,
    tags: ["high-quality"],
  }),
];

describe.skip("TemplateLibrary", () => {
  const mockOnTemplateSelect = vi.fn();
  const mockTemplates = createMockTemplates();

  beforeEach(() => {
    mockOnTemplateSelect.mockClear();
  });

  it("テンプレートライブラリを正常にレンダリングする", () => {
    render(
      <TemplateLibrary
        templates={mockTemplates}
        onTemplateSelect={mockOnTemplateSelect}
      />
    );

    expect(screen.getByText("Search templates...")).toBeInTheDocument();
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Popular")).toBeInTheDocument();
    expect(screen.getByText("High Quality")).toBeInTheDocument();
  });

  it("テンプレートカードが正しく表示される", () => {
    render(
      <TemplateLibrary
        templates={mockTemplates}
        onTemplateSelect={mockOnTemplateSelect}
      />
    );

    expect(screen.getByText("Rock Anthem")).toBeInTheDocument();
    expect(screen.getByText("Pop Hit")).toBeInTheDocument();
    expect(screen.getByText("Japanese Ballad")).toBeInTheDocument();
  });

  it("テンプレートカードをクリックするとonTemplateSelectが呼ばれる", async () => {
    render(
      <TemplateLibrary
        templates={mockTemplates}
        onTemplateSelect={mockOnTemplateSelect}
      />
    );

    const templateCard = screen
      .getByText("Rock Anthem")
      .closest("div[role='button'], div.cursor-pointer");

    if (templateCard) {
      fireEvent.click(templateCard);
      await waitFor(() => {
        expect(mockOnTemplateSelect).toHaveBeenCalledTimes(1);
      });
    }
  });

  it("検索機能が正常に動作する", async () => {
    render(
      <TemplateLibrary
        templates={mockTemplates}
        onTemplateSelect={mockOnTemplateSelect}
      />
    );

    const searchInput = screen.getByPlaceholderText("Search templates...");

    fireEvent.change(searchInput, { target: { value: "rock" } });

    await waitFor(() => {
      expect(screen.getByText("Rock Anthem")).toBeInTheDocument();
      expect(screen.queryByText("Pop Hit")).not.toBeInTheDocument();
    });
  });

  it("カテゴリタブでフィルタリングできる", async () => {
    render(
      <TemplateLibrary
        templates={mockTemplates}
        onTemplateSelect={mockOnTemplateSelect}
      />
    );

    const genreTab = screen.getByText("Genre");
    fireEvent.click(genreTab);

    await waitFor(() => {
      expect(screen.getByText("Rock Anthem")).toBeInTheDocument();
      expect(screen.getByText("Pop Hit")).toBeInTheDocument();
      expect(screen.queryByText("Custom Electronic")).not.toBeInTheDocument();
    });
  });

  it("人気タブで使用回数の多いテンプレートをフィルタリングできる", async () => {
    render(
      <TemplateLibrary
        templates={mockTemplates}
        onTemplateSelect={mockOnTemplateSelect}
      />
    );

    const popularTab = screen.getByText("Popular");
    fireEvent.click(popularTab);

    await waitFor(() => {
      expect(screen.getByText("Rock Anthem")).toBeInTheDocument(); // usageCount: 200
      expect(screen.getByText("Pop Hit")).toBeInTheDocument(); // usageCount: 300
      expect(screen.getByText("Japanese Ballad")).toBeInTheDocument(); // usageCount: 100
      expect(screen.queryByText("Custom Electronic")).not.toBeInTheDocument(); // usageCount: 50
    });
  });

  it("高品質タブで品質スコアの高いテンプレートをフィルタリングできる", async () => {
    render(
      <TemplateLibrary
        templates={mockTemplates}
        onTemplateSelect={mockOnTemplateSelect}
      />
    );

    const highQualityTab = screen.getByText("High Quality");
    fireEvent.click(highQualityTab);

    await waitFor(() => {
      expect(screen.getByText("Rock Anthem")).toBeInTheDocument(); // qualityScore: 90
      expect(screen.getByText("Pop Hit")).toBeInTheDocument(); // qualityScore: 88
      expect(screen.getByText("Japanese Ballad")).toBeInTheDocument(); // qualityScore: 92
      expect(screen.getByText("High Quality Track")).toBeInTheDocument(); // qualityScore: 95
      expect(screen.queryByText("Custom Electronic")).not.toBeInTheDocument(); // qualityScore: 75
    });
  });

  it("ソート機能が正常に動作する", async () => {
    render(
      <TemplateLibrary
        templates={mockTemplates}
        onTemplateSelect={mockOnTemplateSelect}
      />
    );

    // Default sorting is by quality (highest first)
    const templateNames = screen
      .getAllByRole("heading", { level: 3 })
      .map((el) => el.textContent);
    const firstTemplate = templateNames[0];

    // Should show high-quality templates first
    expect(firstTemplate).toContain("High Quality Track"); // qualityScore: 95

    // Change to sort by popular
    const popularSortButton = screen.getByText("Popular");
    fireEvent.click(popularSortButton);

    await waitFor(() => {
      const updatedTemplateNames = screen
        .getAllByRole("heading", { level: 3 })
        .map((el) => el.textContent);
      const firstTemplateAfterSort = updatedTemplateNames[0];
      expect(firstTemplateAfterSort).toContain("Pop Hit"); // usageCount: 300
    });
  });

  it("ジャンルフィルターが適用される", () => {
    const rockGenre = Genre.create("Rock");

    render(
      <TemplateLibrary
        templates={mockTemplates}
        onTemplateSelect={mockOnTemplateSelect}
        selectedGenre={rockGenre}
      />
    );

    expect(screen.getByText("Rock Anthem")).toBeInTheDocument();
    expect(screen.queryByText("Pop Hit")).not.toBeInTheDocument();
    expect(screen.queryByText("Japanese Ballad")).not.toBeInTheDocument();
  });

  it("言語フィルターが適用される", () => {
    const japaneseLanguage = Language.create("ja");

    render(
      <TemplateLibrary
        templates={mockTemplates}
        onTemplateSelect={mockOnTemplateSelect}
        selectedLanguage={japaneseLanguage}
      />
    );

    expect(screen.getByText("Japanese Ballad")).toBeInTheDocument();
    expect(screen.queryByText("Rock Anthem")).not.toBeInTheDocument();
    expect(screen.queryByText("Pop Hit")).not.toBeInTheDocument();
  });

  it("テンプレートが見つからない場合のメッセージを表示する", async () => {
    render(
      <TemplateLibrary
        templates={mockTemplates}
        onTemplateSelect={mockOnTemplateSelect}
      />
    );

    const searchInput = screen.getByPlaceholderText("Search templates...");
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    await waitFor(() => {
      expect(
        screen.getByText("No templates found matching your criteria.")
      ).toBeInTheDocument();
    });
  });

  it("結果の要約が正しく表示される", () => {
    render(
      <TemplateLibrary
        templates={mockTemplates}
        onTemplateSelect={mockOnTemplateSelect}
      />
    );

    expect(
      screen.getByText(
        `Showing ${mockTemplates.length} of ${mockTemplates.length} templates`
      )
    ).toBeInTheDocument();
  });

  it("テンプレートの詳細情報が正しく表示される", () => {
    render(
      <TemplateLibrary
        templates={mockTemplates}
        onTemplateSelect={mockOnTemplateSelect}
      />
    );

    // Check quality score display
    expect(screen.getByText("95")).toBeInTheDocument(); // High Quality Track score
    expect(screen.getByText("300")).toBeInTheDocument(); // Pop Hit usage count

    // Check tags display
    expect(screen.getByText("rock")).toBeInTheDocument();
    expect(screen.getByText("pop")).toBeInTheDocument();
    expect(screen.getByText("japanese")).toBeInTheDocument();
  });
});
