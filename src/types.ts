
export interface Movie {
  Title: string;
  Year: number | null;
  "Your Rating": number | null;
  "IMDb Rating": number | null;
  Genres: string;
  GenreList: string[];
  Directors: string;
  "Date Rated": string | null;
  URL: string;
  NormTitle: string;
  SearchText: string;
}

export interface OscarRow {
  FilmYear: number | null;
  AwardYear: number | null;
  CategoryRaw: string;
  Category: string;
  PersonName: string;
  Film: string;
  IsWinner: boolean;
  NormFilm: string;
  // Augmented properties
  InMyCatalog?: boolean;
  MyRating?: number | null;
  MyIMDb?: number | null;
  CatalogURL?: string;
}

export interface TmdbInfo {
  id: number;
  poster_url: string | null;
  vote_average: number;
}

export interface ProviderInfo {
  platforms: string[];
  link: string | null;
}

export interface OmdbAwards {
  raw: string | null;
  oscars: number;
  emmys: number;
  baftas: number;
  golden_globes: number;
  palme_dor: boolean;
  oscars_nominated: number;
  total_wins: number;
  total_nominations: number;
  imdbRating?: string;
  error?: string;
}

export interface FilterState {
  yearRange: [number, number];
  ratingRange: [number, number];
  genres: string[];
  directors: string[];
}

export interface ApiKeys {
  tmdb: string;
  omdb: string;
  youtube: string;
  gemini: string;
}
