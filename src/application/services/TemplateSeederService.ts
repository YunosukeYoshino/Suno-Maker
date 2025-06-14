import { Template } from "../../domain/entities/Template";
import type { ITemplateRepository } from "../../domain/repositories/ITemplateRepository";
import { Genre } from "../../domain/valueObjects/Genre";
import { Language } from "../../domain/valueObjects/Language";
import { StyleField } from "../../domain/valueObjects/StyleField";

export interface TemplateSeederService {
  seedInitialTemplates(): Promise<Template[]>;
  seedGenreSpecificTemplates(): Promise<Template[]>;
  seedLanguageSpecificTemplates(): Promise<Template[]>;
  seedMoodSpecificTemplates(): Promise<Template[]>;
  clearAllTemplates(): Promise<void>;
}

export class DefaultTemplateSeederService implements TemplateSeederService {
  constructor(private readonly templateRepository: ITemplateRepository) {}

  async seedInitialTemplates(): Promise<Template[]> {
    const templates = [
      ...this.createGenreSpecificTemplates(),
      ...this.createLanguageSpecificTemplates(),
      ...this.createMoodSpecificTemplates(),
    ];

    return await this.templateRepository.saveMany(templates);
  }

  async seedGenreSpecificTemplates(): Promise<Template[]> {
    const templates = this.createGenreSpecificTemplates();
    return await this.templateRepository.saveMany(templates);
  }

  async seedLanguageSpecificTemplates(): Promise<Template[]> {
    const templates = this.createLanguageSpecificTemplates();
    return await this.templateRepository.saveMany(templates);
  }

  async seedMoodSpecificTemplates(): Promise<Template[]> {
    const templates = this.createMoodSpecificTemplates();
    return await this.templateRepository.saveMany(templates);
  }

  async clearAllTemplates(): Promise<void> {
    // This would need to be implemented based on the repository implementation
    throw new Error(
      "clearAllTemplates not implemented - depends on repository implementation"
    );
  }

