/** Dev-only review entry. Vite builds index.html only; this is not a production route. */
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArticlePage, type Article } from '../src/components/ArticlesView';
import { type ArticlePresentation } from '../src/components/ArticleMagazine';
import { supabase } from '../src/lib/supabase';
import { defaultArticles } from '../src/articlesData';
import '../src/index.css';

function Preview() {
  const [article, setArticle] = useState<Article | null>(null);
  const [mode, setMode] = useState<ArticlePresentation>('premium-magazine');
  const [lang, setLang] = useState<'en'|'zh'>('en');
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState('Loading the existing article…');
  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data, error } = supabase ? await supabase.from('articles').select('*').eq('slug', 'mindfulness-through-manual-chores').maybeSingle() : { data: null, error: null };
      if (!active) return;
      const existing = data || defaultArticles[0];
      setArticle({ ...existing, tags: existing.tags || [] } as Article);
      setStatus(error || !data ? 'Public Supabase article unavailable; showing an existing bundled essay.' : 'Existing Supabase article. Preview only; form submissions are disabled.');
    };
    void load();
    return () => { active = false; };
  }, []);
  return <div onSubmitCapture={e => { e.preventDefault(); e.stopPropagation(); }}>
    <nav aria-label="Local composition preview" style={{position:'fixed',inset:'0 0 auto',height:80,zIndex:30,background:'#F4F1EB',borderBottom:'1px solid #D8D2C6',display:'flex',gap:12,alignItems:'center',padding:'0 20px',flexWrap:'wrap'}}>
      <label>Layout <select value={mode} onChange={e=>setMode(e.target.value as ArticlePresentation)} aria-label="Presentation mode">
        <option value="classic-editorial">Classic Editorial</option><option value="premium-magazine">Premium Magazine</option><option value="visual-feature">Visual Feature</option>
      </select></label>
      <button onClick={()=>setLang(lang==='en'?'zh':'en')}>{lang==='en'?'中文':'English'}</button>
    </nav>
    {article ? <ArticlePage article={{...article,presentation:mode}} lang={lang} onBack={()=>{window.location.href='/articles/mindfulness-through-manual-chores';}} onBookmark={()=>setSaved(!saved)} isBookmarked={saved} /> : <p style={{padding:100}}>{status}</p>}
    <p style={{maxWidth:700,margin:'auto',padding:20,fontSize:12}}>{status}</p>
  </div>;
}
createRoot(document.getElementById('root')!).render(<Preview />);
