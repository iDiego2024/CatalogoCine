
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Trophy, Clapperboard, List, Dice5, Star, Settings, 
  BarChart3, Loader2, Play, ExternalLink, PlayCircle, Youtube, 
  BookOpen, CheckCircle2, Award, Flame, ChevronLeft, ChevronRight,
  Calendar, Film, Megaphone, X, Check, Trash2, ThumbsUp, ThumbsDown,
  Activity, PieChart, Clock, TrendingUp, Users, FileText, AlertTriangle, ChevronDown
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  AreaChart, Area, Cell, ScatterChart, Scatter, ReferenceLine
} from 'recharts';
import Fuse from 'fuse.js';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// ==========================================
// 1. CONSTANTES & TIPOS
// ==========================================

const APP_VERSION = "1.2.5";

const AFI_LIST = [
    {"Rank": 1, "Title": "Citizen Kane", "Year": 1941},
    {"Rank": 2, "Title": "The Godfather", "Year": 1972},
    {"Rank": 3, "Title": "Casablanca", "Year": 1942},
    {"Rank": 4, "Title": "Raging Bull", "Year": 1980},
    {"Rank": 5, "Title": "Singin' in the Rain", "Year": 1952},
    {"Rank": 6, "Title": "Gone with the Wind", "Year": 1939},
    {"Rank": 7, "Title": "Lawrence of Arabia", "Year": 1962},
    {"Rank": 8, "Title": "Schindler's List", "Year": 1993},
    {"Rank": 9, "Title": "Vertigo", "Year": 1958},
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
    {"Rank": 91, "Title": "The Searchers", "Year": 1956},
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

interface Movie {
  Title: string; Year: number | null; "Your Rating": number | null; "IMDb Rating": number | null;
  Genres: string; GenreList: string[]; Directors: string; "Date Rated": string | null;
  URL: string; NormTitle: string; SearchText: string;
}

interface OscarRow {
  FilmYear: number | null; AwardYear: number | null; Category: string; PersonName: string;
  Film: string; IsWinner: boolean; NormFilm: string; InMyCatalog?: boolean;
  MyRating?: number | null; MyIMDb?: number | null; CatalogURL?: string;
}

interface FilterState { yearRange: [number, number]; ratingRange: [number, number]; genres: string[]; directors: string[]; }
interface ApiKeys { tmdb: string; omdb: string; youtube: string; }

// ==========================================
// 2. UTILIDADES DE PROCESAMIENTO
// ==========================================

const normalizeTitle = (s: any): string => {
  if (!s) return "";
  return String(s).replace(/[^a-z0-9]+/gi, "").toLowerCase();
};

const parseMoviesCSV = (csvText: string): Movie[] => {
  const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  return (result.data as any[]).map(row => {
    let year = null;
    if (row.Year) {
      const match = String(row.Year).match(/(\d{4})/);
      if (match) year = parseInt(match[0], 10);
    }
    const yourRating = row["Your Rating"] ? parseFloat(row["Your Rating"]) : null;
    const imdbRating = row["IMDb Rating"] ? parseFloat(row["IMDb Rating"]) : null;
    const genreList = row.Genres ? row.Genres.split(", ").map((g:string) => g.trim()) : [];
    const searchText = [row.Title, row["Original Title"], row.Directors, row.Genres, year].filter(Boolean).join(" ").toLowerCase();
    return {
      Title: row.Title, Year: year, "Your Rating": yourRating, "IMDb Rating": imdbRating,
      Genres: row.Genres || "", GenreList: genreList, Directors: row.Directors || "",
      "Date Rated": row["Date Rated"] || null, URL: row.URL || "",
      NormTitle: normalizeTitle(row.Title), SearchText: searchText
    };
  }).filter(m => m.Title);
};

const parseOscarExcel = (buffer: ArrayBuffer) => {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];
  return jsonData.map(row => {
    const filmYear = row["Year Film"] || row["Year_Film"] || row["Year"] || null;
    const isWinner = /^(true|1|yes|won|winner)$/i.test(String(row["Winner"] || row["IsWinner"] || ""));
    const film = String(row["Film"] || row["Movie"] || row["Title"] || "");
    return {
      FilmYear: typeof filmYear === 'number' ? filmYear : parseInt(String(filmYear).match(/\d{4}/)?.[0] || '0'),
      AwardYear: parseInt(String(row["Year Award"] || row["Ceremony"] || filmYear).match(/\d{4}/)?.[0] || '0'),
      Category: String(row["Category"] || row["Award"] || "").trim().toUpperCase(),
      PersonName: String(row["Nominee"] || row["Name"] || ""),
      Film: film, IsWinner: isWinner, NormFilm: normalizeTitle(film)
    };
  });
};

