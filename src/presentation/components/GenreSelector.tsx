'use client';

import { useState, useCallback } from 'react';
import { Genre, type GenreValue } from '../../domain/valueObjects/Genre';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../src/components/ui/badge';
import { Input } from '../../../src/components/ui/input';
import { ScrollArea } from '../../../src/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../src/components/ui/tabs';
import { Search, X } from 'lucide-react';

interface GenreSelectorProps {
  selectedGenres: string[];
  onGenreChange: (genres: string[]) => void;
  maxSelection?: number;
  className?: string;
}

export function GenreSelector({
  selectedGenres,
  onGenreChange,
  maxSelection = 5,
  className = '',
}: GenreSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('main');

  const mainGenres = Genre.getMainGenres();
  const allGenres = Genre.getSupportedGenres();

  const filteredGenres = allGenres.filter((genre) =>
    genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenreToggle = useCallback(
    (genre: string) => {
      if (selectedGenres.includes(genre)) {
        // ジャンル削除
        onGenreChange(selectedGenres.filter((g) => g !== genre));
      } else if (selectedGenres.length < maxSelection) {
        // ジャンル追加
        onGenreChange([...selectedGenres, genre]);
      }
    },
    [selectedGenres, onGenreChange, maxSelection]
  );

  const handleRemoveGenre = useCallback(
    (genreToRemove: string) => {
      onGenreChange(selectedGenres.filter((g) => g !== genreToRemove));
    },
    [selectedGenres, onGenreChange]
  );

  const clearAll = useCallback(() => {
    onGenreChange([]);
  }, [onGenreChange]);

  const getSubGenresForMain = (mainGenre: string) => {
    try {
      return Genre.getSubGenres(mainGenre as any);
    } catch {
      return [];
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 選択済みジャンル表示 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">選択済みジャンル</h3>
          {selectedGenres.length > 0 && (
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
        <div className="flex flex-wrap gap-2 min-h-[2rem]">
          {selectedGenres.length === 0 ? (
            <p className="text-sm text-muted-foreground">ジャンルを選択してください</p>
          ) : (
            selectedGenres.map((genre) => (
              <Badge
                key={genre}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {genre}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleRemoveGenre(genre)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {selectedGenres.length}/{maxSelection} 選択済み
        </p>
      </div>

      {/* ジャンル選択UI */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="main">メインジャンル</TabsTrigger>
          <TabsTrigger value="all">全ジャンル</TabsTrigger>
          <TabsTrigger value="search">検索</TabsTrigger>
        </TabsList>

        <TabsContent value="main" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {mainGenres.map((genre) => {
              const isSelected = selectedGenres.includes(genre);
              const isDisabled = !isSelected && selectedGenres.length >= maxSelection;
              
              return (
                <Button
                  key={genre}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleGenreToggle(genre)}
                  disabled={isDisabled}
                  className="justify-start"
                >
                  {genre}
                </Button>
              );
            })}
          </div>

          {/* サブジャンル表示 */}
          {selectedGenres.length > 0 && (
            <div className="space-y-3">
              {selectedGenres
                .filter((genre) => mainGenres.includes(genre as any))
                .map((mainGenre) => {
                  const subGenres = getSubGenresForMain(mainGenre);
                  if (subGenres.length === 0) return null;

                  return (
                    <div key={mainGenre} className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        {mainGenre} サブジャンル
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
                        {subGenres.map((subGenre) => {
                          const isSelected = selectedGenres.includes(subGenre);
                          const isDisabled = !isSelected && selectedGenres.length >= maxSelection;
                          
                          return (
                            <Button
                              key={subGenre}
                              variant={isSelected ? 'secondary' : 'ghost'}
                              size="sm"
                              onClick={() => handleGenreToggle(subGenre)}
                              disabled={isDisabled}
                              className="justify-start text-xs h-8"
                            >
                              {subGenre}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pr-4">
              {allGenres.map((genre) => {
                const isSelected = selectedGenres.includes(genre);
                const isDisabled = !isSelected && selectedGenres.length >= maxSelection;
                
                return (
                  <Button
                    key={genre}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleGenreToggle(genre)}
                    disabled={isDisabled}
                    className="justify-start"
                  >
                    {genre}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ジャンルを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {searchTerm && (
            <ScrollArea className="h-[350px]">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pr-4">
                {filteredGenres.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);
                  const isDisabled = !isSelected && selectedGenres.length >= maxSelection;
                  
                  return (
                    <Button
                      key={genre}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleGenreToggle(genre)}
                      disabled={isDisabled}
                      className="justify-start"
                    >
                      {genre}
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}