  private createGenreSpecificTemplates(): Template[] {
    return [
      // Rock Templates
      Template.create({
        name: "Classic Rock Anthem",
        description:
          "High-energy rock anthem with powerful guitars, driving drums, and anthemic vocals perfect for stadium crowds",
        genre: Genre.create("Rock"),
        language: Language.create("en"),
        styleField: StyleField.create(
          "classic rock, anthemic, guitar-driven, powerful drums, stadium rock"
        ),
        lyricsStructure:
          "[Intro]\n{intro}\n\n[Verse 1]\n{verse1}\n\n[Pre-Chorus]\n{prechorus}\n\n[Chorus]\n{chorus}\n\n[Verse 2]\n{verse2}\n\n[Pre-Chorus]\n{prechorus}\n\n[Chorus]\n{chorus}\n\n[Bridge]\n{bridge}\n\n[Chorus]\n{chorus}\n\n[Outro]\n{outro}",
        tags: ["rock", "anthem", "guitar", "powerful", "stadium"],
        category: "genre-specific",
        qualityScore: 88,
        usageCount: 245,
      }),

      Template.create({
        name: "Grunge Alternative",
        description:
          "Raw, emotional grunge track with distorted guitars and introspective lyrics",
        genre: Genre.create("Grunge"),
        language: Language.create("en"),
        styleField: StyleField.create(
          "grunge, alternative, distorted guitars, raw emotion, 90s"
        ),
        lyricsStructure:
          "[Verse 1]\n{verse1}\n\n[Chorus]\n{chorus}\n\n[Verse 2]\n{verse2}\n\n[Chorus]\n{chorus}\n\n[Bridge]\n{bridge}\n\n[Chorus]\n{chorus}",
        tags: ["grunge", "alternative", "90s", "raw", "emotional"],
        category: "genre-specific",
        qualityScore: 86,
        usageCount: 187,
      }),

      // Pop Templates
      Template.create({
        name: "Modern Pop Hit",
        description:
          "Catchy contemporary pop song with infectious hooks, polished production, and radio-friendly appeal",
        genre: Genre.create("Pop"),
        language: Language.create("en"),
        styleField: StyleField.create(
          "modern pop, catchy, hook-driven, polished, radio-friendly"
        ),
        lyricsStructure:
          "[Verse 1]\n{verse1}\n\n[Pre-Chorus]\n{prechorus}\n\n[Chorus]\n{chorus}\n\n[Verse 2]\n{verse2}\n\n[Pre-Chorus]\n{prechorus}\n\n[Chorus]\n{chorus}\n\n[Bridge]\n{bridge}\n\n[Chorus]\n{chorus}",
        tags: ["pop", "catchy", "modern", "hook", "radio"],
        category: "genre-specific",
        qualityScore: 90,
        usageCount: 312,
      }),

      Template.create({
        name: "Bedroom Pop Vibes",
        description:
          "Dreamy, lo-fi bedroom pop with warm textures and intimate vocals",
        genre: Genre.create("Bedroom Pop"),
        language: Language.create("en"),
        styleField: StyleField.create(
          "bedroom pop, lo-fi, dreamy, warm, intimate vocals"
        ),
        lyricsStructure:
          "[Intro]\n{intro}\n\n[Verse 1]\n{verse1}\n\n[Chorus]\n{chorus}\n\n[Verse 2]\n{verse2}\n\n[Chorus]\n{chorus}\n\n[Outro]\n{outro}",
        tags: ["bedroom-pop", "lo-fi", "dreamy", "intimate", "chill"],
        category: "genre-specific",
        qualityScore: 84,
        usageCount: 156,
      }),

      // Electronic Templates
      Template.create({
        name: "EDM Festival Banger",
        description:
          "High-energy EDM track with massive drops, festival-ready energy, and crowd-pleasing build-ups",
        genre: Genre.create("EDM"),
        language: Language.create("en"),
        styleField: StyleField.create(
          "edm, festival, high-energy, massive drop, crowd-pleasing"
        ),
        lyricsStructure:
          "[Build-up]\n{buildup}\n\n[Drop]\n{drop}\n\n[Breakdown]\n{breakdown}\n\n[Build-up 2]\n{buildup2}\n\n[Drop]\n{drop}\n\n[Outro]\n{outro}",
        tags: ["edm", "festival", "electronic", "drop", "energy"],
        category: "genre-specific",
        qualityScore: 87,
        usageCount: 298,
      }),

      Template.create({
        name: "Ambient Soundscape",
        description:
          "Atmospheric ambient piece with ethereal textures and meditative qualities",
        genre: Genre.create("Ambient"),
        language: Language.create("en"),
        styleField: StyleField.create(
          "ambient, atmospheric, ethereal, meditative, soundscape"
        ),
        lyricsStructure:
          "[Soundscape 1]\n{soundscape1}\n\n[Transition]\n{transition}\n\n[Soundscape 2]\n{soundscape2}\n\n[Conclusion]\n{conclusion}",
        tags: ["ambient", "atmospheric", "meditative", "ethereal", "relaxing"],
        category: "genre-specific",
        qualityScore: 85,
        usageCount: 142,
      }),

      // Hip-Hop Templates
      Template.create({
        name: "Modern Hip-Hop Flow",
        description:
          "Contemporary hip-hop with modern flow patterns, trap influences, and dynamic vocal delivery",
        genre: Genre.create("Hip-Hop"),
        language: Language.create("en"),
        styleField: StyleField.create(
          "hip-hop, modern flow, trap, dynamic, contemporary"
        ),
        lyricsStructure:
          "[Intro]\n{intro}\n\n[Verse 1]\n{verse1}\n\n[Hook]\n{hook}\n\n[Verse 2]\n{verse2}\n\n[Hook]\n{hook}\n\n[Bridge]\n{bridge}\n\n[Hook]\n{hook}\n\n[Outro]\n{outro}",
        tags: ["hip-hop", "trap", "modern", "flow", "rap"],
        category: "genre-specific",
        qualityScore: 89,
        usageCount: 267,
      }),

      Template.create({
        name: "Old School Boom Bap",
        description:
          "Classic boom bap hip-hop with vintage drum breaks and nostalgic vibes",
        genre: Genre.create("Hip-Hop"),
        language: Language.create("en"),
        styleField: StyleField.create(
          "boom bap, old school, vintage, classic hip-hop, nostalgic"
        ),
        lyricsStructure:
          "[Intro]\n{intro}\n\n[Verse 1]\n{verse1}\n\n[Chorus]\n{chorus}\n\n[Verse 2]\n{verse2}\n\n[Chorus]\n{chorus}\n\n[Verse 3]\n{verse3}\n\n[Outro]\n{outro}",
        tags: ["boom-bap", "old-school", "vintage", "classic", "nostalgic"],
        category: "genre-specific",
        qualityScore: 83,
        usageCount: 178,
      }),

      // Jazz Templates
      Template.create({
        name: "Smooth Jazz Ballad",
        description:
          "Sophisticated jazz ballad with rich harmonies and expressive instrumental solos",
        genre: Genre.create("Jazz"),
        language: Language.create("en"),
        styleField: StyleField.create(
          "smooth jazz, ballad, sophisticated, rich harmonies, instrumental"
        ),
        lyricsStructure:
          "[Intro]\n{intro}\n\n[Verse 1]\n{verse1}\n\n[Chorus]\n{chorus}\n\n[Solo Section]\n{solo}\n\n[Verse 2]\n{verse2}\n\n[Chorus]\n{chorus}\n\n[Outro]\n{outro}",
        tags: ["jazz", "smooth", "ballad", "sophisticated", "harmonies"],
        category: "genre-specific",
        qualityScore: 91,
        usageCount: 134,
      }),

      // Country Templates
      Template.create({
        name: "Country Storytelling",
        description:
          "Traditional country song with narrative lyrics and authentic instrumental arrangement",
        genre: Genre.create("Country"),
        language: Language.create("en"),
        styleField: StyleField.create(
          "country, storytelling, traditional, acoustic, authentic"
        ),
        lyricsStructure:
          "[Intro]\n{intro}\n\n[Verse 1]\n{verse1}\n\n[Chorus]\n{chorus}\n\n[Verse 2]\n{verse2}\n\n[Chorus]\n{chorus}\n\n[Bridge]\n{bridge}\n\n[Chorus]\n{chorus}",
        tags: [
          "country",
          "storytelling",
          "traditional",
          "acoustic",
          "narrative",
        ],
        category: "genre-specific",
        qualityScore: 86,
        usageCount: 203,
      }),

      // Folk Templates
      Template.create({
        name: "Indie Folk Anthem",
        description:
          "Modern indie folk with organic instrumentation and heartfelt vocals",
        genre: Genre.create("Folk"),
        language: Language.create("en"),
        styleField: StyleField.create(
          "indie folk, organic, heartfelt, acoustic, modern"
        ),
        lyricsStructure:
          "[Verse 1]\n{verse1}\n\n[Chorus]\n{chorus}\n\n[Verse 2]\n{verse2}\n\n[Chorus]\n{chorus}\n\n[Bridge]\n{bridge}\n\n[Chorus]\n{chorus}",
        tags: ["folk", "indie", "organic", "heartfelt", "acoustic"],
        category: "genre-specific",
        qualityScore: 88,
        usageCount: 189,
      }),

      // Metal Templates
      Template.create({
        name: "Progressive Metal Epic",
        description:
          "Complex progressive metal with intricate compositions and technical prowess",
        genre: Genre.create("Progressive Rock"),
        language: Language.create("en"),
        styleField: StyleField.create(
          "progressive metal, complex, technical, intricate, epic"
        ),
        lyricsStructure:
          "[Intro]\n{intro}\n\n[Part I: {title1}]\n{part1}\n\n[Part II: {title2}]\n{part2}\n\n[Part III: {title3}]\n{part3}\n\n[Outro]\n{outro}",
        tags: ["progressive", "metal", "complex", "technical", "epic"],
        category: "genre-specific",
        qualityScore: 92,
        usageCount: 167,
      }),

      // Reggae Templates
      Template.create({
        name: "Classic Reggae Groove",
        description:
          "Traditional reggae with iconic off-beat rhythms and conscious lyrics",
        genre: Genre.create("Reggae"),
        language: Language.create("en"),
        styleField: StyleField.create(
          "reggae, off-beat, traditional, conscious, groove"
        ),
        lyricsStructure:
          "[Intro]\n{intro}\n\n[Verse 1]\n{verse1}\n\n[Chorus]\n{chorus}\n\n[Verse 2]\n{verse2}\n\n[Chorus]\n{chorus}\n\n[Bridge]\n{bridge}\n\n[Chorus]\n{chorus}",
        tags: ["reggae", "groove", "conscious", "traditional", "off-beat"],
        category: "genre-specific",
        qualityScore: 84,
        usageCount: 156,
      }),
    ];
  }

