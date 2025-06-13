// Value Objects
export { Genre } from "./valueObjects/Genre";
export { Language } from "./valueObjects/Language";
export { StyleField } from "./valueObjects/StyleField";

// Entities
export { Prompt } from "./entities/Prompt";
export { Lyrics } from "./entities/Lyrics";
export { Song } from "./entities/Song";
export { Template } from "./entities/Template";
export { SuccessExample } from "./entities/SuccessExample";

// Repository Interfaces
export type { IPromptRepository } from "./repositories/IPromptRepository";
export type { ILyricsRepository } from "./repositories/ILyricsRepository";
export type { ISongRepository } from "./repositories/ISongRepository";
export type { ITemplateRepository } from "./repositories/ITemplateRepository";
export type { ISuccessExampleRepository } from "./repositories/ISuccessExampleRepository";

// Types
export type { GenreValue } from "./valueObjects/Genre";
export type {
  PromptProps,
  PromptString,
  OptimizedPrompt,
  ValidationResult,
  QualityScore,
  UsageStats,
  PromptJSON,
} from "./entities/Prompt";
export type {
  LyricsProps,
  LyricSection,
  LyricsStats,
  LyricsValidationResult,
  LyricsJSON,
} from "./entities/Lyrics";
export type {
  SongProps,
  SongStats,
  SongQualityScore,
  SongValidationResult,
  SongJSON,
} from "./entities/Song";
export type {
  TemplateProps,
  TemplateCategory,
  TemplateMatchCriteria,
} from "./entities/Template";
export type {
  SuccessExampleProps,
  SuccessExampleSearchCriteria,
} from "./entities/SuccessExample";

// Repository Types
export type {
  PromptSearchFilters,
  PromptSearchOptions,
  PromptSearchResult,
} from "./repositories/IPromptRepository";
export type {
  LyricsSearchFilters,
  LyricsSearchOptions,
  LyricsSearchResult,
} from "./repositories/ILyricsRepository";
export type {
  SongSearchFilters,
  SongSearchOptions,
  SongSearchResult,
} from "./repositories/ISongRepository";
export type {
  TemplateSearchFilters,
  TemplateSearchOptions,
  TemplateSearchResult,
  TemplateStatistics,
} from "./repositories/ITemplateRepository";
export type {
  SuccessExampleSearchFilters,
  SuccessExampleSearchOptions,
  SuccessExampleSearchResult,
  SuccessExampleStatistics,
} from "./repositories/ISuccessExampleRepository";
