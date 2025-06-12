'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Input } from '@/src/components/ui/input';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Search, X, Music } from 'lucide-react';

export interface InstrumentCategory {
  id: string;
  name: string;
  instruments: Instrument[];
}

export interface Instrument {
  id: string;
  name: string;
  displayName: string;
  category: string;
  tags: string[];
  description?: string;
}

interface InstrumentSelectorProps {
  selectedInstruments: string[];
  onInstrumentChange: (instruments: string[]) => void;
  maxSelection?: number;
  className?: string;
}

// 楽器データ定義
const INSTRUMENT_CATEGORIES: InstrumentCategory[] = [
  {
    id: 'strings',
    name: '弦楽器',
    instruments: [
      { id: 'electric_guitar', name: 'electric guitar', displayName: 'Electric Guitar', category: 'strings', tags: ['rock', 'pop', 'blues'] },
      { id: 'acoustic_guitar', name: 'acoustic guitar', displayName: 'Acoustic Guitar', category: 'strings', tags: ['folk', 'country', 'acoustic'] },
      { id: 'bass', name: 'bass', displayName: 'Bass', category: 'strings', tags: ['rhythm', 'foundation'] },
      { id: 'electric_bass', name: 'electric bass', displayName: 'Electric Bass', category: 'strings', tags: ['rock', 'funk', 'jazz'] },
      { id: 'violin', name: 'violin', displayName: 'Violin', category: 'strings', tags: ['classical', 'folk', 'orchestral'] },
      { id: 'viola', name: 'viola', displayName: 'Viola', category: 'strings', tags: ['classical', 'orchestral'] },
      { id: 'cello', name: 'cello', displayName: 'Cello', category: 'strings', tags: ['classical', 'orchestral', 'deep'] },
      { id: 'double_bass', name: 'double bass', displayName: 'Double Bass', category: 'strings', tags: ['classical', 'jazz', 'orchestral'] },
      { id: 'harp', name: 'harp', displayName: 'Harp', category: 'strings', tags: ['classical', 'ethereal', 'orchestral'] },
      { id: 'banjo', name: 'banjo', displayName: 'Banjo', category: 'strings', tags: ['country', 'folk', 'bluegrass'] },
      { id: 'mandolin', name: 'mandolin', displayName: 'Mandolin', category: 'strings', tags: ['folk', 'bluegrass', 'classical'] },
      { id: 'ukulele', name: 'ukulele', displayName: 'Ukulele', category: 'strings', tags: ['folk', 'pop', 'hawaiian'] },
    ],
  },
  {
    id: 'winds',
    name: '管楽器',
    instruments: [
      { id: 'flute', name: 'flute', displayName: 'Flute', category: 'winds', tags: ['classical', 'light', 'orchestral'] },
      { id: 'piccolo', name: 'piccolo', displayName: 'Piccolo', category: 'winds', tags: ['classical', 'high', 'orchestral'] },
      { id: 'oboe', name: 'oboe', displayName: 'Oboe', category: 'winds', tags: ['classical', 'orchestral', 'woodwind'] },
      { id: 'clarinet', name: 'clarinet', displayName: 'Clarinet', category: 'winds', tags: ['classical', 'jazz', 'orchestral'] },
      { id: 'bassoon', name: 'bassoon', displayName: 'Bassoon', category: 'winds', tags: ['classical', 'orchestral', 'woodwind'] },
      { id: 'saxophone', name: 'saxophone', displayName: 'Saxophone', category: 'winds', tags: ['jazz', 'pop', 'blues'] },
      { id: 'trumpet', name: 'trumpet', displayName: 'Trumpet', category: 'winds', tags: ['jazz', 'classical', 'brass'] },
      { id: 'french_horn', name: 'french horn', displayName: 'French Horn', category: 'winds', tags: ['classical', 'orchestral', 'brass'] },
      { id: 'trombone', name: 'trombone', displayName: 'Trombone', category: 'winds', tags: ['jazz', 'classical', 'brass'] },
      { id: 'tuba', name: 'tuba', displayName: 'Tuba', category: 'winds', tags: ['classical', 'orchestral', 'brass'] },
      { id: 'harmonica', name: 'harmonica', displayName: 'Harmonica', category: 'winds', tags: ['blues', 'folk', 'country'] },
      { id: 'recorder', name: 'recorder', displayName: 'Recorder', category: 'winds', tags: ['classical', 'folk', 'educational'] },
    ],
  },
  {
    id: 'percussion',
    name: '打楽器',
    instruments: [
      { id: 'drums', name: 'drums', displayName: 'Drums', category: 'percussion', tags: ['rhythm', 'rock', 'pop'] },
      { id: 'kick_drum', name: 'kick drum', displayName: 'Kick Drum', category: 'percussion', tags: ['rhythm', 'foundation'] },
      { id: 'snare_drum', name: 'snare drum', displayName: 'Snare Drum', category: 'percussion', tags: ['rhythm', 'backbeat'] },
      { id: 'hi_hat', name: 'hi-hat', displayName: 'Hi-Hat', category: 'percussion', tags: ['rhythm', 'groove'] },
      { id: 'cymbals', name: 'cymbals', displayName: 'Cymbals', category: 'percussion', tags: ['crash', 'accent'] },
      { id: 'timpani', name: 'timpani', displayName: 'Timpani', category: 'percussion', tags: ['classical', 'orchestral', 'dramatic'] },
      { id: 'xylophone', name: 'xylophone', displayName: 'Xylophone', category: 'percussion', tags: ['melodic', 'bright'] },
      { id: 'marimba', name: 'marimba', displayName: 'Marimba', category: 'percussion', tags: ['melodic', 'warm'] },
      { id: 'vibraphone', name: 'vibraphone', displayName: 'Vibraphone', category: 'percussion', tags: ['jazz', 'melodic'] },
      { id: 'tambourine', name: 'tambourine', displayName: 'Tambourine', category: 'percussion', tags: ['rhythm', 'accent'] },
      { id: 'triangle', name: 'triangle', displayName: 'Triangle', category: 'percussion', tags: ['accent', 'classical'] },
      { id: 'cowbell', name: 'cowbell', displayName: 'Cowbell', category: 'percussion', tags: ['rhythm', 'accent'] },
      { id: 'congas', name: 'congas', displayName: 'Congas', category: 'percussion', tags: ['latin', 'rhythm'] },
      { id: 'bongos', name: 'bongos', displayName: 'Bongos', category: 'percussion', tags: ['latin', 'rhythm'] },
    ],
  },
  {
    id: 'keyboards',
    name: '鍵盤楽器',
    instruments: [
      { id: 'piano', name: 'piano', displayName: 'Piano', category: 'keyboards', tags: ['classical', 'pop', 'versatile'] },
      { id: 'grand_piano', name: 'grand piano', displayName: 'Grand Piano', category: 'keyboards', tags: ['classical', 'concert'] },
      { id: 'electric_piano', name: 'electric piano', displayName: 'Electric Piano', category: 'keyboards', tags: ['jazz', 'pop', 'vintage'] },
      { id: 'organ', name: 'organ', displayName: 'Organ', category: 'keyboards', tags: ['classical', 'church', 'rock'] },
      { id: 'harpsichord', name: 'harpsichord', displayName: 'Harpsichord', category: 'keyboards', tags: ['baroque', 'classical'] },
      { id: 'accordion', name: 'accordion', displayName: 'Accordion', category: 'keyboards', tags: ['folk', 'traditional'] },
    ],
  },
  {
    id: 'electronic',
    name: '電子楽器',
    instruments: [
      { id: 'synthesizer', name: 'synthesizer', displayName: 'Synthesizer', category: 'electronic', tags: ['electronic', 'modern', 'versatile'] },
      { id: 'analog_synth', name: 'analog synth', displayName: 'Analog Synth', category: 'electronic', tags: ['vintage', 'warm'] },
      { id: 'digital_synth', name: 'digital synth', displayName: 'Digital Synth', category: 'electronic', tags: ['modern', 'precise'] },
      { id: 'sampler', name: 'sampler', displayName: 'Sampler', category: 'electronic', tags: ['electronic', 'creative'] },
      { id: 'drum_machine', name: 'drum machine', displayName: 'Drum Machine', category: 'electronic', tags: ['electronic', 'rhythm'] },
      { id: 'vocoder', name: 'vocoder', displayName: 'Vocoder', category: 'electronic', tags: ['electronic', 'vocal'] },
      { id: 'theremin', name: 'theremin', displayName: 'Theremin', category: 'electronic', tags: ['electronic', 'unique'] },
      { id: 'moog', name: 'moog', displayName: 'Moog', category: 'electronic', tags: ['analog', 'classic'] },
    ],
  },
  {
    id: 'traditional',
    name: '伝統楽器',
    instruments: [
      { id: 'shamisen', name: 'shamisen', displayName: 'Shamisen', category: 'traditional', tags: ['japanese', 'traditional'] },
      { id: 'koto', name: 'koto', displayName: 'Koto', category: 'traditional', tags: ['japanese', 'traditional'] },
      { id: 'shakuhachi', name: 'shakuhachi', displayName: 'Shakuhachi', category: 'traditional', tags: ['japanese', 'wind'] },
      { id: 'taiko', name: 'taiko', displayName: 'Taiko', category: 'traditional', tags: ['japanese', 'percussion'] },
      { id: 'erhu', name: 'erhu', displayName: 'Erhu', category: 'traditional', tags: ['chinese', 'strings'] },
      { id: 'sitar', name: 'sitar', displayName: 'Sitar', category: 'traditional', tags: ['indian', 'strings'] },
      { id: 'tabla', name: 'tabla', displayName: 'Tabla', category: 'traditional', tags: ['indian', 'percussion'] },
      { id: 'didgeridoo', name: 'didgeridoo', displayName: 'Didgeridoo', category: 'traditional', tags: ['australian', 'wind'] },
      { id: 'bagpipes', name: 'bagpipes', displayName: 'Bagpipes', category: 'traditional', tags: ['scottish', 'wind'] },
      { id: 'djembe', name: 'djembe', displayName: 'Djembe', category: 'traditional', tags: ['african', 'percussion'] },
      { id: 'kalimba', name: 'kalimba', displayName: 'Kalimba', category: 'traditional', tags: ['african', 'melodic'] },
      { id: 'pan_flute', name: 'pan flute', displayName: 'Pan Flute', category: 'traditional', tags: ['andean', 'wind'] },
    ],
  },
];

