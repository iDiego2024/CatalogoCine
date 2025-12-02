
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FilterState } from '../types';
import { ChevronDown, Calendar, Star, Film, Megaphone, X, Check, Filter, Trash2 } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  availableGenres: string[];
  availableDirectors: string[];
}

// --- Internal Component: DualRangeSlider (Timeline) ---
const DualRangeSlider = ({ 
    min, 
    max, 
    value, 
    onChange, 
    step = 1,
    formatLabel
}: { 
    min: number; 
    max: number; 
    value: [number, number]; 
    onChange: (val: [number, number]) => void;
    step?: number;
    formatLabel?: (val: number) => string;
}) => {
    const sliderRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);

    // Calculate percentage for positioning
    const getPercent = useCallback((val: number) => 
        Math.round(((val - min) / (max - min)) * 100), 
    [min, max]);

    const handleMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
        setIsDragging(type);
        e.preventDefault();
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !sliderRef.current) return;

            const rect = sliderRef.current.getBoundingClientRect();
            const percent = Math.min(Math.max(0, (e.clientX - rect.left) / rect.width), 1);
            const rawValue = min + (percent * (max - min));
            const newValue = Math.round(rawValue / step) * step;

            if (isDragging === 'min') {
                const clamped = Math.min(newValue, value[1] - step);
                if (clamped >= min) onChange([clamped, value[1]]);
            } else {
                const clamped = Math.max(newValue, value[0] + step);
                if (clamped <= max) onChange([value[0], clamped]);
            }
        };

        const handleMouseUp = () => {
            setIsDragging(null);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, min, max, step, value, onChange]);

    return (
        <div className="pt-6 pb-2 px-2 select-none">
            <div className="relative w-full h-1 bg-slate-700 rounded-full" ref={sliderRef}>
                {/* Active Track */}
                <div 
                    className="absolute h-full bg-accent rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                    style={{ 
                        left: `${getPercent(value[0])}%`, 
                        width: `${getPercent(value[1]) - getPercent(value[0])}%` 
                    }}
                />

                {/* Min Thumb */}
                <div 
                    className="absolute w-4 h-4 bg-white border-2 border-accent rounded-full -top-1.5 -ml-2 cursor-grab active:cursor-grabbing shadow-lg hover:scale-125 transition-transform z-10"
                    style={{ left: `${getPercent(value[0])}%` }}
                    onMouseDown={handleMouseDown('min')}
                >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-accent bg-black/80 px-1.5 py-0.5 rounded border border-white/10 whitespace-nowrap">
                        {formatLabel ? formatLabel(value[0]) : value[0]}
                    </div>
                </div>

                {/* Max Thumb */}
                <div 
                    className="absolute w-4 h-4 bg-white border-2 border-accent rounded-full -top-1.5 -ml-2 cursor-grab active:cursor-grabbing shadow-lg hover:scale-125 transition-transform z-10"
                    style={{ left: `${getPercent(value[1])}%` }}
                    onMouseDown={handleMouseDown('max')}
                >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-accent bg-black/80 px-1.5 py-0.5 rounded border border-white/10 whitespace-nowrap">
                        {formatLabel ? formatLabel(value[1]) : value[1]}
                    </div>
                </div>

                {/* Ticks / Ruler */}
                <div className="absolute top-4 left-0 w-full flex justify-between text-[9px] text-slate-600 font-mono pointer-events-none">
                    <span>{min}</span>
                    <span>{Math.round((min + max) / 2)}</span>
                    <span>{max}</span>
                </div>
            </div>
        </div>
    );
};


