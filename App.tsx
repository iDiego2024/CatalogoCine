
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Trophy, Clapperboard, List, Dice5, Star, Settings, 
  BarChart3, Loader2, Play, ExternalLink, PlayCircle, Youtube, 
  BookOpen, CheckCircle2, Award, Flame, ChevronLeft, ChevronRight,
  Calendar, Film, Megaphone, X, Check, Trash2, TrendingUp, TrendingDown,
  Users, PieChart, Activity, ThumbsUp, ThumbsDown, AlertTriangle, ListIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  AreaChart, Area, ScatterChart, Scatter, Cell, ReferenceLine
} from 'recharts';
import Fuse from 'fuse.js';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// ==========================================
// CONSTANTS & TYPES
// ==========================================

export const APP_VERSION = "1.2.0";

export const AFI_LIST = [
    {"Rank": 1, "Title": "Citizen Kane", "Year": 1941},
    {"Rank": 2, "Title": "The Godfather", "Year": 1972},
    {"Rank": 3, "Title": "Casablanca", "Year": 1942},
    {"Rank": 4, "Title": "Raging Bull", "Year": 1980},
    {"Rank": 5, "Title": "Singin' in the Rain", "Year": 1952},
    {"Rank": 6, "Title": "Gone with the Wind", "Year": 1939},
    {"Rank": 7, "Title": "Lawrence of Arabia", "Year": 1962},
    {"Rank": 8, "Title": "Schindler's List", "Year": 1993},
    {"Rank": 10, "Title": "The Wizard of Oz", "Year": 1939},
    {"Rank": 11, "Title": "City Lights", "Year": 1931},
    {"Rank": 12, "Title": "The Searchers", "Year": 1956},
    {"Rank": 13, "Title": "Star Wars", "Year": 1977},
    {"Rank": 14, "Title": "Psycho", "Year": 1960},
    {"Rank": 15, "Title": "2001: A Space Odyssey", "Year": 1968},
    {"Rank": 16, "Title": "Sunset Boulevard", "Year": 1950},
    {"Rank": 17, "Title": "The Graduate", "Year": 1967},
    {"Rank": 18, "Title": "The General", "Year": 1926},
    {"Rank": 19, "Title": "On the Waterfront", "Year": 1954},
    {"Rank": 20, "Title": "It's a Wonderful Life", "Year": 1946},
    {"Rank": 21, "Title": "Chinatown", "Year": 1974},
    {"Rank": 22, "Title": "Some Like It Hot", "Year": 1959},
    {"Rank": 23, "Title": "The Grapes of Wrath", "Year": 1940},
    {"Rank": 24, "Title": "E.T. the Extra-Terrestrial", "Year": 1982},
    {"Rank": 25, "Title": "To Kill a Mockingbird", "Year": 1962},
    {"Rank": 26, "Title": "Mr. Smith Goes to Washington", "Year": 1939},
    {"Rank": 27, "Title": "High Noon", "Year": 1952},
    {"Rank": 28, "Title": "All About Eve", "Year": 1950},
    {"Rank": 29, "Title": "Double Indemnity", "Year": 1944},
    {"Rank": 30, "Title": "Apocalypse Now", "Year": 1979},
    {"Rank": 31, "Title": "The Maltese Falcon", "Year": 1941},
    {"Rank": 32, "Title": "The Godfather Part II", "Year": 1974},
    {"Rank": 33, "Title": "One Flew Over the Cuckoo's Nest", "Year": 1975},
    {"Rank": 34, "Title": "Snow White and the Seven Dwarfs", "Year": 1937},
    {"Rank": 35, "Title": "Annie Hall", "Year": 1977},
    {"Rank": 36, "Title": "The Bridge on the River Kwai", "Year": 1957},
    {"Rank": 37, "Title": "The Best Years of Our Lives", "Year": 1946},
    {"Rank": 38, "Title": "The Treasure of the Sierra Madre", "Year": 1948},
    {"Rank": 39, "Title": "Dr. Strangelove", "Year": 1964},
    {"Rank": 40, "Title": "The Sound of Music", "Year": 1965},
    {"Rank": 41, "Title": "King Kong", "Year": 1933},
    {"Rank": 42, "Title": "Bonnie and Clyde", "Year": 1967},
    {"Rank": 43, "Title": "Midnight Cowboy", "Year": 1969},
    {"Rank": 44, "Title": "The Philadelphia Story", "Year": 1940},
    {"Rank": 45, "Title": "Shane", "Year": 1953},
    {"Rank": 46, "Title": "It Happened One Night", "Year": 1934},
    {"Rank": 47, "Title": "A Streetcar Named Desire", "Year": 1951},
    {"Rank": 48, "Title": "Rear Window", "Year": 1954},
    {"Rank": 49, "Title": "Intolerance", "Year": 1916},
    {"Rank": 50, "Title": "The Lord of the Rings: The Fellowship of the Ring", "Year": 2001},
    {"Rank": 51, "Title": "West Side Story", "Year": 1961},
    {"Rank": 52, "Title": "Taxi Driver", "Year": 1976},
    {"Rank": 53, "Title": "The Deer Hunter", "Year": 1978},
    {"Rank": 54, "Title": "M*A*S*H", "Year": 1970},
    {"Rank": 55, "Title": "North by Northwest", "Year": 1959},
    {"Rank": 56, "Title": "Jaws", "Year": 1975},
    {"Rank": 57, "Title": "Rocky", "Year": 1976},
    {"Rank": 58, "Title": "The Gold Rush", "Year": 1925},
    {"Rank": 59, "Title": "Nashville", "Year": 1975},
    {"Rank": 60, "Title": "Duck Soup", "Year": 1933},
    {"Rank": 61, "Title": "Sullivan's Travels", "Year": 1941},
    {"Rank": 62, "Title": "American Graffiti", "Year": 1973},
    {"Rank": 63, "Title": "Cabaret", "Year": 1972},
    {"Rank": 64, "Title": "Network", "Year": 1976},
    {"Rank": 65, "Title": "The African Queen", "Year": 1951},
    {"Rank": 66, "Title": "Raiders of the Lost Ark", "Year": 1981},
    {"Rank": 67, "Title": "Who's Afraid of Virginia Woolf?", "Year": 1966},
    {"Rank": 68, "Title": "Unforgiven", "Year": 1992},
    {"Rank": 69, "Title": "Tootsie", "Year": 1982},
    {"Rank": 70, "Title": "A Clockwork Orange", "Year": 1971},
    {"Rank": 71, "Title": "Saving Private Ryan", "Year": 1998},
    {"Rank": 72, "Title": "The Shawshank Redemption", "Year": 1994},
    {"Rank": 73, "Title": "Butch Cassidy and the Sundance Kid", "Year": 1969},
    {"Rank": 74, "Title": "The Silence of the Lambs", "Year": 1991},
    {"Rank": 75, "Title": "Forrest Gump", "Year": 1994},
    {"Rank": 76, "Title": "All the President's Men", "Year": 1976},
    {"Rank": 77, "Title": "Modern Times", "Year": 1936},
    {"Rank": 78, "Title": "The Wild Bunch", "Year": 1969},
    {"Rank": 79, "Title": "The Apartment", "Year": 1960},
    {"Rank": 80, "Title": "Spartacus", "Year": 1960},
    {"Rank": 81, "Title": "Sunrise: A Song of Two Humans", "Year": 1927},
    {"Rank": 82, "Title": "Titanic", "Year": 1997},
    {"Rank": 83, "Title": "Easy Rider", "Year": 1969},
    {"Rank": 84, "Title": "A Night at the Opera", "Year": 1935},
    {"Rank": 85, "Title": "Platoon", "Year": 1986},
    {"Rank": 86, "Title": "12 Angry Men", "Year": 1957},
    {"Rank": 87, "Title": "Bringing Up Baby", "Year": 1938},
    {"Rank": 88, "Title": "The Sixth Sense", "Year": 1999},
    {"Rank": 89, "Title": "Swing Time", "Year": 1936},
    {"Rank": 90, "Title": "Sophie's Choice", "Year": 1982},
    {"Rank": 92, "Title": "Goodfellas", "Year": 1990},
    {"Rank": 93, "Title": "The French Connection", "Year": 1971},
    {"Rank": 94, "Title": "Pulp Fiction", "Year": 1994},
    {"Rank": 95, "Title": "The Last Picture Show", "Year": 1971},
    {"Rank": 96, "Title": "Do the Right Thing", "Year": 1989},
    {"Rank": 97, "Title": "Blade Runner", "Year": 1982},
    {"Rank": 98, "Title": "Yankee Doodle Dandy", "Year": 1942},
    {"Rank": 99, "Title": "Toy Story", "Year": 1995},
    {"Rank": 100, "Title": "Ben-Hur", "Year": 1959}
];

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
}

