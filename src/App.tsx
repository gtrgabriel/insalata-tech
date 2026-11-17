import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Menu, MonitorPlay, X } from 'lucide-react';
import { MODULES } from './modules';
import { AppCtx, type ViewMode } from './lib/store';
import { Segmented, Skeleton } from './components/ui';

const fromHash = () => {
  const s = window.location.hash.replace('#/', '');
  const i = MODULES.findIndex((m) => m.slug === s || m.id === s);
  return i < 0 ? 0 : i;
};

export default function App() {
  const [idx, setIdx] = useState(fromHash);
  const [mode, setMode] = useState<ViewMode>(() => { try { return (localStorage.getItem('ii-mode') as ViewMode) || 'exec'; } catch { return 'exec'; } });
  const [presenting, setPresenting] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => { try { localStorage.setItem('ii-mode', mode); } catch { /* ignore */ } }, [mode]);
  useEffect(() => {
    const on = () => { setIdx(fromHash()); window.scrollTo({ top: 0 }); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const goIdx = useCallback((i: number) => {
    const n = Math.max(0, Math.min(MODULES.length - 1, i));
    window.location.hash = `/${MODULES[n].slug}`;
    setIdx(n); setMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const go = useCallback((slug: string) => goIdx(MODULES.findIndex((m) => m.slug === slug)), [goIdx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tag) || (e.target as HTMLElement).closest('.diagram')) return;
      if (!presenting) { if (e.key === 'Escape') setMenu(false); return; }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') goIdx(idx + 1);
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') goIdx(idx - 1);
      if (e.key === 'Escape') setPresenting(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [presenting, idx, goIdx]);

  const togglePresent = async () => {
    const next = !presenting;
    setPresenting(next);
    if (next) setMode('exec');
    try {
      if (next && !document.fullscreenElement) await document.documentElement.requestFullscreen?.();
      if (!next && document.fullscreenElement) await document.exitFullscreen?.();
    } catch { /* fullscreen pode ser bloqueado; o modo funciona sem ele */ }
  };
  useEffect(() => {
    const on = () => { if (!document.fullscreenElement) setPresenting(false); };
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);

  const M = MODULES[idx];
  const ctx = useMemo(() => ({ mode, setMode, presenting, go }), [mode, presenting, go]);

  return (
    <AppCtx.Provider value={ctx}>
      <a href="#conteudo" className="sr-only">Pular para o conteúdo</a>
      <div className={`shell ${presenting ? 'is-presenting' : ''} ${mode === 'exec' ? 'exec-mode' : 'tech-mode'}`}>
        {!presenting && (
          <>
            {menu && <button className="scrim" aria-label="Fechar menu" onClick={() => setMenu(false)} />}
            <aside className={`sidebar ${menu ? 'is-open' : ''}`} aria-label="Módulos da proposta">
              <div className="brandmark">
                <span>GRUPO INSALATA × ESTOCA.AI</span>
                <strong>Insalata Intelligence</strong>
                <span style={{ letterSpacing: 0 }}>One ecosystem. Connected operations. Intelligent decisions.</span>
              </div>
              <nav className="nav">
                {MODULES.map((m, i) => (
                  <button key={m.id} aria-current={i === idx ? 'page' : undefined} onClick={() => goIdx(i)}>
                    <span className="num">{m.id}</span>{m.short}
                  </button>
                ))}
              </nav>
              <div className="sidebar-foot">
                <span>Proposta preliminar · novembro de 2026</span>
                <span>Dados de demonstração são simulados. Hipóteses de discovery estão sinalizadas em cada módulo.</span>
              </div>
            </aside>
          </>
        )}
        <div className="main">
          <div className="topbar">
            {!presenting && <button className="icon-btn menu-btn" aria-label="Abrir menu" aria-expanded={menu} onClick={() => setMenu(true)}><Menu size={18} /></button>}
            <span className="crumb"><span className="caption">{M.id}</span>{M.title}</span>
            <Segmented<ViewMode> label="Nível de detalhe" value={mode} onChange={setMode} options={[{ value: 'exec', label: 'Visão executiva' }, { value: 'tech', label: 'Aprofundamento técnico' }]} />
            <button className="btn sm secondary hide-sm" onClick={togglePresent} aria-pressed={presenting}>
              {presenting ? <><X size={16} /> Sair da apresentação</> : <><MonitorPlay size={16} /> Modo apresentação</>}
            </button>
          </div>
          <main id="conteudo" className="page" key={M.id}>
            <Suspense fallback={<div className="stack"><Skeleton h={48} /><Skeleton h={120} /><Skeleton h={420} /></div>}>
              <M.C />
            </Suspense>
          </main>
          <nav className="pager" aria-label="Navegação entre módulos">
            <button className="btn ghost" disabled={idx === 0} onClick={() => goIdx(idx - 1)}><ArrowLeft size={16} />{idx > 0 ? MODULES[idx - 1].short : 'Início'}</button>
            <button className="btn" disabled={idx === MODULES.length - 1} onClick={() => goIdx(idx + 1)}>{idx < MODULES.length - 1 ? MODULES[idx + 1].short : 'Fim'}<ArrowRight size={16} /></button>
          </nav>
        </div>
      </div>
      {presenting && (
        <div className="present-hint" role="toolbar" aria-label="Controles da apresentação">
          <button onClick={() => goIdx(idx - 1)} aria-label="Módulo anterior" disabled={idx === 0}><ArrowLeft size={16} /></button>
          <span>{M.id} / {MODULES.length}</span>
          <button onClick={() => goIdx(idx + 1)} aria-label="Próximo módulo" disabled={idx === MODULES.length - 1}><ArrowRight size={16} /></button>
          <span className="hide-sm">← → navegam · Esc sai</span>
        </div>
      )}
    </AppCtx.Provider>
  );
}