const getRatingColors = (rating: number | null) => {
  if (rating === null) return { border: "rgba(148,163,184,0.8)", text: "text-slate-400" };
  if (rating >= 9) return { border: "#22c55e", text: "text-green-500" };
  if (rating >= 8) return { border: "#0ea5e9", text: "text-sky-500" };
  if (rating >= 7) return { border: "#a855f7", text: "text-purple-500" };
  if (rating >= 6) return { border: "#eab308", text: "text-yellow-500" };
  return { border: "#f97316", text: "text-orange-500" };
};

// ==========================================
// 3. COMPONENTES INTERNOS
// ==========================================

const MovieCard: React.FC<{ movie: Movie; apiKeys: ApiKeys }> = ({ movie, apiKeys }) => {
  const [tmdb, setTmdb] = useState<any>(null);
  useEffect(() => {
    if (apiKeys.tmdb) {
        fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKeys.tmdb}&query=${encodeURIComponent(movie.Title)}&year=${movie.Year}`)
          .then(r => r.json()).then(d => { if(d.results?.[0]) setTmdb(d.results[0]); });
    }
  }, [movie, apiKeys.tmdb]);
  const rating = movie["Your Rating"] ?? movie["IMDb Rating"];
  const colors = getRatingColors(rating);
  return (
    <div className="group relative bg-[#050505] rounded-lg overflow-hidden transition-all duration-500 hover:z-20 hover:scale-105 border border-white/5 hover:border-white/20">
      <div className="aspect-[2/3] w-full bg-slate-900 relative overflow-hidden">
        {tmdb?.poster_path ? (
            <img src={`https://image.tmdb.org/t/p/w342${tmdb.poster_path}`} alt={movie.Title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-800"><Film /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="font-bold text-white text-sm line-clamp-2 mb-1">{movie.Title}</h3>
        <div className="text-[10px] font-bold text-slate-400 mb-2">{movie.Year}</div>
        <div className="flex items-center gap-3 text-xs mb-3">
            {movie["Your Rating"] && <div className={`flex items-center gap-1 font-black ${colors.text}`}> <Star size={12} fill="currentColor" /> {movie["Your Rating"]} </div>}
            {movie["IMDb Rating"] && <div className="text-slate-400 text-[10px] font-bold"> <span className="text-yellow-500 border border-yellow-500/30 px-1 rounded mr-1">IMDb</span>{movie["IMDb Rating"]} </div>}
        </div>
        <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-500 opacity-0 group-hover:opacity-100 border-t border-white/10 pt-2 flex gap-1">
             <a href={movie.URL} target="_blank" rel="noreferrer" className="flex-1 flex justify-center items-center py-1.5 bg-white/10 hover:bg-white/20 rounded text-white"><ExternalLink size={12} /></a>
             <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.Title + " trailer")}`} target="_blank" rel="noreferrer" className="flex-1 flex justify-center items-center py-1.5 bg-red-600/20 hover:bg-red-600/30 rounded text-red-400"><Youtube size={12} /></a>
        </div>
      </div>
    </div>
  );
};

const AFICard: React.FC<{ rank: number; title: string; year: number; movie: Movie | null; apiKeys: ApiKeys }> = ({ rank, title, year, movie, apiKeys }) => {
  const [tmdb, setTmdb] = useState<any>(null);
  useEffect(() => {
    if (apiKeys.tmdb) {
        fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKeys.tmdb}&query=${encodeURIComponent(title)}&year=${year}`)
          .then(r => r.json()).then(d => { if(d.results?.[0]) setTmdb(d.results[0]); });
    }
  }, [title, year, apiKeys.tmdb]);
  return (
    <div className={`relative rounded-3xl border overflow-hidden transition-all duration-500 group flex flex-col md:flex-row gap-8 p-8 ${movie ? 'bg-slate-900/60 border-accent/30 shadow-2xl scale-105' : 'bg-black/40 border-white/5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}>
        <div className="flex flex-row md:flex-col gap-6 shrink-0 items-center md:items-start">
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-white/5 font-serif leading-none italic">#{rank}</div>
            <div className="w-24 h-36 bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-white/5">
                {tmdb?.poster_path ? <img src={`https://image.tmdb.org/t/p/w342${tmdb.poster_path}`} className="w-full h-full object-cover" /> : <Film size={32} className="m-auto mt-12 opacity-10" />}
            </div>
        </div>
        <div className="flex-1 flex flex-col justify-center">
            <h3 className="text-3xl font-black text-white leading-tight mb-2 group-hover:text-accent transition-colors">{title}</h3>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-4">{year}</p>
            {movie && (
                <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-accent">
                    <div className="flex items-center gap-1.5"><Star size={16} fill="currentColor" /> Mi Nota: {movie["Your Rating"] ?? "—"}</div>
                    <div className="text-slate-500">VISTO</div>
                </div>
            )}
        </div>
    </div>
  );
};