const FilterBar: React.FC<FilterBarProps> = ({
  filters, setFilters, availableGenres, availableDirectors
}) => {
  const [activePopover, setActivePopover] = useState<'year' | 'rating' | 'genres' | 'directors' | null>(null);

  const togglePopover = (type: 'year' | 'rating' | 'genres' | 'directors') => {
    setActivePopover(activePopover === type ? null : type);
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

  const removeTag = (type: 'genres' | 'directors' | 'year' | 'rating', val?: string) => {
      if (type === 'genres' || type === 'directors') {
          if (val) toggleSelection(type, val);
      } else if (type === 'year') {
          setFilters(prev => ({ ...prev, yearRange: [1900, new Date().getFullYear()] }));
      } else if (type === 'rating') {
          setFilters(prev => ({ ...prev, ratingRange: [0, 10] }));
      }
  };

  const clearFilters = () => {
      setFilters(prev => ({
          ...prev,
          genres: [],
          directors: [],
          yearRange: [1900, new Date().getFullYear()],
          ratingRange: [0, 10]
      }));
      setActivePopover(null);
  };

  // Check active states
  const isYearActive = filters.yearRange[0] > 1900 || filters.yearRange[1] < new Date().getFullYear();
  const isRatingActive = filters.ratingRange[0] > 0 || filters.ratingRange[1] < 10;
  const hasActiveFilters = filters.genres.length > 0 || filters.directors.length > 0 || isYearActive || isRatingActive;

  // Render a Filter Button with Popover Logic
  const FilterButton = ({ id, label, icon: Icon, active, count, isFiltered }: { id: string, label: string, icon: any, active: boolean, count?: number, isFiltered?: boolean }) => (
    <div className="relative">
      <button 
        onClick={() => togglePopover(id as any)}
        className={`
            group flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all duration-300
            ${active 
                ? 'bg-[#0f172a] border-accent text-accent shadow-[0_0_15px_rgba(234,179,8,0.2)]' 
                : isFiltered 
                    ? 'bg-accent/10 border-accent/40 text-accent hover:bg-accent/20'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 hover:border-white/20'
            }
        `}
      >
        <Icon size={14} className={isFiltered || active ? 'text-accent' : 'text-slate-500 group-hover:text-slate-300'} />
        {label}
        {count ? <span className="ml-1 bg-accent text-black px-1.5 rounded-full text-[9px] font-black">{count}</span> : null}
        <ChevronDown size={12} className={`transition-transform duration-300 opacity-50 ${active ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover */}
      {active && (
        <div className="absolute top-full mt-2 left-0 z-50 min-w-[300px] bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-5 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-left">
           <div className="mb-4 flex justify-between items-center border-b border-white/5 pb-2">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Icon size={12}/> {label}
             </span>
             <button onClick={() => setActivePopover(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X size={14} className="text-slate-500 hover:text-white" /></button>
           </div>
           
           {id === 'year' && (
              <div className="space-y-6">
                  <div className="flex justify-between text-xs text-white font-bold px-1">
                      <span>{filters.yearRange[0]}</span>
                      <span className="text-slate-500">-</span>
                      <span>{filters.yearRange[1]}</span>
                  </div>
                  <DualRangeSlider 
                    min={1920} 
                    max={new Date().getFullYear()} 
                    value={filters.yearRange} 
                    onChange={(val) => setFilters(prev => ({ ...prev, yearRange: val }))}
                  />
                  <div className="text-[10px] text-slate-500 text-center mt-2">Rango de años de estreno</div>
              </div>
           )}

           {id === 'rating' && (
              <div className="space-y-6">
                  <div className="flex justify-between text-xs text-white font-bold px-1">
                      <span>★ {filters.ratingRange[0]}</span>
                      <span className="text-slate-500">-</span>
                      <span>★ {filters.ratingRange[1]}</span>
                  </div>
                  <DualRangeSlider 
                    min={0} 
                    max={10} 
                    step={0.5}
                    value={filters.ratingRange} 
                    onChange={(val) => setFilters(prev => ({ ...prev, ratingRange: val }))}
                    formatLabel={(v) => v.toFixed(1)}
                  />
                  <div className="text-[10px] text-slate-500 text-center mt-2">Rango de nota personal o IMDb</div>
              </div>
           )}

           {id === 'genres' && (
              <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                  {availableGenres.map(g => (
                      <button key={g} onClick={() => toggleSelection('genres', g)}
                          className={`text-[11px] px-3 py-1.5 rounded-lg border transition-all duration-200 ${filters.genres.includes(g) ? 'bg-accent text-black border-accent font-bold shadow-lg shadow-accent/20' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20 hover:text-white'}`}>
                          {g}
                      </button>
                  ))}
              </div>
           )}

            {id === 'directors' && (
              <div className="space-y-2">
                 <input type="text" placeholder="Filtrar lista..." className="w-full bg-black/40 border-b border-white/10 p-2 text-xs text-white mb-2 outline-none focus:border-accent/50" onClick={(e) => e.stopPropagation()} />
                 <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-0.5">
                    {availableDirectors.map(d => (
                        <button key={d} onClick={() => toggleSelection('directors', d)}
                            className={`w-full text-left text-xs px-3 py-2 rounded-lg flex justify-between items-center transition-colors ${filters.directors.includes(d) ? 'bg-accent/10 text-accent font-bold' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                            {d}
                            {filters.directors.includes(d) && <Check size={12} />}
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
    <div className="flex flex-col gap-4">
        {/* Main Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-1.5 bg-black/20 backdrop-blur-md rounded-2xl border border-white/5 w-fit">
            <div className="px-3 flex items-center gap-2 text-slate-500 border-r border-white/5 mr-1">
                <Filter size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Filtros</span>
            </div>
            
            <FilterButton id="year" label="Año" icon={Calendar} active={activePopover === 'year'} isFiltered={isYearActive} />
            <FilterButton id="rating" label="Nota" icon={Star} active={activePopover === 'rating'} isFiltered={isRatingActive} />
            <FilterButton id="genres" label="Género" icon={Film} active={activePopover === 'genres'} count={filters.genres.length || undefined} />
            <FilterButton id="directors" label="Director" icon={Megaphone} active={activePopover === 'directors'} count={filters.directors.length || undefined} />
        </div>

        {/* Active Tags & Reset Row */}
        {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300 pl-2">
                {isYearActive && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-[10px] text-slate-300 font-bold uppercase tracking-wide group">
                        <span>Año: {filters.yearRange[0]} - {filters.yearRange[1]}</span>
                        <button onClick={() => removeTag('year')} className="hover:text-white"><X size={10} /></button>
                    </div>
                )}
                {isRatingActive && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-[10px] text-slate-300 font-bold uppercase tracking-wide group">
                        <span>Nota: {filters.ratingRange[0]} - {filters.ratingRange[1]}</span>
                        <button onClick={() => removeTag('rating')} className="hover:text-white"><X size={10} /></button>
                    </div>
                )}
                {filters.genres.map(g => (
                    <div key={g} className="flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[10px] text-accent font-bold uppercase tracking-wide group">
                        <span>{g}</span>
                        <button onClick={() => removeTag('genres', g)} className="hover:text-white"><X size={10} /></button>
                    </div>
                ))}
                {filters.directors.map(d => (
                    <div key={d} className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] text-purple-400 font-bold uppercase tracking-wide group">
                        <span>{d}</span>
                        <button onClick={() => removeTag('directors', d)} className="hover:text-white"><X size={10} /></button>
                    </div>
                ))}

                <button 
                    onClick={clearFilters}
                    className="ml-2 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                    <Trash2 size={12} /> Limpiar todo
                </button>
            </div>
        )}
    </div>
  );
};

export default FilterBar;
