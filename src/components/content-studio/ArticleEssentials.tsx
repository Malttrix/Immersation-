import React from "react";
import { Field, Panel } from "./fields";
import {
  PILLAR_OPTIONS,
  CATEGORY_OPTIONS_BY_PILLAR,
  CONTENT_FORMAT_OPTIONS,
} from "../../lib/article-taxonomy";
import { suggestSlug, type StudioArticle } from "../../lib/article-studio";
export function ArticleEssentials({
  article: a,
  change,
  isNew,
}: {
  article: StudioArticle;
  change: (p: Partial<StudioArticle>) => void;
  isNew: boolean;
}) {
  const categories = CATEGORY_OPTIONS_BY_PILLAR[a.pillar] || [];
  return (
    <Panel
      title="The essentials"
      description="One title and description per language. Search and social metadata inherit these unless you add an override."
    >
      {(["en", "zh"] as const).map((l) => (
        <div key={l} className="studio-language-group">
          <h3>{l === "en" ? "English" : "简体中文"}</h3>
          <Field
            label={
              l === "en" ? "Article title · English" : "文章标题 · 简体中文"
            }
          >
            <input
              value={a.title[l]}
              onChange={(e) =>
                change({
                  title: { ...a.title, [l]: e.target.value },
                  ...(isNew &&
                  (!a.slug || a.slug === suggestSlug(a.title.en)) &&
                  l === "en"
                    ? { slug: suggestSlug(e.target.value) }
                    : {}),
                })
              }
            />
          </Field>
          <Field
            label={
              l === "en"
                ? "Article description · English"
                : "文章简介 · 简体中文"
            }
          >
            <textarea
              rows={3}
              value={a.excerpt[l]}
              onChange={(e) =>
                change({ excerpt: { ...a.excerpt, [l]: e.target.value } })
              }
            />
          </Field>
        </div>
      ))}
      <div className="studio-two">
        <Field label="Pillar">
          <select
            value={a.pillar || "body"}
            onChange={(e) =>
              change({
                pillar: e.target.value,
                categoryValue: "",
                category: { en: "", zh: "" },
              })
            }
          >
            {PILLAR_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label.en}
              </option>
            ))}
            {!PILLAR_OPTIONS.some((p) => p.value === a.pillar) && a.pillar && (
              <option value={a.pillar}>{a.pillar} (legacy)</option>
            )}
          </select>
        </Field>
        <Field label="Category">
          <select
            value={a.categoryValue || ""}
            onChange={(e) => {
              const cat = categories.find((c) => c.value === e.target.value);
              change({
                categoryValue: e.target.value,
                ...(cat ? { category: cat.label } : {}),
              });
            }}
          >
            <option value="">{a.category?.en || "Choose a category"}</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label.en} / {c.label.zh}
              </option>
            ))}
            {a.categoryValue &&
              !categories.some((c) => c.value === a.categoryValue) && (
                <option value={a.categoryValue}>
                  {a.category?.en} (legacy)
                </option>
              )}
          </select>
        </Field>
      </div>
      <Field
        label="Editorial type"
        hint="Article format describes the editorial purpose. Markdown remains the body format."
      >
        <select
          value={a.articleFormat || "editorial-intelligence"}
          onChange={(e) => change({ articleFormat: e.target.value })}
        >
          {CONTENT_FORMAT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label.en}
            </option>
          ))}
          {a.articleFormat &&
            !CONTENT_FORMAT_OPTIONS.some(
              (f) => f.value === a.articleFormat,
            ) && (
              <option value={a.articleFormat}>
                {a.articleFormat} (legacy)
              </option>
            )}
        </select>
      </Field>
    </Panel>
  );
}
