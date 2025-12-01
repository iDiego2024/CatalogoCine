
import React, { useEffect, useState } from 'react';
import { OscarRow, ApiKeys, TmdbInfo, OmdbAwards } from '../types';
import { fetchTmdbInfo, getYoutubeTrailer, fetchOmdbAwards } from '../utils';
import { Star, Youtube, BookOpen, Film, CheckCircle2, Trophy } from 'lucide-react';

interface OscarCardProps {
  item: OscarRow;
  apiKeys: ApiKeys;
}

const OscarCard: React.FC<OscarCardProps> = ({ item, apiKeys }) => {
  const [tmdb, setTmdb] = useState<TmdbInfo | null>(null);
  const [trailerId, setTrailerId] = useState<string | null>(null);
  const [omdbData, setOmdbData] = useState<OmdbAwards | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (apiKeys.tmdb) {
        fetchTmdbInfo(item.Film, item.FilmYear, apiKeys.tmdb).then(info => {
            if (isMounted) setTmdb(info);
        });
    }
    if (apiKeys.youtube) {
        getYoutubeTrailer(item.Film, item.FilmYear, apiKeys.youtube).then(id => {
            if (isMounted) setTrailerId(id);
        });
    }
    // Fetch OMDb for ratings if not in catalog or just to have data
    if (apiKeys.omdb) {
        fetchOmdbAwards(item.Film, item.FilmYear, apiKeys.omdb).then(data => {
            if (isMounted) setOmdbData(data);
        });
    }

    return () => { isMounted = false; };
  }, [item.Film, item.FilmYear, apiKeys]);

  const reviewUrl = `https://www.google.com/search?q=reseña+película+${encodeURIComponent(item.Film + " " + (item.FilmYear || ""))}`;
  const trailerUrl = trailerId 
    ? `https://www.youtube.com/watch?v=${trailerId}` 
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(item.Film + " trailer")}`;

  // Determine which IMDb rating to show (Catalog priority > API fallback)
  const displayImdb = item.MyIMDb !== undefined && item.MyIMDb !== null
     ? item.MyIMDb 
     : (omdbData?.imdbRating ? parseFloat(omdbData.imdbRating) : null);

  return (
    <div className={`
        group relative flex gap-4 p-3 rounded-xl border transition-all duration-300 overflow-hidden
        ${item.IsWinner 
            ? 'bg-gradient-to-r from-yellow-900/20 to-black/80 border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.1)]' 
            : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'}
    `}>
        {/* Glow for winner */}
        {item.IsWinner && (
            <div className="absolute inset-0 bg-yellow-500/5 pointer-events-none animate-pulse-slow"></div>
        )}

        {/* Poster */}
        <div className="w-20 h-28 shrink-0 bg-black rounded-lg shadow-lg overflow-hidden relative z-10">
            {tmdb?.poster_url ? (
                <img src={tmdb.poster_url} alt={item.Film} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-700">
                    <Film size={20} />
                </div>
            )}
            
            {/* Winner Badge on Poster */}
            {item.IsWinner && (
                <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[9px] font-black px-1.5 py-0.5 shadow-sm z-20 flex items-center gap-1">
                   <Trophy size={8} fill="black" /> WIN
                </div>
            )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col relative z-10 py-1">
            {/* Title & Nominee */}
            <div>
                <h4 className={`font-bold text-sm leading-tight mb-1 truncate ${item.IsWinner ? 'text-yellow-100' : 'text-slate-200'}`}>
                    {item.Film}
                </h4>
                <div className="text-xs text-slate-400 font-medium truncate mb-2 flex items-center gap-1.5">
                    {item.PersonName !== item.Film ? (
                         <>
                            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                            {item.PersonName}
                         </>
                    ) : (
                        <span className="text-slate-600 italic">Película</span>
                    )}
                </div>
            </div>

            {/* Ratings Grid */}
            <div className="flex items-center gap-3 mb-2">
                {/* My Rating (Only if in catalog) */}
                {item.InMyCatalog && item.MyRating !== null && item.MyRating !== undefined && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20">
                        <Star size={10} fill="currentColor" />
                        {item.MyRating}
                    </div>
                )}
                
                {/* IMDb Rating (Catalog or API) */}
                {displayImdb !== null && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                        <span className="text-yellow-500">IMDb</span>
                        {displayImdb}
                    </div>
                )}
            </div>

            {/* Actions / Footer */}
            <div className="mt-auto pt-2 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <a href={reviewUrl} target="_blank" rel="noreferrer" 
                       className="p-1.5 rounded-md hover:bg-white/10 text-slate-500 hover:text-white transition-colors" 
                       title="Leer Reseña">
                        <BookOpen size={12} />
                    </a>
                    <a href={trailerUrl} target="_blank" rel="noreferrer" 
                       className="p-1.5 rounded-md hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-colors" 
                       title="Ver Trailer">
                        <Youtube size={12} />
                    </a>
                </div>
                
                {item.InMyCatalog ? (
                     <div className="text-[10px] font-bold text-green-500/80 flex items-center gap-1">
                         <CheckCircle2 size={10} /> En catálogo
                     </div>
                ) : (
                    <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                        No visto
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default OscarCard;
