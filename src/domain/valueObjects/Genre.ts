import { z } from "zod";

const SUPPORTED_GENRES = [
  // メインジャンル
  "Pop",
  "Rock",
  "Hip-Hop",
  "R&B",
  "Country",
  "Folk",
  "Blues",
  "Jazz",
  "Classical",
  "Electronic",
  "EDM",
  "House",
  "Techno",
  "Trance",
  "Drum & Bass",
  "Dubstep",
  "Ambient",
  "Chillout",
  "Downtempo",
  "Trip-Hop",
  "Indie",
  "Alternative",
  "Punk",
  "Metal",
  "Hard Rock",
  "Progressive Rock",
  "Psychedelic Rock",
  "Funk",
  "Soul",
  "Disco",
  "Reggae",
  "Ska",
  "Latin",
  "Salsa",
  "Bossa Nova",
  "World Music",
  "Celtic",
  "African",
  "Asian",
  "Middle Eastern",
  "Japanese",
  "J-Pop",
  "J-Rock",
  "Enka",
  "Shibuya-kei",
  "Experimental",
  "Avant-garde",
  "Minimalist",
  "Drone",
  "Noise",
  "Soundtrack",
  "Cinematic",
  "Orchestral",
  "Choral",
  "A cappella",
  "Singer-songwriter",
  "Acoustic",
  "Unplugged",
  "Lo-fi",
  "Chillwave",
  "Synthwave",
  "Retrowave",
  "Vaporwave",
  "Future Bass",
  "Trap",
  "Phonk",
  "Drill",
  "Grime",
  "UK Garage",
  "Breakbeat",
  "Jungle",
  "Hardcore",
  "Hardstyle",
  "Gabber",
  "Industrial",
  "EBM",
  "Darkwave",
  "Goth",
  "Post-punk",
  "New Wave",
  "Synthpop",
  "Shoegaze",
  "Dream Pop",
  "Emo",
  "Screamo",
  "Metalcore",
  "Deathcore",
  "Black Metal",
  "Death Metal",
  "Thrash Metal",
  "Power Metal",
  "Doom Metal",
  "Sludge Metal",
  "Stoner Rock",
  "Grunge",
  "Britpop",
  "Madchester",
  "Baggy",
  "Acid House",
  "Big Beat",
  "Breakcore",
  "IDM",
  "Glitch",
  "Microsound",
  "Lowercase",
  "Clicks & Cuts",
  // 地域別・文化的ジャンル追加
  "K-Pop",
  "Afrobeat",
  "Reggaeton",
  "Flamenco",
  "Fado",
  "Tango",
  "Cumbia",
  "Merengue",
  "Bachata",
  "Mento",
  "Calypso",
  "Soca",
  "Zouk",
  "Compas",
  "Highlife",
  "Makossa",
  "Soukous",
  "Mbaqanga",
  "Kwaito",
  "Amapiano",
  "Gqom",
  "Baile Funk",
  "Axé",
  "Forró",
  "MPB",
  "Tropicália",
  "Pagode",
  "Sertanejo",
  "Mbalax",
  "Coupé-Décalé",
  "Ndombolo",
  "Raï",
  "Chaabi",
  "Gnawa",
  "Klezmer",
  "Qawwali",
  "Bhangra",
  "Filmi",
  "Carnatic",
  "Hindustani",
  "Gamelan",
  "Dangdut",
  "Keroncong",
  "Pansori",
  "Gagaku",
  "Min'yō",
  "Taiko",
  "Jiuta",
  "Kayōkyoku",
  // モダンなジャンル追加
  "Hyperpop",
  "Bedroom Pop",
  "Dark Ambient",
  "Witch House",
  "Seapunk",
  "Cloud Rap",
  "Emo Rap",
  "Melodic Dubstep",
  "Colour Bass",
  "Riddim",
  "Deathstep",
  "Brostep",
  "Complextro",
  "Glitch Hop",
  "Neurohop",
  "Liquid Funk",
  "Neurofunk",
  "Hardtek",
  "Frenchcore",
  "UK Hardcore",
  "Happy Hardcore",
  "Speedcore",
  "Terrorcore",
  "Extratone",
  "Splittercore",
  "Breakcore",
  "Digital Hardcore",
  "Cybergrind",
  "Mathcore",
  "Grindcore",
  "Powerviolence",
  "Fastcore",
  "Crust Punk",
  "D-beat",
  "Street Punk",
  "Oi!",
  "Hardcore Punk",
  "Anarcho-punk",
  "Celtic Punk",
  "Folk Punk",
  "Cowpunk",
  "Psychobilly",
  "Gothabilly",
  "Rockabilly",
  "Surf Rock",
  "Garage Rock",
  "Proto-punk",
  "Krautrock",
  "Space Rock",
  "Stoner Metal",
  "Post-rock",
  "Post-metal",
  "Atmospheric Black Metal",
  "Blackgaze",
  "Doomgaze",
  "Sludgecore",
  "Mathrock",
  "Midwest Emo",
  "Emocore",
  "Post-hardcore",
  "Melodic Hardcore",
  "Straight Edge",
  "Youth Crew",
  "Beatdown Hardcore",
  "Crossover Thrash",
  "Groove Metal",
  "Nu Metal",
  "Rap Metal",
  "Funk Metal",
  "Alternative Metal",
  "Post-grunge",
  "Riot Grrrl",
  "Queercore",
  "Sadcore",
  "Slowcore",
  "Emo Pop",
  "Pop Punk",
  "Ska Punk",
  "Two-tone",
  "Third Wave Ska",
] as const;

