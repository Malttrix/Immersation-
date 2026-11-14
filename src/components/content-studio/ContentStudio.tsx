import React, { useEffect, useState } from "react";
import { Plus, Search, ArrowUpRight, Trash2 } from "lucide-react";
import { ArticleEditor } from "./ArticleEditor";
import {
  createArticle,
  hydrateArticle,
  type StudioArticle,
  type ArticleRepository,
} from "../../lib/article-studio";
import "./content-studio.css";
function publicationDay(article: StudioArticle): string {
  const value = article.publicationDate || article.date?.en;
  if (!value) return '';
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString().slice(0, 10) : '';
}
export function ContentStudio({
  articles: rawArticles,
  repository,
  owner,
  onSaved,
  onDeleted,
  onDirtyChange,
  onSavingChange,
  createRequest = 0,
}: {
  articles: any[];
  repository: ArticleRepository;
  owner: string;
  onSaved: (a: StudioArticle) => void;
  onDeleted?: (id: string) => void;
  onDirtyChange?: (dirty: boolean) => void;
  onSavingChange?: (saving: boolean) => void;
  createRequest?: number;
}) {
  const [articles, setArticles] = useState(rawArticles.map(hydrateArticle).filter(a => !a.archivedAt)),
    [editing, setEditing] = useState<StudioArticle | null>(null),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("All"),
    [pillar, setPillar] = useState("All"),
    [dateFrom, setDateFrom] = useState(""),
    [dateTo, setDateTo] = useState(""),
    [deleting, setDeleting] = useState<string | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    setArticles(rawArticles.map(hydrateArticle).filter(a => !a.archivedAt));
  }, [rawArticles]);
  useEffect(() => {
    let active = true;
    repository
      .list()
      .then((rows) => {
        if (active) {
          setArticles(rows);
          setError("");
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [repository]);
  useEffect(() => {
    if (createRequest > 0) setEditing(createArticle());
  }, [createRequest]);
  const saved = (a: StudioArticle) => {
    setArticles((old) => [a, ...old.filter((x) => x.id !== a.id)]);
    onSaved(a);
  };
  const rows = articles.filter(
    (a) =>
      (filter === "All" || (a.status || "Published") === filter) &&
      (pillar === "All" || String(a.pillar || '').toLowerCase().replace(/s$/, '') === pillar) &&
      ((!dateFrom && !dateTo) || (() => { const d = publicationDay(a); return !!d && (!dateFrom || d >= dateFrom) && (!dateTo || d <= dateTo); })()) &&
      `${a.title.en} ${a.title.zh} ${a.slug}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <section className="content-studio" aria-label="Content Studio">
      {editing ? (
        <ArticleEditor
          key={editing.id}
          initial={editing}
          articles={articles}
          repository={repository}
          owner={owner}
          onSaved={saved}
          onClose={() => setEditing(null)}
          onDirtyChange={onDirtyChange}
          onSavingChange={onSavingChange}
        />
      ) : (
        <>
          <header className="studio-list-heading">
            <div>
              <p className="studio-eyebrow">
                THE LIVING JOURNAL / EDITORIAL WORKSPACE
              </p>
              <h1>Stories, thoughtfully made.</h1>
              <p>Write, shape and publish in two languages.</p>
            </div>
            <button
              type="button"
              className="studio-primary"
              onClick={() => setEditing(createArticle())}
            >
              <Plus size={17} /> New article
            </button>
          </header>
          {error && (
            <p role="alert" className="studio-warning">
              {error} Showing the existing catalog. Remote saving must be
              confirmed separately.
            </p>
          )}
          <div className="studio-list-controls">
            <label className="studio-search">
              <Search size={17} />
              <input
                aria-label="Search articles"
                value={search}
                placeholder="Search a title or slug…"
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <select
              aria-label="Filter publication status"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {["All", "Draft", "Published", "Scheduled"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <select aria-label="Filter by pillar" value={pillar} onChange={e => setPillar(e.target.value)}>
              <option value="All">All pillars</option><option value="tool">Tools</option><option value="body">Body</option><option value="capital">Capital</option>
            </select>
            <label>Published from <input aria-label="Published from" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></label>
            <label>Published to <input aria-label="Published to" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} /></label>
            <span>{rows.length} articles</span>
          </div>
          <div className="studio-article-list">
            {rows.map((a) => (
              <div className="studio-article-list-item" key={a.id}><button
                type="button"
                className="studio-article-row"
                onClick={() => setEditing(a)}
              >
                <div>
                  <small>
                    {a.pillar || "Journal"} · {a.status || "Published"}
                  </small>
                  <h2>{a.title.en || "Untitled article"}</h2>
                  <p lang="zh-Hans">{a.title.zh}</p>
                  <code>/{a.slug}</code>
                </div>
                <ArrowUpRight size={20} />
              </button><button type="button" className="studio-delete" disabled={!!deleting} aria-label={`Delete ${a.title.en || a.slug}`} onClick={async () => {
                if (!window.confirm(`Remove “${a.title.en || a.slug}” from Content Studio and the website? Its content and review history will be retained for recovery.`)) return;
                setDeleting(a.id); setError('');
                try { if (!repository.delete) throw Error('Deletion is unavailable.'); await repository.delete(a.id, a.studio_revision || 0); setArticles(old => old.filter(x => x.id !== a.id)); onDeleted?.(a.id); }
                catch (e) { setError(e instanceof Error ? e.message : 'Deletion failed.'); }
                finally { setDeleting(null); }
              }}><Trash2 size={18} /> Delete</button></div>
            ))}
            {!rows.length && (
              <p className="studio-empty">
                No articles match. Clear your search or start a new article.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
