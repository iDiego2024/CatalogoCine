
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Movie, TmdbInfo, ProviderInfo, OmdbAwards } from './types';

// ====================== Data Normalization ======================

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
    
    // Create SearchText
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
  }).filter(m => m.Title); // Filter out empty rows
};

export const parseOscarExcel = (buffer: ArrayBuffer) => {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];

  return jsonData.map(row => {
    // Attempt to map columns flexibly
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

// ====================== Styling Helpers ======================

export const getRatingColors = (rating: number | null) => {
  if (rating === null) return { border: "rgba(148,163,184,0.8)", glow: "rgba(15,23,42,0.0)", text: "text-slate-400" };
  if (rating >= 9) return { border: "#22c55e", glow: "rgba(34,197,94,0.55)", text: "text-green-500" };
  if (rating >= 8) return { border: "#0ea5e9", glow: "rgba(14,165,233,0.55)", text: "text-sky-500" };
  if (rating >= 7) return { border: "#a855f7", glow: "rgba(168,85,247,0.50)", text: "text-purple-500" };
  if (rating >= 6) return { border: "#eab308", glow: "rgba(234,179,8,0.45)", text: "text-yellow-500" };
  return { border: "#f97316", glow: "rgba(249,115,22,0.45)", text: "text-orange-500" };
};

// ====================== API Services ======================

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
      return {
        id: m.id,
        poster_url: m.poster_path ? `${TMDB_IMG}${m.poster_path}` : null,
        vote_average: m.vote_average
      };
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
      ['flatrate', 'rent', 'buy', 'ads', 'free'].forEach(k => {
        cData[k]?.forEach((p: any) => providers.add(p.provider_name));
      });
      return {
        platforms: Array.from(providers).sort(),
        link: cData.link
      };
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
      
      const getNum = (regex: RegExp) => {
        const m = lower.match(regex);
        return m ? parseInt(m[1], 10) : 0;
      };

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
    if (data.items && data.items.length > 0) {
      return data.items[0].id.videoId;
    }
  } catch (e) { console.error("YT Error", e); }
  return null;
};