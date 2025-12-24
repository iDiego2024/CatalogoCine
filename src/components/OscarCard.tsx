import React, { useEffect, useState } from 'react';
import { OscarRow, ApiKeys, TmdbInfo, OmdbAwards } from '../types';
import { fetchTmdbInfo, getYoutubeTrailer, fetchOmdbAwards, getRatingColors } from '../utils';
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

  return (
    <div className={`group relative bg-[#050505] rounded-lg overflow-hidden transition-all duration-500 hover:z-20 hover:scale-105 hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] border ${item.IsWinner ? 'border-yellow-500/30' : 'border-white/5'} hover:border-white/20`}>
         
      {/* Poster */}
      <div className="aspect-[2/3] w-full bg-slate-900 relative overflow-hidden">
        {tmdb?.poster_url ? (
            <img src={tmdb.poster_url} alt={item.Film} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-700">
                <Film size={24} />
            </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
            {item.IsWinner && (
                <div className="bg-yellow-500 text-black text-[9px] font-black px-2 py-0.5 rounded shadow-lg flex items-center gap-1 uppercase tracking-wider">
                    <Trophy size={8} fill="black" /> Won
                </div>
            )}
            {item.InMyCatalog && (
                <div className="bg-green-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg flex items-center gap-1 uppercase tracking-wider">
                    <CheckCircle2 size={8} /> Visto
                </div>
            )}
        </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
        <h4 className="font-bold text-white text-[11px] leading-tight mb-0.5 text-glow truncate" title={item.Film}>{item.Film}</h4>
        <div className="text-[9px] font-bold text-slate-500 mb-2">{item.FilmYear}</div>
        
        {/* Ratings */}
        <div className="flex items-center gap-2 text-[10px] mb-2">
            {item.MyRating !== null && item.MyRating !== undefined && (
                <div className={`flex items-center gap-0.5 font-black ${colors.text}`}>
                    <Star size={10} fill="currentColor" /> {item.MyRating}
                </div>
            )}
            {omdbData?.imdbRating && (
                <div className="text-slate-500 flex items-center gap-0.5">
                   <span className="text-[8px] border border-yellow-500/30 px-0.5 rounded text-yellow-500 font-bold">IMDb</span> {omdbData.imdbRating}
                </div>
            )}
        </div>

        {/* Links Overlay */}
        <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-500 opacity-0 group-hover:opacity-100 border-t border-white/10 pt-2 mt-1">
            <div className="grid grid-cols-2 gap-2">
                 <a href={trailerUrl} target="_blank" rel="noreferrer" className="flex justify-center items-center py-1 bg-red-500/10 hover:bg-red-500/20 rounded text-red-500 transition-colors" title="Trailer">
                    <Youtube size={12} />
                 </a>
                 <a href={`https://www.google.com/search?q=${encodeURIComponent(item.Film + " " + item.FilmYear + " movie")}`} target="_blank" rel="noreferrer" className="flex justify-center items-center py-1 bg-white/10 hover:bg-white/20 rounded text-slate-400 transition-colors">
                    <BookOpen size={12} />
                 </a>
            </div>
        </div>
      </div>
      
      <div className={`absolute inset-0 border-2 ${item.IsWinner ? 'border-yellow-500/20' : 'border-transparent'} group-hover:border-white/10 rounded-lg pointer-events-none transition-colors duration-300`}></div>
    </div>
  );
};

export default OscarCard;