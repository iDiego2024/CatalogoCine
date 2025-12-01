import React, { useMemo, useState } from 'react';
import { Movie, OscarRow } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  AreaChart, Area, ScatterChart, Scatter, Cell, ReferenceLine
} from 'recharts';
import { 
  Trophy, TrendingUp, TrendingDown, Users, Film, PieChart, 
  Activity, Award, Clock, Star, ThumbsUp, ThumbsDown 
} from 'lucide-react';

interface AnalysisViewProps {
  movies: Movie[];
  oscarData: OscarRow[];
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ movies, oscarData }) => {
  const [subTab, setSubTab] = useState<'overview' | 'directors' | 'genres' | 'controversy'>('overview');

  // ==================== DATA PROCESSING ====================
  const stats = useMemo(() => {
    if (movies.length === 0) return null;

    // Basic Stats
    const totalCount = movies.length;
    const ratedMovies = movies.filter(m => m["Your Rating"] !== null);
    const avgRating = ratedMovies.reduce((acc, m) => acc + (m["Your Rating"] || 0), 0) / ratedMovies.length || 0;
    const totalHoursEst = totalCount * 1.9; // Est 1.9 hours per movie

    // Distribution by Rating (1-10)
    const ratingDist = Array.from({ length: 10 }, (_, i) => ({ rating: i + 1, count: 0 }));
    ratedMovies.forEach(m => {
      const r = Math.round(m["Your Rating"] || 0);
      if (r >= 1 && r <= 10) ratingDist[r - 1].count++;
    });

    // Distribution by Year (Decades)
    const yearsMap: Record<string, { year: number, count: number, avg: number, total: number }> = {};
    ratedMovies.forEach(m => {
      if (m.Year) {
        if (!yearsMap[m.Year]) yearsMap[m.Year] = { year: m.Year, count: 0, avg: 0, total: 0 };
        yearsMap[m.Year].count++;
        yearsMap[m.Year].total += m["Your Rating"] || 0;
      }
    });
    const yearChartData = Object.values(yearsMap)
        .map(d => ({ year: d.year, count: d.count, avg: d.total / d.count }))
        .sort((a, b) => a.year - b.year);

    // Directors Analysis
    const directorMap: Record<string, { count: number, totalRating: number }> = {};
    ratedMovies.forEach(m => {
        m.Directors.split(',').map(d => d.trim()).filter(Boolean).forEach(d => {
            if (!directorMap[d]) directorMap[d] = { count: 0, totalRating: 0 };
            directorMap[d].count++;
            directorMap[d].totalRating += m["Your Rating"] || 0;
        });
    });
    const directorStats = Object.entries(directorMap)
        .map(([name, d]) => ({ name, count: d.count, avg: d.totalRating / d.count }))
        .filter(d => d.count >= 2); // Minimum 2 movies to be relevant

    const topDirectorsByCount = [...directorStats].sort((a, b) => b.count - a.count).slice(0, 10);
    const topDirectorsByRating = [...directorStats].filter(d => d.count >= 3).sort((a, b) => b.avg - a.avg).slice(0, 10);

    // Genres Analysis
    const genreMap: Record<string, { count: number, totalRating: number }> = {};
    ratedMovies.forEach(m => {
        m.GenreList.forEach(g => {
            if (!genreMap[g]) genreMap[g] = { count: 0, totalRating: 0 };
            genreMap[g].count++;
            genreMap[g].totalRating += m["Your Rating"] || 0;
        });
    });
    const genreStats = Object.entries(genreMap)
        .map(([name, d]) => ({ name, count: d.count, avg: d.totalRating / d.count }))
        .sort((a, b) => b.count - a.count);

    // Controversy (Diff between Your Rating and IMDb)
    const comparisons = movies
        .filter(m => m["Your Rating"] !== null && m["IMDb Rating"] !== null)
        .map(m => ({
            ...m,
            diff: (m["Your Rating"] || 0) - (m["IMDb Rating"] || 0)
        }))
        .sort((a, b) => b.diff - a.diff);

    const underrated = comparisons.slice(0, 10); // You rated higher
    const overrated = comparisons.slice().reverse().slice(0, 10); // You rated lower
    
    // Oscar Cross-Ref
    const oscarWinsMap: Record<string, number> = {};
    oscarData.filter(o => o.IsWinner).forEach(o => {
        if(o.NormFilm) oscarWinsMap[o.NormFilm] = (oscarWinsMap[o.NormFilm] || 0) + 1;
    });
    
    const myOscarMovies = movies
        .map(m => ({ ...m, wins: oscarWinsMap[m.NormTitle] || 0 }))
        .filter(m => m.wins > 0)
        .sort((a, b) => b.wins - a.wins)
        .slice(0, 10);

    return {
        totalCount,
        avgRating,
        totalHoursEst,
        ratingDist,
        yearChartData,
        topDirectorsByCount,
        topDirectorsByRating,
        genreStats,
        underrated,
        overrated,
        scatterData: comparisons,
        myOscarMovies
    };
  }, [movies, oscarData]);

  if (!stats) return <div className="p-10 text-center text-slate-500">Cargando análisis...</div>;

  // ==================== SUB-COMPONENTS ====================

  const KpiCard = ({ label, value, icon: Icon, color, subText }: any) => (
      <div className="glass-panel p-5 rounded-2xl border-l-4 relative overflow-hidden group" style={{ borderColor: color }}>
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity" style={{ color }}>
              <Icon size={48} />
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</div>
          <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-1">
              {value} <span className="text-sm font-medium text-slate-500">{subText}</span>
          </div>
      </div>
  );

  return (
    <div className="animate-in fade-in duration-700">
      {/* Sub-Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'overview', label: 'Resumen Global', icon: Activity },
            { id: 'directors', label: 'Directores', icon: Users },
            { id: 'genres', label: 'Géneros', icon: PieChart },
            { id: 'controversy', label: 'Controversiales', icon: TrendingUp },
          ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    subTab === tab.id 
                    ? 'bg-accent text-black shadow-[0_0_20px_rgba(234,179,8,0.4)] scale-105' 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                  <tab.icon size={14} />
                  {tab.label}
              </button>
          ))}
      </div>

      {/* ==================== OVERVIEW TAB ==================== */}
      {subTab === 'overview' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard label="Total Vistas" value={stats.totalCount} icon={Film} color="#eab308" subText="películas" />
                <KpiCard label="Nota Media" value={stats.avgRating.toFixed(2)} icon={Star} color="#38bdf8" subText="/ 10" />
                <KpiCard label="Tiempo de Vida" value={Math.round(stats.totalHoursEst)} icon={Clock} color="#a855f7" subText="horas est." />
                <KpiCard label="Premios Vistos" value={stats.myOscarMovies.reduce((a,b)=>a+b.wins,0)} icon={Trophy} color="#22c55e" subText="Oscars" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Rating Distribution */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <BarChart2Icon /> Distribución de Notas
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer>
                            <BarChart data={stats.ratingDist}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="rating" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff'}} 
                                    itemStyle={{color: '#eab308'}}
                                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                />
                                <Bar dataKey="count" fill="#eab308" radius={[4, 4, 0, 0]}>
                                    {stats.ratingDist.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.rating >= 8 ? '#eab308' : entry.rating >= 6 ? '#a855f7' : '#64748b'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Years Trend */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Activity /> Evolución por Año de Estreno
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer>
                            <AreaChart data={stats.yearChartData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff'}} />
                                <Area type="monotone" dataKey="count" stroke="#38bdf8" fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            
            {/* Top Oscar Movies in Catalog */}
             <div className="glass-panel p-6 rounded-2xl border border-white/5">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Trophy className="text-yellow-500" /> Películas Más Premiadas en mi Catálogo
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    {stats.myOscarMovies.map((m, i) => (
                        <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col gap-2">
                            <div className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded w-fit">{m.wins} Oscars</div>
                            <div className="font-bold text-sm text-slate-200 truncate" title={m.Title}>{m.Title}</div>
                            <div className="text-xs text-slate-500">{m.Year}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* ==================== DIRECTORS TAB ==================== */}
      {subTab === 'directors' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-500">
              {/* Most Watched */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5">
                  <h3 className="text-lg font-bold text-white mb-6 text-glow">Más Vistos (Frecuencia)</h3>
                  <div className="space-y-4">
                      {stats.topDirectorsByCount.map((d, i) => (
                          <div key={d.name} className="relative group">
                              <div className="flex justify-between items-end mb-1 relative z-10">
                                  <span className="font-bold text-slate-300 text-sm">{i+1}. {d.name}</span>
                                  <span className="text-xs font-bold text-accent">{d.count} pelis</span>
                              </div>
                              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-slate-600 group-hover:bg-accent transition-all duration-500" 
                                    style={{ width: `${(d.count / stats.topDirectorsByCount[0].count) * 100}%` }}
                                  ></div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Best Rated */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5">
                  <h3 className="text-lg font-bold text-white mb-6 text-glow">Mejor Calificados (Min. 3 pelis)</h3>
                   <div className="space-y-4">
                      {stats.topDirectorsByRating.map((d, i) => (
                          <div key={d.name} className="relative group">
                              <div className="flex justify-between items-end mb-1 relative z-10">
                                  <span className="font-bold text-slate-300 text-sm">{i+1}. {d.name}</span>
                                  <span className="text-xs font-bold text-green-400">★ {d.avg.toFixed(1)}</span>
                              </div>
                              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-green-900 group-hover:bg-green-500 transition-all duration-500" 
                                    style={{ width: `${(d.avg / 10) * 100}%` }}
                                  ></div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* ==================== GENRES TAB ==================== */}
      {subTab === 'genres' && (
          <div className="animate-in slide-in-from-right-4 duration-500 space-y-8">
               <div className="glass-panel p-6 rounded-2xl border border-white/5">
                  <h3 className="text-lg font-bold text-white mb-6">Huella de Géneros</h3>
                  <div className="h-80 w-full">
                        <ResponsiveContainer>
                            <BarChart data={stats.genreStats.slice(0, 15)} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={80} />
                                <Tooltip 
                                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
                                            <p className="text-accent font-bold mb-1">{data.name}</p>
                                            <p className="text-slate-300 text-xs">Vistas: {data.count}</p>
                                            <p className="text-slate-300 text-xs">Nota Media: {data.avg.toFixed(2)}</p>
                                            </div>
                                        );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                  </div>
               </div>
               
               {/* Genre Cards */}
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                   {stats.genreStats.slice(0, 12).map((g) => (
                       <div key={g.name} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                           <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">{g.name}</div>
                           <div className="flex justify-between items-end">
                               <div className="text-2xl font-black text-white">{g.count}</div>
                               <div className={`text-xs font-bold ${g.avg >= 8 ? 'text-green-400' : g.avg >= 6 ? 'text-yellow-400' : 'text-slate-400'}`}>
                                   {g.avg.toFixed(1)} <span className="text-[9px] opacity-70">AVG</span>
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
          </div>
      )}

      {/* ==================== CONTROVERSY TAB ==================== */}
      {subTab === 'controversy' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Underrated */}
                  <div className="glass-panel p-6 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><ThumbsUp size={20}/></div>
                          <div>
                              <h3 className="text-lg font-bold text-white">Joyas Infravaloradas</h3>
                              <p className="text-xs text-slate-500">Tu nota es mucho mayor que IMDb</p>
                          </div>
                      </div>
                      <div className="space-y-3">
                          {stats.underrated.map((m, i) => (
                              <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                  <div className="truncate pr-4 flex-1">
                                      <div className="font-bold text-slate-200 text-sm truncate">{m.Title}</div>
                                      <div className="text-[10px] text-slate-500">{m.Year}</div>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs font-mono">
                                      <span className="text-green-400 font-bold">{m["Your Rating"]}</span>
                                      <span className="text-slate-600">vs</span>
                                      <span className="text-slate-500">{m["IMDb Rating"]}</span>
                                      <span className="bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded text-[10px] font-bold">+{m.diff.toFixed(1)}</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Overrated */}
                  <div className="glass-panel p-6 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-red-500/20 rounded-lg text-red-400"><ThumbsDown size={20}/></div>
                          <div>
                              <h3 className="text-lg font-bold text-white">Decepciones (Sobrevaloradas)</h3>
                              <p className="text-xs text-slate-500">Tu nota es mucho menor que IMDb</p>
                          </div>
                      </div>
                      <div className="space-y-3">
                          {stats.overrated.map((m, i) => (
                              <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                  <div className="truncate pr-4 flex-1">
                                      <div className="font-bold text-slate-200 text-sm truncate">{m.Title}</div>
                                      <div className="text-[10px] text-slate-500">{m.Year}</div>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs font-mono">
                                      <span className="text-red-400 font-bold">{m["Your Rating"]}</span>
                                      <span className="text-slate-600">vs</span>
                                      <span className="text-slate-500">{m["IMDb Rating"]}</span>
                                      <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded text-[10px] font-bold">{m.diff.toFixed(1)}</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              {/* Scatter Plot */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-2">Mapa de Dispersión: Mi Gusto vs. El Mundo</h3>
                    <p className="text-xs text-slate-500 mb-6">Cada punto es una película. Arriba de la diagonal: te gustó más que a la media.</p>
                    <div className="h-80 w-full">
                        <ResponsiveContainer>
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" dataKey="IMDb Rating" name="IMDb" unit="" domain={[0, 10]} stroke="#64748b" fontSize={12} label={{ value: 'IMDb Rating', position: 'bottom', fill: '#64748b', fontSize: 10 }} />
                                <YAxis type="number" dataKey="Your Rating" name="Mi Nota" unit="" domain={[0, 10]} stroke="#64748b" fontSize={12} label={{ value: 'Mi Nota', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff'}} />
                                <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 10, y: 10 }]} stroke="#334155" strokeDasharray="3 3" />
                                <Scatter name="Movies" data={stats.scatterData} fill="#8884d8">
                                    {stats.scatterData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.diff > 1 ? '#22c55e' : entry.diff < -1 ? '#ef4444' : '#94a3b8'} fillOpacity={0.6} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
              </div>
          </div>
      )}
    </div>
  );
};

// Helper icon component since Recharts tooltip overrides icons
const BarChart2Icon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart-2"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>
);

export default AnalysisView;