
import React, { useEffect, useState } from 'react';
import { Movie, TmdbInfo, ProviderInfo, OmdbAwards, ApiKeys } from '../types';
import { fetchTmdbInfo, fetchTmdbProviders, fetchOmdbAwards, getRatingColors, getYoutubeTrailer } from '../utils';
import { Film, Star, ExternalLink, PlayCircle, Youtube, BookOpen, Calendar, MonitorPlay } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  apiKeys: ApiKeys;
  showAwards?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, apiKeys, showAwards }) => {
  const [tmdb, setTmdb] = useState<TmdbInfo | null>(null);
  const [providers, setProviders] = useState<ProviderInfo | null>(null);
  const [awards, setAwards] = useState<OmdbAwards | null>(null);
  const [trailerId, setTrailerId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (apiKeys.tmdb) {
        fetchTmdbInfo(movie.Title, movie.Year, apiKeys.tmdb).then(info => {
            if (isMounted) {
                setTmdb(info);
                if (info) fetchTmdbProviders(info.id, apiKeys.tmdb).then(p => { if (isMounted) setProviders(p) });
            }
        });
    }
    if (showAwards && apiKeys.omdb) {
        fetchOmdbAwards(movie.Title, movie.Year, apiKeys.omdb).then(a => { if (isMounted) setAwards(a) });
    }
    if (apiKeys.youtube) {
        getYoutubeTrailer(movie.Title, movie.Year, apiKeys.youtube).then(id => { if (isMounted) setTrailerId(id) });
    }
    return () => { isMounted = false; };
  }, [movie, apiKeys, showAwards]);

  const rating = movie["Your Rating"] ?? movie["IMDb Rating"];
  const colors = getRatingColors(rating);

  const reviewUrl = `https://www.google.com/search?q=reseña+película+${encodeURIComponent(movie.Title + " " + (movie.Year || ""))}`;
  const trailerUrl = trailerId 
    ? `https://www.youtube.com/watch?v=${trailerId}` 
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.Title + " trailer")}`;

  return (
    <div className="group relative bg-[#050505] rounded-xl overflow-hidden shadow-lg transition-all duration-500 hover:z-20 hover:scale-[1.03] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.9)] border border-white/5 hover:border-white/20">
         
      {/* Poster Image */}
      <div className="aspect-[2/3] w-full bg-slate-900 relative overflow-hidden">
        {tmdb?.poster_url ? (
            <img src={tmdb.poster_url} alt={movie.Title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:saturate-[1.2]" loading="lazy" />
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-700">
                <Film size={40} />
                <span className="text-xs uppercase tracking-widest mt-2 font-bold opacity-50">Sin Imagen</span>
            </div>
        )}
        
        {/* Dark Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
        
        {/* --- Top Badges (Always Visible) --- */}
        <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start">
            {/* Awards Badge */}
            <div className="flex flex-col gap-1">
                {awards?.oscars ? (
                    <span className="bg-yellow-500 text-black text-[10px] font-black px-2 py-1 rounded shadow-lg flex items-center gap-1 animate-in fade-in slide-in-from-top-2">
                        <span className="text-xs">🏆</span> {awards.oscars}
                    </span>
                ) : null}
            </div>

            {/* My Rating Badge (Prominent) */}
            {movie["Your Rating"] && (
                <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg shadow-xl backdrop-blur-md border border-white/10 ${colors.text} bg-black/60`}>
                    <Star size={14} fill="currentColor" />
                    <span className="text-sm font-black text-white">{movie["Your Rating"]}</span>
                </div>
            )}
        </div>
      </div>

      {/* --- Content Overlay (Slide Up Effect) --- */}
      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ease-out">
        
        {/* Title */}
        <h3 className="font-bold text-white text-lg leading-tight mb-1 text-shadow-sm line-clamp-2 group-hover:text-accent transition-colors">
            {movie.Title}
        </h3>
        
        {/* Metadata Line */}
        <div className="flex items-center gap-3 text-xs font-medium text-slate-300 mb-3">
             <span className="flex items-center gap-1 opacity-80"><Calendar size={12}/> {movie.Year}</span>
             {movie["IMDb Rating"] && (
                 <span className="flex items-center gap-1 text-yellow-500/90 bg-yellow-500/10 px-1.5 rounded border border-yellow-500/20">
                     <span className="font-bold">IMDb</span> {movie["IMDb Rating"]}
                 </span>
             )}
        </div>

        {/* --- Expanded Details (Visible on Hover) --- */}
        <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 overflow-hidden transition-all duration-500 delay-75">
            
            {/* Director & Genre */}
            <div className="text-[11px] text-slate-400 space-y-1 mb-4 border-t border-white/10 pt-2">
                <p className="truncate"><span className="text-slate-600 font-bold uppercase tracking-wider">Dir:</span> {movie.Directors}</p>
                <p className="truncate"><span className="text-slate-600 font-bold uppercase tracking-wider">Gén:</span> {movie.Genres}</p>
            </div>

            {/* --- Large Action Buttons --- */}
            <div className="flex items-center justify-between gap-2 mt-2">
                 <a href={trailerUrl} target="_blank" rel="noreferrer" 
                    className="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 hover:bg-red-600 hover:text-white text-slate-400 transition-all group/btn" title="Ver Trailer">
                    <Youtube size={20} className="group-hover/btn:scale-110 transition-transform"/>
                    <span className="text-[9px] font-bold uppercase tracking-wider">Trailer</span>
                 </a>

                 <a href={reviewUrl} target="_blank" rel="noreferrer" 
                    className="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 hover:bg-green-600 hover:text-white text-slate-400 transition-all group/btn" title="Buscar Reseña">
                    <BookOpen size={20} className="group-hover/btn:scale-110 transition-transform"/>
                    <span className="text-[9px] font-bold uppercase tracking-wider">Reseña</span>
                 </a>

                 {providers?.link && (
                    <a href={providers.link} target="_blank" rel="noreferrer" 
                        className="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 hover:bg-sky-600 hover:text-white text-slate-400 transition-all group/btn" title="Ver Online">
                        <MonitorPlay size={20} className="group-hover/btn:scale-110 transition-transform"/>
                        <span className="text-[9px] font-bold uppercase tracking-wider">Stream</span>
                    </a>
                 )}
                 
                 {movie.URL && (
                    <a href={movie.URL} target="_blank" rel="noreferrer" 
                        className="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 hover:bg-yellow-500 hover:text-black text-slate-400 transition-all group/btn" title="Ficha IMDb">
                        <ExternalLink size={20} className="group-hover/btn:scale-110 transition-transform"/>
                        <span className="text-[9px] font-bold uppercase tracking-wider">Ficha</span>
                    </a>
                 )}
            </div>
        </div>
      </div>
      
      {/* Selection Border Glow */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/10 rounded-xl pointer-events-none transition-colors duration-300"></div>
    </div>
  );
};

export default MovieCard;
