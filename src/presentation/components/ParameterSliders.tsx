"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { RotateCcw } from "lucide-react";
import { useCallback, useState } from "react";

export interface MusicParameters {
  energy: number; // 1-10 (低エネルギーから高エネルギー)
  complexity: number; // 1-10 (シンプルから複雑)
  tempo: number; // 1-10 (スローからファスト)
  emotional_intensity: number; // 1-10 (穏やかから激しい)
}

interface ParameterSlidersProps {
  parameters: MusicParameters;
  onParameterChange: (parameters: MusicParameters) => void;
  className?: string;
}

interface ParameterConfig {
  key: keyof MusicParameters;
  label: string;
  description: string;
  getLevelText: (value: number) => string;
  getColor: (value: number) => string;
}

const PARAMETER_CONFIGS: ParameterConfig[] = [
  {
    key: "energy",
    label: "Energy",
    description: "音楽のエネルギーレベル",
    getLevelText: (value: number) => {
      if (value <= 2) return "Very Low";
      if (value <= 4) return "Low";
      if (value <= 6) return "Medium";
      if (value <= 8) return "High";
      return "Very High";
    },
    getColor: (value: number) => {
      if (value <= 3) return "bg-blue-500";
      if (value <= 6) return "bg-green-500";
      if (value <= 8) return "bg-yellow-500";
      return "bg-red-500";
    },
  },
  {
    key: "complexity",
    label: "Complexity",
    description: "音楽の複雑さ・層の厚さ",
    getLevelText: (value: number) => {
      if (value <= 2) return "Very Simple";
      if (value <= 4) return "Simple";
      if (value <= 6) return "Moderate";
      if (value <= 8) return "Complex";
      return "Very Complex";
    },
    getColor: (value: number) => {
      if (value <= 3) return "bg-green-500";
      if (value <= 6) return "bg-blue-500";
      if (value <= 8) return "bg-purple-500";
      return "bg-red-500";
    },
  },
  {
    key: "tempo",
    label: "Tempo",
    description: "テンポ・リズムの速さ",
    getLevelText: (value: number) => {
      if (value <= 2) return "Very Slow";
      if (value <= 4) return "Slow";
      if (value <= 6) return "Medium";
      if (value <= 8) return "Fast";
      return "Very Fast";
    },
    getColor: (value: number) => {
      if (value <= 3) return "bg-blue-500";
      if (value <= 6) return "bg-green-500";
      if (value <= 8) return "bg-orange-500";
      return "bg-red-500";
    },
  },
  {
    key: "emotional_intensity",
    label: "Emotional Intensity",
    description: "感情的な強度・表現力",
    getLevelText: (value: number) => {
      if (value <= 2) return "Very Calm";
      if (value <= 4) return "Calm";
      if (value <= 6) return "Moderate";
      if (value <= 8) return "Intense";
      return "Very Intense";
    },
    getColor: (value: number) => {
      if (value <= 3) return "bg-blue-500";
      if (value <= 6) return "bg-green-500";
      if (value <= 8) return "bg-yellow-500";
      return "bg-red-500";
    },
  },
];

const PRESETS: { name: string; parameters: MusicParameters }[] = [
  {
    name: "Relaxed",
    parameters: { energy: 3, complexity: 4, tempo: 3, emotional_intensity: 2 },
  },
  {
    name: "Balanced",
    parameters: { energy: 5, complexity: 5, tempo: 5, emotional_intensity: 5 },
  },
  {
    name: "Energetic",
    parameters: { energy: 8, complexity: 6, tempo: 7, emotional_intensity: 7 },
  },
  {
    name: "Intense",
    parameters: { energy: 9, complexity: 8, tempo: 8, emotional_intensity: 9 },
  },
  {
    name: "Minimal",
    parameters: { energy: 4, complexity: 2, tempo: 4, emotional_intensity: 3 },
  },
  {
    name: "Epic",
    parameters: { energy: 9, complexity: 9, tempo: 6, emotional_intensity: 8 },
  },
];

const DEFAULT_PARAMETERS: MusicParameters = {
  energy: 5,
  complexity: 5,
  tempo: 5,
  emotional_intensity: 5,
};

export function ParameterSliders({
  parameters,
  onParameterChange,
  className = "",
}: ParameterSlidersProps) {
  const handleParameterChange = useCallback(
    (key: keyof MusicParameters, value: number[]) => {
      const newParameters = {
        ...parameters,
        [key]: value[0],
      };
      onParameterChange(newParameters);
    },
    [parameters, onParameterChange]
  );

  const handlePresetApply = useCallback(
    (preset: MusicParameters) => {
      onParameterChange(preset);
    },
    [onParameterChange]
  );

  const handleReset = useCallback(() => {
    onParameterChange(DEFAULT_PARAMETERS);
  }, [onParameterChange]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* プリセットセクション */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">パラメータプリセット</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              リセット
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => handlePresetApply(preset.parameters)}
                className="text-xs"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* パラメータスライダー */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PARAMETER_CONFIGS.map((config) => {
          const value = parameters[config.key];
          const levelText = config.getLevelText(value);
          const color = config.getColor(value);

          return (
            <Card key={config.key}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{config.label}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {config.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{value}</div>
                    <Badge
                      variant="secondary"
                      className={`text-xs text-white ${color}`}
                    >
                      {levelText}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Slider
                    value={[value]}
                    onValueChange={(newValue) =>
                      handleParameterChange(config.key, newValue)
                    }
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                    aria-label={config.label}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* パラメータサマリー */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">現在の設定</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PARAMETER_CONFIGS.map((config) => {
              const value = parameters[config.key];
              const levelText = config.getLevelText(value);

              return (
                <div key={config.key} className="text-center">
                  <div className="font-medium text-sm">{config.label}</div>
                  <div className="text-2xl font-bold mt-1">{value}</div>
                  <div className="text-xs text-muted-foreground">
                    {levelText}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
