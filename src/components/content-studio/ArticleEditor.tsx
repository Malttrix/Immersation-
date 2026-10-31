import React, { useEffect, useState } from "react";
import {
  Save,
  Eye,
  ArrowLeft,
  Download,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { ArticleEssentials } from "./ArticleEssentials";
import { BilingualEditor } from "./BilingualEditor";
import { EditorialDesignPanel } from "./EditorialDesignPanel";
import { PublishingPanel } from "./PublishingPanel";
import { AdvancedSEO } from "./AdvancedSEO";
import { ArticlePreview } from "./ArticlePreview";
import { useArticleDraft } from "./useArticleDraft";
import {
  mediaChoices,
  type StudioArticle,
  type Language,
  type ArticleRepository,
} from "../../lib/article-studio";
export function ArticleEditor({
  initial,
  articles,
  repository,
  owner,
  onSaved,
  onClose,
  onDirtyChange,
  onSavingChange,
}: {
  initial: StudioArticle;
  articles: StudioArticle[];
  repository: ArticleRepository;
  owner: string;
  onSaved: (a: StudioArticle) => void;
  onClose: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onSavingChange?: (saving: boolean) => void;
}) {
  const draft = useArticleDraft(initial, repository, owner, onSaved),
    { article, change, dirty, state } = draft;
  const [section, setSection] = useState("essentials"),
    [lang, setLang] = useState<Language>("en"),
    [preview, setPreview] = useState(false),
    [settings, setSettings] = useState(true);
  useEffect(() => {
    onSavingChange?.(state === "Saving");
    return () => onSavingChange?.(false);
  }, [state, onSavingChange]);
  useEffect(() => {
    onDirtyChange?.(dirty);
    return () => onDirtyChange?.(false);
  }, [dirty, onDirtyChange]);
  useEffect(() => {
    const save = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        void draft.save(articles);
      }
    };
    window.addEventListener("keydown", save);
    return () => window.removeEventListener("keydown", save);
  }, [article, state]);
  const close = () => {
    if (state === "Saving") return;
    if (
      !dirty ||
      window.confirm(
        "Leave this editor? Unsaved work remains only in this browser recovery copy.",
      )
    )
      onClose();
  };
  const exportDraft = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(article, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${article.slug || "article"}-draft.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const sections = [
    ["essentials", "Essentials"],
    ["content", "Content"],
    ["design", "Media & Design"],
    ["publishing", "Publishing"],
    ["seo", "Advanced SEO"],
  ];
  const choices = mediaChoices(articles);
  return (
    <div className="studio-editor">
      <header className="studio-editor-heading">
        <div>
          <button type="button" className="studio-text" onClick={close}>
            <ArrowLeft size={16} /> All articles
          </button>
          <p className="studio-eyebrow">IMMERSATION / CONTENT STUDIO 2.0</p>
          <h1>{article.title[lang] || "An article in the making"}</h1>
        </div>
        <div className="studio-editor-actions">
          <span
            role="status"
            className={`studio-save-state studio-state-${state.toLowerCase()}`}
          >
            {dirty && state === "Saved" ? "Unsaved" : state}
          </span>
          <button
            type="button"
            onClick={exportDraft}
            className="studio-icon"
            aria-label="Export draft"
          >
            <Download size={18} />
          </button>
          <button
            type="button"
            aria-pressed={preview}
            onClick={() => setPreview(!preview)}
            className="studio-secondary"
          >
            <Eye size={16} /> Preview
          </button>
          <button
            type="button"
            disabled={state === "Saving"}
            className="studio-primary"
            onClick={() => void draft.save(articles)}
          >
            <Save size={16} />{" "}
            {state === "Saving"
              ? "Saving…"
              : `Save ${article.status === "Draft" ? "draft" : article.status === "Scheduled" ? "schedule" : "article"}`}
          </button>
        </div>
      </header>
      {draft.recovery && (
        <aside className="studio-notice">
          <p>
            A browser recovery copy is available ({draft.recovery.savedAt}). It
            has not been published.
          </p>
          <button type="button" onClick={draft.restore}>
            Restore recovery copy
          </button>
          <button type="button" onClick={draft.dismissRecovery}>
            Discard recovery copy
          </button>
        </aside>
      )}
      {draft.errors.length > 0 && (
        <div className="studio-error" role="alert">
          <strong>Save needs attention</strong>
          <ul>
            {draft.errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="studio-recovery" role="status">
        {draft.recoveryStatus ||
          "Changes are committed only when you choose Save."}
      </p>
      <div className="studio-editor-controls">
        <div
          className="studio-language-tabs"
          role="group"
          aria-label="Editing language"
        >
          <button
            type="button"
            aria-pressed={lang === "en"}
            onClick={() => setLang("en")}
          >
            English
          </button>
          <button
            type="button"
            aria-pressed={lang === "zh"}
            onClick={() => setLang("zh")}
          >
            简体中文
          </button>
        </div>
        <button
          type="button"
          className="studio-text studio-settings-toggle"
          aria-expanded={settings}
          onClick={() => setSettings(!settings)}
        >
          {settings ? (
            <PanelRightClose size={17} />
          ) : (
            <PanelRightOpen size={17} />
          )}{" "}
          {settings ? "Hide settings" : "Show settings"}
        </button>
      </div>
      <div
        className={`studio-editor-grid ${settings ? "" : "studio-settings-hidden"}`}
      >
        <nav
          className="studio-section-nav"
          aria-label="Article editor sections"
          hidden={!settings}
        >
          {sections.map(([id, label], i) => (
            <button
              type="button"
              key={id}
              aria-current={section === id ? "page" : undefined}
              onClick={() => setSection(id)}
            >
              <span>0{i + 1}</span>
              {label}
            </button>
          ))}
          <div className="studio-nav-note">
            {article.status || "Published"}
            <br />
            <small>/{article.slug || "untitled"}</small>
          </div>
        </nav>
        <main className="studio-workspace">
          <fieldset disabled={state === "Saving"}>
            {section === "essentials" && (
              <ArticleEssentials
                article={article}
                change={change}
                isNew={!draft.original.slug}
              />
            )}
            {section === "content" && (
              <BilingualEditor article={article} lang={lang} change={change} />
            )}
            {section === "design" && (
              <EditorialDesignPanel
                article={article}
                lang={lang}
                change={change}
                choices={choices}
              />
            )}
            {section === "publishing" && (
              <PublishingPanel
                article={article}
                change={change}
                articles={articles}
                originalSlug={
                  draft.original.status === "Published" ||
                  !draft.original.status
                    ? draft.original.slug
                    : undefined
                }
              />
            )}
            {section === "seo" && (
              <AdvancedSEO article={article} lang={lang} change={change} />
            )}
          </fieldset>
        </main>
      </div>
      {preview && <ArticlePreview article={article} lang={lang} />}
    </div>
  );
}
