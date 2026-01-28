
import React, { useState, useMemo } from 'react';
import { FilterState, Movie } from '../types';
import { Calendar, Star, Film, Megaphone, X, Check, Trash2, SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  availableGenres: string[];
  availableDirectors: string[];
  movies: Movie[];
}

const FilterBar = ({
  filters, setFilters, availableGenres, availableDirectors, movies
}: FilterBarProps) => {
  const [activeModal, setActiveModal] = useState<'year' | 'rating' | 'genres' | 'directors' | null>(null);

  const setDecade = (startYear: number) => {
      const endYear = startYear === 1900 ? 1919 : startYear + 9;
      setFilters(prev => ({ ...prev, yearRange: [startYear, endYear] }));
  };

  const decadeCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    const decadeStarts = [2020, 2010, 2000, 1990, 1980, 1970, 1960, 1950, 1940, 1930, 1920, 1900];
    decadeStarts.forEach(start => counts[start] = 0);
    movies.forEach(m => {
        if (!m.Year) return;
        const d = Math.floor(m.Year / 10) * 10;
        if (d >= 1900) counts[d >= 2020 ? 2020 : d] = (counts[d >= 2020 ? 2020 : d] || 0) + 1;
        else counts[1900] = (counts[1900] || 0) + 1;
    });
    return counts;
  }, [movies]);

  const setRatingBound = (bound: 'min' | 'max', value: number) => {
      setFilters(prev => {
          const newRange: [number, number] = [prev.ratingRange[0], prev.ratingRange[1]];
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
        const newRange: [number, number] = type === 'year' 
            ? [prev.yearRange[0], prev.yearRange[1]] 
            : [prev.ratingRange[0], prev.ratingRange[1]];
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
          yearRange: [1900, new Date().getFullYear() + 1],
          ratingRange: [0, 10]
      }));
      setActiveModal(null);
  };

  const isYearActive = filters.yearRange[0] > 1900 || filters.yearRange[1] < new Date().getFullYear();
  const isRatingActive = filters.ratingRange[0] > 0 || filters.ratingRange[1] < 10;
  const hasActiveFilters = filters.genres.length > 0 || filters.directors.length > 0 || isYearActive || isRatingActive;

  const FilterButton = ({ id, label, icon: Icon, active, count, isFiltered }: { id: string, label: string, icon: any, active: boolean, count?: number, isFiltered?: boolean }) => (
      <button 
        onClick={() => setActiveModal(id as any)}
        className={`
            group flex items-center gap-2 px-6 py-3 rounded-full border text-xs font-bold uppercase tracking-widest transition-all duration-300
            ${active 
                ? 'bg-accent text-black border-accent shadow-[0_0_20px_rgba(234,179,8,0.5)] scale-105' 
                : isFiltered 
                    ? 'bg-accent/20 border-accent/50 text-accent hover:bg-accent/30'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/30'
            }
        `}
      >
        <Icon size={14} className={isFiltered || active ? 'text-inherit' : 'text-slate-500 group-hover:text-white transition-colors'} />
        {label}
        {count ? <span className={`ml-1 px-1.5 rounded-full text-[9px] font-black ${active ? 'bg-black text-accent' : 'bg-accent text-black'}`}>{count}</span> : null}
      </button>
  );

  return (
    <div className="flex flex-col gap-8 relative z-40">
        
        {/* === MAIN TOOLBAR === */}
        <div className="flex flex-wrap items-center gap-3">
             <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-full mr-2">
                <SlidersHorizontal size={16} className="text-slate-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Filtros</span>
            </div>

            <FilterButton id="year" label="Año" icon={Calendar} active={activeModal === 'year'} isFiltered={isYearActive} />
            <FilterButton id="rating" label="Nota" icon={Star} active={activeModal === 'rating'} isFiltered={isRatingActive} />
            <FilterButton id="genres" label="Género" icon={Film} active={activeModal === 'genres'} count={filters.genres.length || undefined} />
            <FilterButton id="directors" label="Director" icon={Megaphone} active={activeModal === 'directors'} count={filters.directors.length || undefined} />

            {hasActiveFilters && (
                <button 
                    onClick={clearFilters}
                    className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                    <Trash2 size={14} /> Borrar Todo
                </button>
            )}
        </div>

        {/* === DECADE SCROLLER (Always Visible) === */}
        <div className="relative border-y border-white/5 bg-black/20 backdrop-blur-sm -mx-4 lg:-mx-8 px-4 lg:px-8 py-4 flex items-center gap-4 overflow-x-auto no-scrollbar mask-image-sides">
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 shrink-0 mr-4 rotate-180" style={{writingMode: 'vertical-lr'}}>Timeline</span>
             {[2020, 2010, 2000, 1990, 1980, 1970, 1960, 1950, 1940, 1930, 1920, 1900].map(decade => {
                const isSelected = filters.yearRange[0] === decade && filters.yearRange[1] === (decade === 1900 ? 1919 : decade + 9);
                return (
                    <button
                        key={decade}
                        onClick={() => setDecade(decade)}
                        className={`
                            shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all duration-300
                            ${isSelected 
                                ? 'bg-accent border-accent text-black shadow-[0_0_20px_rgba(234,179,8,0.3)] scale-110 z-10' 
                                : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:border-white/20 hover:text-white'}
                        `}
                    >
                        <span className="text-xs font-black tracking-tighter">{decade === 1900 ? '1900s' : `${decade}s`}</span>
                        <span className="text-[9px] font-mono opacity-60">{decadeCounts[decade] || 0}</span>
                    </button>
                );
             })}
        </div>


        {/* === MODALS / OVERLAYS (Fixed Position to avoid Z-Index issues) === */}
        {activeModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setActiveModal(null)} />
                
                {/* Modal Content */}
                <div className="relative bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                    
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                        <div className="flex items-center gap-3 text-accent">
                            {activeModal === 'year' && <Calendar size={20} />}
                            {activeModal === 'rating' && <Star size={20} />}
                            {activeModal === 'genres' && <Film size={20} />}
                            {activeModal === 'directors' && <Megaphone size={20} />}
                            <span className="text-sm font-black uppercase tracking-widest text-white">
                                {activeModal === 'year' && "Filtrar por Año"}
                                {activeModal === 'rating' && "Filtrar por Nota"}
                                {activeModal === 'genres' && "Seleccionar Géneros"}
                                {activeModal === 'directors' && "Seleccionar Directores"}
                            </span>
                        </div>
                        <button onClick={() => setActiveModal(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        
                        {activeModal === 'year' && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 space-y-2">
                                        <label className="text-[10px] uppercase text-slate-500 font-bold block pl-1">Desde</label>
                                        <input type="number" value={filters.yearRange[0]} onChange={e => handleRangeChange('year', 0, e.target.value)} 
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-center text-xl font-black focus:border-accent outline-none text-white transition-colors" />
                                    </div>
                                    <div className="text-slate-600 font-black text-xl pt-6">-</div>
                                    <div className="flex-1 space-y-2">
                                        <label className="text-[10px] uppercase text-slate-500 font-bold block pl-1">Hasta</label>
                                        <input type="number" value={filters.yearRange[1]} onChange={e => handleRangeChange('year', 1, e.target.value)} 
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-center text-xl font-black focus:border-accent outline-none text-white transition-colors" />
                                    </div>
                                </div>
                                <p className="text-center text-xs text-slate-500">Escribe el año o usa la línea de tiempo en la barra superior.</p>
                            </div>
                        )}

                        {activeModal === 'rating' && (
                            <div className="space-y-8">
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-4 block text-center">Mínima</label>
                                    <div className="flex justify-between gap-1">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => (
                                            <button key={`min-${r}`} onClick={() => setRatingBound('min', r)}
                                                className={`w-8 h-10 rounded flex items-center justify-center text-sm font-black transition-all ${filters.ratingRange[0] === r ? 'bg-accent text-black scale-110 shadow-lg' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}>
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-4 block text-center">Máxima</label>
                                    <div className="flex justify-between gap-1">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => (
                                            <button key={`max-${r}`} onClick={() => setRatingBound('max', r)}
                                                className={`w-8 h-10 rounded flex items-center justify-center text-sm font-black transition-all ${filters.ratingRange[1] === r ? 'bg-accent text-black scale-110 shadow-lg' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}>
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeModal === 'genres' && (
                            <div className="flex flex-wrap gap-3">
                                {availableGenres.map(g => (
                                    <button key={g} onClick={() => toggleSelection('genres', g)}
                                        className={`text-xs px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-2 ${filters.genres.includes(g) ? 'bg-accent text-black border-accent font-black shadow-lg shadow-accent/20' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20 hover:text-white'}`}>
                                        {filters.genres.includes(g) && <Check size={12} />}
                                        {g}
                                    </button>
                                ))}
                            </div>
                        )}

                        {activeModal === 'directors' && (
                            <div className="space-y-4">
                                <input type="text" placeholder="Buscar director..." className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-accent/50 sticky top-0" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {availableDirectors.map(d => (
                                        <button key={d} onClick={() => toggleSelection('directors', d)}
                                            className={`text-left text-xs px-4 py-3 rounded-xl flex justify-between items-center transition-colors border ${filters.directors.includes(d) ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 font-bold' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                                            <span className="truncate">{d}</span>
                                            {filters.directors.includes(d) && <Check size={12} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Footer */}
                    <div className="p-4 bg-black/20 border-t border-white/5 flex justify-end">
                        <button onClick={() => setActiveModal(null)} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold uppercase tracking-widest text-white transition-colors">
                            Listo
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default FilterBar;
