import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Movie, FilterState, ApiKeys, OscarRow } from './types';
import { parseMoviesCSV, parseOscarExcel, normalizeTitle } from './utils';
import { AFI_LIST } from './constants';
import SettingsModal from './components/SettingsModal';
import FilterBar from './components/FilterBar';
import MovieCard from './components/MovieCard';
import OscarCard from './components/OscarCard';
import AFICard from './components/AFICard';
import OscarMovieSummary from './components/OscarMovieSummary';
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
  const [selectedOscarMovieTitle, setSelectedOscarMovieTitle] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    yearRange: [1900, new Date().getFullYear() + 1],
    ratingRange: [0, 10],
    genres: [],
    directors: []
  });

  const [apiKeys] = useState<ApiKeys>(DEFAULT_API_KEYS);

  useEffect(() => {
    const loadData = async () => {
        setIsDataLoading(true);
        try {
            const csvReq = await fetch(`peliculas.csv?t=${Date.now()}`, { cache: 'no-store' });
            if (csvReq.ok) {
                const text = await csvReq.text();
                if (text && text.length > 50) setMovies(parseMoviesCSV(text));
            }
        } catch (e) { console.warn("CSV no disponible"); }

        try {
            const xlsxReq = await fetch(`Oscar_Data_1927_today.xlsx?t=${Date.now()}`, { cache: 'no-store' });
            if (xlsxReq.ok) {
                const buf = await xlsxReq.arrayBuffer();
                if (buf && buf.byteLength > 100) setOscarData(parseOscarExcel(buf));
            }
        } catch (e) { console.warn("Excel no disponible"); }
        
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

  const paginatedMovies = useMemo(() => {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      return filteredMovies.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMovies, currentPage]);

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
      return Object.values(statsMap).sort((a: any, b: any) => b.wins !== a.wins ? b.wins - a.wins : b.noms - a.noms);
  }, [oscarFiltered, oscarYear]);

  // Clase de grid unificada para coherencia en todo el sitio
  const GRID_CLASS = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-x-6 gap-y-12";

  return (
    <div className="min-h-screen text-slate-200 font-sans flex flex-col relative">
      <div className="bg-cinematic"></div>
      <div className="bg-noise"></div>

      <SettingsModal 
        isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
        onFileUpload={(file, type) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (type === 'movies') setMovies(parseMoviesCSV(e.target?.result as string));
                else setOscarData(parseOscarExcel(e.target?.result as ArrayBuffer));
            };
            if (type === 'movies') reader.readAsText(file); else reader.readAsArrayBuffer(file);
        }}
        onClearData={() => { setMovies([]); setOscarData([]); setFilteredMovies([]); }}
      />

      <header className={`sticky top-0 z-50 transition-all duration-500 border-b ${isScrolled ? 'bg-black/95 backdrop-blur-xl border-white/5 py-2' : 'bg-transparent border-transparent py-4'}`}>
          <div className="max-w-[1920px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-6">
              <div className="flex items-center gap-3 shrink-0 group cursor-pointer" onClick={() => setActiveTab('catalog')}>
                  <div className="w-10 h-10 bg-gradient-to-br from-accent to-yellow-600 rounded-xl flex items-center justify-center text-primary shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                      <Clapperboard size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                      <h1 className="text-xl font-black uppercase tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent leading-none">Mi Cine</h1>
                      <div className="text-[10px] font-black text-accent tracking-[0.3em] uppercase opacity-90 mt-1">Catálogo Personal</div>
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

              <nav className="flex items-center gap-4">
                  <div className="hidden lg:flex items-center gap-1">
                     {[
                        { id: 'catalog', label: 'Catálogo' },
                        { id: 'analysis', label: 'Análisis' },
                        { id: 'oscars', label: 'Premios Oscar' },
                        { id: 'afi', label: 'Lista AFI' },
                        { id: 'random', label: 'Sugerencia' },
                      ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'text-white border-b-2 border-accent' : 'text-slate-500 hover:text-slate-300'}`}>
                            {tab.label}
                        </button>
                      ))}
                  </div>
                  <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-white transition-colors"><Settings size={20} /></button>
              </nav>
          </div>
      </header>

      <main className="max-w-[1920px] mx-auto p-4 lg:p-8 w-full flex-1 relative z-10">
            {activeTab === 'catalog' && (
                <div className="animate-in fade-in duration-700">
                    <FilterBar filters={filters} setFilters={setFilters} availableGenres={availableGenres} availableDirectors={availableDirectors} />
                    {isDataLoading && movies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-40"><Loader2 size={48} className="animate-spin text-accent mb-4" /><p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Iniciando Función...</p></div>
                    ) : filteredMovies.length === 0 ? (
                        <div className="text-center py-40 opacity-20"><Clapperboard size={80} className="mx-auto mb-4" /><p className="font-black uppercase tracking-widest">No se encontraron películas</p></div>
                    ) : (
                        <div className={GRID_CLASS}>
                            {paginatedMovies.map((m, i) => <MovieCard key={`${m.Title}-${i}`} movie={m} apiKeys={apiKeys} />)}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'oscars' && (
                <div className="space-y-12 animate-in fade-in duration-700">
                    <div className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden shadow-2xl">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                             <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                                    <Trophy size={32} className="text-yellow-500" />
                                </div>
                                <div><h2 className="text-4xl font-black uppercase text-yellow-500 tracking-tighter leading-none">Premios Oscar</h2><p className="text-[10px] text-yellow-500/60 font-black uppercase tracking-[0.2em] mt-2">Archivo Histórico de la Academia</p></div>
                            </div>
                            <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/5 shadow-xl">
                                <button onClick={() => setOscarYear(oscarYear - 1)} className="p-3 hover:bg-white/5 rounded-xl transition-colors">Ant</button>
                                <div className="px-12 py-3 bg-yellow-500 text-black rounded-xl font-black text-3xl shadow-lg">{oscarYear}</div>
                                <button onClick={() => setOscarYear(oscarYear + 1)} className="p-3 hover:bg-white/5 rounded-xl transition-colors">Sig</button>
                            </div>
                        </div>
                        <div className="flex overflow-x-auto gap-2 pb-4 no-scrollbar scroll-smooth">
                            {availableOscarYears.map(y => (
                                <button key={y} onClick={() => setOscarYear(y)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${oscarYear === y ? 'bg-yellow-500 text-black shadow-xl' : 'bg-white/5 text-slate-500 hover:text-white hover:bg-white/10'}`}>{y}</button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-20">
                        {oscarDisplayData.map(([cat, items]) => (
                            <div key={cat} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-8 border-l-4 border-yellow-500 pl-4 bg-gradient-to-r from-yellow-500/5 to-transparent py-2">{cat}</h3>
                                <div className={GRID_CLASS}>
                                    {items.map((o, i) => (
                                        <OscarCard key={`${cat}-${i}`} item={o} apiKeys={apiKeys} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {oscarLeaderboard.length > 0 && (
                        <div className="mt-32 pt-16 border-t border-white/5">
                             <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-12 flex items-center gap-4"><List className="text-yellow-500" /> Ranking y Desglose por Película</h3>
                             <div className="flex flex-col lg:flex-row gap-8 h-[650px]">
                                 <div className="lg:w-1/3 glass-panel rounded-2xl border border-white/5 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-black/20">
                                     {oscarLeaderboard.map((m) => (
                                         <button key={m.title} onClick={() => setSelectedOscarMovieTitle(m.title)} className={`w-full flex items-center justify-between p-4 rounded-xl transition-all border ${selectedOscarMovieTitle === m.title ? 'bg-yellow-500/10 border-yellow-500/40 shadow-xl' : 'bg-transparent border-transparent hover:bg-white/5'}`}>
                                             <div className="flex items-center gap-4 truncate pr-2">
                                                 {m.isWinner && <Trophy size={14} className="text-yellow-500 shrink-0" />}
                                                 <span className={`text-[11px] font-black uppercase tracking-wide truncate ${selectedOscarMovieTitle === m.title ? 'text-white' : 'text-slate-400'}`}>{m.title}</span>
                                             </div>
                                             <div className="flex gap-4 shrink-0"><span className="text-[10px] font-black text-yellow-500">{m.wins}W</span><span className="text-[10px] font-black text-slate-600">{m.noms}N</span></div>
                                         </button>
                                     ))}
                                 </div>
                                 <div className="lg:w-2/3 h-full">
                                     {selectedOscarMovieTitle ? (
                                         <OscarMovieSummary title={selectedOscarMovieTitle} year={oscarYear} oscarData={oscarData} apiKeys={apiKeys} movies={movies} />
                                     ) : (
                                         <div className="h-full glass-panel rounded-2xl border border-white/5 flex flex-col items-center justify-center opacity-40 italic text-sm text-center p-12">
                                             <Play size={48} className="mb-6 opacity-20" />
                                             <p className="uppercase tracking-[0.2em] font-black text-xs">Selecciona una película de la lista para ver el desglose de sus premios</p>
                                         </div>
                                     )}
                                 </div>
                             </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'afi' && (
                 <div className="animate-in fade-in duration-700 max-w-6xl mx-auto space-y-12">
                    <div className="text-center mb-20">
                        <h2 className="text-6xl font-black uppercase italic tracking-tighter mb-4 bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent leading-none">Lista AFI</h2>
                        <p className="text-accent font-black uppercase tracking-[0.6em] text-[10px]">100 Years... 100 Movies (10th Anniversary)</p>
                    </div>
                    <div className="grid grid-cols-1 gap-8">
                        {AFI_LIST.map(a => (
                            <AFICard 
                                key={a.Rank} 
                                rank={a.Rank} 
                                title={a.Title} 
                                year={a.Year} 
                                movie={movies.find(m => m.NormTitle === normalizeTitle(a.Title))} 
                                apiKeys={apiKeys} 
                            />
                        ))}
                    </div>
                 </div>
            )}

            {activeTab === 'analysis' && <AnalysisView movies={movies} oscarData={oscarData} />}
      </main>
    </div>
  );
}

export default App;