"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { X, Heart, Zap, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MoodItem {
  id: string;
  name: string;
  displayName: string;
  energy: number; // 1-5 (低エネルギー〜高エネルギー)
  valence: number; // 1-5 (ネガティブ〜ポジティブ)
  color: string;
  description?: string;
  tags: string[];
}

interface MoodMatrixProps {
  selectedMoods: string[];
  onMoodChange: (moods: string[]) => void;
  maxSelection?: number;
  className?: string;
}

// ムードデータ定義（感情の二次元マッピング）
const MOOD_ITEMS: MoodItem[] = [
  // 高エネルギー + ポジティブ（第1象限）
  {
    id: "energetic",
    name: "energetic",
    displayName: "Energetic",
    energy: 5,
    valence: 4,
    color: "bg-red-500",
    tags: ["dynamic", "powerful"],
    description: "活動的で力強い",
  },
  {
    id: "happy",
    name: "happy",
    displayName: "Happy",
    energy: 4,
    valence: 5,
    color: "bg-yellow-500",
    tags: ["joyful", "bright"],
    description: "明るく楽しい",
  },
  {
    id: "excited",
    name: "excited",
    displayName: "Excited",
    energy: 5,
    valence: 5,
    color: "bg-orange-500",
    tags: ["thrilling", "intense"],
    description: "興奮した、わくわくする",
  },
  {
    id: "euphoric",
    name: "euphoric",
    displayName: "Euphoric",
    energy: 5,
    valence: 5,
    color: "bg-pink-500",
    tags: ["ecstatic", "blissful"],
    description: "陶酔的、至福の",
  },
  {
    id: "triumphant",
    name: "triumphant",
    displayName: "Triumphant",
    energy: 5,
    valence: 4,
    color: "bg-amber-500",
    tags: ["victorious", "glorious"],
    description: "勝利の、輝かしい",
  },

  // 高エネルギー + ネガティブ（第2象限）
  {
    id: "aggressive",
    name: "aggressive",
    displayName: "Aggressive",
    energy: 5,
    valence: 2,
    color: "bg-red-700",
    tags: ["fierce", "intense"],
    description: "攻撃的で激しい",
  },
  {
    id: "angry",
    name: "angry",
    displayName: "Angry",
    energy: 4,
    valence: 1,
    color: "bg-red-800",
    tags: ["furious", "rage"],
    description: "怒りに満ちた",
  },
  {
    id: "anxious",
    name: "anxious",
    displayName: "Anxious",
    energy: 4,
    valence: 2,
    color: "bg-yellow-700",
    tags: ["nervous", "tense"],
    description: "不安で緊張した",
  },
  {
    id: "frantic",
    name: "frantic",
    displayName: "Frantic",
    energy: 5,
    valence: 2,
    color: "bg-orange-700",
    tags: ["chaotic", "desperate"],
    description: "必死で混乱した",
  },
  {
    id: "intense",
    name: "intense",
    displayName: "Intense",
    energy: 5,
    valence: 3,
    color: "bg-purple-700",
    tags: ["powerful", "concentrated"],
    description: "強烈で集中した",
  },

  // 低エネルギー + ポジティブ（第3象限）
  {
    id: "calm",
    name: "calm",
    displayName: "Calm",
    energy: 2,
    valence: 4,
    color: "bg-blue-400",
    tags: ["peaceful", "serene"],
    description: "穏やかで平和な",
  },
  {
    id: "peaceful",
    name: "peaceful",
    displayName: "Peaceful",
    energy: 1,
    valence: 4,
    color: "bg-green-400",
    tags: ["tranquil", "gentle"],
    description: "平和で静かな",
  },
  {
    id: "contemplative",
    name: "contemplative",
    displayName: "Contemplative",
    energy: 2,
    valence: 3,
    color: "bg-indigo-400",
    tags: ["thoughtful", "reflective"],
    description: "瞑想的で思慮深い",
  },
  {
    id: "content",
    name: "content",
    displayName: "Content",
    energy: 2,
    valence: 4,
    color: "bg-emerald-400",
    tags: ["satisfied", "comfortable"],
    description: "満足で心地よい",
  },
  {
    id: "dreamy",
    name: "dreamy",
    displayName: "Dreamy",
    energy: 2,
    valence: 4,
    color: "bg-purple-400",
    tags: ["ethereal", "floating"],
    description: "夢見心地で幻想的",
  },

  // 低エネルギー + ネガティブ（第4象限）
  {
    id: "sad",
    name: "sad",
    displayName: "Sad",
    energy: 2,
    valence: 2,
    color: "bg-blue-700",
    tags: ["melancholy", "sorrowful"],
    description: "悲しく憂鬱な",
  },
  {
    id: "melancholic",
    name: "melancholic",
    displayName: "Melancholic",
    energy: 1,
    valence: 2,
    color: "bg-indigo-700",
    tags: ["wistful", "pensive"],
    description: "憂愁で物思いにふける",
  },
  {
    id: "lonely",
    name: "lonely",
    displayName: "Lonely",
    energy: 1,
    valence: 1,
    color: "bg-gray-600",
    tags: ["isolated", "desolate"],
    description: "孤独で寂しい",
  },
  {
    id: "nostalgic",
    name: "nostalgic",
    displayName: "Nostalgic",
    energy: 2,
    valence: 3,
    color: "bg-amber-700",
    tags: ["wistful", "reminiscent"],
    description: "懐かしく郷愁の",
  },
  {
    id: "mysterious",
    name: "mysterious",
    displayName: "Mysterious",
    energy: 2,
    valence: 3,
    color: "bg-slate-600",
    tags: ["enigmatic", "dark"],
    description: "神秘的で謎めいた",
  },

  // 中エネルギー域
  {
    id: "romantic",
    name: "romantic",
    displayName: "Romantic",
    energy: 3,
    valence: 4,
    color: "bg-rose-500",
    tags: ["loving", "tender"],
    description: "ロマンチックで愛情深い",
  },
  {
    id: "epic",
    name: "epic",
    displayName: "Epic",
    energy: 4,
    valence: 4,
    color: "bg-violet-600",
    tags: ["grand", "heroic"],
    description: "壮大で英雄的な",
  },
  {
    id: "groovy",
    name: "groovy",
    displayName: "Groovy",
    energy: 4,
    valence: 4,
    color: "bg-lime-500",
    tags: ["rhythmic", "funky"],
    description: "グルーヴィでファンキー",
  },
  {
    id: "chill",
    name: "chill",
    displayName: "Chill",
    energy: 2,
    valence: 3,
    color: "bg-teal-400",
    tags: ["relaxed", "laid-back"],
    description: "リラックスしたゆったり",
  },
  {
    id: "dark",
    name: "dark",
    displayName: "Dark",
    energy: 3,
    valence: 2,
    color: "bg-gray-800",
    tags: ["ominous", "brooding"],
    description: "暗く陰鬱な",
  },
];