  private createLanguageSpecificTemplates(): Template[] {
    return [
      // Japanese Templates
      Template.create({
        name: "J-Pop バラード",
        description:
          "感動的な日本語バラード、美しいメロディーと心に響く歌詞で聴く人の心を動かします",
        genre: Genre.create("J-Pop"),
        language: Language.create("ja"),
        styleField: StyleField.create(
          "j-pop, ballad, emotional, beautiful melody, heartfelt"
        ),
        lyricsStructure:
          "[イントロ]\n{intro}\n\n[Aメロ]\n{verse1}\n\n[Bメロ]\n{bridge1}\n\n[サビ]\n{chorus}\n\n[Aメロ]\n{verse2}\n\n[Bメロ]\n{bridge2}\n\n[サビ]\n{chorus}\n\n[Cメロ]\n{bridge3}\n\n[サビ]\n{chorus}\n\n[アウトロ]\n{outro}",
        tags: ["j-pop", "ballad", "emotional", "japanese", "beautiful"],
        category: "language-specific",
        qualityScore: 89,
        usageCount: 234,
      }),

      Template.create({
        name: "アニソン風ポップ",
        description:
          "アニメソング風の明るくキャッチーなポップソング、元気で前向きな楽曲",
        genre: Genre.create("J-Pop"),
        language: Language.create("ja"),
        styleField: StyleField.create(
          "anime song, bright, catchy, energetic, uplifting"
        ),
        lyricsStructure:
          "[イントロ]\n{intro}\n\n[Aメロ]\n{verse1}\n\n[サビ]\n{chorus}\n\n[Aメロ]\n{verse2}\n\n[サビ]\n{chorus}\n\n[Cメロ]\n{bridge}\n\n[サビ]\n{chorus}",
        tags: ["anime", "bright", "catchy", "energetic", "japanese"],
        category: "language-specific",
        qualityScore: 87,
        usageCount: 198,
      }),

      Template.create({
        name: "演歌スタイル",
        description:
          "伝統的な演歌スタイルの楽曲、情感豊かな歌詞と日本的な美しさ",
        genre: Genre.create("Enka"),
        language: Language.create("ja"),
        styleField: StyleField.create(
          "enka, traditional, emotional, japanese culture, nostalgic"
        ),
        lyricsStructure:
          "[前奏]\n{intro}\n\n[一番]\n{verse1}\n\n[サビ]\n{chorus}\n\n[二番]\n{verse2}\n\n[サビ]\n{chorus}\n\n[間奏]\n{interlude}\n\n[三番]\n{verse3}\n\n[サビ]\n{chorus}",
        tags: ["enka", "traditional", "emotional", "culture", "nostalgic"],
        category: "language-specific",
        qualityScore: 85,
        usageCount: 112,
      }),

      // K-Pop Templates
      Template.create({
        name: "K-Pop Dance Hit",
        description:
          "High-energy K-Pop dance track with synchronized choreography and catchy hooks",
        genre: Genre.create("K-Pop"),
        language: Language.create("ko"),
        styleField: StyleField.create(
          "k-pop, dance, high-energy, synchronized, catchy hooks"
        ),
        lyricsStructure:
          "[Intro]\n{intro}\n\n[Verse 1]\n{verse1}\n\n[Pre-Chorus]\n{prechorus}\n\n[Chorus]\n{chorus}\n\n[Verse 2]\n{verse2}\n\n[Pre-Chorus]\n{prechorus}\n\n[Chorus]\n{chorus}\n\n[Bridge]\n{bridge}\n\n[Chorus]\n{chorus}",
        tags: ["k-pop", "dance", "energetic", "catchy", "korean"],
        category: "language-specific",
        qualityScore: 91,
        usageCount: 287,
      }),

      // Spanish Templates
      Template.create({
        name: "Latin Pop Romance",
        description:
          "Romantic Latin pop ballad with passionate vocals and rich Spanish lyrics",
        genre: Genre.create("Latin"),
        language: Language.create("es"),
        styleField: StyleField.create(
          "latin pop, romantic, passionate, ballad, spanish"
        ),
        lyricsStructure:
          "[Introducción]\n{intro}\n\n[Verso 1]\n{verse1}\n\n[Coro]\n{chorus}\n\n[Verso 2]\n{verse2}\n\n[Coro]\n{chorus}\n\n[Puente]\n{bridge}\n\n[Coro]\n{chorus}",
        tags: ["latin", "romantic", "passionate", "ballad", "spanish"],
        category: "language-specific",
        qualityScore: 88,
        usageCount: 176,
      }),

      Template.create({
        name: "Reggaeton Urbano",
        description:
          "Modern reggaeton with urban beats and contemporary Spanish rap",
        genre: Genre.create("Reggaeton"),
        language: Language.create("es"),
        styleField: StyleField.create(
          "reggaeton, urban, modern beats, spanish rap, contemporary"
        ),
        lyricsStructure:
          "[Intro]\n{intro}\n\n[Verso 1]\n{verse1}\n\n[Coro]\n{chorus}\n\n[Verso 2]\n{verse2}\n\n[Coro]\n{chorus}\n\n[Puente]\n{bridge}\n\n[Coro]\n{chorus}",
        tags: ["reggaeton", "urban", "modern", "rap", "spanish"],
        category: "language-specific",
        qualityScore: 86,
        usageCount: 213,
      }),

      // French Templates
      Template.create({
        name: "Chanson Française",
        description:
          "Classic French chanson with poetic lyrics and sophisticated musical arrangement",
        genre: Genre.create("Pop"),
        language: Language.create("fr"),
        styleField: StyleField.create(
          "chanson française, poetic, sophisticated, classic, french"
        ),
        lyricsStructure:
          "[Introduction]\n{intro}\n\n[Couplet 1]\n{verse1}\n\n[Refrain]\n{chorus}\n\n[Couplet 2]\n{verse2}\n\n[Refrain]\n{chorus}\n\n[Pont]\n{bridge}\n\n[Refrain]\n{chorus}",
        tags: ["chanson", "french", "poetic", "sophisticated", "classic"],
        category: "language-specific",
        qualityScore: 89,
        usageCount: 143,
      }),
    ];
  }

