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

// Default API Keys configured for auto-load
const DEFAULT_API_KEYS: ApiKeys = {
  tmdb: "506c9387e637ecb32fd3b1ab6ade4259",
  omdb: "1b00f496",
  youtube: "AIzaSyBV8-kbLUzPAT9Pi1JBXP9KQBAjF0gvRHo"
};

const ITEMS_PER_PAGE = 48;

function App() {
  // ================= State =================
  const [movies, setMovies] = useState<Movie[]>([]);
  const [oscarData, setOscarData] = useState<OscarRow[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  
  const [activeTab, setActiveTab] = useState<'catalog' | 'analysis' | 'afi' | 'oscars' | 'random'>('catalog');
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  
  // To prevent flash of empty state before data loads
  const [isDataLoading, setIsDataLoading] = useState(true);

  const [filters, setFilters] = useState<FilterState>({
    yearRange: [1900, new Date().getFullYear()],
    ratingRange: [0, 10],
    genres: [],
    directors: []
  });

  // Initialize with hardcoded keys
  const [apiKeys, setApiKeys] = useState<ApiKeys>(DEFAULT_API_KEYS);

  // Load sample data automatically on mount
  useEffect(() => {
    // Attempt to load from public folder (for Vercel deployment)
    const loadData = async () => {
        setIsDataLoading(true);
        try {
            const csvReq = await fetch('peliculas.csv');
            if (csvReq.ok) {
                const text = await csvReq.text();
                if (text) setMovies(parseMoviesCSV(text));
            } else {
                console.warn("peliculas.csv not found in public folder. Use manual upload.");
            }
        } catch (e) { console.error("Error loading CSV automatically:", e); }

        try {
            const xlsxReq = await fetch('Oscar_Data_1927_today.xlsx');
            if (xlsxReq.ok) {
                const buf = await xlsxReq.arrayBuffer();
                if (buf) setOscarData(parseOscarExcel(buf));
            } else {
                console.warn("Oscar excel not found in public folder. Use manual upload.");
            }
        } catch (e) { console.error("Error loading Excel automatically:", e); }
        
        setIsDataLoading(false);
    };

    loadData();
    
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ================= Computed Data =================
  const availableGenres = useMemo(() => Array.from(new Set(movies.flatMap(m => m.GenreList))).sort(), [movies]);
  const availableDirectors = useMemo(() => Array.from(new Set(movies.flatMap(m => m.Directors.split(',').map(d => d.trim()).filter(Boolean)))).sort(), [movies]);

  const yearBounds = useMemo(() => {
    const years = movies.map(m => m.Year).filter((y): y is number => y !== null);
    if (!years.length) return [1900, new Date().getFullYear()] as [number, number];
    return [Math.min(...years), Math.max(...years)] as [number, number];
  }, [movies]);

  // Sync year bounds to filters initially
  useEffect(() => {
     if (movies.length > 0 && filters.yearRange[0] === 1900) {
        const years = movies.map(m => m.Year).filter((y): y is number => y !== null);
        if (years.length) {
            setFilters(prev => ({...prev, yearRange: [Math.min(...years), Math.max(...years)]}));
        }
     }
  }, [movies]);

  // ================= Filtering & Search =================
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
    setCurrentPage(1); // Reset to page 1 on filter change
  }, [movies, filters, searchQuery]);

  // ================= Pagination Logic =================
  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);
  const paginatedMovies = useMemo(() => {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      return filteredMovies.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMovies, currentPage]);

  const handlePageChange = (newPage: number) => {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ================= Handlers =================
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

  // ================= Derived Stats =================
  const stats = useMemo(() => {
    if (!filteredMovies.length) return null;
    const avgRating = filteredMovies.reduce((acc, m) => acc + (m["Your Rating"] || 0), 0) / filteredMovies.filter(m => m["Your Rating"]).length || 0;
    
    // Explicitly typed reduction
    const years = filteredMovies.reduce<Record<number, number>>((acc, m) => { 
        if (m.Year) {
            acc[m.Year] = (acc[m.Year] || 0) + 1;
        }
        return acc; 
    }, {});

    const yearData = Object.entries(years)
        .map(([name, value]) => ({name, value}))
        .sort((a: {name: string}, b: {name: string}) => Number(a.name) - Number(b.name));

    return { count: filteredMovies.length, avgRating, yearData };
  }, [filteredMovies]);

  // ================= Oscar Logic =================
  const [oscarYear, setOscarYear] = useState<number>(2024);
  const [showOnlyWinners, setShowOnlyWinners] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // New State for Movie Drill-down
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

  // Calculate Ranking/Leaderboard for the current year
  const oscarLeaderboard = useMemo(() => {
      const yearData = oscarFiltered.filter(o => o.FilmYear === oscarYear);
      const statsMap: Record<string, {title: string, wins: number, noms: number, isWinner: boolean}> = {};

      yearData.forEach(row => {
          if (!statsMap[row.Film]) {
              statsMap[row.Film] = { title: row.Film, wins: 0, noms: 0, isWinner: false };
          }
          const entry = statsMap[row.Film];
          entry.noms += 1;
          if (row.IsWinner) {
              entry.wins += 1;
              entry.isWinner = true;
          }
      });

      return Object.values(statsMap).sort((a: {wins: number, noms: number}, b: {wins: number, noms: number}) => {
          if (b.wins !== a.wins) return b.wins - a.wins; // Sort by wins
          return b.noms - a.noms; // Then by noms
      });
  }, [oscarFiltered, oscarYear]);

  // Reset selected movie when year changes
  useEffect(() => {
    setSelectedOscarMovieTitle(null);
  }, [oscarYear]);


  // Data for the main gallery view
  const oscarDisplayData = useMemo(() => {
    let data = oscarFiltered.filter(o => o.FilmYear === oscarYear);
    if (showOnlyWinners) {
      data = data.filter(o => o.IsWinner);
    }
    
    // Group by Category
    const grouped: Record<string, OscarRow[]> = {};
    data.forEach(item => {
        if (!grouped[item.Category]) grouped[item.Category] = [];
        grouped[item.Category].push(item);
    });

    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  }, [oscarFiltered, oscarYear, showOnlyWinners]);

  // Scroll timeline to active year
  useEffect(() => {
     if (activeTab === 'oscars' && timelineRef.current) {
        // Simple scroll logic could go here
     }
  }, [activeTab]);

  // ================= Render =================
  return (
    <div className="min-h-screen text-slate-200 font-sans selection:bg-accent/30 selection:text-white flex flex-col relative">
      <SettingsModal 
        isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
        onFileUpload={handleFileUpload} apiKeys={apiKeys} setApiKeys={setApiKeys}
      />

      {/* Header */}
      <header className={`sticky top-0 z-50 transition-all duration-500 border-b ${isScrolled ? 'bg-[#000000]/80 backdrop-blur-xl border-white/5 py-2' : 'bg-transparent border-transparent py-4'}`}>
          <div className="max-w-[1920px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-6">
              
              {/* Left: Logo */}
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

              {/* Center: Search */}
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

              {/* Right: Menu (Nav) & Settings */}
              <div className="flex items-center gap-2 lg:gap-6 shrink-0">
                  {/* Desktop Navigation */}
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

                  <button 
                     onClick={() => setIsSettingsOpen(true)}
                     className="group relative p-2 rounded-full hover:bg-white/5 transition-colors"
                     title="Configuración"
                  >
                      <Settings size={20} className="text-slate-400 group-hover:text-white group-hover:rotate-90 transition-all duration-500" />
                  </button>
              </div>
          </div>
          
          {/* Mobile Controls */}
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
                     <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id as any)} 
                        className={`p-3 min-w-[60px] rounded-xl flex flex-col items-center gap-1 ${activeTab === tab.id ? 'text-accent' : 'text-slate-500'}`}
                     >
                        <tab.icon size={20} />
                     </button>
                  ))}
                  <button onClick={() => setActiveTab('analysis' as any)} className={`p-3 rounded-xl flex flex-col items-center gap-1 ${activeTab === 'analysis' ? 'text-accent' : 'text-slate-500'}`}><BarChart3 size={20} /></button>
              </div>
          </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto p-4 lg:p-8 w-full flex-1 relative z-10">
            
            {/* Catalog Tab */}
            {activeTab === 'catalog' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    
                    {/* Stats Dashboard */}
                    {filteredMovies.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="glass-panel p-4 rounded-xl border-l-2 border-accent/50 flex flex-col justify-center relative overflow-hidden group">
                                <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Clapperboard size={40} /></div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Títulos</div>
                                <div className="text-3xl font-black text-white tracking-tight">{filteredMovies.length}</div>
                            </div>
                            <div className="glass-panel p-4 rounded-xl border-l-2 border-sky-500/50 flex flex-col justify-center relative overflow-hidden group">
                                <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Star size={40} /></div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Nota Media</div>
                                <div className="text-3xl font-black text-sky-400 tracking-tight">{stats?.avgRating.toFixed(2)}</div>
                            </div>
                            <div className="glass-panel p-4 rounded-xl border-l-2 border-purple-500/50 flex flex-col justify-center relative overflow-hidden group md:col-span-2">
                                <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Flame size={40} /></div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Top Género</div>
                                <div className="text-xl font-bold text-purple-300 truncate">
                                    {(() => {
                                        const genreCounts = filteredMovies.flatMap(m => m.GenreList).reduce<Record<string, number>>((acc, g) => {
                                            acc[g] = (acc[g] || 0) + 1;
                                            return acc;
                                        }, {});
                                        const sorted = Object.entries(genreCounts).sort(([, countA], [, countB]) => countB - countA);
                                        return sorted[0]?.[0] || 'N/A';
                                    })()}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filters Toolbar */}
                    <div className="mb-10 relative z-20">
                        <FilterBar 
                            filters={filters} setFilters={setFilters} 
                            availableGenres={availableGenres} availableDirectors={availableDirectors}
                        />
                    </div>
                    
                    {/* Loading State */}
                    {isDataLoading && movies.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <Loader2 size={40} className="animate-spin mb-4 text-accent" />
                            <p className="uppercase tracking-widest text-xs">Cargando catálogo...</p>
                        </div>
                    )}

                    {/* Grid */}
                    {!isDataLoading && filteredMovies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-slate-600">
                            <div className="p-8 bg-white/5 rounded-full mb-6 border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                                <Clapperboard size={64} className="opacity-30" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-400 mb-2">Escena eliminada</h2>
                            <p className="text-slate-500">No hay películas que coincidan con tu búsqueda.</p>
                            <button onClick={() => setFilters({yearRange: [1900, new Date().getFullYear()], ratingRange: [0, 10], genres: [], directors: []})} className="mt-6 px-6 py-2 bg-accent/10 border border-accent/20 text-accent rounded-full hover:bg-accent/20 transition-colors text-sm font-bold uppercase tracking-wider">Restaurar Corte Original</button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-x-5 gap-y-10 px-2">
                                {paginatedMovies.map((m, i) => (
                                    <MovieCard key={`${m.Title}-${i}`} movie={m} apiKeys={apiKeys} />
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex flex-col items-center mt-16 mb-8 gap-4">
                                    <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-6 shadow-lg">
                                        <button 
                                            onClick={() => handlePageChange(currentPage - 1)} 
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-300"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        
                                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                            Página <span className="text-white">{currentPage}</span> de <span className="text-white">{totalPages}</span>
                                        </span>
                                        
                                        <button 
                                            onClick={() => handlePageChange(currentPage + 1)} 
                                            disabled={currentPage === totalPages}
                                            className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-300"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                    <div className="text-[10px] text-slate-600 uppercase tracking-wider font-bold">
                                        {filteredMovies.length} Títulos Encontrados
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Analysis Tab */}
            {activeTab === 'analysis' && (
                <AnalysisView movies={filteredMovies} oscarData={oscarData} />
            )}

            {/* Oscar Tab */}
            {activeTab === 'oscars' && (
                <div className="space-y-8 animate-in fade-in duration-700">
                    
                    {/* Header with Timeline */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/10 to-transparent"></div>
                        
                        {/* Title Row */}
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10 mb-10">
                             <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-b from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.3)] border-2 border-yellow-200/20">
                                    <Trophy size={24} className="text-yellow-950 drop-shadow-md" strokeWidth={2} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 uppercase tracking-tight">Premios Oscar</h2>
                                    <div className="flex items-center gap-4 mt-1">
                                        <p className="text-xs text-yellow-500/80 font-bold uppercase tracking-widest">Archivo Histórico</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Toggle Winner */}
                            <label className="flex items-center cursor-pointer gap-2 group bg-black/40 px-4 py-2 rounded-full border border-white/10 hover:border-accent/40 transition-colors">
                                <div className="relative">
                                    <input type="checkbox" className="sr-only" checked={showOnlyWinners} onChange={e => setShowOnlyWinners(e.target.checked)} />
                                    <div className={`block w-8 h-4 rounded-full transition-colors ${showOnlyWinners ? 'bg-yellow-500' : 'bg-slate-700'}`}></div>
                                    <div className={`dot absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform ${showOnlyWinners ? 'transform translate-x-4' : ''}`}></div>
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wide ${showOnlyWinners ? 'text-yellow-400' : 'text-slate-500 group-hover:text-slate-300'}`}>Solo Ganadoras</span>
                            </label>
                        </div>

                        {/* Timeline */}
                        <div className="relative w-full h-16 flex items-center group/timeline">
                             {/* Line */}
                             <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10 z-0"></div>
                             
                             {/* Scrollable Container */}
                             <div 
                                ref={timelineRef}
                                className="relative w-full overflow-x-auto flex items-center gap-8 px-[40%] custom-scrollbar pb-4 pt-4 z-10 snap-x"
                                style={{ scrollBehavior: 'smooth' }}
                             >
                                {availableOscarYears.map(year => (
                                    <button
                                        key={year}
                                        onClick={() => setOscarYear(year)}
                                        className={`shrink-0 relative flex flex-col items-center justify-center min-w-[60px] h-full group transition-all snap-center ${
                                            oscarYear === year ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-80'
                                        }`}
                                    >
                                        <span className={`text-xs font-bold mb-3 transition-colors ${oscarYear === year ? 'text-accent' : 'text-slate-400'}`}>{year}</span>
                                        <div className={`w-3 h-3 rounded-full transition-all duration-300 relative z-10 ${
                                            oscarYear === year 
                                            ? 'bg-accent shadow-[0_0_15px_rgba(234,179,8,0.8)] scale-125' 
                                            : 'bg-slate-700 group-hover:bg-white'
                                        }`}></div>
                                        {/* Vertical tick */}
                                        <div className={`w-px h-3 mt-2 ${oscarYear === year ? 'bg-accent/50' : 'bg-white/10'}`}></div>
                                    </button>
                                ))}
                             </div>
                             
                             {/* Fade Edges */}
                             <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0f172a] to-transparent pointer-events-none z-20"></div>
                             <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0f172a] to-transparent pointer-events-none z-20"></div>
                        </div>
                    </div>
                        
                    {/* Content */}
                    <div className="space-y-8">
                        {oscarDisplayData.map(([category, items]) => (
                             <div key={category} className="animate-in slide-in-from-bottom-2 duration-500">
                                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-white/5 pb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-accent/50"></span>
                                    {category}
                                 </h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                     {items.map((o, i) => (
                                         <OscarCard key={`${category}-${i}`} item={o} apiKeys={apiKeys} />
                                     ))}
                                 </div>
                             </div>
                        ))}
                    </div>

                    {oscarDisplayData.length === 0 && (
                        <div className="text-center py-32 opacity-50">
                            <Trophy size={64} className="mx-auto mb-6 text-slate-700" />
                            <p className="text-slate-400 text-lg uppercase tracking-widest font-light">Sin registros para {oscarYear}</p>
                        </div>
                    )}
                    
                    {/* Leaderboard / Movie Drill Down Section */}
                    {oscarLeaderboard.length > 0 && (
                        <div className="mt-16 pt-10 border-t border-white/5 animate-in fade-in slide-in-from-bottom-8 duration-700">
                             <div className="flex items-center gap-3 mb-6">
                                 <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500 border border-yellow-500/20">
                                    <List size={20} />
                                 </div>
                                 <h3 className="text-xl font-black text-white uppercase tracking-tight">Ranking & Desglose por Película</h3>
                             </div>
                             
                             <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
                                 
                                 {/* Left: Leaderboard List */}
                                 <div className="lg:w-1/3 glass-panel rounded-2xl border border-white/5 overflow-hidden flex flex-col">
                                     <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
                                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Película</span>
                                         <div className="flex gap-4">
                                             <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest w-8 text-center">Wins</span>
                                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-8 text-center">Noms</span>
                                         </div>
                                     </div>
                                     <div className="overflow-y-auto custom-scrollbar flex-1 p-2 space-y-1">
                                         {oscarLeaderboard.map((m) => (
                                             <button
                                                 key={m.title}
                                                 onClick={() => setSelectedOscarMovieTitle(m.title)}
                                                 className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 text-left group ${
                                                     selectedOscarMovieTitle === m.title 
                                                     ? 'bg-white/10 border border-accent/20 shadow-lg' 
                                                     : 'hover:bg-white/5 border border-transparent'
                                                 }`}
                                             >
                                                 <div className="flex items-center gap-3 min-w-0">
                                                     {m.isWinner && <Trophy size={14} className="text-yellow-500 shrink-0" />}
                                                     <span className={`text-xs font-bold truncate ${selectedOscarMovieTitle === m.title ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                                         {m.title}
                                                     </span>
                                                 </div>
                                                 <div className="flex gap-4 shrink-0">
                                                     <span className={`text-xs font-bold w-8 text-center ${m.wins > 0 ? 'text-yellow-400' : 'text-slate-600'}`}>{m.wins}</span>
                                                     <span className="text-xs font-bold text-slate-500 w-8 text-center">{m.noms}</span>
                                                 </div>
                                             </button>
                                         ))}
                                     </div>
                                 </div>

                                 {/* Right: Detail View */}
                                 <div className="lg:w-2/3 h-full">
                                     {selectedOscarMovieTitle ? (
                                         <OscarMovieSummary 
                                             title={selectedOscarMovieTitle} 
                                             year={oscarYear} 
                                             oscarData={oscarData} 
                                             apiKeys={apiKeys} 
                                             movies={movies}
                                         />
                                     ) : (
                                         <div className="h-full glass-panel rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center p-10 border-dashed">
                                             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 animate-pulse-slow">
                                                 <Play size={32} className="text-slate-600 ml-1" />
                                             </div>
                                             <h3 className="text-lg font-bold text-slate-300 mb-2">Selecciona una película</h3>
                                             <p className="text-sm text-slate-500 max-w-xs">Haz clic en cualquier título de la lista para ver su desglose completo de premios y nominaciones.</p>
                                         </div>
                                     )}
                                 </div>
                             </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* AFI Tab */}
            {activeTab === 'afi' && (
                 <div className="max-w-[1920px] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {/* Header Card */}
                    <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl mb-10">
                        <div className="p-10 border-b border-white/10 bg-black/40 backdrop-blur flex flex-col md:flex-row justify-between items-center relative overflow-hidden gap-6">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-transparent"></div>
                            <div className="relative z-10 text-center md:text-left">
                                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Lista AFI</h3>
                                <p className="text-sm text-blue-200/70 font-bold uppercase tracking-widest mt-1">100 Years... 100 Movies (10th Anniversary)</p>
                            </div>
                            <div className="text-right relative z-10 flex items-center gap-6">
                                 <div>
                                    <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
                                        {Math.round((AFI_LIST.filter(a => movies.some(m => m.NormTitle === normalizeTitle(a.Title))).length / 100) * 100)}%
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 text-center">Completado</div>
                                 </div>
                                 <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 flex items-center justify-center bg-blue-500/10">
                                    <Star size={32} className="text-blue-400" fill="currentColor" />
                                 </div>
                            </div>
                        </div>
                    </div>

                    {/* Movie Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-10">
                        {AFI_LIST.map(a => {
                            const match = movies.find(m => m.NormTitle === normalizeTitle(a.Title));
                            
                            // Construct a valid movie object (either real or mock)
                            const displayMovie: Movie = match || {
                                Title: a.Title,
                                Year: a.Year,
                                "Your Rating": null,
                                "IMDb Rating": null,
                                Genres: "",
                                GenreList: [],
                                Directors: "",
                                "Date Rated": null,
                                URL: "",
                                NormTitle: normalizeTitle(a.Title),
                                SearchText: ""
                            };

                            return (
                                <div key={a.Rank} className="relative group">
                                    {/* Rank Badge */}
                                    <div className="absolute -top-3 -left-3 z-30 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-black text-white text-sm shadow-[0_5px_15px_rgba(37,99,235,0.4)] border-4 border-[#020617]">
                                        {a.Rank}
                                    </div>
                                    
                                    {/* Card */}
                                    <div className={match ? '' : 'grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500'}>
                                        <MovieCard movie={displayMovie} apiKeys={apiKeys} showAwards={true} />
                                    </div>

                                    {/* Missing Indicator Overlay (Optional, visually subtle) */}
                                    {!match && (
                                        <div className="absolute top-2 right-2 z-30 pointer-events-none">
                                            <div className="bg-black/60 backdrop-blur border border-white/10 px-2 py-1 rounded text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                                                Falta
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                 </div>
            )}

            {/* Random Tab */}
            {activeTab === 'random' && (
                <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-in fade-in duration-700">
                    <div className="relative mb-16 group perspective-1000">
                        <div className="absolute inset-0 bg-accent/30 blur-[60px] rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
                        <button 
                            onClick={() => setRandomPick(getRandomMovie())}
                            className="shine-effect relative flex items-center gap-6 px-12 py-8 bg-black border border-accent/50 text-accent font-black text-2xl uppercase tracking-[0.2em] rounded-none hover:border-accent hover:shadow-[0_0_40px_rgba(234,179,8,0.3)] transition-all duration-300 transform group-hover:scale-105"
                            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%)' }}
                        >
                            <Dice5 size={40} className="group-hover:rotate-180 transition-transform duration-700" />
                            <span>Qué ver hoy</span>
                        </button>
                    </div>
                    
                    {randomPick && (
                        <div className="max-w-sm w-full animate-in slide-in-from-bottom-8 duration-500">
                            <MovieCard movie={randomPick} apiKeys={apiKeys} showAwards={true} />
                            <p className="mt-8 text-slate-500 text-sm italic font-serif tracking-wide">"Disfruta la función"</p>
                        </div>
                    )}
                </div>
            )}
      </main>
      
      {/* Cinematic Footer */}
      <footer className="mt-auto py-12 text-center relative z-10 border-t border-white/5 bg-black/60 backdrop-blur-md">
          <div className="text-[10px] uppercase tracking-[0.3em] text-slate-600 mb-2">Mi Cine &copy; {new Date().getFullYear()}</div>
          <div className="text-slate-700 text-xs">Developed by Diego Leal</div>
      </footer>
    </div>
  );
}

export default App;