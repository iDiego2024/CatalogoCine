import React, { useState, useEffect } from 'react';
import { Movie, ApiKeys, TmdbInfo } from '../types';
import { fetchTmdbInfo } from '../utils';
import { Film, CheckCircle2, Search, ExternalLink, Star } from 'lucide-react';

interface AFICardProps {
  rank: number;
  title: string;
  year: number;
  movie: Movie | null;
  apiKeys: ApiKeys;
}

const AFICard: React.FC<AFICardProps> = ({ rank, title, year, movie, apiKeys }) => {
  const [tmdb, setTmdb] = useState<TmdbInfo | null>(null);

  useEffect(() => {
    if (apiKeys.tmdb) fetchTmdbInfo(title, year, apiKeys.tmdb).then(setTmdb);
  }, [title, year, apiKeys]);

  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${title} ${year} película importancia histórica`)}`;

  return (
    <div className={`relative rounded-2xl border overflow-hidden transition-all duration-500 group flex flex-col md:flex-row gap-6 p-6 ${movie ? 'bg-slate-900/60 border-accent/30 shadow-2xl' : 'bg-black/40 border-white/5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}>
      <div className="flex flex-row md:flex-col gap-4 shrink-0 items-center md:items-start">
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-white/5 font-serif leading-none italic">#{rank}</div>
          <div className="w-24 h-36 bg-black rounded-xl shadow-2xl overflow-hidden shrink-0 border border-white/5 relative">
              {tmdb?.poster_url ? <img src={tmdb.poster_url} alt={title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-800"><Film size={32} /></div>}
              {movie && <div className="absolute top-2 right-2 bg-accent text-black p-1 rounded-full shadow-lg"><CheckCircle2 size={12} /></div>}
          </div>
      </div>

      <div className="flex-1 flex flex-col justify-between">
          <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                      <h3 className="text-2xl font-black text-white leading-tight group-hover:text-accent transition-colors">{title}</h3>
                      <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">{year}</p>
                  </div>
              </div>
              {movie && (
                  <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-accent mb-6">
                      <div className="flex items-center gap-1.5"><Star size={14} fill="currentColor" /> Mi Nota: {movie["Your Rating"] ?? "—"}</div>
                      <a href={movie.URL} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors flex items-center gap-1 group/imdb">
                        <span className="text-yellow-500 font-bold border border-yellow-500/30 px-1 rounded text-[10px] group-hover/imdb:border-yellow-500 transition-colors">IMDb</span> {movie["IMDb Rating"] ?? "—"}
                      </a>
                  </div>
              )}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-xs text-slate-400 leading-relaxed italic opacity-80 mb-4 line-clamp-2">"Una obra maestra fundamental del cine estadounidense, seleccionada por el American Film Institute por su impacto cultural y artístico."</p>
                  <a href={googleSearchUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-all"><Search size={12} /> Leer análisis histórico</a>
              </div>
          </div>
      </div>
    </div>
  );
};

export default AFICard;