const ALL_INSTRUMENTS = INSTRUMENT_CATEGORIES.flatMap(category => category.instruments);

export function InstrumentSelector({
  selectedInstruments,
  onInstrumentChange,
  maxSelection = 10,
  className = '',
}: InstrumentSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredInstruments = useMemo(() => {
    let instruments = ALL_INSTRUMENTS;
    
    // カテゴリフィルタ
    if (activeCategory !== 'all') {
      instruments = instruments.filter(instrument => instrument.category === activeCategory);
    }
    
    // 検索フィルタ
    if (searchTerm) {
      instruments = instruments.filter(instrument => 
        instrument.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instrument.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instrument.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return instruments;
  }, [activeCategory, searchTerm]);

  const handleInstrumentToggle = useCallback(
    (instrumentName: string) => {
      if (selectedInstruments.includes(instrumentName)) {
        // 楽器削除
        onInstrumentChange(selectedInstruments.filter(inst => inst !== instrumentName));
      } else if (selectedInstruments.length < maxSelection) {
        // 楽器追加
        onInstrumentChange([...selectedInstruments, instrumentName]);
      }
    },
    [selectedInstruments, onInstrumentChange, maxSelection]
  );

  const handleRemoveInstrument = useCallback(
    (instrumentToRemove: string) => {
      onInstrumentChange(selectedInstruments.filter(inst => inst !== instrumentToRemove));
    },
    [selectedInstruments, onInstrumentChange]
  );

  const clearAll = useCallback(() => {
    onInstrumentChange([]);
  }, [onInstrumentChange]);

  const getInstrumentDisplayName = (instrumentName: string): string => {
    const instrument = ALL_INSTRUMENTS.find(inst => inst.name === instrumentName);
    return instrument?.displayName || instrumentName;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 選択済み楽器表示 */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Music className="h-5 w-5" />
              選択済み楽器
            </CardTitle>
            {selectedInstruments.length > 0 && (
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
              {selectedInstruments.length === 0 ? (
                <p className="text-sm text-muted-foreground">楽器を選択してください</p>
              ) : (
                selectedInstruments.map((instrumentName) => (
                  <Badge
                    key={instrumentName}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {getInstrumentDisplayName(instrumentName)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemoveInstrument(instrumentName)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedInstruments.length}/{maxSelection} 選択済み
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 検索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="楽器を検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* 楽器選択UI */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">すべて</TabsTrigger>
          {INSTRUMENT_CATEGORIES.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <ScrollArea className="h-[400px]">
            <div className="space-y-6 pr-4">
              {INSTRUMENT_CATEGORIES.map((category) => (
                <div key={category.id} className="space-y-3">
                  <h3 className="font-medium text-sm text-muted-foreground">
                    {category.name}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {category.instruments
                      .filter(instrument => 
                        !searchTerm || 
                        instrument.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        instrument.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        instrument.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
                      )
                      .map((instrument) => {
                        const isSelected = selectedInstruments.includes(instrument.name);
                        const isDisabled = !isSelected && selectedInstruments.length >= maxSelection;
                        
                        return (
                          <Button
                            key={instrument.id}
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleInstrumentToggle(instrument.name)}
                            disabled={isDisabled}
                            className="justify-start text-xs h-8"
                          >
                            {instrument.displayName}
                          </Button>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {INSTRUMENT_CATEGORIES.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {filteredInstruments
                .filter(instrument => instrument.category === category.id)
                .map((instrument) => {
                  const isSelected = selectedInstruments.includes(instrument.name);
                  const isDisabled = !isSelected && selectedInstruments.length >= maxSelection;
                  
                  return (
                    <Button
                      key={instrument.id}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleInstrumentToggle(instrument.name)}
                      disabled={isDisabled}
                      className="justify-start"
                      title={instrument.tags.join(', ')}
                    >
                      {instrument.displayName}
                    </Button>
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}