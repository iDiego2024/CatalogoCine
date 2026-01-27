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
    <div className={`group relative bg-[#050505] rounded-xl overflow-hidden transition-all duration-500 hover:z-20 hover:scale-105 hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] border ${item.IsWinner ? 'border-yellow-500/30' : 'border-white/5'} hover:border-white/20`}>
         
      {/* Poster Area */}
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
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-20">
            {item.IsWinner && (
                <div className="bg-yellow-500 text-black text-[8px] font-black px-2 py-0.5 rounded shadow-lg flex items-center gap-1 uppercase tracking-wider">
                    <Trophy size={10} fill="black" /> Ganador
                </div>
            )}
            {item.InMyCatalog && (
                <div className="bg-green-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-lg flex items-center gap-1 uppercase tracking-wider">
                    <CheckCircle2 size={10} /> Visto
                </div>
            )}
        </div>
      </div>

      {/* Content Area */}
      <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
        <h4 className="font-black text-white text-[11px] leading-tight mb-0.5 text-glow uppercase tracking-wide truncate" title={item.PersonName}>
            {item.PersonName}
        </h4>
        <div className="text-[9px] font-bold text-slate-400 mb-2 truncate" title={item.Film}>
            {item.Film} ({item.FilmYear})
        </div>
        
        {/* Ratings Section */}
        <div className="flex items-center gap-2 text-[10px] mb-3 opacity-0 group-hover:opacity-100 transition-opacity">
            {item.MyRating !== null && item.MyRating !== undefined && (
                <div className={`flex items-center gap-0.5 font-black ${colors.text} bg-white/5 px-1.5 py-0.5 rounded`}>
                    <Star size={10} fill="currentColor" /> {item.MyRating}
                </div>
            )}
            {(omdbData?.imdbRating || item.MyIMDb) && (
                <div className="text-slate-500 flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded">
                   <span className="text-[8px] text-yellow-500 font-bold uppercase">IMDb</span> 
                   <span className="font-black text-slate-300">{item.MyIMDb || omdbData?.imdbRating}</span>
                </div>
            )}
        </div>

        {/* Action Toolbar */}
        <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-500 opacity-0 group-hover:opacity-100 border-t border-white/10 pt-2 mt-1">
            <div className="grid grid-cols-3 gap-1.5">
                 <a href={imdbUrl} target="_blank" rel="noreferrer" className="flex justify-center items-center py-1.5 bg-white/10 hover:bg-white/20 rounded text-slate-300 transition-colors" title="Ver en IMDb">
                    <ExternalLink size={12} />
                 </a>
                 <a href={trailerUrl} target="_blank" rel="noreferrer" className="flex justify-center items-center py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded text-red-500 transition-colors" title="Ver Trailer">
                    <Youtube size={12} />
                 </a>
                 <a href={`https://www.google.com/search?q=${encodeURIComponent(item.Film + " " + item.FilmYear + " movie awards")}`} target="_blank" rel="noreferrer" className="flex justify-center items-center py-1.5 bg-white/10 hover:bg-white/20 rounded text-slate-400 transition-colors" title="Más Info">
                    <BookOpen size={12} />
                 </a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OscarCard;