// ==========================================
// UTILS & API SERVICES
// ==========================================

export const normalizeTitle = (s: any): string => {
  if (!s) return "";
  return String(s).replace(/[^a-z0-9]+/gi, "").toLowerCase();
};

export const parseMoviesCSV = (csvText: string): Movie[] => {
  const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  const data = result.data as any[];
  
  return data.map(row => {
    let year = null;
    if (row.Year) {
      const match = String(row.Year).match(/(\d{4})/);
      if (match) year = parseInt(match[0], 10);
    }
    
    const yourRating = row["Your Rating"] ? parseFloat(row["Your Rating"]) : null;
    const imdbRating = row["IMDb Rating"] ? parseFloat(row["IMDb Rating"]) : null;
    const genres = row.Genres || "";
    const genreList = genres ? genres.split(", ").map((g:string) => g.trim()) : [];
    const directors = row.Directors || "";
    
    const searchFields = [row.Title, row["Original Title"], directors, genres, year, yourRating, imdbRating];
    const searchText = searchFields.filter(Boolean).join(" ").toLowerCase();

    return {
      Title: row.Title,
      Year: year,
      "Your Rating": yourRating,
      "IMDb Rating": imdbRating,
      Genres: genres,
      GenreList: genreList,
      Directors: directors,
      "Date Rated": row["Date Rated"] || null,
      URL: row.URL || "",
      NormTitle: normalizeTitle(row.Title),
      SearchText: searchText
    };
  }).filter(m => m.Title);
};

export const parseOscarExcel = (buffer: ArrayBuffer) => {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];

  return jsonData.map(row => {
    const filmYear = row["Year Film"] || row["Year_Film"] || row["year film"] || row["Year"] || null;
    const awardYear = row["Year Award"] || row["Ceremony"] || filmYear;
    const category = row["Category"] || row["Award"] || "";
    const film = row["Film"] || row["Movie"] || row["Title"] || "";
    const name = row["Nominee"] || row["Name"] || "";
    const winnerRaw = row["Winner"] || row["IsWinner"] || row["Won"] || "";
    
    let isWinner = false;
    if (typeof winnerRaw === 'boolean') isWinner = winnerRaw;
    else if (String(winnerRaw).match(/^(true|1|yes|won|winner)$/i)) isWinner = true;

    return {
      FilmYear: typeof filmYear === 'number' ? filmYear : parseInt(String(filmYear).match(/\d{4}/)?.[0] || '0'),
      AwardYear: typeof awardYear === 'number' ? awardYear : parseInt(String(awardYear).match(/\d{4}/)?.[0] || '0'),
      CategoryRaw: String(category),
      Category: String(category).trim().toUpperCase(),
      PersonName: String(name),
      Film: String(film),
      IsWinner: isWinner,
      NormFilm: normalizeTitle(film)
    };
  });
};

export const getRatingColors = (rating: number | null) => {
  if (rating === null) return { border: "rgba(148,163,184,0.8)", glow: "rgba(15,23,42,0.0)", text: "text-slate-400" };
  if (rating >= 9) return { border: "#22c55e", glow: "rgba(34,197,94,0.55)", text: "text-green-500" };
  if (rating >= 8) return { border: "#0ea5e9", glow: "rgba(14,165,233,0.55)", text: "text-sky-500" };
  if (rating >= 7) return { border: "#a855f7", glow: "rgba(168,85,247,0.50)", text: "text-purple-500" };
  if (rating >= 6) return { border: "#eab308", glow: "rgba(234,179,8,0.45)", text: "text-yellow-500" };
  return { border: "#f97316", glow: "rgba(249,115,22,0.45)", text: "text-orange-500" };
};

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/w342";

export const fetchTmdbInfo = async (title: string, year: number | null, apiKey: string): Promise<TmdbInfo | null> => {
  if (!apiKey || !title) return null;
  try {
    const query = new URLSearchParams({ api_key: apiKey, query: title });
    if (year) query.append("year", year.toString());
    const res = await fetch(`${TMDB_BASE}/search/movie?${query}`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const m = data.results[0];
      return { id: m.id, poster_url: m.poster_path ? `${TMDB_IMG}${m.poster_path}` : null, vote_average: m.vote_average };
    }
  } catch (e) { console.error("TMDB Error", e); }
  return null;
};

