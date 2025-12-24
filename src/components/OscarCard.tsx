
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
    <div className={`group relative bg-[#050505] rounded-lg overflow-hidden transition-all duration-500 hover:z-20 hover:scale-105 hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] border ${item.IsWinner ? 'border-yellow-500/30' : 'border-white/5'} hover:border-white/20 flex flex-col h-full`}>
         
      {/* Poster & Badges Area */}
      <div className="aspect-[2/3] w-full bg-slate-900 relative overflow-hidden shrink-0">
        {tmdb?.poster_url ? (
            <img src={tmdb.poster_url} alt={item.Film} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-700">
                <Film size={24} />
            </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
        
        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-20">
            {item.IsWinner && (
                <div className="bg-yellow-500 text-black text-[8px] font-black px-2 py-0.5 rounded shadow-xl flex items-center gap-1 uppercase tracking-wider">
                    <Trophy size={8} fill="black" /> Ganador
                </div>
            )}
            {item.InMyCatalog && (
                <div className="bg-green-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-xl flex items-center gap-1 uppercase tracking-wider">
                    <CheckCircle2 size={8} /> Visto
                </div>
            )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3 flex flex-col flex-1 bg-black/40 relative">
        <h4 className={`font-black text-[11px] leading-tight mb-1 text-glow uppercase tracking-wide ${item.IsWinner ? 'text-yellow-400' : 'text-slate-100'}`} title={item.PersonName}>
            {item.PersonName}
        </h4>
        <div className="text-[9px] font-bold text-slate-400 mb-2 italic truncate" title={item.Film}>
            {item.Film} ({item.FilmYear})
        </div>
        
        {/* Ratings */}
        <div className="flex items-center gap-2 mb-3">
            {item.MyRating !== null && item.MyRating !== undefined ? (
                <div className={`flex items-center gap-0.5 text-[9px] font-black ${colors.text} bg-white/5 px-1.5 py-0.5 rounded`}>
                    <Star size={8} fill="currentColor" /> {item.MyRating}
                </div>
            ) : (
                <div className="text-[8px] font-bold text-slate-600 uppercase">Sin nota</div>
            )}
            
            {omdbData?.imdbRating && (
                <a href={imdbUrl} target="_blank" rel="noreferrer" className="text-slate-400 flex items-center gap-0.5 hover:text-white transition-colors group/imdb bg-white/5 px-1.5 py-0.5 rounded">
                   <span className="text-[7px] text-yellow-500 font-bold">IMDb</span> 
                   <span className="text-[9px] font-black">{omdbData.imdbRating}</span>
                </a>
            )}
        </div>

        {/* Links Footer */}
        <div className="mt-auto pt-2 border-t border-white/5 flex items-center justify-between gap-1">
             <a href={imdbUrl} target="_blank" rel="noreferrer" className="flex-1 flex justify-center items-center py-1.5 bg-white/5 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors" title="IMDb">
                <ExternalLink size={11} />
             </a>
             <a href={trailerUrl} target="_blank" rel="noreferrer" className="flex-1 flex justify-center items-center py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded text-red-500 transition-colors" title="Trailer">
                <Youtube size={12} />
             </a>
             <a href={`https://www.google.com/search?q=${encodeURIComponent(item.Film + " " + item.FilmYear + " movie review")}`} target="_blank" rel="noreferrer" className="flex-1 flex justify-center items-center py-1.5 bg-white/5 hover:bg-white/10 rounded text-slate-400 transition-colors" title="Buscar">
                <BookOpen size={11} />
             </a>
        </div>
      </div>
    </div>
  );
};

export default OscarCard;
