"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Template, TemplateCategory } from "@/domain/entities/Template";
import type { Genre } from "@/domain/valueObjects/Genre";
import type { Language } from "@/domain/valueObjects/Language";
import {
  Clock,
  Filter,
  Heart,
  Search,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

interface TemplateLibraryProps {
  templates: Template[];
  onTemplateSelect: (template: Template) => void;
  selectedGenre?: Genre;
  selectedLanguage?: Language;
  className?: string;
}

interface TemplateCardProps {
  template: Template;
  onSelect: (template: Template) => void;
}

function TemplateCard({ template, onSelect }: TemplateCardProps) {
  const handleSelect = useCallback(() => {
    onSelect(template);
  }, [template, onSelect]);

  const categoryIcons = {
    "genre-specific": <Zap className="h-4 w-4" />,
    "language-specific": <Heart className="h-4 w-4" />,
    "mood-specific": <Star className="h-4 w-4" />,
    custom: <Filter className="h-4 w-4" />,
  };

  const categoryColors = {
    "genre-specific": "bg-blue-100 text-blue-800",
    "language-specific": "bg-green-100 text-green-800",
    "mood-specific": "bg-purple-100 text-purple-800",
    custom: "bg-orange-100 text-orange-800",
  };

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]"
      onClick={handleSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">
              {template.name}
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              {template.description}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-1 ml-2">
            <Badge variant="secondary" className="text-xs">
              {typeof template.genre.value === "string"
                ? template.genre.value
                : template.genre.value.join(", ")}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{template.qualityScore}</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-3 w-3" />
              <span>{template.usageCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{template.language.value}</span>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-xs ${categoryColors[template.category]}`}
          >
            <span className="flex items-center space-x-1">
              {categoryIcons[template.category]}
              <span>{template.category}</span>
            </span>
          </Badge>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{template.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function TemplateLibrary({
  templates,
  onTemplateSelect,
  selectedGenre,
  selectedLanguage,
  className = "",
}: TemplateLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState<"quality" | "usage" | "recent">(
    "quality"
  );

  // Filter templates based on search term and active tab
  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(searchLower) ||
          template.description.toLowerCase().includes(searchLower) ||
          template.tags.some((tag) =>
            tag.toLowerCase().includes(searchLower)
          ) ||
          (typeof template.genre.value === "string"
            ? template.genre.value.toLowerCase().includes(searchLower)
            : template.genre.value.some((g) =>
                g.toLowerCase().includes(searchLower)
              ))
      );
    }

    // Apply tab filter
    if (activeTab !== "all") {
      if (activeTab === "popular") {
        filtered = filtered.filter((template) => template.usageCount > 50);
      } else if (activeTab === "high-quality") {
        filtered = filtered.filter((template) => template.qualityScore >= 85);
      } else if (activeTab === "recent") {
        // Show recently created templates (for now, just show all since we don't have date filtering logic)
        filtered = filtered;
      } else {
        // Filter by category
        filtered = filtered.filter(
          (template) => template.category === activeTab
        );
      }
    }

    // Apply genre filter if provided
    if (selectedGenre) {
      filtered = filtered.filter((template) =>
        template.genre.equals(selectedGenre)
      );
    }

    // Apply language filter if provided
    if (selectedLanguage) {
      filtered = filtered.filter((template) =>
        template.language.equals(selectedLanguage)
      );
    }

    // Apply sorting (create copy to avoid mutating props)
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "quality":
          return b.qualityScore - a.qualityScore;
        case "usage":
          return b.usageCount - a.usageCount;
        case "recent":
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    templates,
    searchTerm,
    activeTab,
    selectedGenre,
    selectedLanguage,
    sortBy,
  ]);

  // Group templates by category for better organization
  const templatesByCategory = useMemo(() => {
    const categories: Record<TemplateCategory, Template[]> = {
      "genre-specific": [],
      "language-specific": [],
      "mood-specific": [],
      custom: [],
    };

    filteredTemplates.forEach((template) => {
      categories[template.category].push(template);
    });

    return categories;
  }, [filteredTemplates]);

  const handleTemplateSelect = useCallback(
    (template: Template) => {
      onTemplateSelect(template);
    },
    [onTemplateSelect]
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Sort Controls */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Button
            variant={sortBy === "quality" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("quality")}
          >
            Quality
          </Button>
          <Button
            variant={sortBy === "usage" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("usage")}
          >
            Popular
          </Button>
          <Button
            variant={sortBy === "recent" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("recent")}
          >
            Recent
          </Button>
        </div>
      </div>

      {/* Template Categories Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="high-quality">High Quality</TabsTrigger>
          <TabsTrigger value="genre-specific">Genre</TabsTrigger>
          <TabsTrigger value="language-specific">Language</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <ScrollArea className="h-[600px]">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={handleTemplateSelect}
                />
              ))}
            </div>
            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No templates found matching your criteria.
                </p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="popular" className="mt-6">
          <ScrollArea className="h-[600px]">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={handleTemplateSelect}
                />
              ))}
            </div>
            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No popular templates found.
                </p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="high-quality" className="mt-6">
          <ScrollArea className="h-[600px]">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={handleTemplateSelect}
                />
              ))}
            </div>
            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No high-quality templates found.
                </p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="genre-specific" className="mt-6">
          <ScrollArea className="h-[600px]">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templatesByCategory["genre-specific"].map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={handleTemplateSelect}
                />
              ))}
            </div>
            {templatesByCategory["genre-specific"].length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No genre-specific templates found.
                </p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="language-specific" className="mt-6">
          <ScrollArea className="h-[600px]">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templatesByCategory["language-specific"].map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={handleTemplateSelect}
                />
              ))}
            </div>
            {templatesByCategory["language-specific"].length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No language-specific templates found.
                </p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="custom" className="mt-6">
          <ScrollArea className="h-[600px]">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templatesByCategory["custom"].map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={handleTemplateSelect}
                />
              ))}
            </div>
            {templatesByCategory["custom"].length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No custom templates found.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Create your first custom template to get started!
                </p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Results Summary */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredTemplates.length} of {templates.length} templates
      </div>
    </div>
  );
}
