import React, { useEffect, useState } from 'react';
import { Movie, TmdbInfo, ProviderInfo, OmdbAwards, ApiKeys } from '../types';
import { fetchTmdbInfo, fetchTmdbProviders, fetchOmdbAwards, getRatingColors, getYoutubeTrailer } from '../utils';
import { Film, Star, ExternalLink, PlayCircle, Youtube, BookOpen } from 'lucide-react';

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
    if (apiKeys.tmdb) {
        fetchTmdbInfo(movie.Title, movie.Year, apiKeys.tmdb).then(info => {
            setTmdb(info);
            if (info) fetchTmdbProviders(info.id, apiKeys.tmdb).then(setProviders);
        });
    }
    if (showAwards && apiKeys.omdb) {
        fetchOmdbAwards(movie.Title, movie.Year, apiKeys.omdb).then(setAwards);
    }
    if (apiKeys.youtube) {
        getYoutubeTrailer(movie.Title, movie.Year, apiKeys.youtube).then(setTrailerId);
    }
  }, [movie, apiKeys, showAwards]);

  const rating = movie["Your Rating"] ?? movie["IMDb Rating"];
  const colors = getRatingColors(rating);

  const reviewUrl = `https://www.google.com/search?q=reseña+película+${encodeURIComponent(movie.Title + " " + (movie.Year || ""))}`;
  const trailerUrl = trailerId 
    ? `https://www.youtube.com/watch?v=${trailerId}` 
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.Title + " trailer")}`;

  return (
    <div className="group relative bg-[#050505] rounded-lg overflow-hidden transition-all duration-500 hover:z-20 hover:scale-105 hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] border border-white/5 hover:border-white/20">
         
      {/* Poster */}
      <div className="aspect-[2/3] w-full bg-slate-900 relative overflow-hidden">
        {tmdb?.poster_url ? (
            <img src={tmdb.poster_url} alt={movie.Title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:saturate-150" loading="lazy" />
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-700">
                <Film size={32} />
                <span className="text-[10px] uppercase tracking-widest mt-2 font-bold opacity-50">No Image</span>
            </div>
        )}
        
        {/* Cinematic Gradient Overlay (Always visible but stronger on hover) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
        
        {/* Top Badges */}
        <div className="absolute top-0 left-0 p-2 flex gap-1 flex-wrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-y-2 group-hover:translate-y-0">
            {awards?.oscars ? <span className="bg-yellow-500 text-black text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wide shadow-lg shadow-yellow-500/20">🏆 {awards.oscars}</span> : null}
            {awards?.palme_dor ? <span className="bg-green-600 text-white text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wide shadow-lg">🌿 Palma</span> : null}
        </div>
      </div>

      {/* Content Slide-up on Hover */}
      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="font-bold text-white text-sm leading-tight mb-1 text-glow drop-shadow-md line-clamp-2">{movie.Title}</h3>
        <div className="text-[10px] font-bold text-slate-400 mb-2">{movie.Year}</div>
        
        {/* Ratings - visible on hover primarily, or simplified */}
        <div className="flex items-center gap-3 text-xs mb-3 opacity-80 group-hover:opacity-100 transition-opacity">
            {movie["Your Rating"] && (
                <div className={`flex items-center gap-1 font-black ${colors.text}`}>
                    <Star size={12} fill="currentColor" /> {movie["Your Rating"]}
                </div>
            )}
            {movie["IMDb Rating"] && (
                <a href={movie.URL} target="_blank" rel="noreferrer" className="text-slate-400 flex items-center gap-1 hover:text-white transition-colors group/imdb">
                   <span className="font-bold text-yellow-500/80 text-[10px] border border-yellow-500/30 px-1 rounded group-hover/imdb:border-yellow-500">IMDb</span> {movie["IMDb Rating"]}
                </a>
            )}
        </div>

        {/* Detailed Info (Revealed on Hover) */}
        <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-500 opacity-0 group-hover:opacity-100">
            <div className="text-[10px] text-slate-300 space-y-1 mb-3 pt-2 border-t border-white/10">
                <p className="line-clamp-1"><span className="text-slate-500 uppercase tracking-wider text-[9px]">Gén:</span> {movie.Genres}</p>
                <p className="line-clamp-1"><span className="text-slate-500 uppercase tracking-wider text-[9px]">Dir:</span> {movie.Directors}</p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-4 gap-1 text-[9px] uppercase tracking-wide font-bold mt-2">
                 {movie.URL && (
                     <a href={movie.URL} target="_blank" rel="noreferrer" className="col-span-1 flex justify-center items-center py-1.5 bg-white/10 hover:bg-white/20 rounded text-slate-300 hover:text-white transition-colors">
                        <ExternalLink size={10} />
                     </a>
                 )}
                 {providers?.link && (
                     <a href={providers.link} target="_blank" rel="noreferrer" className="col-span-1 flex justify-center items-center py-1.5 bg-sky-500/20 hover:bg-sky-500/30 rounded text-sky-400 hover:text-sky-200 transition-colors">
                        <PlayCircle size={10} />
                     </a>
                 )}
                 <a href={reviewUrl} target="_blank" rel="noreferrer" className="col-span-1 flex justify-center items-center py-1.5 bg-green-500/20 hover:bg-green-500/30 rounded text-green-400 hover:text-green-200 transition-colors" title="Reseña">
                    <BookOpen size={10} />
                 </a>
                 <a href={trailerUrl} target="_blank" rel="noreferrer" className="col-span-1 flex justify-center items-center py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400 hover:text-red-200 transition-colors" title="Trailer">
                    <Youtube size={10} />
                 </a>
            </div>
        </div>
      </div>
      
      {/* Active Selection Glow */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/10 rounded-lg pointer-events-none transition-colors duration-300"></div>
    </div>
  );
};

export default MovieCard;