
import React, { useState } from 'react';
import { ApiKeys } from '../types';
import { CHANGELOG } from '../constants';
import { Upload, Settings, X, FileText, Key, History, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUpload: (file: File, type: 'movies' | 'oscars') => void;
  apiKeys: ApiKeys;
  setApiKeys: (k: ApiKeys) => void;
  onClearData?: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose, onFileUpload, apiKeys, setApiKeys, onClearData
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'data' | 'api' | 'changelog'>('data');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings size={20} className="text-accent" /> Configuración
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-48 bg-slate-900/30 border-r border-slate-700 p-2 space-y-1 hidden sm:block">
            <button 
              onClick={() => setActiveTab('data')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'data' ? 'bg-accent/10 text-accent' : 'text-slate-400 hover:bg-white/5'}`}
            >
              <FileText size={16} /> Datos
            </button>
            <button 
              onClick={() => setActiveTab('api')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'api' ? 'bg-accent/10 text-accent' : 'text-slate-400 hover:bg-white/5'}`}
            >
              <Key size={16} /> APIs
            </button>
             <button 
              onClick={() => setActiveTab('changelog')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'changelog' ? 'bg-accent/10 text-accent' : 'text-slate-400 hover:bg-white/5'}`}
            >
              <History size={16} /> Versiones
            </button>
          </div>

          {/* Mobile Tabs */}
          <div className="sm:hidden flex border-b border-slate-700">
            {['data', 'api', 'changelog'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wide ${activeTab === tab ? 'text-accent border-b-2 border-accent' : 'text-slate-500'}`}
                >
                    {tab}
                </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'data' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                 <h3 className="text-lg font-bold text-white mb-4">Cargar Archivos</h3>
                 <div className="space-y-4">
                   <div className="p-4 rounded-xl border border-dashed border-slate-600 bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                      <label className="block cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="p-2 bg-accent/10 rounded-lg text-accent"><Upload size={20} /></div>
                           <div>
                             <div className="font-bold text-slate-200">CSV Películas (IMDb)</div>
                             <div className="text-xs text-slate-500">Sube tu exportación de IMDb</div>
                           </div>
                        </div>
                        <input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0], 'movies')} />
                      </label>
                   </div>

                   <div className="p-4 rounded-xl border border-dashed border-slate-600 bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                      <label className="block cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="p-2 bg-accent-alt/10 rounded-lg text-accent-alt"><Upload size={20} /></div>
                           <div>
                             <div className="font-bold text-slate-200">Excel Oscars</div>
                             <div className="text-xs text-slate-500">Base de datos de premios</div>
                           </div>
                        </div>
                        <input type="file" accept=".xlsx" className="hidden" onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0], 'oscars')} />
                      </label>
                   </div>
                   
                   {onClearData && (
                     <div className="pt-4 mt-4 border-t border-white/10">
                        <button onClick={onClearData} className="text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-wider">
                           Borrar datos almacenados
                        </button>
                     </div>
                   )}
                 </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-white mb-4">Configuración de APIs</h3>
                <div className="space-y-4">
                  {/* Gemini Key */}
                  <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl">
                      <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-300 mb-2">
                          <Sparkles size={14} /> Google Gemini API Key
                      </label>
                      <input type="password" value={apiKeys.gemini} onChange={e => setApiKeys({...apiKeys, gemini: e.target.value})} 
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-accent outline-none mb-2" placeholder="AI Studio Key para recomendaciones..." />
                      <p className="text-[10px] text-slate-500">Necesaria para el chat inteligente "Qué veo hoy".</p>
                  </div>

                  <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">TMDb API Key</label>
                      <input type="password" value={apiKeys.tmdb} onChange={e => setApiKeys({...apiKeys, tmdb: e.target.value})} 
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-accent outline-none" placeholder="Ingresa tu clave de TMDb" />
                  </div>
                  <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">OMDb API Key</label>
                      <input type="password" value={apiKeys.omdb} onChange={e => setApiKeys({...apiKeys, omdb: e.target.value})} 
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-accent outline-none" placeholder="Ingresa tu clave de OMDb" />
                  </div>
                  <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">YouTube API Key</label>
                      <input type="password" value={apiKeys.youtube} onChange={e => setApiKeys({...apiKeys, youtube: e.target.value})} 
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-accent outline-none" placeholder="Ingresa tu clave de Google Cloud" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'changelog' && (
               <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                 <h3 className="text-lg font-bold text-white mb-4">Historial de Versiones</h3>
                 <div className="space-y-4">
                    {Object.entries(CHANGELOG).map(([ver, notes]) => (
                        <div key={ver} className="border-l-2 border-slate-700 pl-4 py-1">
                            <div className="font-mono text-accent font-bold mb-1">v{ver}</div>
                            <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                                {notes.map((n, i) => <li key={i}>{n}</li>)}
                            </ul>
                        </div>
                    ))}
                 </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
