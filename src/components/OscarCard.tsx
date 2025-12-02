
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
    // Fetch OMDb to get universal IMDb rating if needed
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

  // IMDb: Prioritize catalog data, fallback to API
  const displayImdb = item.MyIMDb !== undefined && item.MyIMDb !== null
     ? item.MyIMDb 
     : (omdbData?.imdbRating ? parseFloat(omdbData.imdbRating) : null);

  return (
    <div className={`
        group relative flex flex-col h-full rounded-xl overflow-hidden transition-all duration-300 border
        ${item.IsWinner 
            ? 'bg-gradient-to-b from-yellow-900/20 to-black/90 border-yellow-500/40 shadow-[0_0_25px_rgba(234,179,8,0.15)]' 
            : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'}
    `}>
        {/* Glow for winner */}
        {item.IsWinner && (
            <div className="absolute inset-0 bg-yellow-500/5 pointer-events-none animate-pulse-slow"></div>
        )}

        {/* Poster Section (Vertical) */}
        <div className="aspect-[2/3] w-full bg-black relative overflow-hidden">
            {tmdb?.poster_url ? (
                <img src={tmdb.poster_url} alt={item.Film} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-700">
                    <Film size={32} />
                </div>
            )}
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>

            {/* Winner Badge on Poster */}
            {item.IsWinner && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-black text-[10px] font-black px-2 py-1 rounded shadow-lg z-20 flex items-center gap-1 uppercase tracking-wide">
                   <Trophy size={10} fill="black" /> Winner
                </div>
            )}

            {/* Catalog Status Badge */}
            {item.InMyCatalog && (
                <div className="absolute top-2 left-2 bg-green-500/90 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg z-20 flex items-center gap-1 uppercase tracking-wide backdrop-blur-sm">
                   <CheckCircle2 size={10} /> Visto
                </div>
            )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 flex flex-col relative z-10 -mt-12">
            
            {/* Title & Nominee Info */}
            <div className="mb-3">
                <h4 className={`font-bold text-lg leading-tight mb-1 text-glow line-clamp-2 ${item.IsWinner ? 'text-yellow-100' : 'text-slate-100'}`}>
                    {item.Film}
                </h4>
                
                {/* Specific Nominee (Director, Actor, etc.) */}
                {item.PersonName !== item.Film && (
                    <div className="text-xs text-slate-400 font-medium truncate flex items-center gap-1.5 mt-1 border-l-2 border-white/20 pl-2">
                        {item.PersonName}
                    </div>
                )}
            </div>

            {/* Ratings Row */}
            <div className="flex items-center gap-3 mb-4">
                {/* My Rating */}
                {item.InMyCatalog && item.MyRating !== null && item.MyRating !== undefined && (
                    <div className="flex items-center gap-1 text-xs font-black text-accent">
                        <Star size={12} fill="currentColor" />
                        {item.MyRating}
                    </div>
                )}
                
                {/* Universal IMDb */}
                {displayImdb !== null ? (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-white/10 px-1.5 py-0.5 rounded border border-white/10">
                        <span className="text-yellow-500">IMDb</span>
                        {displayImdb}
                    </div>
                ) : (
                    <span className="text-[10px] text-slate-600">IMDb --</span>
                )}
            </div>

            {/* Actions Footer */}
            <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3">
                <div className="flex gap-2">
                    <a href={reviewUrl} target="_blank" rel="noreferrer" 
                       className="p-2 rounded-lg bg-white/5 hover:bg-white/20 text-slate-400 hover:text-white transition-colors" 
                       title="Leer Reseña">
                        <BookOpen size={14} />
                    </a>
                    <a href={trailerUrl} target="_blank" rel="noreferrer" 
                       className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors" 
                       title="Ver Trailer">
                        <Youtube size={14} />
                    </a>
                </div>
            </div>
        </div>
    </div>
  );
};

export default OscarCard;
