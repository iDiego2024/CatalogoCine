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

  // Load sample data automatically on mount with cache busting
  useEffect(() => {
    const loadData = async () => {
        setIsDataLoading(true);
        // Usamos cache: 'no-store' para forzar al navegador a ignorar archivos viejos
        try {
            const csvReq = await fetch(`peliculas.csv?t=${Date.now()}`, { cache: 'no-store' });
            if (csvReq.ok) {
                const text = await csvReq.text();
                if (text && text.length > 10) setMovies(parseMoviesCSV(text));
            }
        } catch (e) { console.warn("Peliculas.csv no disponible"); }

        try {
            const xlsxReq = await fetch(`Oscar_Data_1927_today.xlsx?t=${Date.now()}`, { cache: 'no-store' });
            if (xlsxReq.ok) {
                const buf = await xlsxReq.arrayBuffer();
                if (buf && buf.byteLength > 100) setOscarData(parseOscarExcel(buf));
            }
        } catch (e) { console.warn("Oscar_Data no disponible"); }
        
        setIsDataLoading(false);
    };

    loadData();
    
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClearData = () => {
    setMovies([]);
    setOscarData([]);
    setFilteredMovies([]);
    alert("Datos y caché temporal limpiados con éxito.");
  };

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
    return Array.from(years).sort((a: number, b: number) => b - a);
  }, [oscarData]);

  const oscarLeaderboard = useMemo(() => {
      const yearData = oscarFiltered.filter(o => o.FilmYear === oscarYear);
      const statsMap: Record<string, {title: string, wins: number, noms: number, isWinner: boolean}> = {};
      yearData.forEach(row => {
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
          if (b.wins !== a.wins) return b.wins - a.wins;
          return b.noms - a.noms;
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
        onFileUpload={handleFileUpload} onClearData={handleClearData}
      />

      <header className={`sticky top-0 z-50 transition-all duration-500 border-b ${isScrolled ? 'bg-[#000000]/80 backdrop-blur-xl border-white/5 py-2' : 'bg-transparent border-transparent py-4'}`}>
          <div className="max-w-[1920px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-6">
              <div className="flex items-center gap-3 shrink-0 group cursor-pointer" onClick={() => setActiveTab('catalog')}>
                  <div className="w-10 h-10 bg-gradient-to-br from-accent to-yellow-600 rounded-xl flex items-center justify-center text-primary shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all duration-500">
                      <Clapperboard size={24} strokeWidth={2.5} />
                  </div>
                  <div className="hidden sm:block">
                      <h1 className="text-xl font-black uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent leading-none">Mi Cine</h1>
                  </div>
              </div>

              <div className="hidden md:flex flex-1 max-w-xl mx-auto px-4">
                  <div className="relative group w-full">
                       <input 
                           type="text" 
                           placeholder="Buscar película..." 
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm focus:border-accent/50 outline-none backdrop-blur-md"
                       />
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  </div>
              </div>

              <div className="flex items-center gap-6">
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
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab.id ? 'text-white border-b-2 border-accent' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {tab.label}
                        </button>
                      ))}
                  </nav>
                  <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-white/5"><Settings size={20} /></button>
              </div>
          </div>
      </header>

      <main className="max-w-[1920px] mx-auto p-4 lg:p-8 w-full flex-1">
            {activeTab === 'catalog' && (
                <div className="animate-in fade-in duration-700">
                    <div className="mb-10"><FilterBar filters={filters} setFilters={setFilters} availableGenres={availableGenres} availableDirectors={availableDirectors} /></div>
                    
                    {isDataLoading && movies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <Loader2 size={40} className="animate-spin mb-4 text-accent" />
                            <p className="uppercase tracking-widest text-xs">Cargando...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-x-5 gap-y-10 px-2">
                            {paginatedMovies.map((m, i) => <MovieCard key={`${m.Title}-${i}`} movie={m} apiKeys={apiKeys} />)}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'analysis' && <AnalysisView movies={filteredMovies} oscarData={oscarData} />}

            {activeTab === 'oscars' && (
                <div className="space-y-8 animate-in fade-in duration-700">
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10 mb-10">
                             <div className="flex items-center gap-4">
                                <Trophy size={24} className="text-yellow-500" />
                                <h2 className="text-3xl font-black uppercase text-yellow-500">Premios Oscar</h2>
                                <button onClick={() => setOscarYear(oscarYear - 1)} className="p-2 bg-white/5 rounded">Ant</button>
                                <span className="text-2xl font-bold">{oscarYear}</span>
                                <button onClick={() => setOscarYear(oscarYear + 1)} className="p-2 bg-white/5 rounded">Sig</button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {availableOscarYears.slice(0, 20).map(y => (
                                <button key={y} onClick={() => setOscarYear(y)} className={`px-4 py-2 rounded-lg text-xs font-bold ${oscarYear === y ? 'bg-accent text-black' : 'bg-white/5'}`}>{y}</button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {oscarDisplayData.flatMap(([cat, items]) => items.map((o, i) => <OscarCard key={`${cat}-${i}`} item={o} apiKeys={apiKeys} />))}
                    </div>
                </div>
            )}
      </main>
    </div>
  );
}

export default App;