
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Movie, FilterState, ApiKeys, OscarRow } from './types';
import { parseMoviesCSV, parseOscarExcel, normalizeTitle } from './utils';
import { AFI_LIST } from './constants';
import SettingsModal from './components/SettingsModal';
import FilterBar from './components/FilterBar';
import MovieCard from './components/MovieCard';
import OscarCard from './components/OscarCard';
import OscarMovieSummary from './components/OscarMovieSummary';
import AnalysisView from './components/AnalysisView';
import AFICard from './components/AFICard';
import { Search, Trophy, Clapperboard, Award, BarChart3, List, Dice5, Star, Settings, Flame, ChevronLeft, ChevronRight, Loader2, Play } from 'lucide-react';
import Fuse from 'fuse.js';

const DEFAULT_API_KEYS: ApiKeys = {
  tmdb: "506c9387e637ecb32fd3b1ab6ade4259",
  omdb: "1b00f496",
  youtube: "AIzaSyBV8-kbLUzPAT9Pi1JBXP9KQBAjF0gvRHo"
};

const ITEMS_PER_PAGE = 48;

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [oscarData, setOscarData] = useState<OscarRow[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [activeTab, setActiveTab] = useState<'catalog' | 'analysis' | 'afi' | 'oscars' | 'random'>('catalog');
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    yearRange: [1900, new Date().getFullYear()],
    ratingRange: [0, 10],
    genres: [],
    directors: []
  });
  const [apiKeys] = useState<ApiKeys>(DEFAULT_API_KEYS);

  useEffect(() => {
    const loadData = async () => {
        setIsDataLoading(true);
        try {
            const csvReq = await fetch('peliculas.csv');
            if (csvReq.ok) {
                const text = await csvReq.text();
                if (text) setMovies(parseMoviesCSV(text));
            }
        } catch (e) { console.error("Error loading CSV:", e); }

        try {
            const xlsxReq = await fetch('Oscar_Data_1927_today.xlsx');
            if (xlsxReq.ok) {
                const buf = await xlsxReq.arrayBuffer();
                if (buf) setOscarData(parseOscarExcel(buf));
            }
        } catch (e) { console.error("Error loading Excel:", e); }
        setIsDataLoading(false);
    };
    loadData();
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const availableGenres = useMemo(() => Array.from(new Set(movies.flatMap(m => m.GenreList))).sort(), [movies]);
  const availableDirectors = useMemo(() => Array.from(new Set(movies.flatMap(m => m.Directors.split(',').map(d => d.trim()).filter(Boolean)))).sort(), [movies]);

  useEffect(() => {
    let result = movies.filter(m => {
        const y = m.Year || 0;
        const r = m["Your Rating"] ?? -1;
        if (y < filters.yearRange[0] || y > filters.yearRange[1]) return false;
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

  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);
  const paginatedMovies = useMemo(() => {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      return filteredMovies.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMovies, currentPage]);

  const handleFileUpload = (file: File, type: 'movies' | 'oscars') => {
    const reader = new FileReader();
    reader.onload = (e) => {
        if (type === 'movies') setMovies(parseMoviesCSV(e.target?.result as string));
        else setOscarData(parseOscarExcel(e.target?.result as ArrayBuffer));
    };
    if (type === 'movies') reader.readAsText(file);
    else reader.readAsArrayBuffer(file);
  };

  const getRandomMovie = () => {
    if (filteredMovies.length === 0) return null;
    return filteredMovies[Math.floor(Math.random() * filteredMovies.length)];
  };
  const [randomPick, setRandomPick] = useState<Movie | null>(null);

  const stats = useMemo(() => {
    if (!filteredMovies.length) return null;
    const avgRating = filteredMovies.reduce((acc, m) => acc + (m["Your Rating"] || 0), 0) / filteredMovies.filter(m => m["Your Rating"]).length || 0;
    return { count: filteredMovies.length, avgRating };
  }, [filteredMovies]);

  const [oscarYear, setOscarYear] = useState<number>(2024);
  const [showOnlyWinners, setShowOnlyWinners] = useState(false);
  const [selectedOscarMovieTitle, setSelectedOscarMovieTitle] = useState<string | null>(null);

  const oscarFiltered = useMemo(() => {
      return oscarData.map(o => {
          const match = movies.find(m => m.NormTitle === o.NormFilm && m.Year === o.FilmYear);
          return { ...o, InMyCatalog: !!match, MyRating: match?.["Your Rating"], MyIMDb: match?.["IMDb Rating"], CatalogURL: match?.URL };
      });
  }, [oscarData, movies]);

  const availableOscarYears = useMemo(() => {
    const years = new Set(oscarData.map(o => o.FilmYear).filter((y): y is number => y !== null));
    return Array.from(years).sort((a: number, b: number) => Number(b) - Number(a));
  }, [oscarData]);

  const oscarLeaderboard = useMemo(() => {
      const yearData = oscarFiltered.filter(o => o.FilmYear === oscarYear);
      const statsMap: Record<string, {title: string, wins: number, noms: number, isWinner: boolean}> = {};
      yearData.forEach(row => {
          if (!row.Film) return;
          let entry = statsMap[row.Film];
          if (!entry) {
              entry = { title: row.Film, wins: 0, noms: 0, isWinner: false };
              statsMap[row.Film] = entry;
          }
          entry.noms += 1;
          if (row.IsWinner) {
              entry.wins += 1;
              entry.isWinner = true;
          }
      });
      return Object.values(statsMap).sort((a: any, b: any) => {
          if (Number(b.wins) !== Number(a.wins)) return Number(b.wins) - Number(a.wins);
          return Number(b.noms) - Number(a.noms);
      });
  }, [oscarFiltered, oscarYear]);

  const oscarDisplayData = useMemo(() => {
    let data = oscarFiltered.filter(o => o.FilmYear === oscarYear);
    if (showOnlyWinners) data = data.filter(o => o.IsWinner);
    const grouped: Record<string, OscarRow[]> = {};
    data.forEach(item => {
        if (!grouped[item.Category]) grouped[item.Category] = [];
        grouped[item.Category].push(item);
    });
    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  }, [oscarFiltered, oscarYear, showOnlyWinners]);

  return (
    <div className="min-h-screen text-slate-200 font-sans selection:bg-accent/30 selection:text-white flex flex-col relative">
      <SettingsModal 
        isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
        onFileUpload={handleFileUpload}
      />

      <header className={`sticky top-0 z-50 transition-all duration-500 border-b ${isScrolled ? 'bg-[#000000]/80 backdrop-blur-xl border-white/5 py-2' : 'bg-transparent border-transparent py-4'}`}>
          <div className="max-w-[1920px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-6">
              <div className="flex items-center gap-3 shrink-0 group cursor-pointer" onClick={() => setActiveTab('catalog')}>
                  <div className="w-10 h-10 bg-gradient-to-br from-accent to-yellow-600 rounded-xl flex items-center justify-center text-primary shadow-[0_0_20px_rgba(234,179,8,0.4)] group-hover:shadow-[0_0_30px_rgba(234,179,8,0.6)] transition-all duration-500 relative overflow-hidden">
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                      <Clapperboard size={24} strokeWidth={2.5} className="relative z-10" />
                  </div>
                  <div className="hidden sm:block">
                      <h1 className="text-xl font-black uppercase tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent leading-none">Mi Cine</h1>
                      <div className="text-[10px] font-bold text-accent tracking-[0.2em] uppercase opacity-80 group-hover:tracking-[0.25em] transition-all">Catálogo Personal</div>
                  </div>
              </div>

              <div className="hidden md:flex flex-1 max-w-xl mx-auto px-4">
                  <div className="relative group w-full">
                       <input 
                           type="text" 
                           placeholder="Buscar película..." 
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:border-accent/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(234,179,8,0.1)] transition-all duration-300 outline-none backdrop-blur-md"
                       />
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors" size={18} />
                  </div>
              </div>

              <div className="flex items-center gap-2 lg:gap-6 shrink-0">
                  <nav className="hidden md:flex items-center gap-1">
                     {[
                        { id: 'catalog', label: 'Catálogo', icon: List },
                        { id: 'analysis', label: 'Análisis', icon: BarChart3 },
                        { id: 'oscars', label: 'Premios Oscar', icon: Trophy },
                        { id: 'afi', label: 'Lista AFI', icon: Star },
                        { id: 'random', label: 'Qué ver hoy', icon: Dice5 },
                      ].map(tab => (
                        <button 
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                                relative px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300
                                ${activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'}
                            `}
                        >
                            <span className="flex items-center gap-2 relative z-10">
                                {activeTab === tab.id && <tab.icon size={14} className="text-accent animate-pulse-slow" />}
                                {tab.label}
                            </span>
                            {activeTab === tab.id && (
                                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent shadow-[0_-2px_10px_rgba(234,179,8,0.5)]"></span>
                            )}
                        </button>
                      ))}
                  </nav>
                  <div className="h-6 w-px bg-white/10 hidden md:block"></div>
                  <button onClick={() => setIsSettingsOpen(true)} className="group relative p-2 rounded-full hover:bg-white/5 transition-colors">
                      <Settings size={20} className="text-slate-400 group-hover:text-white group-hover:rotate-90 transition-all duration-500" />
                  </button>
              </div>
          </div>
          
          <div className="md:hidden bg-black/80 backdrop-blur-xl border-y border-white/5">
              <div className="p-3">
                  <div className="relative group">
                       <input 
                           type="text" 
                           placeholder="Buscar..." 
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-accent outline-none text-white"
                       />
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  </div>
              </div>
              <div className="flex justify-around pb-2 px-2 overflow-x-auto">
                  {[
                    { id: 'catalog', icon: List, label: 'Cine' },
                    { id: 'oscars', icon: Trophy, label: 'Oscars' },
                    { id: 'random', icon: Dice5, label: 'Hoy' },
                    { id: 'afi', icon: Star, label: 'AFI' },
                  ].map(tab => (
                     <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`p-3 min-w-[60px] rounded-xl flex flex-col items-center gap-1 ${activeTab === tab.id ? 'text-accent' : 'text-slate-500'}`}>
                        <tab.icon size={20} />
                     </button>
                  ))}
              </div>
          </div>
      </header>

      <main className="max-w-[1920px] mx-auto p-4 lg:p-8 w-full flex-1 relative z-10">
            {activeTab === 'catalog' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {filteredMovies.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="glass-panel p-4 rounded-xl border-l-2 border-accent/50 flex flex-col justify-center relative overflow-hidden group">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Títulos</div>
                                <div className="text-3xl font-black text-white tracking-tight">{filteredMovies.length}</div>
                            </div>
                            <div className="glass-panel p-4 rounded-xl border-l-2 border-sky-500/50 flex flex-col justify-center relative overflow-hidden group">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Nota Media</div>
                                <div className="text-3xl font-black text-sky-400 tracking-tight">{stats?.avgRating.toFixed(2)}</div>
                            </div>
                        </div>
                    )}

                    <div className="mb-10 relative z-20">
                        <FilterBar filters={filters} setFilters={setFilters} availableGenres={availableGenres} availableDirectors={availableDirectors} />
                    </div>
                    
                    {!isDataLoading && filteredMovies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-slate-600">
                            <h2 className="text-2xl font-bold text-slate-400 mb-2">Sin resultados</h2>
                            <button onClick={() => setFilters({yearRange: [1900, 2024], ratingRange: [0, 10], genres: [], directors: []})} className="mt-6 px-6 py-2 bg-accent/10 text-accent rounded-full border border-accent/20">Limpiar Filtros</button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-x-5 gap-y-10 px-2">
                                {paginatedMovies.map((m, i) => <MovieCard key={`${m.Title}-${i}`} movie={m} apiKeys={apiKeys} />)}
                            </div>
                            {totalPages > 1 && (
                                <div className="flex flex-col items-center mt-16 mb-8 gap-4">
                                    <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-6 shadow-lg">
                                        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 disabled:opacity-30"><ChevronLeft size={20} /></button>
                                        <span className="text-xs font-bold uppercase text-slate-400">Página {currentPage} de {totalPages}</span>
                                        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 disabled:opacity-30"><ChevronRight size={20} /></button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {activeTab === 'analysis' && <AnalysisView movies={filteredMovies} oscarData={oscarData} />}

            {activeTab === 'oscars' && (
                <div className="space-y-8 animate-in fade-in duration-700">
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden bg-black/40">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10 mb-8">
                             <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-b from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                                    <Trophy size={24} className="text-yellow-950" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 uppercase tracking-tight">Premios Oscar</h2>
                                    <p className="text-xs