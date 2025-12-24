import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Movie, FilterState, ApiKeys, OscarRow } from './types';
import { parseMoviesCSV, parseOscarExcel, normalizeTitle } from './utils';
import SettingsModal from './components/SettingsModal';
import FilterBar from './components/FilterBar';
import MovieCard from './components/MovieCard';
import OscarCard from './components/OscarCard';
import AnalysisView from './components/AnalysisView';
import { Search, Trophy, Clapperboard, List, Dice5, Star, Settings, BarChart3, Loader2, Play } from 'lucide-react';
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
    yearRange: [1900, new Date().getFullYear() + 1],
    ratingRange: [0, 10],
    genres: [],
    directors: []
  });

  const [apiKeys] = useState<ApiKeys>(DEFAULT_API_KEYS);

  // Carga inicial con prevención de caché
  useEffect(() => {
    const loadData = async () => {
        setIsDataLoading(true);
        try {
            const csvReq = await fetch(`peliculas.csv?t=${Date.now()}`, { cache: 'no-store' });
            if (csvReq.ok) {
                const text = await csvReq.text();
                if (text && text.length > 50) {
                    const parsed = parseMoviesCSV(text);
                    setMovies(parsed);
                }
            }
        } catch (e) { console.warn("Peliculas.csv no encontrado en servidor"); }

        try {
            const xlsxReq = await fetch(`Oscar_Data_1927_today.xlsx?t=${Date.now()}`, { cache: 'no-store' });
            if (xlsxReq.ok) {
                const buf = await xlsxReq.arrayBuffer();
                if (buf && buf.byteLength > 100) setOscarData(parseOscarExcel(buf));
            }
        } catch (e) { console.warn("Oscar Data no encontrado en servidor"); }
        
        setIsDataLoading(false);
    };

    loadData();
    
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sincronizar filtros cuando llegan películas
  useEffect(() => {
    if (movies.length > 0) {
      const years = movies.map(m => m.Year).filter((y): y is number => y !== null && y > 1800);
      if (years.length > 0) {
        setFilters(prev => ({
          ...prev,
          yearRange: [Math.min(...years), Math.max(...years)]
        }));
      }
    }
  }, [movies]);

  const handleClearData = () => {
    setMovies([]);
    setOscarData([]);
    setFilteredMovies([]);
    alert("Caché y datos locales limpiados.");
  };

  const availableGenres = useMemo(() => Array.from(new Set(movies.flatMap(m => m.GenreList))).sort(), [movies]);
  const availableDirectors = useMemo(() => Array.from(new Set(movies.flatMap(m => m.Directors.split(',').map(d => d.trim()).filter(Boolean)))).sort(), [movies]);

  useEffect(() => {
    let result = movies.filter(m => {
        const y = m.Year || 0;
        const r = m["Your Rating"] ?? -1;
        // Si no hay año definido, lo incluimos si el filtro es amplio
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

  const [oscarYear, setOscarYear] = useState<number>(2024);
  const [showOnlyWinners, setShowOnlyWinners] = useState(false);

  const availableOscarYears = useMemo(() => {
    const years = new Set(oscarData.map(o => o.FilmYear).filter((y): y is number => y !== null));
    return Array.from(years).sort((a: number, b: number) => b - a);
  }, [oscarData]);

  const oscarFiltered = useMemo(() => {
    return oscarData.map(o => {
        const match = movies.find(m => m.NormTitle === o.NormFilm && m.Year === o.FilmYear);
        return { ...o, InMyCatalog: !!match, MyRating: match?.["Your Rating"], MyIMDb: match?.["IMDb Rating"], CatalogURL: match?.URL };
    });
  }, [oscarData, movies]);

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
    <div className="min-h-screen text-slate-200 font-sans flex flex-col relative">
      <div className="bg-cinematic"></div>
      <div className="bg-noise"></div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        onFileUpload={handleFileUpload} 
        onClearData={handleClearData}
      />

      <header className={`sticky top-0 z-50 transition-all duration-500 border-b ${isScrolled ? 'bg-black/90 backdrop-blur-xl border-white/5 py-2' : 'bg-transparent border-transparent py-4'}`}>
          <div className="max-w-[1920px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-6">
              <div className="flex items-center gap-3 shrink-0 group cursor-pointer" onClick={() => setActiveTab('catalog')}>
                  <div className="w-10 h-10 bg-gradient-to-br from-accent to-yellow-600 rounded-xl flex items-center justify-center text-primary shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                      <Clapperboard size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                      <h1 className="text-xl font-black uppercase tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent leading-none">Mi Cine</h1>
                      <div className="text-[10px] font-bold text-accent tracking-[0.2em] uppercase opacity-90 mt-1">Catálogo Personal</div>
                  </div>
              </div>

              <div className="hidden md:flex flex-1 max-w-xl mx-auto px-4">
                  <div className="relative group w-full">
                       <input 
                           type="text" 
                           placeholder="Buscar película o director..." 
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm focus:border-accent/50 outline-none backdrop-blur-md transition-all"
                       />
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  </div>
              </div>

              <div className="flex items-center gap-4">
                  <nav className="hidden md:flex items-center gap-1">
                     {[
                        { id: 'catalog', label: 'Catálogo', icon: List },
                        { id: 'analysis', label: 'Análisis', icon: BarChart3 },
                        { id: 'oscars', label: 'Oscars', icon: Trophy },
                        { id: 'afi', label: 'Lista AFI', icon: Star },
                        { id: 'random', label: 'Qué ver', icon: Dice5 },
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
                  <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                    <Settings size={20} />
                  </button>
              </div>
          </div>
      </header>

      <main className="max-w-[1920px] mx-auto p-4 lg:p-8 w-full flex-1 relative z-10">
            {activeTab === 'catalog' && (
                <div className="animate-in fade-in duration-700">
                    <div className="mb-12">
                        <FilterBar 
                            filters={filters} 
                            setFilters={setFilters} 
                            availableGenres={availableGenres} 
                            availableDirectors={availableDirectors} 
                        />
                    </div>
                    
                    {isDataLoading && movies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-slate-500">
                            <Loader2 size={48} className="animate-spin mb-6 text-accent" />
                            <p className="uppercase tracking-[0.3em] text-[10px] font-black animate-pulse">Procesando Proyección...</p>
                        </div>
                    ) : filteredMovies.length === 0 ? (
                        <div className="text-center py-32">
                            <Clapperboard size={64} className="mx-auto mb-6 opacity-10 text-white" />
                            <p className="uppercase tracking-widest text-sm text-slate-500 font-bold italic">La sala está vacía. Ajusta los filtros o carga datos.</p>
                            <button 
                                onClick={() => setFilters({yearRange: [1900, 2025], ratingRange: [0, 10], genres: [], directors: []})}
                                className="mt-8 px-6 py-2 bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase hover:bg-accent/20 transition-all rounded-full"
                            >
                                Reestablecer Filtros
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-x-6 gap-y-12">
                            {paginatedMovies.map((m, i) => <MovieCard key={`${m.Title}-${i}`} movie={m} apiKeys={apiKeys} />)}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'analysis' && <AnalysisView movies={filteredMovies} oscarData={oscarData} />}

            {activeTab === 'oscars' && (
                <div className="space-y-8 animate-in fade-in duration-700">
                    <div className="glass-panel p-8 rounded-2xl border border-white/5">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                             <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20">
                                  <Trophy size={32} className="text-yellow-500" />
                                </div>
                                <div>
                                  <h2 className="text-4xl font-black uppercase text-yellow-500 tracking-tighter">Premios Oscar</h2>
                                  <p className="text-xs text-yellow-500/60 font-bold uppercase tracking-widest mt-1">Archivo Histórico de la Academia</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-black/40 p-2 rounded-xl border border-white/5">
                                <button onClick={() => setOscarYear(oscarYear - 1)} className="p-3 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">Ant</button>
                                <div className="px-8 py-2 bg-yellow-500 text-black rounded-lg font-black text-2xl shadow-[0_0_20px_rgba(234,179,8,0.3)]">{oscarYear}</div>
                                <button onClick={() => setOscarYear(oscarYear + 1)} className="p-3 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">Sig</button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {availableOscarYears.slice(0, 30).map(y => (
                                <button key={y} onClick={() => setOscarYear(y)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${oscarYear === y ? 'bg-yellow-500 text-black' : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'}`}>{y}</button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {oscarDisplayData.flatMap(([cat, items]) => items.map((o, i) => <OscarCard key={`${cat}-${i}`} item={o} apiKeys={apiKeys} />))}
                    </div>
                </div>
            )}
      </main>
      
      <footer className="py-12 border-t border-white/5 text-center bg-black/40 mt-auto">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">Mi Cine &bull; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;