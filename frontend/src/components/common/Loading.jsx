import { useEffect, useState } from 'react';

const STYLES = `
  @keyframes spin-plate {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes counter-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(-360deg); }
  }
  @keyframes float-up {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-8px); }
  }
  @keyframes steam {
    0%   { transform: translateY(0) scale(1); opacity: 0.7; }
    100% { transform: translateY(-20px) scale(1.4); opacity: 0; }
  }
  @keyframes progress-fill {
    0%   { width: 0%; }
    20%  { width: 18%; }
    50%  { width: 52%; }
    80%  { width: 78%; }
    95%  { width: 92%; }
    100% { width: 96%; }
  }
  @keyframes fade-slide-up {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ticker-scroll {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes dot-bounce {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40%            { transform: scale(1);   opacity: 1; }
  }
  @keyframes ping-ring {
    0%   { transform: scale(1);   opacity: 0.5; }
    100% { transform: scale(1.8); opacity: 0; }
  }

  .anim-spin-plate   { animation: spin-plate 8s linear infinite; }
  .anim-counter-spin { animation: counter-spin 8s linear infinite; }
  .anim-float        { animation: float-up 3s ease-in-out infinite; }
  .anim-steam-1      { animation: steam 2.2s ease-out infinite; }
  .anim-steam-2      { animation: steam 2.2s ease-out .7s infinite; }
  .anim-steam-3      { animation: steam 2.2s ease-out 1.4s infinite; }
  .anim-progress     { animation: progress-fill 4s cubic-bezier(.4,0,.2,1) forwards; }
  .anim-fade-up      { animation: fade-slide-up .5s ease both; }
  .anim-ticker       { animation: ticker-scroll 20s linear infinite; }
  .anim-ping         { animation: ping-ring 1.6s ease-out infinite; }
  .anim-dot-1        { animation: dot-bounce 1.2s ease-in-out infinite; }
  .anim-dot-2        { animation: dot-bounce 1.2s ease-in-out .2s infinite; }
  .anim-dot-3        { animation: dot-bounce 1.2s ease-in-out .4s infinite; }
`;

const MESSAGES = [
  'Initializing POS system',
  'Loading menu catalog',
  'Syncing kitchen display',
  'Connecting to printer',
  'Fetching active orders',
  'Almost ready to serve',
];

const TICKER_ITEMS = [
  '🍕 Margherita ×2', '🥩 Ribeye ×1', '🍜 Ramen ×3',
  '🥗 Caesar ×2', '🍔 Smash Burger ×4', '☕ Espresso ×2',
  '🍣 Omakase ×1', '🍷 Chianti ×2', '🍰 Tiramisu ×3',
  '🥐 Croissant ×5', '🦞 Lobster Bisque ×1', '🍹 Mojito ×4',
];

