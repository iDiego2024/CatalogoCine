import React, { useState, useMemo } from 'react';
import { FilterState, Movie } from '../types';
import { ChevronDown, Calendar, Star, Film, Megaphone, X, Check, Trash2 } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  availableGenres: string[];
  availableDirectors: string[];
  movies: Movie[]; // New prop to calculate decade counts
}

const FilterBar = ({
  filters, setFilters, availableGenres, availableDirectors, movies
}: FilterBarProps) => {
  const [activePopover, setActivePopover] = useState<'year' | 'rating' | 'genres' | 'directors' | null>(null);

  const togglePopover = (type: 'year' | 'rating' | 'genres' | 'directors') => {
    setActivePopover(activePopover === type ? null : type);
  };

  const setDecade = (startYear: number) => {
      // Si es Clásico (1900), abarcamos hasta 1919. Si no, tramo de 10 años.
      const endYear = startYear === 1900 ? 1919 : startYear + 9;
      setFilters(prev => ({ ...prev, yearRange: [startYear, endYear] }));
  };

  const decadeCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    const decadeStarts = [2020, 2010, 2000, 1990, 1980, 1970, 1960, 1950, 1940, 1930, 1920, 1900];
    
    decadeStarts.forEach(start => counts[start] = 0);
    
    movies.forEach(m => {
        if (!m.Year) return;
        if (m.Year >= 2020) counts[2020]++;
        else if (m.Year >= 2010) counts[2010]++;
        else if (m.Year >= 2000) counts[2000]++;
        else if (m.Year >= 1990) counts[1990]++;
        else if (m.Year >= 1980) counts[1980]++;
        else if (m.Year >= 1970) counts[1970]++;
        else if (m.Year >= 1960) counts[1960]++;
        else if (m.Year >= 1950) counts[1950]++;
        else if (m.Year >= 1940) counts[1940]++;
        else if (m.Year >= 1930) counts[1930]++;
        else if (m.Year >= 1920) counts[1920]++;
        else if (m.Year >= 1900) counts[1900]++;
    });
    
    return counts;
  }, [movies]);

  const setRatingBound = (bound: 'min' | 'max', value: number) => {
      setFilters(prev => {
          const newRange: [number, number] = [...prev.ratingRange];
          if (bound === 'min') newRange[0] = value;
          else newRange[1] = value;
          
          if (newRange[0] > newRange[1]) {
              if (bound === 'min') newRange[1] = value;
              else newRange[0] = value;
          }
          return { ...prev, ratingRange: newRange };
      });
  };

  const handleRangeChange = (type: 'year' | 'rating', index: 0 | 1, val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return;
    setFilters(prev => {
        const newRange = type === 'year' ? [...prev.yearRange] : [...prev.ratingRange];
        newRange[index] = num;
        return { ...prev, [type === 'year' ? 'yearRange' : 'ratingRange']: newRange };
    });
  };

  const toggleSelection = (type: 'genres' | 'directors', val: string) => {
    setFilters(prev => {
      const list = prev[type];
      return {
        ...prev,
        [type]: list.includes(val) ? list.filter(i => i !== val) : [...list, val]
      };
    });
  };

  const clearFilters = () => {
      setFilters(prev => ({
          ...prev,
          genres: [],
          directors: [],
          yearRange: [1900, 2025],
          ratingRange: [0, 10]
      }));
      setActivePopover(null);
  };

  const isYearActive = filters.yearRange[0] > 1900 || filters.yearRange[1] < 2024;
  const isRatingActive = filters.ratingRange[0] > 0 || filters.ratingRange[1] < 10;
  const hasActiveFilters = filters.genres.length > 0 || filters.directors.length > 0 || isYearActive || isRatingActive;

  const FilterButton = ({ id, label, icon: Icon, active, count, isFiltered }: { id: string, label: string, icon: any, active: boolean, count?: number, isFiltered?: boolean }) => (
    <div className="relative">
      <button 
        onClick={() => togglePopover(id as any)}
        className={`
            group flex items-center gap-2 px-5 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300
            ${active 
                ? 'bg-slate-900 border-accent text-accent shadow-[0_0_15px_rgba(234,179,8,0.2)]' 
                : isFiltered 
                    ? 'bg-accent/10 border-accent/40 text-accent hover:bg-accent/20'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 hover:border-white/20'
            }
        `}
      >
        <Icon size={14} className={isFiltered || active ? 'text-accent' : 'text-slate-500 transition-colors'} />
        {label}
        {count ? <span className="ml-1 bg-accent text-black px-1.5 rounded-full text-[8px] font-black">{count}</span> : null}
        <ChevronDown size={12} className={`transition-transform duration-300 opacity-50 ${active ? 'rotate-180' : ''}`} />
      </button>

      {active && (
        <div className="absolute top-full mt-3 left-0 z-50 min-w-[340px] bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-6 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-left">
           <div className="mb-6 flex justify-between items-center border-b border-white/5 pb-3">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Icon size={14}/> {label}
             </span>
             <button onClick={() => setActivePopover(null)} className="p-1 hover:bg-white/10 rounded-full text-slate-500 hover:text-white"><X size={16} /></button>
           </div>
           
           {id === 'year' && (
              <div className="space-y-4">
                  <div className="flex items-center gap-3">
                      <div className="flex-1">
                          <label className="text-[9px] uppercase text-slate-500 font-bold mb-1.5 block">Desde</label>
                          <input type="number" value={filters.yearRange[0]} onChange={e => handleRangeChange('year', 0, e.target.value)} 
                              className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-center text-sm font-mono focus:border-accent outline-none text-white transition-colors" />
                      </div>
                      <div className="flex-1">
                          <label className="text-[9px] uppercase text-slate-500 font-bold mb-1.5 block">Hasta</label>
                          <input type="number" value={filters.yearRange[1]} onChange={e => handleRangeChange('year', 1, e.target.value)} 
                              className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-center text-sm font-mono focus:border-accent outline-none text-white transition-colors" />
                      </div>
                  </div>
              </div>
           )}

           {id === 'rating' && (
              <div className="space-y-6">
                  <div>
                      <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-3 block">Puntuación Mínima</label>
                      <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => (
                              <button 
                                key={`min-${r}`}
                                onClick={() => setRatingBound('min', r)}
                                className={`flex-1 aspect-square rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                                    filters.ratingRange[0] === r 
                                    ? 'bg-accent text-black shadow-[0_0_15px_rgba(234,179,8,0.4)] scale-110' 
                                    : 'bg-white/5 text-slate-400 hover:bg-white/15'
                                }`}
                              >
                                  {r}
                              </button>
                          ))}
                      </div>
                  </div>
                  <div>
                      <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-3 block">Puntuación Máxima</label>
                      <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => (
                              <button 
                                key={`max-${r}`}
                                onClick={() => setRatingBound('max', r)}
                                className={`flex-1 aspect-square rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                                    filters.ratingRange[1] === r 
                                    ? 'bg-accent text-black shadow-[0_0_15px_rgba(234,179,8,0.4)] scale-110' 
                                    : 'bg-white/5 text-slate-400 hover:bg-white/15'
                                }`}
                              >
                                  {r}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
           )}

           {id === 'genres' && (
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                  {availableGenres.map(g => (
                      <button key={g} onClick={() => toggleSelection('genres', g)}
                          className={`text-[10px] px-3 py-2 rounded-lg border transition-all ${filters.genres.includes(g) ? 'bg-accent text-black border-accent font-black' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'}`}>
                          {g}
                      </button>
                  ))}
              </div>
           )}

            {id === 'directors' && (
              <div className="space-y-4">
                 <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-1 pr-2">
                    {availableDirectors.map(d => (
                        <button key={d} onClick={() => toggleSelection('directors', d)}
                            className={`w-full text-left text-[11px] px-3 py-2.5 rounded-lg flex justify-between items-center transition-colors ${filters.directors.includes(d) ? 'bg-accent/10 text-accent font-black' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}>
                            {d}
                            {filters.directors.includes(d) && <Check size={14} />}
                        </button>
                    ))}
                 </div>
              </div>
           )}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
        {/* Carrete de Cine: Selector de Décadas */}
        <div className="relative pt-6 pb-2">
            {/* Perforaciones superiores */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-black flex justify-around px-8 opacity-60">
                {Array.from({length: 40}).map((_, i) => <div key={i} className="w-2.5 h-2.5 bg-zinc-900 rounded-sm mt-0.5"></div>)}
            </div>
            
            <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-4 px-2 no-scrollbar scroll-smooth">
                {[2020, 2010, 2000, 1990, 1980, 1970, 1960, 1950, 1940, 1930, 1920, 1900].map(decade => {
                    const isSelected = filters.yearRange[0] === decade && filters.yearRange[1] === (decade === 1900 ? 1919 : decade + 9);
                    return (
                        <button
                            key={decade}
                            onClick={() => setDecade(decade)}
                            className={`
                                shrink-0 px-8 py-3 rounded-md text-[11px] font-black tracking-[0.2em] uppercase transition-all duration-500 border-x border-white/5 relative flex flex-col items-center gap-1
                                ${isSelected
                                    ? 'bg-accent text-black shadow-[0_0_30px_rgba(234,179,8,0.4)] scale-110 z-10' 
                                    : 'bg-zinc-900/60 text-slate-500 hover:text-slate-100 hover:bg-zinc-800'}
                            `}
                        >
                            <span>{decade === 1900 ? 'CLÁSICOS' : `${decade}S`}</span>
                            <span className={`text-[9px] font-mono ${isSelected ? 'opacity-80' : 'opacity-40'}`}>
                                ({decadeCounts[decade] || 0})
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Perforaciones inferiores */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-black flex justify-around px-8 opacity-60">
                {Array.from({length: 40}).map((_, i) => <div key={i} className="w-2.5 h-2.5 bg-zinc-900 rounded-sm mt-0.5"></div>)}
            </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
            <div className="p-2 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/5 flex gap-2 shadow-2xl">
                <FilterButton id="year" label="Año" icon={Calendar} active={activePopover === 'year'} isFiltered={isYearActive} />
                <FilterButton id="rating" label="Nota" icon={Star} active={activePopover === 'rating'} isFiltered={isRatingActive} />
                <FilterButton id="genres" label="Género" icon={Film} active={activePopover === 'genres'} count={filters.genres.length || undefined} />
                <FilterButton id="directors" label="Director" icon={Megaphone} active={activePopover === 'directors'} count={filters.directors.length || undefined} />
            </div>

            {hasActiveFilters && (
                <button 
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-red-500 bg-red-500/5 hover:bg-red-500/10 transition-all border border-red-500/10"
                >
                    <Trash2 size={12} /> Limpiar Mesa
                </button>
            )}
        </div>
    </div>
  );
};

export default FilterBar;