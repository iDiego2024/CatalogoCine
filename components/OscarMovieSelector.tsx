
import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Clapperboard, Check, Trophy, X } from 'lucide-react';

interface OscarMovieSelectorProps {
  movies: { title: string; isWinner: boolean }[];
  selectedMovie: string | null;
  onSelect: (title: string | null) => void;
}

const OscarMovieSelector: React.FC<OscarMovieSelectorProps> = ({ movies, selectedMovie, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredMovies = movies.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full sm:max-w-xs z-30" ref={containerRef}>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
            w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all duration-300 group
            ${isOpen 
                ? 'bg-black/80 border-accent text-white shadow-[0_0_20px_rgba(234,179,8,0.2)]' 
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300'}
        `}
      >
        <div className="flex items-center gap-3 overflow-hidden">
            <div className={`p-1.5 rounded-md transition-colors ${selectedMovie ? 'bg-accent text-black' : 'bg-white/10 text-slate-400'}`}>
                <Clapperboard size={16} />
            </div>
            <span className={`text-sm font-bold truncate ${selectedMovie ? 'text-white' : 'text-slate-400'}`}>
                {selectedMovie || "Seleccionar Película..."}
            </span>
        </div>
        <ChevronDown size={16} className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-accent' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
            
            {/* Search Bar */}
            <div className="p-2 border-b border-white/5 sticky top-0 bg-[#0a0a0a] z-10">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                        ref={inputRef}
                        type="text" 
                        placeholder="Buscar título..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-lg py-2 pl-9 pr-8 text-xs text-white placeholder-slate-600 focus:border-accent/50 focus:bg-white/10 outline-none transition-all"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white">
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                {filteredMovies.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-600 italic">No se encontraron películas</div>
                ) : (
                    filteredMovies.map((m) => (
                        <button
                            key={m.title}
                            onClick={() => {
                                onSelect(m.title);
                                setIsOpen(false);
                                setSearchTerm("");
                            }}
                            className={`
                                w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between text-xs font-medium transition-all group
                                ${selectedMovie === m.title 
                                    ? 'bg-accent/10 text-accent' 
                                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}
                            `}
                        >
                            <span className="truncate pr-2">{m.title}</span>
                            <div className="flex items-center gap-2">
                                {m.isWinner && (
                                    <span className="bg-yellow-500/10 text-yellow-500 p-0.5 rounded" title="Película Ganadora">
                                        <Trophy size={10} />
                                    </span>
                                )}
                                {selectedMovie === m.title && <Check size={14} />}
                            </div>
                        </button>
                    ))
                )}
            </div>
            
            {/* Clear Button */}
            {selectedMovie && (
                <div className="border-t border-white/5 p-1">
                    <button 
                        onClick={() => { onSelect(null); setIsOpen(false); }}
                        className="w-full py-2 text-center text-[10px] uppercase font-bold tracking-wider text-slate-600 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors"
                    >
                        Limpiar Selección
                    </button>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default OscarMovieSelector;