const Loading = () => {
  const [msgIdx, setMsgIdx] = useState(0);
  const [show, setShow]     = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setShow(false);
      setTimeout(() => { setMsgIdx(i => (i + 1) % MESSAGES.length); setShow(true); }, 350);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const tickerBase = TICKER_ITEMS.join('   ·   ');
  const tickerFull = tickerBase + '   ·   ' + tickerBase;

  return (
    <>
      <style>{STYLES}</style>

      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden select-none">

        {/* Dot-grid background */}
        <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* Glow blobs */}
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full pointer-events-none opacity-20 dark:opacity-10 blur-3xl bg-primary-300" />
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 rounded-full pointer-events-none opacity-15 dark:opacity-10 blur-3xl bg-primary-400" />

        {/* ── Center stage ── */}
        <div className="relative z-10 flex flex-col items-center gap-7 anim-fade-up">

          {/* Spinning plate rig */}
          <div className="relative w-40 h-40 flex items-center justify-center anim-float">

            {/* Outer dashed orbit */}
            <div className="absolute w-40 h-40 rounded-full border border-dashed border-primary-200 dark:border-primary-800 anim-spin-plate" />

            {/* Ping rings */}
            <div className="absolute w-24 h-24 rounded-full border-2 border-primary-300 dark:border-primary-700 anim-ping" />
            <div className="absolute w-24 h-24 rounded-full border-2 border-primary-300 dark:border-primary-700 anim-ping" style={{ animationDelay: '.8s' }} />

            {/* Plate */}
            <div className="relative w-24 h-24 rounded-full bg-white dark:bg-gray-800 shadow-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-center">

              {/* Steam wisps */}
              <span className="absolute -top-5 left-[34%] w-[5px] h-5 rounded-full bg-primary-300 dark:bg-primary-600 anim-steam-1" style={{ filter: 'blur(1px)' }} />
              <span className="absolute -top-6 left-[50%]  w-[5px] h-6 rounded-full bg-primary-300 dark:bg-primary-600 anim-steam-2" style={{ filter: 'blur(1px)' }} />
              <span className="absolute -top-5 left-[64%] w-[5px] h-5 rounded-full bg-primary-300 dark:bg-primary-600 anim-steam-3" style={{ filter: 'blur(1px)' }} />

              {/* Cloche SVG */}
              <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 text-primary-600 dark:text-primary-400" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 30C8 20.06 15.16 12 24 12s16 8.06 16 18H8Z" fill="currentColor" fillOpacity=".12" />
                <path d="M8 30C8 20.06 15.16 12 24 12s16 8.06 16 18" />
                <line x1="4"  y1="30" x2="44" y2="30" />
                <line x1="24" y1="12" x2="24" y2="8" />
                <circle cx="24" cy="7" r="2" fill="currentColor" />
                <line x1="14" y1="30" x2="14" y2="36" />
                <line x1="34" y1="30" x2="34" y2="36" />
                <line x1="10" y1="36" x2="38" y2="36" />
              </svg>
            </div>

            {/* Orbiting icon — fork */}
            <div
              className="absolute w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center text-primary-500 anim-counter-spin"
              style={{ top: '8px', left: '4px' }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 2v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V2M7 9v13M17 2v20" />
                <path d="M13 2v4a3 3 0 0 0 3 3h2V2" />
              </svg>
            </div>

            {/* Orbiting icon — receipt */}
            <div
              className="absolute w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center text-primary-500 anim-counter-spin"
              style={{ bottom: '8px', right: '4px' }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1Z"/>
                <path d="M8 10h8M8 14h5"/>
              </svg>
            </div>
          </div>

          {/* Brand */}
          <div className="text-center anim-fade-up" style={{ animationDelay: '.15s' }}>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Restaurant <span className="text-primary-600 dark:text-primary-400">POS</span>
            </h1>
            <p className="text-xs font-semibold tracking-[.25em] uppercase text-gray-400 dark:text-gray-500 mt-1">
              Point of Sale System
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-64 sm:w-80 anim-fade-up" style={{ animationDelay: '.3s' }}>
            <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full anim-progress bg-primary-500"
              />
            </div>
          </div>

          {/* Cycling status + bounce dots */}
          <div className="flex items-center gap-3 anim-fade-up" style={{ animationDelay: '.45s' }}>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-primary-400 anim-dot-1" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-primary-400 anim-dot-2" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-primary-400 anim-dot-3" />
            </div>
            <p
              key={msgIdx}
              className="text-sm font-medium text-gray-500 dark:text-gray-400"
              style={{
                opacity: show ? 1 : 0,
                transform: show ? 'translateY(0)' : 'translateY(6px)',
                transition: 'opacity .35s ease, transform .35s ease',
              }}
            >
              {MESSAGES[msgIdx]}…
            </p>
          </div>
        </div>

        {/* ── Bottom order ticker ── */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800 py-2">
          <div className="flex whitespace-nowrap anim-ticker">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium pr-8">{tickerFull}</span>
          </div>
        </div>

      </div>
    </>
  );
};

export default Loading;