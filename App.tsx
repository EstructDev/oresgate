
import React, { useState, useEffect, useCallback } from 'react';
import { Riddle, GameState } from './types';
import { RIDDLES } from './constants';

const LOCAL_STORAGE_KEY = 'torre_do_resgate_v2_final';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: 0, 
    unlockedLevel: 1,
    isFinished: false
  });

  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });
  const [showMap, setShowMap] = useState(false);

  // Persistência robusta
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.currentLevel === 'number') {
          setGameState(parsed);
        }
      }
    } catch (e) {
      console.error("Erro ao carregar dados", e);
    }
  }, []);

  const autoDownload = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  useEffect(() => {
  if (gameState.currentLevel === 11) {
    autoDownload(
      '/arquivos/presentinho.html',
      'presentinho.html'
    );
  }
}, [gameState.currentLevel]);


  const saveState = (newState: GameState) => {
    setGameState(newState);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
  };

  // Handlers diretos para evitar lag
  const handleStart = () => {
    saveState({ ...gameState, currentLevel: gameState.unlockedLevel });
  };

  const handleLevelJump = (level: number) => {
    saveState({ ...gameState, currentLevel: level });
    setShowMap(false);
  };

  const handleHome = () => {
    saveState({ ...gameState, currentLevel: 0 });
  };

  const checkAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || feedback.type === 'success') return;

    const currentRiddle = RIDDLES[gameState.currentLevel - 1];
    const normalize = (s: string) => 
      s.trim().toLowerCase()
       .normalize("NFD")
       .replace(/[\u0300-\u036f]/g, "")
       .replace(/[^a-z0-9]/g, "");
    
    if (normalize(input) === normalize(currentRiddle.answer)) {
      setFeedback({ type: 'success', message: 'ACESSO CONCEDIDO! Selo rompido.' });
      
      setTimeout(() => {
        setGameState(prev => {
          const isLast = prev.currentLevel === 10;
          const nextLevel = isLast ? 11 : prev.currentLevel + 1;
          const nextUnlocked = Math.max(prev.unlockedLevel, nextLevel > 10 ? 10 : nextLevel);
          
          const newState = { 
            ...prev, 
            currentLevel: nextLevel, 
            unlockedLevel: nextUnlocked,
            isFinished: isLast 
          };
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
          return newState;
        });
        setInput('');
        setFeedback({ type: null, message: '' });
      }, 1000);
    } else {
      setFeedback({ type: 'error', message: 'CÓDIGO INCORRETO. Tente novamente.' });
      setTimeout(() => setFeedback({ type: null, message: '' }), 2000);
    }
  };

  const renderLanding = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6 animate-[fadeIn_0.8s_ease-out]">
      <div className="relative mb-12">
        <div className="absolute -inset-20 bg-purple-600/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/5 text-yellow-500 text-[10px] font-bold tracking-[0.4em] uppercase">
            <span className="material-symbols-outlined text-xs">workspace_premium</span>
            De Gustavo Para Vitor Hugo
          </div>
          <h1 className="text-7xl md:text-9xl font-pixel text-white leading-[0.8] drop-shadow-[0_8px_0_#4a1d6a]">
            CASTELO DO<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400">RESGATE</span>
          </h1>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-lg z-20">
        <button 
          onClick={handleStart}
          className="flex-1 h-20 bg-purple-600 hover:bg-purple-500 text-white font-pixel text-3xl rounded-2xl shadow-[0_6px_0_#4a1d6a] transition-all active:translate-y-1 active:shadow-none flex items-center justify-center gap-3"
        >
          <span className="material-symbols-outlined text-3xl">play_circle</span> JOGAR
        </button>
        <button 
          onClick={() => setShowMap(true)}
          className="flex-1 h-20 bg-gray-800 hover:bg-gray-700 text-white font-pixel text-3xl rounded-2xl shadow-[0_6px_0_#1a1a1a] transition-all active:translate-y-1 active:shadow-none flex items-center justify-center gap-3"
        >
          <span className="material-symbols-outlined text-3xl">map</span> MAPA
        </button>
      </div>

      <p className="mt-12 max-w-md text-gray-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
        Uma jornada através de 10 memórias encriptadas para celebrar nosso primeiro ano.
      </p>
    </div>
  );

  const renderLevel = () => {
    const r = RIDDLES[gameState.currentLevel - 1];
    if (!r) return null;
    return (
      <div className="w-full max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center animate-[fadeIn_0.5s_ease-out]">
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
            <div>
               <p className="text-purple-400 font-pixel text-lg uppercase tracking-tighter">Frequência: {gameState.currentLevel}/10</p>
               <h2 className="text-3xl md:text-5xl font-pixel text-white">{r.title}</h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-500 font-bold block">ESTABILIDADE</span>
              <span className="font-pixel text-xl text-yellow-500">{Math.round((gameState.currentLevel/10)*100)}%</span>
            </div>
          </div>

          <div className="bg-[#1c1022] border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
               <span className="material-symbols-outlined text-9xl">lock_open</span>
            </div>
            
            <div className="mb-8 space-y-4">
               <p className="text-xl md:text-2xl text-purple-50 text-center font-light italic leading-relaxed">
                 "{r.riddle}"
               </p>
               
            </div>

            <form onSubmit={checkAnswer} className="space-y-4">
               <div className="relative">
                 <input 
                  autoFocus
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="DIGITE A CHAVE..."
                  className="w-full bg-black/50 border-2 border-white/10 focus:border-purple-500 focus:ring-8 focus:ring-purple-500/10 rounded-2xl py-5 px-6 text-xl text-white outline-none transition-all placeholder:text-gray-700 font-pixel tracking-widest uppercase text-center"
                 />
                 {feedback.type && (
                   <div className={`absolute -top-8 left-0 w-full text-center font-bold text-xs tracking-widest animate-pulse ${feedback.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                      {feedback.message}
                   </div>
                 )}
               </div>
               <button 
                type="submit" 
                className="w-full py-5 bg-white text-black font-pixel text-2xl rounded-2xl hover:bg-purple-400 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl"
               >
                  SINCRONIZAR <span className="material-symbols-outlined">sync_alt</span>
               </button>
            </form>

            <div className="mt-8 flex items-start gap-3 p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/10">
               <span className="material-symbols-outlined text-yellow-500 text-sm">info</span>
               <p className="text-[11px] text-gray-400 leading-tight uppercase font-bold tracking-tight">
                <span className="text-yellow-500">Nota do Guia:</span> {r.hint}
               </p>
            </div>
          </div>

          <div className="flex justify-between items-center text-[9px] text-gray-600 font-bold uppercase tracking-[0.3em]">
             <span className="max-w-[70%]">{r.narrative}</span>
             <button onClick={() => setShowMap(true)} className="flex items-center gap-1 hover:text-white transition-colors">
                MAPA <span className="material-symbols-outlined text-xs">explore</span>
             </button>
          </div>
        </div>

        <div className="relative aspect-square rounded-[3rem] overflow-hidden border-8 border-white/5 shadow-inner group">
           <img src={r.imageUrl} alt="Contexto" className="w-full h-full object-cover transition-transform duration-[15s] group-hover:scale-125 opacity-70" />
           <div className="absolute inset-0 bg-gradient-to-t from-[#0c0611] via-transparent to-transparent"></div>
           <div className="absolute inset-0 border-[30px] border-black/20 pointer-events-none"></div>
        </div>
      </div>
    );
  };

  const renderMap = () => (
    <div className="fixed inset-0 z-[100] bg-[#0c0611]/98 backdrop-blur-3xl flex flex-col p-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-pixel text-purple-400">INDEXADOR DE MEMÓRIAS</h2>
        <button onClick={() => setShowMap(false)} className="size-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-5 gap-4 max-w-5xl mx-auto w-full pb-20">
        {RIDDLES.map((r) => {
          const isUnlocked = r.id <= gameState.unlockedLevel;
          const isCurrent = r.id === gameState.currentLevel;
          return (
            <button 
              key={r.id}
              disabled={!isUnlocked}
              onClick={() => handleLevelJump(r.id)}
              className={`relative aspect-[4/5] rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2
                ${isUnlocked ? 'border-purple-500/40 bg-purple-900/10 hover:border-purple-300 hover:scale-105' : 'border-white/5 bg-gray-900/50 opacity-30 grayscale'}
                ${isCurrent ? 'ring-4 ring-yellow-400 border-yellow-400' : ''}
              `}
            >
              <span className="text-4xl font-pixel text-white">{r.id}</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-center px-2">
                {isUnlocked ? r.title : '?? BLOQUEADO ??'}
              </span>
              {isCurrent && <div className="absolute -top-1 -right-1 size-4 bg-yellow-400 rounded-full animate-ping"></div>}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderFinal = () => (
    <div className="flex flex-col items-center justify-center min-h-[90vh] text-center px-6 py-20 animate-[fadeIn_2s_ease-out]">
      <div className="size-32 bg-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(234,179,8,0.3)] border-8 border-white/20 mb-8">
        <span className="material-symbols-outlined text-6xl text-white">celebration</span>
      </div>
      
      <div className="max-w-3xl bg-white/5 border border-purple-500/20 rounded-[4rem] p-12 md:p-20 backdrop-blur-xl relative">
        <h2 className="text-6xl md:text-8xl font-pixel text-white mb-6">MISSÃO CONCLUÍDA</h2>
        <p className="text-2xl md:text-3xl text-purple-200 font-light leading-relaxed mb-10 italic">
          "Obrigado por ser o meu melhor porto seguro e a minha maior aventura. 365 dias foi só o tutorial. VOCÊ SALVOU SEU PRINCIPE!"
        </p>
        
        <div className="flex justify-center gap-4 mb-10">
           <span className="material-symbols-outlined text-red-500 text-5xl animate-bounce">favorite</span>
           <span className="material-symbols-outlined text-red-500 text-5xl animate-bounce" style={{animationDelay: '0.2s'}}>favorite</span>
           <span className="material-symbols-outlined text-red-500 text-5xl animate-bounce" style={{animationDelay: '0.4s'}}>favorite</span>
        </div>

        <button 
          onClick={() => { localStorage.removeItem(LOCAL_STORAGE_KEY); window.location.reload(); }}
          className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 font-pixel text-xl transition-all"
        >
          REINICIAR CRONOLOGIA
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* GLOBAL HEADER */}
      <header className="fixed top-0 inset-x-0 z-[60] h-20 bg-black/40 backdrop-blur-md border-b border-white/5 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleHome}>
          <div className="size-10 bg-gradient-to-br from-purple-500 to-purple-800 rounded flex items-center justify-center">
            <span className="material-symbols-outlined text-white">castle</span>
          </div>
          <h1 className="text-xl font-pixel text-white tracking-widest hidden sm:block">REINO DE CATARINA KARLA</h1>
        </div>
        
        <button onClick={() => setShowMap(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
          <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Menu da Torre</span>
          <span className="material-symbols-outlined text-purple-400">grid_view</span>
        </button>
      </header>

      <main className="pt-24 min-h-screen">
        {gameState.currentLevel === 0 && renderLanding()}
        {gameState.currentLevel > 0 && gameState.currentLevel <= 10 && renderLevel()}
        {gameState.currentLevel === 11 && renderFinal()}
        {showMap && renderMap()}
      </main>

      {/* Progress Bar Fixed at Bottom */}
      {gameState.currentLevel > 0 && gameState.currentLevel <= 10 && (
        <div className="fixed bottom-0 left-0 w-full h-1.5 bg-white/5 z-[60]">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 transition-all duration-700 ease-out"
            style={{ width: `${(gameState.currentLevel / 10) * 100}%` }}
          />
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default App;
