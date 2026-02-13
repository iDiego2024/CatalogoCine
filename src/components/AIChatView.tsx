
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Movie, ApiKeys } from '../types';
import MovieCard from './MovieCard';
import { Send, Sparkles, Bot, User, Loader2, Info } from 'lucide-react';

interface AIChatViewProps {
  movies: Movie[];
  apiKeys: ApiKeys;
  onOpenSettings: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  recommendations?: Movie[];
  reasoning?: { title: string; reason: string }[];
}

const SUGGESTIONS = [
    "Algo como Blade Runner pero optimista",
    "Películas cortas para un martes",
    "Ciencia ficción de los 80s",
    "Joyas ocultas que he calificado alto",
    "Cine negro con final feliz",
    "Algo para ver con lluvia"
];

const AIChatView: React.FC<AIChatViewProps> = ({ movies, apiKeys, onOpenSettings }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    if (!apiKeys.gemini) {
        onOpenSettings();
        return;
    }

    const userMsg: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
        // Prepare Catalog Context (Lightweight version to save tokens)
        const catalogContext = movies.map(m => ({
            title: m.Title,
            year: m.Year,
            director: m.Directors,
            genres: m.Genres,
            myRating: m["Your Rating"],
            imdb: m["IMDb Rating"]
        }));

        const ai = new GoogleGenAI({ apiKey: apiKeys.gemini });
        
        // Using Gemini 2.5 Flash for speed and complex JSON capabilities
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-latest',
            contents: `
                CATÁLOGO DEL USUARIO (JSON): 
                ${JSON.stringify(catalogContext)}
                
                PETICIÓN DEL USUARIO: "${text}"
                
                TU TAREA:
                Actúa como un experto cinéfilo y sommelier de películas.
                Recomienda de 1 a 4 películas EXCLUSIVAMENTE de este catálogo que coincidan con la petición del usuario.
                
                Reglas:
                1. Solo recomienda películas que estén en la lista proporcionada.
                2. Si la petición es abstracta (ej: "algo triste"), infiere basándote en géneros, directores y conocimiento general del cine.
                3. Prioriza películas con alta calificación personal ("myRating") si el usuario pide "lo mejor".
                4. Devuelve la respuesta en formato JSON estricto.
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        reply: { type: Type.STRING },
                        recommendations: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    year: { type: Type.INTEGER },
                                    reason: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });

        const jsonResponse = JSON.parse(response.text || "{}");
        
        // Map back to full movie objects
        const recMovies: Movie[] = [];
        const reasons: { title: string; reason: string }[] = [];

        if (jsonResponse.recommendations) {
            jsonResponse.recommendations.forEach((rec: any) => {
                // Fuzzy find or exact match
                const match = movies.find(m => 
                    m.Title.toLowerCase() === rec.title.toLowerCase() || 
                    m.NormTitle === rec.title.toLowerCase().replace(/[^a-z0-9]/g, '')
                );
                if (match) {
                    recMovies.push(match);
                    reasons.push({ title: match.Title, reason: rec.reason });
                }
            });
        }

        const botMsg: Message = {
            role: 'model',
            text: jsonResponse.reply || "Aquí tienes algunas opciones de tu colección.",
            recommendations: recMovies,
            reasoning: reasons
        };

        setMessages(prev => [...prev, botMsg]);

    } catch (error) {
        console.error("Gemini Error:", error);
        setMessages(prev => [...prev, { role: 'model', text: "Lo siento, hubo un error conectando con mi cerebro cinéfilo. Verifica tu API Key o intenta de nuevo." }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[85vh] max-w-5xl mx-auto rounded-3xl overflow-hidden glass-panel border border-white/10 relative">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-black/40 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-purple-500/20">
                <Sparkles size={20} className="text-white animate-pulse-slow" />
            </div>
            <div>
                <h2 className="text-lg font-black text-white leading-none">Cinephile AI</h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Powered by Gemini</p>
            </div>
            {!apiKeys.gemini && (
                <button onClick={onOpenSettings} className="ml-auto text-xs bg-red-500/10 text-red-400 px-3 py-1 rounded-full border border-red-500/20 hover:bg-red-500/20 transition-colors">
                    Falta API Key
                </button>
            )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar scroll-smooth" ref={scrollRef}>
            {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                    <Bot size={48} className="text-slate-600 mb-4" />
                    <h3 className="text-xl font-bold text-slate-300 mb-2">¿Qué te apetece ver hoy?</h3>
                    <p className="text-sm text-slate-500 max-w-md mb-8">
                        Explora tu catálogo conversando. Pídeme recomendaciones por estado de ánimo, trama específica o combinaciones extrañas.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                        {SUGGESTIONS.map((s, i) => (
                            <button 
                                key={i} 
                                onClick={() => handleSend(s)}
                                className="text-xs text-left p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-accent/30 hover:text-accent transition-all duration-300"
                            >
                                "{s}"
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-700' : 'bg-indigo-600'}`}>
                            {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                        </div>
                        
                        <div className={`max-w-[90%] md:max-w-[85%] space-y-4`}>
                            {/* Text Bubble */}
                            <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                                msg.role === 'user' 
                                ? 'bg-slate-800 text-slate-200 rounded-tr-none' 
                                : 'bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border border-white/10 text-slate-100 rounded-tl-none backdrop-blur-md'
                            }`}>
                                {msg.text}
                            </div>

                            {/* Recommendations Grid */}
                            {msg.recommendations && msg.recommendations.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 w-full">
                                    {msg.recommendations.map((movie, mIdx) => {
                                        const reason = msg.reasoning?.find(r => r.title === movie.Title)?.reason;
                                        return (
                                            <div key={mIdx} className="flex flex-col gap-3 group/item animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${mIdx * 100}ms` }}>
                                                <div className="relative z-10 transition-transform duration-300 group-hover/item:-translate-y-1">
                                                     <MovieCard movie={movie} apiKeys={apiKeys} />
                                                </div>
                                                {reason && (
                                                    <div className="bg-white/5 border border-white/5 px-3 py-2 rounded-xl text-[10px] text-indigo-300 leading-relaxed flex gap-2 backdrop-blur-sm">
                                                        <Info size={12} className="shrink-0 mt-0.5 text-indigo-400" />
                                                        <span>{reason}</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
            
            {isLoading && (
                 <div className="flex gap-4 animate-in fade-in">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                        <Sparkles size={14} className="animate-spin" />
                    </div>
                    <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                    </div>
                 </div>
            )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/60 border-t border-white/10 backdrop-blur-xl">
            <div className="relative max-w-3xl mx-auto flex items-center gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                    placeholder="Describe lo que quieres ver hoy..."
                    className="w-full bg-white/5 border border-white/10 rounded-full py-3.5 pl-6 pr-14 text-sm text-white placeholder-slate-500 focus:border-indigo-500/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(99,102,241,0.2)] outline-none transition-all"
                    disabled={isLoading}
                />
                <button 
                    onClick={() => handleSend()}
                    disabled={isLoading || !input.trim()}
                    className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-600/20"
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
            </div>
            <div className="text-center mt-2">
                <p className="text-[9px] text-slate-600 uppercase tracking-widest">
                    Las recomendaciones se basan únicamente en tu catálogo local.
                </p>
            </div>
        </div>
    </div>
  );
};

export default AIChatView;
