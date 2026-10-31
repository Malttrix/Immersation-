import React from "react";
import { Field, Panel } from "./fields";
import {
  fromScheduleInput,
  toScheduleInput,
  type StudioArticle,
} from "../../lib/article-studio";
export function PublishingPanel({
  article: a,
  change,
  articles,
  originalSlug,
}: {
  article: StudioArticle;
  change: (p: Partial<StudioArticle>) => void;
  articles: StudioArticle[];
  originalSlug?: string;
}) {
  return (
    <Panel
      title="Publishing"
      description="Identity, timing and distribution. Saving is explicit; browser recovery never publishes an article."
    >
      <div className="studio-two">
        <Field label="Publication status">
          <select
            value={a.status || "Published"}
            onChange={(e) => change({ status: e.target.value })}
          >
            <option>Draft</option>
            <option>Published</option>
            <option>Scheduled</option>
          </select>
        </Field>
        <Field label="Publish date">
          <input
            type="date"
            value={a.publicationDate || ""}
            onChange={(e) => {
              const date = e.target.value;
              change({
                publicationDate: date,
                ...(date
                  ? {
                      date: {
                        en: new Date(`${date}T00:00:00Z`).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            timeZone: "UTC",
                          },
                        ),
                        zh: new Date(`${date}T00:00:00Z`).toLocaleDateString(
                          "zh-CN",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            timeZone: "UTC",
                          },
                        ),
                      },
                    }
                  : {}),
              });
            }}
          />
        </Field>
      </div>
      {!a.publicationDate && (
        <p className="studio-hint">
          Existing display date preserved: {a.date?.en || "Not set"}
        </p>
      )}
      {a.status === "Scheduled" && (
        <Field
          label="Schedule · Asia/Singapore (UTC+08:00)"
          hint="Visibility begins when the saved timestamp is due, on the next page load. This does not send newsletters or run a background publishing job."
        >
          <input
            type="datetime-local"
            value={toScheduleInput(a.scheduledDate || "")}
            onInput={(e) =>
              change({
                scheduledDate: fromScheduleInput(e.currentTarget.value),
              })
            }
            onBlur={(e) =>
              change({
                scheduledDate: fromScheduleInput(e.currentTarget.value),
              })
            }
            onChange={(e) =>
              change({ scheduledDate: fromScheduleInput(e.target.value) })
            }
          />
        </Field>
      )}
      <Field label="URL slug" hint="Existing slugs never change automatically.">
        <input
          value={a.slug}
          onChange={(e) => change({ slug: e.target.value })}
        />
      </Field>
      {originalSlug && a.slug !== originalSlug && (
        <p role="alert" className="studio-warning">
          Changing a published URL can break links. No redirect is created.
          Confirm this change before saving.
        </p>
      )}
      <Field label="Author">
        <input
          value={a.author || ""}
          onChange={(e) => change({ author: e.target.value })}
        />
      </Field>
      <Field label="Tags" hint="Separate tags with commas.">
        <input
          value={(a.tags || []).join(", ")}
          onChange={(e) =>
            change({ tags: e.target.value.split(",").map((t) => t.trim()) })
          }
        />
      </Field>
      <label className="studio-check">
        <input
          type="checkbox"
          checked={!!a.featured}
          onChange={(e) => change({ featured: e.target.checked })}
        />{" "}
        Featured article
      </label>
      <fieldset className="studio-related">
        <legend>Related articles</legend>
        {articles
          .filter((x) => x.id !== a.id)
          .map((x) => (
            <label className="studio-check" key={x.id}>
              <input
                type="checkbox"
                checked={(a.relatedArticles || []).includes(x.slug)}
                onChange={(e) =>
                  change({
                    relatedArticles: e.target.checked
                      ? [...(a.relatedArticles || []), x.slug]
                      : (a.relatedArticles || []).filter(
                          (s: string) => s !== x.slug,
                        ),
                  })
                }
              />
              {x.title.en || x.title.zh}
            </label>
          ))}
      </fieldset>
      <details>
        <summary>Compatibility settings</summary>
        <Field
          label="Legacy body format"
          hint="Preserved independently from editorial type; changing this does not convert content."
        >
          <input
            value={a.contentFormat || "markdown"}
            onChange={(e) => change({ contentFormat: e.target.value })}
          />
        </Field>
        <Field label="Existing advertisement URL">
          <input
            value={a.adUrl || ""}
            onChange={(e) => change({ adUrl: e.target.value })}
          />
        </Field>
      </details>
    </Panel>
  );
}
