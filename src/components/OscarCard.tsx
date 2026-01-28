
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

  // Determine Public Rating (IMDb priority -> TMDb fallback)
  let publicRating: string | number | null = null;
  let publicSource: 'IMDb' | 'TMDb' | null = null;

  if (item.MyIMDb) {
      publicRating = item.MyIMDb;
      publicSource = 'IMDb';
  } else if (omdbData?.imdbRating && omdbData.imdbRating !== "N/A") {
      publicRating = omdbData.imdbRating;
      publicSource = 'IMDb';
  } else if (tmdb?.vote_average) {
      publicRating = tmdb.vote_average.toFixed(1);
      publicSource = 'TMDb';
  }

  return (
    <div className={`group relative bg-[#050505] rounded-xl overflow-hidden transition-all duration-500 hover:z-20 hover:scale-105 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] border ${item.IsWinner ? 'border-yellow-500/30' : 'border-white/5'} hover:border-white/20 p-3 flex gap-4`}>
         
      {/* Poster (w-24 h-36) */}
      <div className="w-24 h-36 shrink-0 bg-slate-900 relative overflow-hidden shadow-lg rounded-lg border border-white/5">
        {tmdb?.poster_url ? (
            <img src={tmdb.poster_url} alt={item.Film} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-700">
                <Film size={24} />
            </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        {item.IsWinner && (
            <div className="absolute top-0 right-0 bg-yellow-500 text-black p-1 shadow-lg z-20 rounded-bl-lg">
                <Trophy size={14} fill="black" />
            </div>
        )}
        {item.InMyCatalog && (
            <div className="absolute bottom-0 left-0 bg-green-600 text-white p-1 shadow-lg z-20 rounded-tr-lg">
                <CheckCircle2 size={12} />
            </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between py-0.5 flex-1 min-w-0">
        <div>
            <h4 className="font-bold text-white text-sm leading-tight mb-1.5 line-clamp-2 group-hover:text-accent transition-colors" title={item.PersonName}>
                {item.PersonName}
            </h4>
            <div className="text-xs font-medium text-slate-400 line-clamp-2 leading-relaxed" title={item.Film}>
                {item.Film}
            </div>
        </div>
        
        {/* Ratings & Actions */}
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs">
                {item.MyRating !== null && item.MyRating !== undefined && (
                    <div className={`flex items-center gap-1 font-black ${colors.text} bg-white/5 px-2 py-1 rounded`}>
                        <Star size={12} fill="currentColor" /> {item.MyRating}
                    </div>
                )}
                
                {/* Public Rating Display */}
                {publicRating && (
                    <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded text-slate-400">
                       <span className={`text-[10px] font-bold ${publicSource === 'IMDb' ? 'text-yellow-600' : 'text-sky-500'}`}>{publicSource}</span> 
                       <span className="font-bold text-slate-300 text-[11px]">{publicRating}</span>
                    </div>
                )}
            </div>

            {/* Micro Links */}
            <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300 border-t border-white/5 pt-2">
                 <a href={imdbUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded" title="Ficha">
                    <ExternalLink size={12} /> Ficha
                 </a>
                 <a href={trailerUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-red-400 transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded" title="Trailer">
                    <Youtube size={12} /> Trailer
                 </a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OscarCard;