const FilterBar: React.FC<{ filters: FilterState; setFilters: any; availableGenres: string[]; availableDirectors: string[]; movies: Movie[] }> = ({ filters, setFilters, availableGenres, availableDirectors, movies }) => {
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const decadeCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    [2020, 2010, 2000, 1990, 1980, 1970, 1960, 1950, 1940, 1930, 1920, 1900].forEach(d => counts[d] = 0);
    movies.forEach(m => {
        if (!m.Year) return;
        if (m.Year >= 2020) counts[2020]++; else if (m.Year >= 2010) counts[2010]++; else if (m.Year >= 2000) counts[2000]++;
        else if (m.Year >= 1990) counts[1990]++; else if (m.Year >= 1980) counts[1980]++; else if (m.Year >= 1970) counts[1970]++;
        else if (m.Year >= 1960) counts[1960]++; else if (m.Year >= 1950) counts[1950]++; else if (m.Year >= 1940) counts[1940]++;
        else if (m.Year >= 1930) counts[1930]++; else if (m.Year >= 1920) counts[1920]++; else if (m.Year >= 1900) counts[1900]++;
    });
    return counts;
  }, [movies]);
  return (
    <div className="flex flex-col gap-8 mb-12">
        <div className="relative pt-6 pb-2">
            <div className="absolute top-0 left-0 right-0 h-4 bg-black flex justify-around px-8 opacity-60"> {Array.from({length: 40}).map((_, i) => <div key={i} className="w-2.5 h-2.5 bg-zinc-900 rounded-sm mt-0.5"></div>)} </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-4 px-2 no-scrollbar scroll-smooth">
                {[2020, 2010, 2000, 1990, 1980, 1970, 1960, 1950, 1940, 1930, 1920, 1900].map(decade => {
                    const isSel = filters.yearRange[0] === decade && filters.yearRange[1] === (decade === 1900 ? 1919 : decade+9);
                    return (
                        <button key={decade} onClick={() => setFilters({...filters, yearRange: [decade, decade === 1900 ? 1919 : decade + 9]})}
                            className={`shrink-0 px-8 py-3 rounded-md text-[11px] font-black tracking-[0.2em] uppercase transition-all duration-500 border-x border-white/5 relative flex flex-col items-center gap-1 ${isSel ? 'bg-accent text-black shadow-[0_0_30px_rgba(234,179,8,0.4)] scale-110 z-10' : 'bg-zinc-900/60 text-slate-500 hover:text-slate-100'}`}>
                            <span>{decade === 1900 ? 'CLÁSICOS' : `${decade}S`}</span>
                            <span className="text-[9px] font-mono opacity-50">({decadeCounts[decade] || 0})</span>
                        </button>
                    );
                })}
            </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
            <div className="p-2 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/5 flex gap-2">
                <button onClick={() => setActivePopover(activePopover === 'genres' ? null : 'genres')} className={`px-5 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-[0.1em] flex items-center gap-2 ${filters.genres.length > 0 ? 'border-accent text-accent' : 'border-white/5 text-slate-400'}`}><Film size={14}/>Géneros</button>
                <button onClick={() => setFilters({genres:[], directors:[], yearRange:[1900, 2025], ratingRange:[0, 10]})} className="px-5 py-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={16}/></button>
            </div>
            {activePopover === 'genres' && (
                <div className="flex flex-wrap gap-2 p-6 bg-slate-900 border border-white/10 rounded-2xl max-h-48 overflow-y-auto">
                    {availableGenres.map(g => (
                        <button key={g} onClick={() => setFilters({...filters, genres: filters.genres.includes(g) ? filters.genres.filter((i:any)=>i!==g) : [...filters.genres, g]})} className={`px-3 py-1.5 rounded-lg text-[10px] border ${filters.genres.includes(g) ? 'bg-accent text-black border-accent' : 'bg-white/5 border-white/5 text-slate-400'}`}>{g}</button>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

const AnalysisView: React.FC<{ movies: Movie[]; oscarData: OscarRow[] }> = ({ movies, oscarData }) => {
  const [subTab, setSubTab] = useState<'overview' | 'directors' | 'controversy'>('overview');
  const stats = useMemo(() => {
    if (movies.length === 0) return null;
    const rated = movies.filter(m => m["Your Rating"] !== null);
    const avg = rated.length ? rated.reduce((acc, m) => acc + (m["Your Rating"] || 0), 0) / rated.length : 0;
    const ratingDist = Array.from({ length: 10 }, (_, i) => ({ rating: i + 1, count: rated.filter(m => Math.round(m["Your Rating"] || 0) === i + 1).length }));
    const comparisons = movies.filter(m => m["Your Rating"] !== null && m["IMDb Rating"] !== null).map(m => ({ ...m, diff: (m["Your Rating"] || 0) - (m["IMDb Rating"] || 0) })).sort((a, b) => b.diff - a.diff);
    const dirMap: Record<string, {count:number, total:number}> = {};
    rated.forEach(m => { m.Directors.split(',').forEach(d => { const n = d.trim(); if(n){ if(!dirMap[n]) dirMap[n] = {count:0, total:0}; dirMap[n].count++; dirMap[n].total += m["Your Rating"] || 0; } }); });
    const topDirs = Object.entries(dirMap).map(([name, d]) => ({name, count: d.count, avg: d.total/d.count})).sort((a,b) => b.count - a.count).slice(0, 10);
    return { total: movies.length, avg, ratingDist, underrated: comparisons.slice(0, 10), overrated: comparisons.slice().reverse().slice(0, 10), topDirs };
  }, [movies]);
  if (!stats) return <div className="p-20 text-center text-slate-600 italic">No hay datos suficientes.</div>;
  return (
    <div className="animate-in fade-in duration-700 space-y-12">
        <div className="flex gap-2">
            {['overview', 'directors', 'controversy'].map(t => (
                <button key={t} onClick={() => setSubTab(t as any)} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${subTab === t ? 'bg-accent text-black' : 'bg-white/5 text-slate-500 hover:text-white'}`}>{t}</button>
            ))}
        </div>
        {subTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-panel p-8 rounded-3xl h-80 shadow-2xl"> 
                    <h4 className="text-xs font-black uppercase text-slate-500 mb-8">Distribución de Notas</h4> 
                    <ResponsiveContainer> 
                        <BarChart data={stats.ratingDist}> <XAxis dataKey="rating" stroke="#334155" fontSize={10}/> <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}}/> <Bar dataKey="count" fill="#eab308" radius={[4, 4, 0, 0]}/> </BarChart> 
                    </ResponsiveContainer> 
                </div>
                <div className="grid grid-cols-2 gap-4 h-80">
                    <div className="glass-panel p-8 rounded-3xl flex flex-col justify-center shadow-xl"> <span className="text-xs font-black text-slate-500 uppercase mb-2">Total Vistas</span> <span className="text-6xl font-black text-white">{stats.total}</span> </div>
                    <div className="glass-panel p-8 rounded-3xl flex flex-col justify-center shadow-xl"> <span className="text-xs font-black text-slate-500 uppercase mb-2">Nota Media</span> <span className="text-6xl font-black text-accent">{stats.avg.toFixed(2)}</span> </div>
                </div>
            </div>
        )}
        {subTab === 'directors' && (
             <div className="glass-panel p-8 rounded-3xl shadow-2xl">
                 <h4 className="text-xs font-black uppercase text-slate-500 mb-8">Directores más vistos</h4>
                 <div className="space-y-4">
                     {stats.topDirs.map((d, i) => (
                         <div key={d.name} className="flex justify-between items-end border-b border-white/5 pb-2">
                             <span className="text-sm font-bold">{i+1}. {d.name}</span>
                             <div className="flex gap-4 items-baseline"> <span className="text-accent font-black">{d.count} <span className="text-[9px] opacity-40">PELIS</span></span> <span className="text-slate-500 text-xs font-mono">{d.avg.toFixed(1)}</span> </div>
                         </div>
                     ))}
                 </div>
             </div>
        )}
        {subTab === 'controversy' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-panel p-6 rounded-3xl shadow-xl"> 
                    <h4 className="text-xs font-black text-green-500 uppercase mb-6 flex items-center gap-2"> <ThumbsUp size={16}/> Joyas Infravaloradas </h4> 
                    <div className="space-y-3"> {stats.underrated.map(m => ( <div key={m.Title} className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5"> <span className="text-xs font-bold text-white truncate pr-4">{m.Title}</span> <div className="flex gap-4 text-[10px] font-mono"> <span className="text-green-500">{m["Your Rating"]}</span> <span className="text-slate-600">vs</span> <span className="text-slate-500">{m["IMDb Rating"]}</span> </div> </div> ))} </div> 
                </div>
                <div className="glass-panel p-6 rounded-3xl shadow-xl"> 
                    <h4 className="text-xs font-black text-red-500 uppercase mb-6 flex items-center gap-2"> <ThumbsDown size={16}/> Decepciones </h4> 
                    <div className="space-y-3"> {stats.overrated.map(m => ( <div key={m.Title} className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5"> <span className="text-xs font-bold text-white truncate pr-4">{m.Title}</span> <div className="flex gap-4 text-[10px] font-mono"> <span className="text-red-500">{m["Your Rating"]}</span> <span className="text-slate-600">vs</span> <span className="text-slate-500">{m["IMDb Rating"]}</span> </div> </div> ))} </div> 
                </div>
            </div>
        )}
    </div>
  );
};

const OscarMovieSummary: React.FC<{ title: string; year: number; oscarData: OscarRow[]; movies: Movie[] }> = ({ title, year, oscarData, movies }) => {
  const rows = oscarData.filter(o => o.Film === title && o.FilmYear === year);
  const totalWins = rows.filter(r => r.IsWinner).length;
  const totalNoms = rows.length;
  if (!rows.length) return null;
  return (
    <div className="glass-panel p-8 rounded-3xl border border-white/10 animate-in fade-in slide-in-from-right-8 h-full shadow-2xl relative overflow-hidden">
        <h2 className="text-3xl font-black uppercase text-white mb-2">{title} <span className="text-slate-500 text-xl font-normal">({year})</span></h2>
        <div className="flex gap-4 mb-8">
            <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"> <span className="text-2xl font-black text-yellow-500">{totalWins}</span> <span className="text-[8px] font-black uppercase text-yellow-500/50 block tracking-widest">Premios</span> </div>
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl"> <span className="text-2xl font-black text-white">{totalNoms}</span> <span className="text-[8px] font-black uppercase text-slate-600 block tracking-widest">Nominaciones</span> </div>
        </div>
        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {rows.map((r, i) => (
                <div key={i} className={`flex justify-between items-center p-4 rounded-xl border ${r.IsWinner ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-black/20 border-white/5'}`}>
                    <div> <div className={`text-[11px] font-black uppercase ${r.IsWinner ? 'text-yellow-400' : 'text-slate-300'}`}>{r.Category}</div> <div className="text-[10px] text-slate-600 mt-1 uppercase truncate">{r.PersonName}</div> </div>
                    {r.IsWinner ? <span className="bg-yellow-500 text-black text-[8px] font-black px-2 py-0.5 rounded shadow-lg">GANADO</span> : <span className="text-[9px] text-slate-700 font-black uppercase">NOM</span>}
                </div>
            ))}
        </div>
    </div>
  );
};

// ==========================================
// 4. APLICACIÓN PRINCIPAL (APP)
// ==========================================

const ITEMS_PER_PAGE = 48;
const API_KEYS: ApiKeys = { tmdb: "506c9387e637ecb32fd3b1ab6ade4259", omdb: "1b00f496", youtube: "AIzaSyBV8-kbLUzPAT9Pi1JBXP9KQBAjF0gvRHo" };

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
  const [oscarYear, setOscarYear] = useState<number>(2024);
  const [randomPick, setRandomPick] = useState<Movie | null>(null);
  const [filters, setFilters] = useState<FilterState>({ yearRange: [1900, 2025], ratingRange: [0, 10], genres: [], directors: [] });

  useEffect(() => {
    const loadData = async () => {
        setIsDataLoading(true);
        try {
            const csvReq = await fetch(`peliculas.csv?t=${Date.now()}`);
            if (csvReq.ok) setMovies(parseMoviesCSV(await csvReq.text()));
            const xlsxReq = await fetch(`Oscar_Data_1927_today.xlsx?t=${Date.now()}`);
            if (xlsxReq.ok) setOscarData(parseOscarExcel(await xlsxReq.arrayBuffer()));
        } catch (e) { console.warn("Cargar manualmente."); }
        setIsDataLoading(false);
    };
    loadData();
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let result = movies.filter(m => {
        if (m.Year && (m.Year < filters.yearRange[0] || m.Year > filters.yearRange[1])) return false;
        if (filters.genres.length && !filters.genres.every(g => m.GenreList.includes(g))) return false;
        return true;
    });
    if (searchQuery.length > 1) {
       const fuse = new Fuse(result, { keys: ['Title', 'Directors', 'Genres'], threshold: 0.3 });
       result = fuse.search(searchQuery).map(r => r.item);
    }
    setFilteredMovies(result);
    setCurrentPage(1);
  }, [movies, filters, searchQuery]);

  const paginatedMovies = useMemo(() => {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      return filteredMovies.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMovies, currentPage]);

  const oscarLeaderboard = useMemo(() => {
      const yearData = oscarData.filter(o => o.FilmYear === oscarYear);
      const statsMap: Record<string, {title: string, wins: number, noms: number, isWinner: boolean}> = {};
      yearData.forEach(row => {
          if (!statsMap[row.Film]) statsMap[row.Film] = { title: row.Film, wins: 0, noms: 0, isWinner: false };
          const entry = statsMap[row.Film];
          entry.noms += 1; if (row.IsWinner) { entry.wins += 1; entry.isWinner = true; }
      });
      return Object.values(statsMap).sort((a, b) => b.wins !== a.wins ? b.wins - a.wins : b.noms - a.noms);
  }, [oscarData, oscarYear]);

  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen text-slate-200 font-sans flex flex-col relative bg-black">
      <div className="bg-cinematic fixed inset-0 opacity-40 z-0"></div>
      
      {/* Header */}
      <header className={`sticky top-0 z-50 transition-all duration-500 border-b ${isScrolled ? 'bg-black/95 backdrop-blur-xl border-white/5 py-2' : 'bg-transparent border-transparent py-4'}`}>
          <div className="max-w-[1920px] mx-auto px-6 h-16 flex items-center justify-between gap-6">
              <div className="flex items-center gap-3 shrink-0 group cursor-pointer" onClick={() => setActiveTab('catalog')}>
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(234,179,8,0.4)]"> <Clapperboard size={24} /> </div>
                  <h1 className="text-xl font-black uppercase tracking-tight hidden sm:block">Mi Cine</h1>
              </div>
              <div className="hidden md:flex flex-1 max-w-xl mx-auto px-4">
                  <div className="relative group w-full"> <input type="text" placeholder="Buscar título..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm focus:border-accent/50 outline-none backdrop-blur-md" /> <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} /> </div>
              </div>
              <nav className="flex items-center gap-4">
                  <div className="hidden lg:flex items-center gap-1">
                     {[{ id: 'catalog', label: 'Catálogo' }, { id: 'analysis', label: 'Análisis' }, { id: 'oscars', label: 'Premios Oscar' }, { id: 'afi', label: 'Lista AFI' }, { id: 'random', label: 'Qué ver hoy' }].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'text-white border-b-2 border-accent' : 'text-slate-500 hover:text-slate-300'}`}> {tab.label} </button>
                      ))}
                  </div>
                  <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-white"><Settings size={20} /></button>
              </nav>
          </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto p-6 w-full flex-1 relative z-10">
            {activeTab === 'catalog' && (
                <div className="animate-in fade-in duration-700">
                    <FilterBar filters={filters} setFilters={setFilters} availableGenres={Array.from(new Set(movies.flatMap(m=>m.GenreList))).sort()} availableDirectors={[]} movies={movies} />
                    {isDataLoading && movies.length === 0 ? <div className="flex flex-col items-center justify-center py-40 text-slate-500"><Loader2 className="animate-spin mb-4" /> Cargando catálogo...</div> :
                    filteredMovies.length === 0 ? <div className="text-center py-40 opacity-20"><Clapperboard size={80} className="mx-auto mb-4" /> No hay resultados</div> :
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-6 gap-y-12"> {paginatedMovies.map((m, i) => <MovieCard key={i} movie={m} apiKeys={API_KEYS} />)} </div>
                        {totalPages > 1 && (
                            <div className="mt-20 flex justify-center items-center gap-4">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)} className="p-4 bg-white/5 rounded-full disabled:opacity-20 hover:bg-white/10 transition-all shadow-xl"><ChevronLeft/></button>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Página {currentPage} de {totalPages}</span>
                                <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(c => c + 1)} className="p-4 bg-white/5 rounded-full disabled:opacity-20 hover:bg-white/10 transition-all shadow-xl"><ChevronRight/></button>
                            </div>
                        )}
                    </>}
                </div>
            )}

            {activeTab === 'analysis' && <AnalysisView movies={movies} oscarData={oscarData} />}

            {activeTab === 'oscars' && (
                <div className="space-y-12 animate-in fade-in duration-700">
                    <div className="glass-panel p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 mb-12 shadow-2xl border border-white/10">
                        <div className="flex items-center gap-6"> <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.2)]"> <Trophy size={32} className="text-yellow-500" /> </div> <div><h2 className="text-4xl font-black uppercase text-yellow-500 tracking-tighter">Premios Oscar</h2><p className="text-[10px] text-yellow-500/60 font-black uppercase tracking-[0.2em] mt-2">Archivo Histórico de la Academia</p></div> </div>
                        <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/5">
                            <button onClick={() => setOscarYear(oscarYear - 1)} className="p-3 hover:bg-white/5 rounded-xl transition-colors"> <ChevronLeft /> </button>
                            <div className="px-12 py-3 bg-yellow-500 text-black rounded-xl font-black text-3xl shadow-lg">{oscarYear}</div>
                            <button onClick={() => setOscarYear(oscarYear + 1)} className="p-3 hover:bg-white/5 rounded-xl transition-colors"> <ChevronRight /> </button>
                        </div>
                    </div>
                    {oscarLeaderboard.length > 0 && (
                        <div className="flex flex-col lg:flex-row gap-8 h-[600px]">
                            <div className="lg:w-1/3 glass-panel rounded-2xl border border-white/5 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-black/20">
                                {oscarLeaderboard.map((m: any) => (
                                    <button key={m.title} onClick={() => setSelectedOscarMovieTitle(m.title)} className={`w-full flex items-center justify-between p-4 rounded-xl transition-all border ${selectedOscarMovieTitle === m.title ? 'bg-yellow-500/10 border-yellow-500/40 shadow-xl' : 'bg-transparent border-transparent hover:bg-white/5'}`}>
                                        <div className="flex items-center gap-4 truncate pr-2"> {m.isWinner && <Trophy size={14} className="text-yellow-500 shrink-0" />} <span className={`text-[11px] font-black uppercase tracking-wide truncate ${selectedOscarMovieTitle === m.title ? 'text-white' : 'text-slate-400'}`}>{m.title}</span> </div>
                                        <div className="flex gap-4 shrink-0"><span className="text-[10px] font-black text-yellow-500">{m.wins}W</span><span className="text-[10px] font-black text-slate-600">{m.noms}N</span></div>
                                    </button>
                                ))}
                            </div>
                            <div className="lg:w-2/3 h-full">
                                    {selectedOscarMovieTitle ? <OscarMovieSummary title={selectedOscarMovieTitle} year={oscarYear} oscarData={oscarData} movies={movies} /> : <div className="h-full glass-panel rounded-2xl flex flex-col items-center justify-center opacity-40 text-center p-12"> <Play size={48} className="mb-6 opacity-20" /> <p className="uppercase tracking-[0.2em] font-black text-xs">Selecciona una película para ver su desglose</p> </div>}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'afi' && (
                <div className="max-w-4xl mx-auto animate-in fade-in duration-700 space-y-12">
                    <div className="text-center mb-20"> <h2 className="text-6xl font-black uppercase italic tracking-tighter mb-4">Lista AFI</h2> <p className="text-accent font-black uppercase tracking-[0.6em] text-[10px]">100 Years... 100 Movies</p> </div>
                    <div className="grid gap-8">
                        {AFI_LIST.map(a => {
                            const match = movies.find(m => m.NormTitle === normalizeTitle(a.Title));
                            return <AFICard key={a.Rank} rank={a.Rank} title={a.Title} year={a.Year} movie={match || null} apiKeys={API_KEYS} />;
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'random' && (
                <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-in duration-700">
                    <div className="relative mb-12 group">
                        <div className="absolute inset-0 bg-accent/30 blur-[80px] rounded-full opacity-20" />
                        <button onClick={() => setRandomPick(movies[Math.floor(Math.random() * movies.length)])}
                            className="relative flex items-center gap-6 px-16 py-10 bg-black border border-accent/50 text-accent font-black text-3xl uppercase tracking-[0.2em] rounded-2xl hover:border-accent hover:shadow-[0_0_60px_rgba(234,179,8,0.3)] transition-all transform hover:scale-105">
                            <Dice5 size={48} className="group-hover:rotate-180 transition-transform duration-700" /> <span>Qué ver hoy</span>
                        </button>
                    </div>
                    {randomPick && <div className="max-w-sm w-full animate-in slide-in-from-bottom-8 duration-700"> <MovieCard movie={randomPick} apiKeys={API_KEYS} /> <p className="mt-8 text-slate-500 text-sm italic tracking-wide">"El azar ha hablado, ¡disfruta la función!"</p> </div>}
                </div>
            )}
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#0f172a] border border-slate-700 w-full max-w-lg rounded-3xl p-8 space-y-8 shadow-2xl">
            <div className="flex justify-between items-center"> <h2 className="text-2xl font-black uppercase flex items-center gap-3"><Settings className="text-accent"/> Configuración</h2> <button onClick={() => setIsSettingsOpen(false)} className="text-slate-500 hover:text-white"><X size={24} /></button> </div>
            <div className="space-y-4">
              <label className="block p-6 border border-dashed border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors group">
                <div className="flex items-center gap-4"> <div className="p-3 bg-accent/20 rounded-xl text-accent group-hover:scale-110 transition-transform"><FileText /></div> <div><div className="font-black text-xs uppercase">Cargar Películas (CSV)</div><div className="text-[10px] text-slate-500">Exportación de IMDb</div></div> </div>
                <input type="file" accept=".csv" className="hidden" onChange={async e => { if(e.target.files?.[0]) { setMovies(parseMoviesCSV(await e.target.files[0].text())); setIsSettingsOpen(false); } }} />
              </label>
              <label className="block p-6 border border-dashed border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors group">
                <div className="flex items-center gap-4"> <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-500 group-hover:scale-110 transition-transform"><Trophy /></div> <div><div className="font-black text-xs uppercase">Cargar Oscars (Excel)</div><div className="text-[10px] text-slate-500">Base histórica</div></div> </div>
                <input type="file" accept=".xlsx" className="hidden" onChange={async e => { if(e.target.files?.[0]) { setOscarData(parseOscarExcel(await e.target.files[0].arrayBuffer())); setIsSettingsOpen(false); } }} />
              </label>
              <button onClick={() => { setMovies([]); setOscarData([]); setIsSettingsOpen(false); }} className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"><Trash2 size={14}/> Borrar Datos Locales</button>
            </div>
          </div>
        </div>
      )}

      <footer className="py-12 text-center border-t border-white/5 opacity-40 text-[10px] font-black uppercase tracking-[0.5em] z-10">Mi Cine &copy; {new Date().getFullYear()} · Developed by Diego Leal</footer>
    </div>
  );
}
