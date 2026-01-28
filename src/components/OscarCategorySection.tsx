
import React, { useState } from 'react';
import { OscarRow, ApiKeys } from '../types';
import OscarCard from './OscarCard';
import { ChevronDown, Trophy, Star } from 'lucide-react';

interface OscarCategorySectionProps {
  category: string;
  items: OscarRow[];
  apiKeys: ApiKeys;
}

const OscarCategorySection: React.FC<OscarCategorySectionProps> = ({ category, items, apiKeys }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Find winner for the preview text
  const winner = items.find(i => i.IsWinner);
  const winnerName = winner ? (winner.PersonName !== winner.Film ? `${winner.PersonName} (${winner.Film})` : winner.Film) : "Sin datos";

  return (
    <div className="mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group relative overflow-hidden ${
            isOpen 
            ? 'bg-white/10 border-white/20' 
            : 'bg-black/40 border-white/5 hover:bg-white/5 hover:border-white/10'
        }`}
      >
        {/* Background gradient if winner exists and collapsed */}
        {!isOpen && winner && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-yellow-900/10 pointer-events-none" />
        )}

        <div className="flex items-center gap-4 relative z-10">
            <div className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-accent text-black' : 'bg-white/5 text-slate-500 group-hover:text-slate-300'}`}>
                {isOpen ? <Trophy size={18} /> : <Star size={18} />}
            </div>
            <div className="text-left">
                <h3 className={`text-sm font-black uppercase tracking-[0.15em] ${isOpen ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {category}
                </h3>
                {/* Winner Preview when collapsed */}
                {!isOpen && winner && (
                    <div className="text-[10px] text-yellow-500/80 font-bold mt-0.5 flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2">
                        <Trophy size={10} /> 
                        <span className="uppercase tracking-wider">Ganador:</span> 
                        <span className="text-slate-300 truncate max-w-[200px] sm:max-w-md">{winnerName}</span>
                    </div>
                )}
            </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
            {!isOpen && (
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest bg-white/5 px-2 py-1 rounded hidden sm:block">
                    {items.length} Nominados
                </span>
            )}
            <div className={`p-1 rounded-full transition-transform duration-500 ${isOpen ? 'rotate-180 bg-white/10 text-white' : 'text-slate-500'}`}>
                <ChevronDown size={20} />
            </div>
        </div>
      </button>

      {/* Content Grid */}
      <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
        <div className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-2">
                {items.map((o, i) => (
                    <OscarCard key={`${category}-${i}`} item={o} apiKeys={apiKeys} />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default OscarCategorySection;