export const fetchTmdbProviders = async (tmdbId: number, apiKey: string, country = "CL"): Promise<ProviderInfo | null> => {
  if (!apiKey || !tmdbId) return null;
  try {
    const res = await fetch(`${TMDB_BASE}/movie/${tmdbId}/watch/providers?api_key=${apiKey}`);
    const data = await res.json();
    const cData = data.results?.[country];
    if (cData) {
      const providers = new Set<string>();
      ['flatrate', 'rent', 'buy', 'ads', 'free'].forEach(k => { cData[k]?.forEach((p: any) => providers.add(p.provider_name)); });
      return { platforms: Array.from(providers).sort(), link: cData.link };
    }
  } catch (e) { console.error("TMDB Prov Error", e); }
  return null;
};

export const fetchOmdbAwards = async (title: string, year: number | null, apiKey: string): Promise<OmdbAwards | null> => {
  if (!apiKey || !title) return null;
  try {
    const query = new URLSearchParams({ apikey: apiKey, t: title, type: 'movie' });
    if (year) query.append('y', year.toString());
    const res = await fetch(`https://www.omdbapi.com/?${query}`);
    const data = await res.json();
    if (data.Response === "True") {
      const awardsStr = data.Awards || "";
      const lower = awardsStr.toLowerCase();
      const getNum = (regex: RegExp) => { const m = lower.match(regex); return m ? parseInt(m[1], 10) : 0; };
      return {
        raw: awardsStr === "N/A" ? null : awardsStr,
        oscars: getNum(/won\s+(\d+)\s+oscars?/),
        oscars_nominated: getNum(/nominated\s+for\s+(\d+)\s+oscars?/),
        emmys: getNum(/won\s+(\d+)\s+primetime\s+emmys?/) || getNum(/won\s+(\d+)\s+emmy/),
        baftas: getNum(/won\s+(\d+)[^.]*bafta/) || (lower.includes("bafta") ? 1 : 0),
        golden_globes: getNum(/won\s+(\d+)[^.]*golden\s+globe/) || (lower.includes("golden globe") ? 1 : 0),
        palme_dor: lower.includes("palme d'or") || lower.includes("palme dor"),
        total_wins: getNum(/(\d+)\s+wins?/),
        total_nominations: getNum(/(\d+)\s+nominations?/),
        imdbRating: data.imdbRating !== "N/A" ? data.imdbRating : undefined
      };
    }
  } catch (e) { console.error("OMDB Error", e); }
  return { error: "Not found", oscars: 0, emmys: 0, baftas: 0, golden_globes: 0, palme_dor: false, oscars_nominated: 0, total_wins: 0, total_nominations: 0, raw: null };
};

