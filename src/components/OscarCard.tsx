
import React, { useEffect, useState } from 'react';
import { OscarRow, ApiKeys, TmdbInfo, OmdbAwards } from '../types';
import { fetchTmdbInfo, getYoutubeTrailer, fetchOmdbAwards, getRatingColors } from '../utils';
import { Star, Youtube, BookOpen, Film, CheckCircle2, Trophy, ExternalLink } from 'lucide-react';

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
    if (apiKeys.omdb) {
        fetchOmdbAwards(item.Film, item.FilmYear, apiKeys.omdb).then(data => {
            if (isMounted) setOmdbData(data);
        });
    }
    return () => { isMounted = false; };
  }, [item.Film, item.FilmYear, apiKeys]);

  const trailerUrl = trailerId 
    ? `https://www.youtube.com/watch?v=${trailerId}` 
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(item.Film + " trailer")}`;

  const rating = item.MyRating ?? (omdbData?.imdbRating ? parseFloat(omdbData.imdbRating) : null);
  const colors = getRatingColors(rating);
  const imdbUrl = item.CatalogURL || `https://www.imdb.com/find?q=${encodeURIComponent(item.Film + " " + item.FilmYear)}`;

  return (
    <div className={`group relative bg-[#050505] rounded-lg overflow-hidden transition-all duration-500 hover:z-20 hover:scale-105 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] border ${item.IsWinner ? 'border-yellow-500/30' : 'border-white/5'} hover:border-white/20`}>
         
      {/* Poster (Optimized Size) */}
      <div className="w-14 h-20 shrink-0 bg-slate-900 relative overflow-hidden float-left mr-3 shadow-md">
        {tmdb?.poster_url ? (
            <img src={tmdb.poster_url} alt={item.Film} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-700">
                <Film size={16} />
            </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        {item.IsWinner && (
            <div className="absolute top-0 right-0 bg-yellow-500 text-black p-0.5 shadow-lg z-20">
                <Trophy size={10} fill="black" />
            </div>
        )}
        {item.InMyCatalog && (
            <div className="absolute bottom-0 left-0 bg-green-600 text-white p-0.5 shadow-lg z-20">
                <CheckCircle2 size={8} />
            </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2 pl-0 flex flex-col h-20 justify-between">
        <div>
            <h4 className="font-bold text-white text-[11px] leading-tight mb-0.5 line-clamp-2" title={item.PersonName}>
                {item.PersonName}
            </h4>
            <div className="text-[9px] font-medium text-slate-400 line-clamp-1" title={item.Film}>
                {item.Film}
            </div>
        </div>
        
        {/* Ratings & Actions */}
        <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2 text-[10px]">
                {item.MyRating !== null && item.MyRating !== undefined && (
                    <div className={`flex items-center gap-0.5 font-black ${colors.text}`}>
                        <Star size={8} fill="currentColor" /> {item.MyRating}
                    </div>
                )}
                {(omdbData?.imdbRating || item.MyIMDb) && (
                    <div className="text-slate-500 flex items-center gap-0.5">
                       <span className="text-[8px] text-yellow-600 font-bold">IMDb</span> 
                       <span className="font-bold text-slate-400 text-[9px]">{item.MyIMDb || omdbData?.imdbRating}</span>
                    </div>
                )}
            </div>

            {/* Micro Links */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 <a href={imdbUrl} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors" title="IMDb">
                    <ExternalLink size={10} />
                 </a>
                 <a href={trailerUrl} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-red-500 transition-colors" title="Trailer">
                    <Youtube size={10} />
                 </a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OscarCard;
