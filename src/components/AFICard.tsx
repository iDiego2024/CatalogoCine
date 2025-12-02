
import React, { useState, useEffect } from 'react';
import { Movie, ApiKeys, TmdbInfo } from '../types';
import { fetchTmdbInfo } from '../utils';
import { Film, CheckCircle2, Search, ExternalLink, Star } from 'lucide-react';

interface AFICardProps {
  rank: number;
  title: string;
  year: number;
  movie: Movie | null; // null if not in catalog
  apiKeys: ApiKeys;
}

const AFICard: React.FC<AFICardProps> = ({ rank, title, year, movie, apiKeys }) => {
  const [tmdb, setTmdb] = useState<TmdbInfo | null>(null);

  useEffect(() => {
    if (apiKeys.tmdb) {
      fetchTmdbInfo(title, year, apiKeys.tmdb).then(setTmdb);
    }
  }, [title, year, apiKeys]);

  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`importancia histórica película ${title} ${year} cine`)}`;
  const afiSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`AFI 100 movies ${title} entry`)}`;

  // Visual state: B&W if not seen, Color if seen
  const containerClass = movie 
    ? "bg-gradient-to-r from-[#0f172a] to-[#1e293b] border-l-4 border-l-accent" 
    : "bg-[#0a0a0a] border-l-4 border-l-slate-700 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500";

  return (
    <div className={`relative rounded-xl border-y border-r border-white/5 overflow-hidden shadow-lg group ${containerClass}`}>
      
      <div className="flex flex-col md:flex-row gap-6 p-6">
        {/* Rank & Poster */}
        <div className="flex flex-row md:flex-col gap-4 shrink-0 items-center md:items-start">
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-600 font-serif leading-none">
                #{rank}
            </div>
            <div className="w-24 h-36 bg-black rounded shadow-2xl overflow-hidden relative shrink-0">
                {tmdb?.poster_url ? (
                    <img src={tmdb.poster_url} alt={title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700"><Film size={24} /></div>
                )}
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-1 leading-tight group-hover:text-accent transition-colors">{title}</h3>
                        <div className="text-sm text-slate-400 font-bold">{year}</div>
                    </div>
                    {movie && (
                        <div className="flex items-center gap-2 bg-green-900/30 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-green-500/20">
                            <CheckCircle2 size={14} /> Visto
                        </div>
                    )}
                </div>

                {/* My Rating Context */}
                {movie && (
                    <div className="mt-4 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-accent font-black">
                            <Star size={14} fill="currentColor" />
                            <span>Mi Nota: {movie["Your Rating"] ?? "—"}</span>
                        </div>
                        {movie["IMDb Rating"] && (
                            <div className="flex items-center gap-1.5 text-slate-400 font-bold">
                                <span className="text-yellow-600">IMDb:</span> {movie["IMDb Rating"]}
                            </div>
                        )}
                    </div>
                )}

                {/* Historical Context Placeholder */}
                <div className="mt-6 p-4 bg-black/20 rounded-lg border border-white/5 relative">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Film size={12} /> Importancia Histórica
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed italic opacity-80">
                        "Una obra fundamental en la lista de la AFI. Explora por qué esta película definió una era y cambió el lenguaje cinematográfico para siempre."
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="mt-4 flex flex-wrap gap-3">
                        <a href={googleSearchUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white transition-colors border border-white/10">
                            <Search size={12} /> Leer análisis crítico
                        </a>
                        <a href={afiSearchUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-900/20 hover:bg-blue-900/40 text-xs font-bold text-blue-300 hover:text-blue-200 transition-colors border border-blue-500/20">
                            <ExternalLink size={12} /> Ficha en AFI
                        </a>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AFICard;
