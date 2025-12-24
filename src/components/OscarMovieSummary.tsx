
import React, { useEffect, useState } from 'react';
import { OscarRow, ApiKeys, TmdbInfo, Movie, OmdbAwards } from '../types';
import { fetchTmdbInfo, fetchOmdbAwards, getRatingColors, getYoutubeTrailer } from '../utils';
import { Film, Star, Trophy, BookOpen, Youtube, ExternalLink, PlayCircle } from 'lucide-react';

interface OscarMovieSummaryProps {
  title: string;
  year: number;
  oscarData: OscarRow[];
  apiKeys: ApiKeys;
  movies: Movie[]; // Catalog movies to cross-reference
}

const OscarMovieSummary: React.FC<OscarMovieSummaryProps> = ({ title, year, oscarData, apiKeys, movies }) => {
  const [tmdb, setTmdb] = useState<TmdbInfo | null>(null);
  const [omdb, setOmdb] = useState<OmdbAwards | null>(null);
  const [trailerId, setTrailerId] = useState<string | null>(null);

  // Filter oscar rows for this specific movie
  const rows = oscarData.filter(o => o.Film === title && o.FilmYear === year);
  
  // Find in catalog
  const catalogMatch = movies.find(m => m.NormTitle === rows[0]?.NormFilm && m.Year === year);

  useEffect(() => {
    if (apiKeys.tmdb) {
        fetchTmdbInfo(title, year, apiKeys.tmdb).then(setTmdb);
    }
    if (apiKeys.omdb) {
        fetchOmdbAwards(title, year, apiKeys.omdb).then(setOmdb);
    }
    if (apiKeys.youtube) {
        getYoutubeTrailer(title, year, apiKeys.youtube).then(setTrailerId);
    }
  }, [title, year, apiKeys]);

  if (rows.length === 0) return null;

  const totalWins = rows.filter(r => r.IsWinner).length;
  const totalNoms = rows.length;
  
  // Sorting: Winners first
  const sortedRows = [...rows].sort((a, b) => (a.IsWinner === b.IsWinner ? 0 : a.IsWinner ? -1 : 1));

  const reviewUrl = `https://www.google.com/search?q=reseña+película+${encodeURIComponent(title + " " + year)}`;
  const trailerUrl = trailerId 
    ? `https://www.youtube.com/watch?v=${trailerId}` 
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " trailer")}`;

  const ratingColor = getRatingColors(catalogMatch?.["Your Rating"] || null);

  const displayImdb = catalogMatch?.["IMDb Rating"] 
      ? catalogMatch["IMDb Rating"] 
      : (omdb?.imdbRating ? parseFloat(omdb.imdbRating) : null);
  
  const imdbUrl = catalogMatch?.URL || `https://www.imdb.com/find?q=${encodeURIComponent(title + " " + year)}`;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 h-full">
         {/* Background Glow */}
         <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-black/80 via-black/40 to-transparent z-0"></div>
         {tmdb?.poster_url && (
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-20 pointer-events-none z-0">
                <img src={tmdb.poster_url} className="w-full h-full object-cover mask-image-gradient" alt="" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] to-transparent"></div>
            </div>
         )}

         <div className="relative z-10 flex flex-col lg:flex-row gap-8">
             {/* Poster */}
             <div className="w-32 lg:w-48 shrink-0 mx-auto lg:mx-0">
                 <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-2xl border border-white/10 relative group">
                    {tmdb?.poster_url ? (
                        <img src={tmdb.poster_url} alt={title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-600"><Film size={32}/></div>
                    )}
                    {/* Catalog Badge */}
                    {catalogMatch && (
                        <div className="absolute top-2 right-2 bg-accent text-black text-[9px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-wider">
                            En catálogo
                        </div>
                    )}
                 </div>
             </div>

             {/* Details */}
             <div className="flex-1 flex flex-col">
                 <h2 className="text-2xl lg:text-3xl font-black text-white leading-tight mb-2 text-glow">{title} <span className="text-slate-500 text-xl font-normal">({year})</span></h2>
                 
                 {/* Stats Bar */}
                 <div className="flex flex-wrap gap-4 mb-6">
                    <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2">
                        <Trophy size={18} className="text-yellow-500" />
                        <div>
                            <div className="text-xl font-black text-yellow-400 leading-none">{totalWins}</div>
                            <div className="text-[9px] uppercase text-yellow-500/60 font-bold tracking-wider">Premios</div>
                        </div>
                    </div>
                    <div className="px-4 py-2 bg-slate-700/30 border border-white/10 rounded-lg flex items-center gap-2">
                        <div className="text-xl font-black text-slate-300 leading-none">{totalNoms}</div>
                        <div className="text-[9px] uppercase text-slate-500 font-bold tracking-wider">Nominaciones</div>
                    </div>
                    
                    {/* Ratings */}
                    {(catalogMatch?.["Your Rating"] || displayImdb) && (
                        <div className="flex items-center gap-4 px-4 border-l border-white/10">
                            {catalogMatch?.["Your Rating"] && (
                                <div className={`flex flex-col items-center ${ratingColor.text}`}>
                                    <span className="text-xl font-black flex items-center gap-1"><Star size={16} fill="currentColor" /> {catalogMatch["Your Rating"]}</span>
                                    <span className="text-[8px] uppercase opacity-60 font-bold">Mi Nota</span>
                                </div>
                            )}
                            {displayImdb && (
                                <a href={imdbUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center text-slate-300 hover:text-white transition-colors group/imdb">
                                    <span className="text-xl font-black flex items-center gap-1"><span className="text-yellow-500 font-serif font-bold text-xs border border-yellow-500 px-1 rounded-sm group-hover/imdb:border-yellow-400 transition-colors">IMDb</span> {displayImdb}</span>
                                    <span className="text-[8px] uppercase opacity-60 font-bold text-slate-500">Global</span>
                                </a>
                            )}
                        </div>
                    )}
                 </div>

                 {/* Links Toolbar */}
                 <div className="flex gap-2 mb-6">
                    <a href={imdbUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 rounded-md text-[10px] font-black uppercase tracking-wider transition-colors text-yellow-500 hover:text-yellow-400">
                        <ExternalLink size={14} /> IMDb
                    </a>
                    <a href={trailerUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-md text-[10px] font-black uppercase tracking-wider transition-colors text-red-400 hover:text-red-300">
                        <Youtube size={14} /> Trailer
                    </a>
                    <a href={reviewUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-[10px] font-black uppercase tracking-wider transition-colors text-slate-300 hover:text-white">
                        <BookOpen size={14} /> Reseña
                    </a>
                 </div>

                 {/* Nominations List */}
                 <div className="flex-1 overflow-hidden flex flex-col">
                     <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-1">Desglose de Nominaciones</h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 overflow-y-auto custom-scrollbar pr-2 flex-1 max-h-[300px]">
                         {sortedRows.map((r, i) => (
                             <div key={i} className={`flex items-center justify-between py-2 border-b border-white/5 px-2 ${r.IsWinner ? 'bg-yellow-500/5 rounded-lg' : ''}`}>
                                 <div className="min-w-0 pr-4">
                                     <div className={`text-[10px] font-black uppercase tracking-tight ${r.IsWinner ? 'text-yellow-300' : 'text-slate-200'}`}>{r.Category}</div>
                                     <div className="text-[10px] text-slate-500 truncate font-bold">{r.PersonName}</div>
                                 </div>
                                 {r.IsWinner ? (
                                     <span className="shrink-0 bg-yellow-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1 uppercase tracking-tighter">
                                         <Trophy size={8} fill="black"/> GANA
                                     </span>
                                 ) : (
                                     <span className="shrink-0 text-[8px] text-slate-700 font-black uppercase">NOM</span>
                                 )}
                             </div>
                         ))}
                     </div>
                 </div>
             </div>
         </div>
    </div>
  );
};

export default OscarMovieSummary;