export const getYoutubeTrailer = async (title: string, year: number | null, apiKey: string): Promise<string | null> => {
  if (!apiKey || !title) return null;
  try {
    const q = `${title} trailer ${year || ''}`;
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video&maxResults=1&key=${apiKey}`);
    const data = await res.json();
    if (data.items && data.items.length > 0) { return data.items[0].id.videoId; }
  } catch (e) { console.error("YT Error", e); }
  return null;
};

// ==========================================
// COMPONENTS
// ==========================================

const MovieCard: React.FC<{ movie: Movie; apiKeys: ApiKeys; showAwards?: boolean }> = ({ movie, apiKeys, showAwards }) => {
  const [tmdb, setTmdb] = useState<TmdbInfo | null>(null);
  const [providers, setProviders] = useState<ProviderInfo | null>(null);
  const [awards, setAwards] = useState<OmdbAwards | null>(null);
  const [trailerId, setTrailerId] = useState<string | null>(null);

  useEffect(() => {
    if (apiKeys.tmdb) {
        fetchTmdbInfo(movie.Title, movie.Year, apiKeys.tmdb).then(info => {
            setTmdb(info);
            if (info) fetchTmdbProviders(info.id, apiKeys.tmdb).then(setProviders);
        });
    }
    if (showAwards && apiKeys.omdb) { fetchOmdbAwards(movie.Title, movie.Year, apiKeys.omdb).then(setAwards); }
    if (apiKeys.youtube) { getYoutubeTrailer(movie.Title, movie.Year, apiKeys.youtube).then(setTrailerId); }
  }, [movie, apiKeys, showAwards]);

  const rating = movie["Your Rating"] ?? movie["IMDb Rating"];
  const colors = getRatingColors(rating);
  const reviewUrl = `https://www.google.com/search?q=reseña+película+${encodeURIComponent(movie.Title + " " + (movie.Year || ""))}`;
  const trailerUrl = trailerId ? `https://www.youtube.com/watch?v=${trailerId}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.Title + " trailer")}`;

  return (
    <div className="group relative bg-[#050505] rounded-lg overflow-hidden transition-all duration-500 hover:z-20 hover:scale-105 hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] border border-white/5 hover:border-white/20">
      <div className="aspect-[2/3] w-full bg-slate-900 relative overflow-hidden">
        {tmdb?.poster_url ? (
            <img src={tmdb.poster_url} alt={movie.Title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:saturate-150" loading="lazy" />
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-700">
                <Film size={32} />
                <span className="text-[10px] uppercase tracking-widest mt-2 font-bold opacity-50">No Image</span>
            </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
        <div className="absolute top-0 left-0 p-2 flex gap-1 flex-wrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-y-2 group-hover:translate-y-0">
            {awards?.oscars ? <span className="bg-yellow-500 text-black text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wide shadow-lg shadow-yellow-500/20">🏆 {awards.oscars}</span> : null}
            {awards?.palme_dor ? <span className="bg-green-600 text-white text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wide shadow-lg">🌿 Palma</span> : null}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="font-bold text-white text-sm leading-tight mb-1 text-glow drop-shadow-md line-clamp-2">{movie.Title}</h3>
        <div className="text-[10px] font-bold text-slate-400 mb-2">{movie.Year}</div>
        <div className="flex items-center gap-3 text-xs mb-3 opacity-80 group-hover:opacity-100 transition-opacity">
            {movie["Your Rating"] && ( <div className={`flex items-center gap-1 font-black ${colors.text}`}> <Star size={12} fill="currentColor" /> {movie["Your Rating"]} </div> )}
            {movie["IMDb Rating"] && (
                <a href={movie.URL} target="_blank" rel="noreferrer" className="text-slate-400 flex items-center gap-1 hover:text-white transition-colors group/imdb">
                   <span className="font-bold text-yellow-500/80 text-[10px] border border-yellow-500/30 px-1 rounded group-hover/imdb:border-yellow-500 transition-colors">IMDb</span> {movie["IMDb Rating"]}
                </a>
            )}
        </div>
        <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-500 opacity-0 group-hover:opacity-100">
            <div className="text-[10px] text-slate-300 space-y-1 mb-3 pt-2 border-t border-white/10">
                <p className="line-clamp-1"><span className="text-slate-500 uppercase tracking-wider text-[9px]">Gén:</span> {movie.Genres}</p>
                <p className="line-clamp-1"><span className="text-slate-500 uppercase tracking-wider text-[9px]">Dir:</span> {movie.Directors}</p>
            </div>
            <div className="grid grid-cols-4 gap-1 text-[9px] uppercase tracking-wide font-bold mt-2">
                 {movie.URL && ( <a href={movie.URL} target="_blank" rel="noreferrer" className="col-span-1 flex justify-center items-center py-1.5 bg-white/10 hover:bg-white/20 rounded text-slate-300 hover:text-white transition-colors"> <ExternalLink size={10} /> </a> )}
                 {providers?.link && ( <a href={providers.link} target="_blank" rel="noreferrer" className="col-span-1 flex justify-center items-center py-1.5 bg-sky-500/20 hover:bg-sky-500/30 rounded text-sky-400 hover:text-sky-200 transition-colors"> <PlayCircle size={10} /> </a> )}
                 <a href={reviewUrl} target="_blank" rel="noreferrer" className="col-span-1 flex justify-center items-center py-1.5 bg-green-500/20 hover:bg-green-500/30 rounded text-green-400 hover:text-green-200 transition-colors" title="Reseña"> <BookOpen size={10} /> </a>
                 <a href={trailerUrl} target="_blank" rel="noreferrer" className="col-span-1 flex justify-center items-center py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400 hover:text-red-200 transition-colors" title="Trailer"> <Youtube size={10} /> </a>
            </div>
        </div>
      </div>
    </div>
  );
};

const FilterBar: React.FC<{ filters: FilterState; setFilters: React.Dispatch<React.SetStateAction<FilterState>>; availableGenres: string[]; availableDirectors: string[]; movies: Movie[] }> = ({ filters, setFilters, availableGenres, availableDirectors, movies }) => {
  const [activePopover, setActivePopover] = useState<'year' | 'rating' | 'genres' | 'directors' | null>(null);
  const decadeCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    const decadeStarts = [2020, 2010, 2000, 1990, 1980, 1970, 1960, 1950, 1940, 1930, 1920, 1900];
    decadeStarts.forEach(start => counts[start] = 0);
    movies.forEach(m => {
        if (!m.Year) return;
        if (m.Year >= 2020) counts[2020]++; else if (m.Year >= 2010) counts[2010]++; else if (m.Year >= 2000) counts[2000]++;
        else if (m.Year >= 1990) counts[1990]++; else if (m.Year >= 1980) counts[1980]++; else if (m.Year >= 1970) counts[1970]++;
        else if (m.Year >= 1960) counts[1960]++; else if (m.Year >= 1950) counts[1950]++; else if (m.Year >= 1940) counts[1940]++;
        else if (m.Year >= 1930) counts[1930]++; else if (m.Year >= 1920) counts[1920]++; else if (m.Year >= 1900) counts[1900]++;
    });
    return counts;
  }, [movies]);

  const toggleSelection = (type: 'genres' | 'directors', val: string) => {
    setFilters(prev => {
      const list = prev[type];
      return { ...prev, [type]: list.includes(val) ? list.filter(i => i !== val) : [...list, val] };
    });
  };

  const clearFilters = () => setFilters({ genres: [], directors: [], yearRange: [1900, 2025], ratingRange: [0, 10] });
  const isYearActive = filters.yearRange[0] > 1900 || filters.yearRange[1] < 2024;
  const isRatingActive = filters.ratingRange[0] > 0 || filters.ratingRange[1] < 10;
  const hasActiveFilters = filters.genres.length > 0 || filters.directors.length > 0 || isYearActive || isRatingActive;

  return (
    <div className="flex flex-col gap-8">
        <div className="relative pt-6 pb-2">
            <div className="absolute top-0 left-0 right-0 h-4 bg-black flex justify-around px-8 opacity-60"> {Array.from({length: 40}).map((_, i) => <div key={i} className="w-2.5 h-2.5 bg-zinc-900 rounded-sm mt-0.5"></div>)} </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-4 px-2 no-scrollbar scroll-smooth">
                {[2020, 2010, 2000, 1990, 1980, 1970, 1960, 1950, 1940, 1930, 1920, 1900].map(decade => {
                    const isSelected = filters.yearRange[0] === decade && filters.yearRange[1] === (decade === 1900 ? 1919 : decade + 9);
                    return (
                        <button key={decade} onClick={() => setFilters(prev => ({ ...prev, yearRange: [decade, decade === 1900 ? 1919 : decade + 9] }))}
                            className={`shrink-0 px-8 py-3 rounded-md text-[11px] font-black tracking-[0.2em] uppercase transition-all duration-500 border-x border-white/5 relative flex flex-col items-center gap-1 ${isSelected ? 'bg-accent text-black shadow-[0_0_30px_rgba(234,179,8,0.4)] scale-110 z-10' : 'bg-zinc-900/60 text-slate-500 hover:text-slate-100'}`}>
                            <span>{decade === 1900 ? 'CLÁSICOS' : `${decade}S`}</span>
                            <span className={`text-[9px] font-mono ${isSelected ? 'opacity-80' : 'opacity-40'}`}>({decadeCounts[decade] || 0})</span>
                        </button>
                    );
                })}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-black flex justify-around px-8 opacity-60"> {Array.from({length: 40}).map((_, i) => <div key={i} className="w-2.5 h-2.5 bg-zinc-900 rounded-sm mt-0.5"></div>)} </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
            <div className="p-2 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/5 flex gap-2 shadow-2xl">
                <button onClick={() => setActivePopover(activePopover === 'year' ? null : 'year')} className={`px-5 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-[0.1em] flex items-center gap-2 ${activePopover === 'year' || isYearActive ? 'border-accent text-accent bg-accent/10' : 'border-white/5 text-slate-400'}`}><Calendar size={14}/>Año</button>
                <button onClick={() => setActivePopover(activePopover === 'rating' ? null : 'rating')} className={`px-5 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-[0.1em] flex items-center gap-2 ${activePopover === 'rating' || isRatingActive ? 'border-accent text-accent bg-accent/10' : 'border-white/5 text-slate-400'}`}><Star size={14}/>Nota</button>
                <button onClick={() => setActivePopover(activePopover === 'genres' ? null : 'genres')} className={`px-5 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-[0.1em] flex items-center gap-2 ${activePopover === 'genres' || filters.genres.length > 0 ? 'border-accent text-accent bg-accent/10' : 'border-white/5 text-slate-400'}`}><Film size={14}/>Género {filters.genres.length > 0 && <span className="bg-accent text-black px-1.5 rounded-full text-[8px]">{filters.genres.length}</span>}</button>
                <button onClick={() => setActivePopover(activePopover === 'directors' ? null : 'directors')} className={`px-5 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-[0.1em] flex items-center gap-2 ${activePopover === 'directors' || filters.directors.length > 0 ? 'border-accent text-accent bg-accent/10' : 'border-white/5 text-slate-400'}`}><Megaphone size={14}/>Director {filters.directors.length > 0 && <span className="bg-accent text-black px-1.5 rounded-full text-[8px]">{filters.directors.length}</span>}</button>
            </div>
            {hasActiveFilters && ( <button onClick={clearFilters} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-red-500 bg-red-500/5 hover:bg-red-500/10 transition-all border border-red-500/10"> <Trash2 size={12} /> Limpiar Mesa </button> )}
        </div>
        {activePopover === 'genres' && (
            <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {availableGenres.map(g => (
                    <button key={g} onClick={() => toggleSelection('genres', g)} className={`text-[10px] px-3 py-2 rounded-lg border ${filters.genres.includes(g) ? 'bg-accent text-black border-accent' : 'bg-white/5 border-white/5 text-slate-400'}`}>{g}</button>
                ))}
            </div>
        )}
    </div>
  );
};

const AnalysisView: React.FC<{ movies: Movie[]; oscarData: OscarRow[] }> = ({ movies, oscarData }) => {
  const [subTab, setSubTab] = useState<'overview' | 'directors' | 'genres' | 'controversy'>('overview');
  const stats = useMemo(() => {
    if (movies.length === 0) return null;
    const rated = movies.filter(m => m["Your Rating"] !== null);
    const avg = rated.reduce((acc, m) => acc + (m["Your Rating"] || 0), 0) / rated.length || 0;
    const ratingDist = Array.from({ length: 10 }, (_, i) => ({ rating: i + 1, count: rated.filter(m => Math.round(m["Your Rating"] || 0) === i + 1).length }));
    const comparisons = movies.filter(m => m["Your Rating"] !== null && m["IMDb Rating"] !== null).map(m => ({ ...m, diff: (m["Your Rating"] || 0) - (m["IMDb Rating"] || 0) })).sort((a, b) => b.diff - a.diff);
    return { total: movies.length, avg, ratingDist, comparisons, underrated: comparisons.slice(0, 10), overrated: comparisons.slice().reverse().slice(0, 10) };
  }, [movies]);

  if (!stats) return <div className="p-20 text-center text-slate-600">No hay datos suficientes para el análisis</div>;

  return (
    <div className="animate-in fade-in duration-700 space-y-12">
        <div className="flex gap-4">
            {['overview', 'directors', 'genres', 'controversy'].map(t => (
                <button key={t} onClick={() => setSubTab(t as any)} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${subTab === t ? 'bg-accent text-black' : 'bg-white/5 text-slate-500'}`}>{t}</button>
            ))}
        </div>
        {subTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-panel p-8 rounded-3xl h-80"> <h4 className="text-xs font-black uppercase text-slate-500 mb-8">Distribución de Notas</h4> <ResponsiveContainer> <BarChart data={stats.ratingDist}> <XAxis dataKey="rating" stroke="#334155" fontSize={10}/> <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}}/> <Bar dataKey="count" fill="#eab308" radius={[4, 4, 0, 0]}/> </BarChart> </ResponsiveContainer> </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-panel p-8 rounded-3xl flex flex-col justify-center"> <span className="text-xs font-black text-slate-500 uppercase">Total Vistas</span> <span className="text-5xl font-black text-white">{stats.total}</span> </div>
                    <div className="glass-panel p-8 rounded-3xl flex flex-col justify-center"> <span className="text-xs font-black text-slate-500 uppercase">Nota Media</span> <span className="text-5xl font-black text-accent">{stats.avg.toFixed(2)}</span> </div>
                </div>
            </div>
        )}
        {subTab === 'controversy' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-panel p-8 rounded-3xl"> <h4 className="text-xs font-black text-green-500 uppercase mb-6 flex items-center gap-2"> <ThumbsUp size={16}/> Joyas Infravaloradas </h4> <div className="space-y-4"> {stats.underrated.map(m => ( <div key={m.Title} className="flex justify-between items-center bg-black/20 p-4 rounded-xl"> <span className="text-xs font-black text-white truncate pr-4">{m.Title}</span> <div className="flex gap-4 text-[10px] font-mono"> <span className="text-green-500">{m["Your Rating"]}</span> <span className="text-slate-600">vs</span> <span className="text-slate-500">{m["IMDb Rating"]}</span> </div> </div> ))} </div> </div>
                <div className="glass-panel p-8 rounded-3xl"> <h4 className="text-xs font-black text-red-500 uppercase mb-6 flex items-center gap-2"> <ThumbsDown size={16}/> Decepciones </h4> <div className="space-y-4"> {stats.overrated.map(m => ( <div key={m.Title} className="flex justify-between items-center bg-black/20 p-4 rounded-xl"> <span className="text-xs font-black text-white truncate pr-4">{m.Title}</span> <div className="flex gap-4 text-[10px] font-mono"> <span className="text-red-500">{m["Your Rating"]}</span> <span className="text-slate-600">vs</span> <span className="text-slate-500">{m["IMDb Rating"]}</span> </div> </div> ))} </div> </div>
            </div>
        )}
    </div>
  );
};

const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void; onFileUpload: (file: File, type: 'movies' | 'oscars') => void; onClearData: () => void }> = ({ isOpen, onClose, onFileUpload, onClearData }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0f172a] border border-slate-700 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden p-8 space-y-8">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black uppercase text-white flex items-center gap-3"> <Settings className="text-accent" /> Configuración </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X size={24} /></button>
        </div>
        <div className="space-y-6">
            <div className="p-6 bg-white/5 border border-dashed border-white/10 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer relative">
                <input type="file" accept=".csv" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0], 'movies')} />
                <div className="flex items-center gap-4"> <div className="p-3 bg-accent/10 rounded-xl text-accent"><Search /></div> <div> <h3 className="font-black text-white uppercase text-xs">Cargar Películas (CSV)</h3> <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Exportación de IMDb</p> </div> </div>
            </div>
            <div className="p-6 bg-white/5 border border-dashed border-white/10 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer relative">
                <input type="file" accept=".xlsx" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0], 'oscars')} />
                <div className="flex items-center gap-4"> <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500"><Trophy /></div> <div> <h3 className="font-black text-white uppercase text-xs">Cargar Oscars (Excel)</h3> <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Base de datos de la academia</p> </div> </div>
            </div>
        </div>
        <div className="pt-8 border-t border-white/5">
            <button onClick={() => { if(confirm("¿Borrar todos los datos?")) onClearData(); }} className="w-full py-4 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"> <Trash2 size={16} className="inline mr-2" /> Borrar Caché y Datos </button>
        </div>
      </div>
    </div>
  );
};

const OscarCard: React.FC<{ item: OscarRow; apiKeys: ApiKeys }> = ({ item, apiKeys }) => {
  const [tmdb, setTmdb] = useState<TmdbInfo | null>(null);
  useEffect(() => { if (apiKeys.tmdb) fetchTmdbInfo(item.Film, item.FilmYear, apiKeys.tmdb).then(setTmdb); }, [item.Film, item.FilmYear]);
  return (
    <div className={`group relative bg-[#050505] rounded-lg overflow-hidden transition-all duration-500 hover:scale-105 border ${item.IsWinner ? 'border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.1)]' : 'border-white/5'}`}>
      <div className="aspect-[2/3] w-full bg-slate-900 relative overflow-hidden">
        {tmdb?.poster_url ? <img src={tmdb.poster_url} alt={item.Film} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-800"><Film /></div>}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
            {item.IsWinner && <div className="bg-yellow-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg flex items-center gap-1 uppercase tracking-wider"> <Trophy size={8} fill="black" /> WIN </div>}
            {item.InMyCatalog && <div className="bg-green-500 text-white text-[7px] font-black px-1 py-0.5 rounded shadow-lg flex items-center gap-1 uppercase tracking-wider"> <CheckCircle2 size={8} /> VISTO </div>}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black to-transparent">
            <h4 className="text-[10px] font-black uppercase text-white truncate" title={item.Film}>{item.Film}</h4>
            <div className="text-[8px] font-black text-slate-500 mt-0.5">{item.FilmYear}</div>
        </div>
      </div>
    </div>
  );
};

const OscarMovieSummary: React.FC<{ title: string; year: number; oscarData: OscarRow[]; apiKeys: ApiKeys; movies: Movie[] }> = ({ title, year, oscarData, apiKeys, movies }) => {
  const rows = oscarData.filter(o => o.Film === title && o.FilmYear === year);
  const catalogMatch = movies.find(m => m.NormTitle === normalizeTitle(title) && m.Year === year);
  const totalWins = rows.filter(r => r.IsWinner).length;
  const totalNoms = rows.length;
  return (
    <div className="glass-panel p-8 rounded-3xl border border-white/5 animate-in fade-in slide-in-from-right-8 h-full">
        <h2 className="text-3xl font-black uppercase text-white mb-2">{title} <span className="text-slate-500 text-xl">({year})</span></h2>
        <div className="flex gap-4 mb-8">
            <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"> <span className="text-2xl font-black text-yellow-500">{totalWins}</span> <span className="text-[8px] font-black uppercase text-yellow-500/50 block tracking-widest">Premios</span> </div>
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl"> <span className="text-2xl font-black text-white">{totalNoms}</span> <span className="text-[8px] font-black uppercase text-slate-600 block tracking-widest">Nominaciones</span> </div>
            {catalogMatch && <div className="px-4 py-2 bg-accent/10 border border-accent/20 rounded-xl"> <span className="text-2xl font-black text-accent">{catalogMatch["Your Rating"]}</span> <span className="text-[8px] font-black uppercase text-accent/50 block tracking-widest">Mi Nota</span> </div>}
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
            {rows.map((r, i) => (
                <div key={i} className={`flex justify-between items-center p-4 rounded-xl border ${r.IsWinner ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-black/20 border-white/5'}`}>
                    <div> <div className={`text-[11px] font-black uppercase ${r.IsWinner ? 'text-yellow-400' : 'text-slate-300'}`}>{r.Category}</div> <div className="text-[10px] text-slate-600 mt-1 uppercase">{r.PersonName}</div> </div>
                    {r.IsWinner ? <span className="bg-yellow-500 text-black text-[9px] font-black px-2 py-0.5 rounded">GANADO</span> : <span className="text-[9px] text-slate-700 font-black uppercase">NOM</span>}
                </div>
            ))}
        </div>
    </div>
  );
};

// ==========================================
// MAIN APP COMPONENT
// ==========================================

const DEFAULT_API_KEYS: ApiKeys = {
  tmdb: "506c9387e637ecb32fd3b1ab6ade4259",
  omdb: "1b00f496",
  youtube: "AIzaSyBV8-kbLUzPAT9Pi1JBXP9KQBAjF0gvRHo"
};

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [oscarData, setOscarData] = useState<OscarRow[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [activeTab, setActiveTab] = useState<'catalog' | 'analysis' | 'afi' | 'oscars' | 'random'>('catalog');
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [selectedOscarMovieTitle, setSelectedOscarMovieTitle] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({ yearRange: [1900, new Date().getFullYear() + 1], ratingRange: [0, 10], genres: [], directors: [] });
  const [apiKeys] = useState<ApiKeys>(DEFAULT_API_KEYS);
  const [randomPick, setRandomPick] = useState<Movie | null>(null);

  useEffect(() => {
    const loadData = async () => {
        setIsDataLoading(true);
        try {
            const csvReq = await fetch(`peliculas.csv?t=${Date.now()}`, { cache: 'no-store' });
            if (csvReq.ok) { const text = await csvReq.text(); if (text && text.length > 50) setMovies(parseMoviesCSV(text)); }
        } catch (e) {}
        try {
            const xlsxReq = await fetch(`Oscar_Data_1927_today.xlsx?t=${Date.now()}`, { cache: 'no-store' });
            if (xlsxReq.ok) { const buf = await xlsxReq.arrayBuffer(); if (buf && buf.byteLength > 100) setOscarData(parseOscarExcel(buf)); }
        } catch (e) {}
        setIsDataLoading(false);
    };
    loadData();
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let result = movies.filter(m => {
        const y = m.Year || 0;
        const r = m["Your Rating"] ?? -1;
        if (y !== 0 && (y < filters.yearRange[0] || y > filters.yearRange[1])) return false;
        if (filters.ratingRange[0] > 0 && (r < filters.ratingRange[0] || r > filters.ratingRange[1])) return false;
        if (filters.genres.length && !filters.genres.every(g => m.GenreList.includes(g))) return false;
        if (filters.directors.length && !filters.directors.some(d => m.Directors.includes(d))) return false;
        return true;
    });
    if (searchQuery.length > 1) {
       const fuse = new Fuse(result, { keys: ['Title', 'Directors', 'Genres', 'Year'], threshold: 0.3 });
       result = fuse.search(searchQuery).map(r => r.item);
    }
    setFilteredMovies(result);
    setCurrentPage(1);
  }, [movies, filters, searchQuery]);

  const availableGenres = useMemo(() => Array.from(new Set(movies.flatMap(m => m.GenreList))).sort(), [movies]);
  const availableDirectors = useMemo(() => Array.from(new Set(movies.flatMap(m => m.Directors.split(',').map(d => d.trim()).filter(Boolean)))).sort(), [movies]);
  const paginatedMovies = useMemo(() => filteredMovies.slice((currentPage - 1) * 48, currentPage * 48), [filteredMovies, currentPage]);

  const [oscarYear, setOscarYear] = useState<number>(2024);
  const availableOscarYears = useMemo(() => Array.from(new Set(oscarData.map(o => o.FilmYear).filter((y): y is number => y !== null))).sort((a, b) => b - a), [oscarData]);
  const oscarFiltered = useMemo(() => oscarData.map(o => {
        const match = movies.find(m => m.NormTitle === o.NormFilm && m.Year === o.FilmYear);
        return { ...o, InMyCatalog: !!match, MyRating: match?.["Your Rating"], MyIMDb: match?.["IMDb Rating"], CatalogURL: match?.URL };
  }), [oscarData, movies]);

  const oscarDisplayData = useMemo(() => {
    const data = oscarFiltered.filter(o => o.FilmYear === oscarYear);
    const grouped: Record<string, OscarRow[]> = {};
    data.forEach(item => { if (!grouped[item.Category]) grouped[item.Category] = []; grouped[item.Category].push(item); });
    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  }, [oscarFiltered, oscarYear]);

  const oscarLeaderboard = useMemo(() => {
      const yearData = oscarFiltered.filter(o => o.FilmYear === oscarYear);
      const statsMap: Record<string, {title: string, wins: number, noms: number, isWinner: boolean}> = {};
      yearData.forEach(row => {
          let entry = statsMap[row.Film];
          if (!entry) entry = { title: row.Film, wins: 0, noms: 0, isWinner: false };
          entry.noms += 1; if (row.IsWinner) { entry.wins += 1; entry.isWinner = true; }
          statsMap[row.Film] = entry;
      });
      // Added : any to sort parameters to fix subtraction errors on line 665
      return Object.values(statsMap).sort((a: any, b: any) => b.wins !== a.wins ? b.wins - a.wins : b.noms - a.noms);
  }, [oscarFiltered, oscarYear]);

  return (
    <div className="min-h-screen text-slate-200 font-sans flex flex-col relative">
      <div className="bg-cinematic"></div>
      <div className="bg-noise"></div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onFileUpload={(file, type) => {
            const reader = new FileReader();
            reader.onload = (e) => { if (type === 'movies') setMovies(parseMoviesCSV(e.target?.result as string)); else setOscarData(parseOscarExcel(e.target?.result as ArrayBuffer)); };
            if (type === 'movies') reader.readAsText(file); else reader.readAsArrayBuffer(file);
        }} onClearData={() => { setMovies([]); setOscarData([]); setFilteredMovies([]); }}
      />

      <header className={`sticky top-0 z-50 transition-all duration-500 border-b ${isScrolled ? 'bg-black/95 backdrop-blur-xl border-white/5 py-2' : 'bg-transparent border-transparent py-4'}`}>
          <div className="max-w-[1920px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-6">
              <div className="flex items-center gap-3 shrink-0 group cursor-pointer" onClick={() => setActiveTab('catalog')}>
                  <div className="w-10 h-10 bg-gradient-to-br from-accent to-yellow-600 rounded-xl flex items-center justify-center text-primary shadow-[0_0_20px_rgba(234,179,8,0.4)]"> <Clapperboard size={24} strokeWidth={2.5} /> </div>
                  <div> <h1 className="text-xl font-black uppercase tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent leading-none">Mi Cine</h1> <div className="text-[10px] font-black text-accent tracking-[0.3em] uppercase opacity-90 mt-1">Catálogo Personal</div> </div>
              </div>
              <div className="hidden md:flex flex-1 max-w-xl mx-auto px-4">
                  <div className="relative group w-full"> <input type="text" placeholder="Buscar película..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm focus:border-accent/50 outline-none backdrop-blur-md" /> <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} /> </div>
              </div>
              <nav className="flex items-center gap-4">
                  <div className="hidden lg:flex items-center gap-1">
                     {[{ id: 'catalog', label: 'Catálogo' }, { id: 'analysis', label: 'Análisis' }, { id: 'oscars', label: 'Premios Oscar' }, { id: 'afi', label: 'Lista AFI' }, { id: 'random', label: 'Qué ver hoy' }].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'text-white border-b-2 border-accent' : 'text-slate-500 hover:text-slate-300'}`}> {tab.label} </button>
                      ))}
                  </div>
                  <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-white transition-colors"><Settings size={20} /></button>
              </nav>
          </div>
      </header>

      <main className="max-w-[1920px] mx-auto p-4 lg:p-8 w-full flex-1 relative z-10">
            {activeTab === 'catalog' && (
                <div className="animate-in fade-in duration-700">
                    <FilterBar filters={filters} setFilters={setFilters} availableGenres={availableGenres} availableDirectors={availableDirectors} movies={movies} />
                    {isDataLoading && movies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-40"><Loader2 size={48} className="animate-spin text-accent mb-4" /><p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Iniciando Función...</p></div>
                    ) : filteredMovies.length === 0 ? (
                        <div className="text-center py-40 opacity-20"><Clapperboard size={80} className="mx-auto mb-4" /><p className="font-black uppercase tracking-widest">No se encontraron películas</p></div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-x-6 gap-y-12">
                            {paginatedMovies.map((m, i) => <MovieCard key={`${m.Title}-${i}`} movie={m} apiKeys={apiKeys} />)}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'oscars' && (
                <div className="space-y-12 animate-in fade-in duration-700">
                    <div className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden shadow-2xl">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                             <div className="flex items-center gap-6"> <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.2)]"> <Trophy size={32} className="text-yellow-500" /> </div> <div><h2 className="text-4xl font-black uppercase text-yellow-500 tracking-tighter leading-none">Premios Oscar</h2><p className="text-[10px] text-yellow-500/60 font-black uppercase tracking-[0.2em] mt-2">Archivo Histórico de la Academia</p></div> </div>
                            <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/5 shadow-xl">
                                <button onClick={() => setOscarYear(oscarYear - 1)} className="p-3 hover:bg-white/5 rounded-xl transition-colors">Ant</button>
                                <div className="px-12 py-3 bg-yellow-500 text-black rounded-xl font-black text-3xl shadow-lg">{oscarYear}</div>
                                <button onClick={() => setOscarYear(oscarYear + 1)} className="p-3 hover:bg-white/5 rounded-xl transition-colors">Sig</button>
                            </div>
                        </div>
                        <div className="flex overflow-x-auto gap-2 pb-4 no-scrollbar scroll-smooth">
                            {availableOscarYears.map(y => ( <button key={y} onClick={() => setOscarYear(y)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${oscarYear === y ? 'bg-yellow-500 text-black shadow-xl' : 'bg-white/5 text-slate-500 hover:text-white hover:bg-white/10'}`}>{y}</button> ))}
                        </div>
                    </div>
                    <div className="space-y-20">
                        {oscarDisplayData.map(([cat, items]) => (
                            <div key={cat} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-8 border-l-4 border-yellow-500 pl-4 bg-gradient-to-r from-yellow-500/5 to-transparent py-2">{cat}</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-x-6 gap-y-12"> {items.map((o, i) => <OscarCard key={`${cat}-${i}`} item={o} apiKeys={apiKeys} />)} </div>
                            </div>
                        ))}
                    </div>
                    {oscarLeaderboard.length > 0 && (
                        <div className="mt-32 pt-16 border-t border-white/5">
                             <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-12 flex items-center gap-4"><List className="text-yellow-500" /> Ranking por Película</h3>
                             <div className="flex flex-col lg:flex-row gap-8 h-[650px]">
                                 <div className="lg:w-1/3 glass-panel rounded-2xl border border-white/5 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-black/20">
                                     {oscarLeaderboard.map((m) => (
                                         <button key={m.title} onClick={() => setSelectedOscarMovieTitle(m.title)} className={`w-full flex items-center justify-between p-4 rounded-xl transition-all border ${selectedOscarMovieTitle === m.title ? 'bg-yellow-500/10 border-yellow-500/40 shadow-xl' : 'bg-transparent border-transparent hover:bg-white/5'}`}>
                                             <div className="flex items-center gap-4 truncate pr-2"> {m.isWinner && <Trophy size={14} className="text-yellow-500 shrink-0" />} <span className={`text-[11px] font-black uppercase tracking-wide truncate ${selectedOscarMovieTitle === m.title ? 'text-white' : 'text-slate-400'}`}>{m.title}</span> </div>
                                             <div className="flex gap-4 shrink-0"><span className="text-[10px] font-black text-yellow-500">{m.wins}W</span><span className="text-[10px] font-black text-slate-600">{m.noms}N</span></div>
                                         </button>
                                     ))}
                                 </div>
                                 <div className="lg:w-2/3 h-full"> {selectedOscarMovieTitle ? <OscarMovieSummary title={selectedOscarMovieTitle} year={oscarYear} oscarData={oscarData} apiKeys={apiKeys} movies={movies} /> : <div className="h-full glass-panel rounded-2xl flex flex-col items-center justify-center opacity-40 italic text-center p-12"> <Play size={48} className="mb-6 opacity-20" /> <p className="uppercase tracking-[0.2em] font-black text-xs">Selecciona una película para ver su desglose</p> </div>} </div>
                             </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'random' && (
                <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-in fade-in duration-700">
                    <div className="relative mb-16 group perspective-1000">
                        <div className="absolute inset-0 bg-accent/30 blur-[60px] rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
                        <button onClick={() => setRandomPick(filteredMovies[Math.floor(Math.random() * filteredMovies.length)])}
                            className="shine-effect relative flex items-center gap-6 px-12 py-8 bg-black border border-accent/50 text-accent font-black text-2xl uppercase tracking-[0.2em] rounded-none hover:border-accent hover:shadow-[0_0_40px_rgba(234,179,8,0.3)] transition-all duration-300 transform group-hover:scale-105"
                            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%)' }}>
                            <Dice5 size={40} className="group-hover:rotate-180 transition-transform duration-700" />
                            <span>Qué ver hoy</span>
                        </button>
                    </div>
                    {randomPick && <div className="max-w-sm w-full animate-in slide-in-from-bottom-8 duration-500"> <MovieCard movie={randomPick} apiKeys={apiKeys} showAwards={true} /> <p className="mt-8 text-slate-500 text-sm italic font-serif tracking-wide">"Disfruta la función"</p> </div>}
                </div>
            )}

            {activeTab === 'afi' && (
                 <div className="animate-in fade-in duration-700 max-w-6xl mx-auto space-y-12">
                    <div className="text-center mb-20"> <h2 className="text-6xl font-black uppercase italic tracking-tighter mb-4 bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent leading-none">Lista AFI</h2> <p className="text-accent font-black uppercase tracking-[0.6em] text-[10px]">100 Years... 100 Movies (10th Anniversary)</p> </div>
                    <div className="grid grid-cols-1 gap-8">
                        {AFI_LIST.map(a => {
                            const match = movies.find(m => m.NormTitle === normalizeTitle(a.Title));
                            return (
                                <div key={a.Rank} className={`relative rounded-2xl border overflow-hidden transition-all duration-500 group flex flex-col md:flex-row gap-6 p-6 ${match ? 'bg-slate-900/60 border-accent/30 shadow-2xl' : 'bg-black/40 border-white/5 grayscale opacity-60'}`}>
                                    <div className="flex flex-row md:flex-col gap-4 shrink-0 items-center md:items-start"> <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-white/5 font-serif leading-none italic">#{a.Rank}</div> </div>
                                    <div className="flex-1"> <h3 className="text-2xl font-black text-white leading-tight mb-2">{a.Title} <span className="text-slate-500 font-normal">({a.Year})</span></h3> {match && <div className="text-xs font-black text-accent flex items-center gap-2 uppercase tracking-widest"><Star fill="currentColor" size={14}/> Mi Nota: {match["Your Rating"]}</div>} </div>
                                </div>
                            );
                        })}
                    </div>
                 </div>
            )}

            {activeTab === 'analysis' && <AnalysisView movies={movies} oscarData={oscarData} />}
      </main>
      <footer className="mt-auto py-12 text-center relative z-10 border-t border-white/5 bg-black/60 backdrop-blur-md"> <div className="text-[10px] uppercase tracking-[0.3em] text-slate-600 mb-2">Mi Cine &copy; {new Date().getFullYear()}</div> <div className="text-slate-700 text-xs font-bold">Developed by Diego Leal</div> </footer>
    </div>
  );
}
