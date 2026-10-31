import React, { useEffect, useState } from "react";
import { Plus, Search, ArrowUpRight } from "lucide-react";
import { ArticleEditor } from "./ArticleEditor";
import {
  createArticle,
  hydrateArticle,
  type StudioArticle,
  type ArticleRepository,
} from "../../lib/article-studio";
import "./content-studio.css";
export function ContentStudio({
  articles: rawArticles,
  repository,
  owner,
  onSaved,
  onDirtyChange,
  onSavingChange,
  createRequest = 0,
}: {
  articles: any[];
  repository: ArticleRepository;
  owner: string;
  onSaved: (a: StudioArticle) => void;
  onDirtyChange?: (dirty: boolean) => void;
  onSavingChange?: (saving: boolean) => void;
  createRequest?: number;
}) {
  const [articles, setArticles] = useState(rawArticles.map(hydrateArticle)),
    [editing, setEditing] = useState<StudioArticle | null>(null),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("All"),
    [error, setError] = useState("");
  useEffect(() => {
    setArticles(rawArticles.map(hydrateArticle));
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
            <span>{rows.length} articles</span>
          </div>
          <div className="studio-article-list">
            {rows.map((a) => (
              <button
                type="button"
                className="studio-article-row"
                key={a.id}
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
              </button>
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