// プリセット定義
const MOOD_PRESETS = [
  { name: "Upbeat", moods: ["energetic", "happy", "excited"] },
  { name: "Chill", moods: ["calm", "peaceful", "dreamy"] },
  { name: "Emotional", moods: ["sad", "melancholic", "nostalgic"] },
  { name: "Intense", moods: ["aggressive", "intense", "frantic"] },
  { name: "Epic", moods: ["epic", "triumphant", "powerful"] },
  { name: "Romantic", moods: ["romantic", "dreamy", "content"] },
];

export function MoodMatrix({
  selectedMoods,
  onMoodChange,
  maxSelection = 5,
  className = "",
}: MoodMatrixProps) {
  const [hoveredMood, setHoveredMood] = useState<string | null>(null);

  const moodsByPosition = useMemo(() => {
    const matrix: { [key: string]: MoodItem[] } = {
      highPos: [], // 高エネルギー + ポジティブ
      highNeg: [], // 高エネルギー + ネガティブ
      lowPos: [], // 低エネルギー + ポジティブ
      lowNeg: [], // 低エネルギー + ネガティブ
      center: [], // 中央エリア
    };

    MOOD_ITEMS.forEach((mood) => {
      if (mood.energy >= 4 && mood.valence >= 4) {
        matrix.highPos.push(mood);
      } else if (mood.energy >= 4 && mood.valence <= 2) {
        matrix.highNeg.push(mood);
      } else if (mood.energy <= 2 && mood.valence >= 4) {
        matrix.lowPos.push(mood);
      } else if (mood.energy <= 2 && mood.valence <= 2) {
        matrix.lowNeg.push(mood);
      } else {
        matrix.center.push(mood);
      }
    });

    return matrix;
  }, []);

  const handleMoodToggle = useCallback(
    (moodName: string) => {
      if (selectedMoods.includes(moodName)) {
        onMoodChange(selectedMoods.filter((mood) => mood !== moodName));
      } else if (selectedMoods.length < maxSelection) {
        onMoodChange([...selectedMoods, moodName]);
      }
    },
    [selectedMoods, onMoodChange, maxSelection]
  );

  const handleRemoveMood = useCallback(
    (moodToRemove: string) => {
      onMoodChange(selectedMoods.filter((mood) => mood !== moodToRemove));
    },
    [selectedMoods, onMoodChange]
  );

  const clearAll = useCallback(() => {
    onMoodChange([]);
  }, [onMoodChange]);

  const applyPreset = useCallback(
    (preset: (typeof MOOD_PRESETS)[0]) => {
      const validMoods = preset.moods.slice(0, maxSelection);
      onMoodChange(validMoods);
    },
    [onMoodChange, maxSelection]
  );

  const getMoodDisplayName = (moodName: string): string => {
    const mood = MOOD_ITEMS.find((item) => item.name === moodName);
    return mood?.displayName || moodName;
  };

  const renderMoodButton = (mood: MoodItem) => {
    const isSelected = selectedMoods.includes(mood.name);
    const isDisabled = !isSelected && selectedMoods.length >= maxSelection;
    const isHovered = hoveredMood === mood.id;

    return (
      <Button
        key={mood.id}
        variant={isSelected ? "default" : "outline"}
        size="sm"
        onClick={() => handleMoodToggle(mood.name)}
        disabled={isDisabled}
        onMouseEnter={() => setHoveredMood(mood.id)}
        onMouseLeave={() => setHoveredMood(null)}
        className={cn(
          "relative h-12 w-full text-xs transition-all duration-200",
          "hover:scale-105 hover:shadow-md",
          isSelected && "ring-2 ring-offset-2 ring-primary",
          isHovered && "z-10"
        )}
        style={{
          backgroundColor: isSelected ? undefined : mood.color,
          borderColor: isSelected ? undefined : mood.color,
        }}
        title={mood.description}
      >
        <div className="flex flex-col items-center gap-1">
          <span className={cn("font-medium", !isSelected && "text-white")}>
            {mood.displayName}
          </span>
          {isHovered && (
            <span
              className={cn("text-xs opacity-80", !isSelected && "text-white")}
            >
              E:{mood.energy} V:{mood.valence}
            </span>
          )}
        </div>
      </Button>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 選択済みムード表示 */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="h-5 w-5" />
              選択済みムード
            </CardTitle>
            {selectedMoods.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-xs"
              >
                すべてクリア
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 min-h-[2rem]">
              {selectedMoods.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  ムードを選択してください
                </p>
              ) : (
                selectedMoods.map((moodName) => {
                  const mood = MOOD_ITEMS.find(
                    (item) => item.name === moodName
                  );
                  return (
                    <Badge
                      key={moodName}
                      variant="secondary"
                      className="flex items-center gap-1"
                      style={{ backgroundColor: mood?.color + "20" }}
                    >
                      {getMoodDisplayName(moodName)}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => handleRemoveMood(moodName)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedMoods.length}/{maxSelection} 選択済み
            </p>
          </div>
        </CardContent>
      </Card>

      {/* プリセット */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ムードプリセット</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {MOOD_PRESETS.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
                className="text-xs"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ムードマトリックス */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="h-5 w-5" />
            ムードマトリックス
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            エネルギー（縦軸）と感情価（横軸）の二次元でムードを選択
          </p>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* 軸ラベル */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs font-medium text-muted-foreground">
              ポジティブ
            </div>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs font-medium text-muted-foreground">
              ネガティブ
            </div>
            <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs font-medium text-muted-foreground">
              高エネルギー
            </div>
            <div className="absolute -left-12 bottom-4 transform -rotate-90 text-xs font-medium text-muted-foreground">
              低エネルギー
            </div>

            {/* マトリックスグリッド */}
            <div className="grid grid-cols-2 gap-4 p-8">
              {/* 第2象限: 高エネルギー + ネガティブ */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-center mb-3">
                  <Zap className="h-4 w-4 inline mr-1" />
                  Intense
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {moodsByPosition.highNeg.map(renderMoodButton)}
                </div>
              </div>

              {/* 第1象限: 高エネルギー + ポジティブ */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-center mb-3">
                  <Zap className="h-4 w-4 inline mr-1" />
                  <Heart className="h-4 w-4 inline mr-1" />
                  Energetic
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {moodsByPosition.highPos.map(renderMoodButton)}
                </div>
              </div>

              {/* 第3象限: 低エネルギー + ネガティブ */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-center mb-3">
                  Melancholic
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {moodsByPosition.lowNeg.map(renderMoodButton)}
                </div>
              </div>

              {/* 第4象限: 低エネルギー + ポジティブ */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-center mb-3">
                  <Heart className="h-4 w-4 inline mr-1" />
                  Peaceful
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {moodsByPosition.lowPos.map(renderMoodButton)}
                </div>
              </div>
            </div>

            {/* 中央エリア */}
            <div className="mt-6 pt-4 border-t">
              <h4 className="text-sm font-medium text-center mb-3">
                その他のムード
              </h4>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {moodsByPosition.center.map(renderMoodButton)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
