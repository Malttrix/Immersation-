import React from "react";
import { Field, Panel } from "./fields";
import {
  articleSEO,
  type StudioArticle,
  type Language,
} from "../../lib/article-studio";
export function AdvancedSEO({
  article: a,
  lang,
  change,
}: {
  article: StudioArticle;
  lang: Language;
  change: (p: Partial<StudioArticle>) => void;
}) {
  const suffix = lang === "en" ? "EN" : "ZH",
    seo = articleSEO(a, lang);
  return (
    <Panel
      title="Search & social"
      description="Defaults follow the primary title and description. Custom legacy values are preserved below."
    >
      <div className="studio-search-preview" aria-label="Search preview">
        <small>immersation.com › articles › {a.slug}</small>
        <h3>{seo.title || "Article title"} | Immersation</h3>
        <p>{seo.description || "Your article description will appear here."}</p>
      </div>
      <div className="studio-social-preview" aria-label="Social preview">
        <small>IMMERSATION · {lang === "en" ? "English" : "简体中文"}</small>
        <h3>{seo.title || "Article title"}</h3>
        <p>{seo.description || "Article description"}</p>
      </div>
      <details>
        <summary>
          Advanced overrides · {lang === "en" ? "English" : "简体中文"}
          {a.seo?.[`title${suffix}`] || a.seo?.[`desc${suffix}`]
            ? " · custom values saved"
            : ""}
        </summary>
        <Field
          label="SEO title override"
          hint="Leave empty to use the article title."
        >
          <input
            value={a.seo?.[`title${suffix}`] || ""}
            onChange={(e) =>
              change({ seo: { ...a.seo, [`title${suffix}`]: e.target.value } })
            }
          />
        </Field>
        <Field
          label="SEO description override"
          hint="Leave empty to use the article description."
        >
          <textarea
            value={a.seo?.[`desc${suffix}`] || ""}
            onChange={(e) =>
              change({ seo: { ...a.seo, [`desc${suffix}`]: e.target.value } })
            }
          />
        </Field>
        <Field
          label="Canonical URL"
          hint="Existing values are preserved. Leave empty for the article's existing URL."
        >
          <input
            value={a.canonicalLink || ""}
            onChange={(e) => change({ canonicalLink: e.target.value })}
          />
        </Field>
      </details>
      <p className="studio-hint">
        Search and social previews are illustrative. No keyword score or ranking
        promise is applied. Indexing controls are not exposed because the
        current site has no article-specific indexing model.
      </p>
    </Panel>
  );
}
