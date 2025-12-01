import React, { useState } from 'react';
import { FilterState, ApiKeys } from '../types';
import { CHANGELOG } from '../constants';
import { Upload, Settings, Filter, X } from 'lucide-react';

interface SidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  availableGenres: string[];
  availableDirectors: string[];
  yearBounds: [number, number];
  ratingBounds: [number, number];
  onFileUpload: (file: File, type: 'movies' | 'oscars') => void;
  apiKeys: ApiKeys;
  setApiKeys: (k: ApiKeys) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  filters, setFilters, availableGenres, availableDirectors, yearBounds, ratingBounds, onFileUpload, apiKeys, setApiKeys, isOpen, onClose
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);

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

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-[#0f172a]/95 border-r border-slate-700/30 backdrop-blur-xl transform transition-transform duration-300 overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6 lg:hidden">
            <h2 className="text-xl font-bold bg-gradient-to-r from-accent to-accent-alt bg-clip-text text-transparent">Menú</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
        </div>

        {/* Data Upload */}
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2"><Upload size={14} /> Datos</h3>
          <div className="space-y-3">
             <label className="block">
                <span className="text-xs text-slate-400 mb-1 block">CSV Películas (IMDb)</span>
                <input type="file" accept=".csv" onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0], 'movies')} 
                  className="block w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20 cursor-pointer"/>
             </label>
             <label className="block">
                <span className="text-xs text-slate-400 mb-1 block">Excel Oscars</span>
                <input type="file" accept=".xlsx" onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0], 'oscars')} 
                  className="block w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-accent-alt/10 file:text-accent-alt hover:file:bg-accent-alt/20 cursor-pointer"/>
             </label>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2"><Filter size={14} /> Filtros</h3>
            
            <div className="mb-4">
                <label className="text-xs text-slate-300 mb-1 block">Rango Años</label>
                <div className="flex gap-2">
                    <input type="number" value={filters.yearRange[0]} onChange={e => handleRangeChange('year', 0, e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded px-2 py-1 text-xs" />
                    <span className="text-slate-500">-</span>
                    <input type="number" value={filters.yearRange[1]} onChange={e => handleRangeChange('year', 1, e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded px-2 py-1 text-xs" />
                </div>
            </div>

            <div className="mb-4">
                <label className="text-xs text-slate-300 mb-1 block">Mi Nota (0-10)</label>
                <div className="flex gap-2">
                    <input type="number" value={filters.ratingRange[0]} onChange={e => handleRangeChange('rating', 0, e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded px-2 py-1 text-xs" />
                    <span className="text-slate-500">-</span>
                    <input type="number" value={filters.ratingRange[1]} onChange={e => handleRangeChange('rating', 1, e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded px-2 py-1 text-xs" />
                </div>
            </div>

            <div className="mb-4">
                <label className="text-xs text-slate-300 mb-1 block">Géneros</label>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto custom-scrollbar">
                    {availableGenres.map(g => (
                        <button key={g} onClick={() => toggleSelection('genres', g)}
                            className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${filters.genres.includes(g) ? 'bg-accent/20 border-accent text-accent' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                            {g}
                        </button>
                    ))}
                </div>
            </div>
            
             <div className="mb-4">
                <label className="text-xs text-slate-300 mb-1 block">Directores</label>
                 <select multiple value={filters.directors} onChange={(e) => {
                     const selected = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
                     setFilters(prev => ({...prev, directors: selected}));
                 }} className="w-full bg-slate-800/50 border border-slate-700 rounded px-2 py-1 text-xs h-32 custom-scrollbar">
                    {availableDirectors.map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                 </select>
                 <p className="text-[10px] text-slate-500 mt-1">Ctrl+Click para seleccionar múltiples</p>
            </div>
        </div>

        {/* Settings */}
        <div className="mb-4">
             <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                <Settings size={14} /> Configuración APIs
             </button>
             {showSettings && (
                 <div className="mt-3 space-y-2 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                     <div>
                         <label className="text-[10px] text-slate-500 block">TMDb API Key</label>
                         <input type="password" value={apiKeys.tmdb} onChange={e => setApiKeys({...apiKeys, tmdb: e.target.value})} className="w-full bg-black/30 border border-slate-700 rounded px-2 py-1 text-xs" />
                     </div>
                     <div>
                         <label className="text-[10px] text-slate-500 block">OMDb API Key</label>
                         <input type="password" value={apiKeys.omdb} onChange={e => setApiKeys({...apiKeys, omdb: e.target.value})} className="w-full bg-black/30 border border-slate-700 rounded px-2 py-1 text-xs" />
                     </div>
                     <div>
                         <label className="text-[10px] text-slate-500 block">YouTube API Key</label>
                         <input type="password" value={apiKeys.youtube} onChange={e => setApiKeys({...apiKeys, youtube: e.target.value})} className="w-full bg-black/30 border border-slate-700 rounded px-2 py-1 text-xs" />
                     </div>
                 </div>
             )}
        </div>

        {/* Changelog */}
        <div>
            <button onClick={() => setShowChangelog(!showChangelog)} className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300">
                Versiones
            </button>
            {showChangelog && (
                <div className="mt-2 text-xs text-slate-400 space-y-2 pl-2 border-l border-slate-700">
                    {Object.entries(CHANGELOG).map(([ver, notes]) => (
                        <div key={ver}>
                            <div className="font-bold text-slate-300">v{ver}</div>
                            <ul className="list-disc list-inside opacity-70">
                                {notes.map((n, i) => <li key={i}>{n}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;