type SupportedGenre = (typeof SUPPORTED_GENRES)[number];

const GenreSchema = z.union([
  z.enum(SUPPORTED_GENRES),
  z
    .array(z.enum(SUPPORTED_GENRES))
    .min(1, "ジャンル名は空文字列にできません")
    .max(5, "ジャンルは最大5つまで指定できます"),
]);

export type GenreValue = z.infer<typeof GenreSchema>;

export class Genre {
  private constructor(private readonly _value: GenreValue) {}

  static create(value: GenreValue): Genre {
    // 空文字列や空配列のチェック
    if (value === "" || (Array.isArray(value) && value.length === 0)) {
      throw new Error("ジャンル名は空文字列にできません");
    }

    try {
      const validatedValue = GenreSchema.parse(value);

      if (Array.isArray(validatedValue)) {
        // 重複チェック
        const uniqueGenres = [...new Set(validatedValue)];
        if (uniqueGenres.length !== validatedValue.length) {
          throw new Error("重複するジャンルは指定できません");
        }
      }

      return new Genre(validatedValue);
    } catch (error) {
      if (error instanceof Error && error.message.includes("重複する")) {
        throw error;
      }
      throw new Error("サポートされていないジャンルです");
    }
  }

  get value(): GenreValue {
    return this._value;
  }

  static isSupported(genre: string): genre is SupportedGenre {
    return SUPPORTED_GENRES.includes(genre as SupportedGenre);
  }

  static isValidCombination(genres: string[]): boolean {
    if (genres.length === 0) return false;
    if (genres.length > 5) return false;

    // 重複チェック
    const uniqueGenres = [...new Set(genres)];
    if (uniqueGenres.length !== genres.length) return false;

    // サポートされているジャンルかチェック
    return genres.every((genre) => Genre.isSupported(genre));
  }

  toPromptString(options?: { priority?: "low" | "medium" | "high" }): string {
    const genreStr = Array.isArray(this._value)
      ? this._value.join(", ")
      : this._value;

    switch (options?.priority) {
      case "high":
        return genreStr.toUpperCase();
      case "low":
        return genreStr.toLowerCase();
      default:
        return genreStr;
    }
  }

  equals(other: Genre): boolean {
    if (Array.isArray(this._value) && Array.isArray(other._value)) {
      return (
        this._value.length === other._value.length &&
        this._value.every((genre, index) => genre === other._value[index])
      );
    }
    return this._value === other._value;
  }

  static getSupportedGenres(): readonly SupportedGenre[] {
    return SUPPORTED_GENRES;
  }

  static getMainGenres(): readonly SupportedGenre[] {
    return [
      "Pop",
      "Rock",
      "Hip-Hop",
      "R&B",
      "Country",
      "Folk",
      "Blues",
      "Jazz",
      "Classical",
      "Electronic",
      "Indie",
      "Alternative",
      "Metal",
      "Punk",
      "Funk",
      "Soul",
      "Reggae",
      "Latin",
      "World Music",
      "Japanese",
      "African",
      "Asian",
      "K-Pop",
      "Afrobeat",
      "Experimental",
    ] as const;
  }

  static getSubGenres(mainGenre: SupportedGenre): readonly SupportedGenre[] {
    const subGenreMap: Record<string, readonly SupportedGenre[]> = {
      Electronic: [
        "EDM",
        "House",
        "Techno",
        "Trance",
        "Drum & Bass",
        "Dubstep",
        "Ambient",
        "Chillout",
        "Downtempo",
        "Trip-Hop",
        "Future Bass",
        "Melodic Dubstep",
        "Riddim",
        "Brostep",
        "Glitch Hop",
        "Neurohop",
      ],
      Rock: [
        "Hard Rock",
        "Progressive Rock",
        "Psychedelic Rock",
        "Grunge",
        "Britpop",
        "Post-rock",
        "Garage Rock",
        "Surf Rock",
        "Krautrock",
        "Space Rock",
      ],
      Metal: [
        "Black Metal",
        "Death Metal",
        "Thrash Metal",
        "Power Metal",
        "Doom Metal",
        "Sludge Metal",
        "Nu Metal",
        "Groove Metal",
        "Post-metal",
        "Atmospheric Black Metal",
        "Stoner Metal",
      ],
      Japanese: ["J-Pop", "J-Rock", "Enka", "Shibuya-kei", "Gagaku", "Min'yō", "Taiko", "Kayōkyoku"],
      "Hip-Hop": ["Trap", "Phonk", "Drill", "Grime", "Cloud Rap", "Emo Rap"],
      Punk: ["Post-punk", "New Wave", "Emo", "Screamo", "Hardcore Punk", "Pop Punk", "Folk Punk", "Celtic Punk"],
      "K-Pop": ["K-Pop"],
      Afrobeat: ["Afrobeat", "Highlife", "Amapiano", "Gqom"],
      Pop: ["Hyperpop", "Bedroom Pop", "Emo Pop", "Synthpop"],
      Latin: ["Reggaeton", "Cumbia", "Merengue", "Bachata", "Sertanejo", "Baile Funk"],
      African: ["Afrobeat", "Highlife", "Makossa", "Soukous", "Mbalax", "Amapiano", "Gqom"],
      Asian: ["K-Pop", "Gamelan", "Dangdut", "Pansori", "Bhangra", "Qawwali"],
      Experimental: ["Hyperpop", "Witch House", "Seapunk", "Dark Ambient", "Noise", "Drone"],
    };

    return subGenreMap[mainGenre] || [];
  }
}
