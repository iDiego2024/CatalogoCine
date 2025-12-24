import React, { useState } from 'react';
import { CHANGELOG } from '../constants';
import { Upload, Settings, X, FileText, History, Trash2, AlertTriangle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUpload: (file: File, type: 'movies' | 'oscars') => void;
  onClearData: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose, onFileUpload, onClearData
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'data' | 'changelog'>('data');

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
              onClick={() => setActiveTab('changelog')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'changelog' ? 'bg-accent/10 text-accent' : 'text-slate-400 hover:bg-white/5'}`}
            >
              <History size={16} /> Versiones
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'data' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                 <div>
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
                   </div>
                 </div>

                 {/* Danger Zone: Clear Cache */}
                 <div className="pt-6 border-t border-red-500/20">
                    <h3 className="text-sm font-bold text-red-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <AlertTriangle size={14} /> Zona de Peligro
                    </h3>
                    <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
                      <p className="text-xs text-slate-400 mb-4">
                        Si has borrado los archivos del servidor pero siguen apareciendo, usa este botón para vaciar el estado actual y forzar una recarga limpia.
                      </p>
                      <button 
                        onClick={() => {
                          if (confirm("¿Seguro que quieres borrar la caché de datos?")) {
                            onClearData();
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 text-red-500 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                      >
                        <Trash2 size={14} /> Borrar Caché y Datos
                      </button>
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