  private createMoodSpecificTemplates(): Template[] {
    return [
      // Emotional/Sad Templates
      Template.create({
        name: "Melancholic Reflection",
        description:
          "Deeply emotional track for moments of introspection and melancholy",
        genre: Genre.create("Indie"),
        language: Language.create("en"),
        styleField: StyleField.create(
          "melancholic, introspective, emotional, reflective, minor key"
        ),
        lyricsStructure:
          "[Quiet Intro]\n{intro}\n\n[Verse 1]\n{verse1}\n\n[Chorus]\n{chorus}\n\n[Verse 2]\n{verse2}\n\n[Chorus]\n{chorus}\n\n[Bridge]\n{bridge}\n\n[Final Chorus]\n{chorus}",
        tags: [
          "melancholic",
          "sad",
          "introspective",
          "emotional",
          "reflective",
        ],
        category: "mood-specific",
        qualityScore: 87,
        usageCount: 198,
      }),

      // Happy/Uplifting Templates
      Template.create({
        name: "Feel-Good Anthem",
        description:
          "Uplifting and energetic track designed to boost mood and inspire positivity",
        genre: Genre.create("Pop"),
        language: Language.create("en"),
        styleField: StyleField.create(
          "uplifting, energetic, feel-good, positive, major key"
        ),
        lyricsStructure:
          "[Energetic Intro]\n{intro}\n\n[Verse 1]\n{verse1}\n\n[Chorus]\n{chorus}\n\n[Verse 2]\n{verse2}\n\n[Chorus]\n{chorus}\n\n[Bridge]\n{bridge}\n\n[Final Chorus]\n{chorus}",
        tags: ["happy", "uplifting", "energetic", "positive", "feel-good"],
        category: "mood-specific",
        qualityScore: 90,
        usageCount: 312,
      }),

      // Romantic Templates
      Template.create({
        name: "Romantic Serenade",
        description:
          "Tender and romantic ballad perfect for expressing love and affection",
        genre: Genre.create("R&B"),
        language: Language.create("en"),
        styleField: StyleField.create(
          "romantic, tender, serenade, love song, smooth"
        ),
        lyricsStructure:
          "[Gentle Intro]\n{intro}\n\n[Verse 1]\n{verse1}\n\n[Chorus]\n{chorus}\n\n[Verse 2]\n{verse2}\n\n[Chorus]\n{chorus}\n\n[Bridge]\n{bridge}\n\n[Final Chorus]\n{chorus}",
        tags: ["romantic", "love", "tender", "serenade", "smooth"],
        category: "mood-specific",
        qualityScore: 89,
        usageCount: 245,
      }),

      // Aggressive/Intense Templates
      Template.create({
        name: "Intense Energy",
        description:
          "High-intensity track with aggressive energy and powerful dynamics",
        genre: Genre.create("Metal"),
        language: Language.create("en"),
        styleField: StyleField.create(
          "intense, aggressive, powerful, high-energy, dynamic"
        ),
        lyricsStructure:
          "[Explosive Intro]\n{intro}\n\n[Verse 1]\n{verse1}\n\n[Chorus]\n{chorus}\n\n[Verse 2]\n{verse2}\n\n[Chorus]\n{chorus}\n\n[Breakdown]\n{breakdown}\n\n[Final Chorus]\n{chorus}",
        tags: ["intense", "aggressive", "powerful", "energetic", "dynamic"],
        category: "mood-specific",
        qualityScore: 88,
        usageCount: 176,
      }),

      // Chill/Relaxing Templates
      Template.create({
        name: "Chill Vibes",
        description:
          "Relaxing and laid-back track perfect for unwinding and peaceful moments",
        genre: Genre.create("Chillout"),
        language: Language.create("en"),
        styleField: StyleField.create(
          "chill, relaxing, laid-back, peaceful, ambient"
        ),
        lyricsStructure:
          "[Soft Intro]\n{intro}\n\n[Verse 1]\n{verse1}\n\n[Chorus]\n{chorus}\n\n[Verse 2]\n{verse2}\n\n[Chorus]\n{chorus}\n\n[Outro]\n{outro}",
        tags: ["chill", "relaxing", "peaceful", "laid-back", "ambient"],
        category: "mood-specific",
        qualityScore: 85,
        usageCount: 234,
      }),

      // Motivational Templates
      Template.create({
        name: "Motivational Powerhouse",
        description:
          "Inspiring and motivational track designed to energize and empower listeners",
        genre: Genre.create("Rock"),
        language: Language.create("en"),
        styleField: StyleField.create(
          "motivational, inspiring, empowering, energizing, anthem"
        ),
        lyricsStructure:
          "[Building Intro]\n{intro}\n\n[Verse 1]\n{verse1}\n\n[Chorus]\n{chorus}\n\n[Verse 2]\n{verse2}\n\n[Chorus]\n{chorus}\n\n[Bridge]\n{bridge}\n\n[Final Chorus]\n{chorus}",
        tags: [
          "motivational",
          "inspiring",
          "empowering",
          "energizing",
          "anthem",
        ],
        category: "mood-specific",
        qualityScore: 91,
        usageCount: 267,
      }),

      // Nostalgic Templates
      Template.create({
        name: "Nostalgic Journey",
        description:
          "Wistful and nostalgic track that evokes memories and bygone times",
        genre: Genre.create("Folk"),
        language: Language.create("en"),
        styleField: StyleField.create(
          "nostalgic, wistful, memories, bygone, vintage"
        ),
        lyricsStructure:
          "[Gentle Intro]\n{intro}\n\n[Verse 1]\n{verse1}\n\n[Chorus]\n{chorus}\n\n[Verse 2]\n{verse2}\n\n[Chorus]\n{chorus}\n\n[Bridge]\n{bridge}\n\n[Final Chorus]\n{chorus}",
        tags: ["nostalgic", "memories", "wistful", "vintage", "retrospective"],
        category: "mood-specific",
        qualityScore: 86,
        usageCount: 189,
      }),
    ];
  }
}
