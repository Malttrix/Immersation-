import React, { useState } from "react";
import { Field, Panel } from "./fields";
import { MediaPicker } from "./MediaPicker";
import { resolveArticlePresentation } from "../ArticleMagazine";
import {
  editableSections,
  configureSection,
  type StudioArticle,
  type Language,
} from "../../lib/article-studio";
export function EditorialDesignPanel({
  article: a,
  lang,
  change,
  choices,
}: {
  article: StudioArticle;
  lang: Language;
  change: (p: Partial<StudioArticle>) => void;
  choices: { url: string; label: string }[];
}) {
  const [selection, setSelection] = useState(""),
    [layout, setLayout] = useState<"background" | "image" | "split" | "quote">(
      "background",
    ),
    [attrs, setAttrs] = useState<Record<string, any>>({
      intensity: 0.24,
      overlay: 0,
      focal: "right",
      mobileFallback: "image",
    }),
    [message, setMessage] = useState("");
  const sections = editableSections(a.content[lang]);
  const section = sections.find((s) => String(s.start) === selection);
  const setEditorial = (patch: any) =>
    change({ editorial: { ...a.editorial, ...patch } });
  return (
    <Panel
      title="Media & design"
      description="Art direction serves the writing. Use one clear hero and add photographic sections only where they support the story."
    >
      <Field label="Article presentation">
        <select
          value={resolveArticlePresentation(a.presentation)}
          onChange={(e) =>
            change({
              presentation:
                typeof a.presentation === "object"
                  ? { ...a.presentation, mode: e.target.value }
                  : e.target.value,
            })
          }
        >
          <option value="classic-editorial">Classic Editorial</option>
          <option value="premium-magazine">Premium Magazine</option>
          <option value="visual-feature">Visual Feature</option>
        </select>
      </Field>
      <MediaPicker
        label="Hero image URL"
        value={a.cover}
        onChange={(cover) => change({ cover })}
        choices={choices}
      />
      <div className="studio-two">
        <Field
          label={`Hero alt text · ${lang === "en" ? "English" : "简体中文"}`}
          hint="Describe the image, rather than its filename."
        >
          <input
            value={a.coverAlt?.[lang] || ""}
            onChange={(e) =>
              change({ coverAlt: { ...a.coverAlt, [lang]: e.target.value } })
            }
          />
        </Field>
        <Field
          label={`Hero caption · ${lang === "en" ? "English" : "简体中文"}`}
        >
          <input
            value={a.coverCaption?.[lang] || ""}
            onChange={(e) =>
              change({
                coverCaption: { ...a.coverCaption, [lang]: e.target.value },
              })
            }
          />
        </Field>
      </div>
      <div className="studio-two">
        <Field label="Hero treatment">
          <select
            value={a.editorial?.coverTreatment || "complete"}
            onChange={(e) => setEditorial({ coverTreatment: e.target.value })}
          >
            <option value="complete">
              Complete image · preserve lettering
            </option>
            <option value="photograph">Photographic crop</option>
          </select>
        </Field>
        <Field label="Hero focal position">
          <select
            value={a.editorial?.coverFocal || "center"}
            onChange={(e) => setEditorial({ coverFocal: e.target.value })}
          >
            {["center", "left", "right", "top", "bottom"].map((x) => (
              <option key={x}>{x}</option>
            ))}
            {a.editorial?.coverFocal &&
              !["center", "left", "right", "top", "bottom"].includes(
                a.editorial.coverFocal,
              ) && <option>{a.editorial.coverFocal}</option>}
          </select>
        </Field>
      </div>
      <MediaPicker
        label="Pinterest image URL"
        value={a.pinterestImageUrl}
        onChange={(pinterestImageUrl) => change({ pinterestImageUrl })}
        choices={choices}
      />
      <p className="studio-hint">
        The desktop reading sidebar uses this image, with the hero as its
        fallback.
      </p>
      <details>
        <summary>Legacy automatic background</summary>
        <label className="studio-check">
          <input
            type="checkbox"
            checked={a.editorial?.automaticBackground !== false}
            onChange={(e) =>
              setEditorial({ automaticBackground: e.target.checked })
            }
          />{" "}
          One automatic section introduction
        </label>
        <MediaPicker
          label="Automatic background URL"
          value={a.editorial?.backgroundImage}
          onChange={(backgroundImage) => setEditorial({ backgroundImage })}
          choices={choices}
        />
        <Field label="Automatic photo opacity">
          <input
            type="range"
            min="12"
            max="28"
            value={Math.round((a.editorial?.backgroundIntensity ?? 0.24) * 100)}
            onChange={(e) =>
              setEditorial({
                backgroundIntensity: Number(e.target.value) / 100,
              })
            }
          />
        </Field>
        <p className="studio-hint">
          Existing articles keep their settings. New articles start with
          automatic backgrounds off.
        </p>
      </details>
      <div className="studio-rule">
        <h3>Compose an editorial section</h3>
        <p className="studio-hint">
          Choose an existing section or directive in the current language.
          Applying a layout changes markup only.
        </p>
        <Field label="Article section">
          <select
            value={selection}
            onChange={(e) => {
              setSelection(e.target.value);
              const s = sections.find(
                (s) => String(s.start) === e.target.value,
              );
              if (s?.attrs) {
                setAttrs(s.attrs);
                setLayout(s.layout as any);
              }
              setMessage("");
            }}
          >
            <option value="">Choose a section</option>
            {sections.map((s) => (
              <option key={s.start} value={s.start}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Section layout">
          <select
            value={layout}
            onChange={(e) => setLayout(e.target.value as any)}
          >
            <option value="background">Faded background</option>
            <option value="image">Full-width image</option>
            <option value="split">Split image & text</option>
            <option value="quote">Editorial pull quote</option>
          </select>
        </Field>
        {layout !== "quote" && (
          <>
            <MediaPicker
              label="Section image URL"
              value={attrs.src}
              onChange={(src) => setAttrs({ ...attrs, src })}
              choices={choices}
            />
            <div className="studio-two">
              <Field label="Section focal position">
                <select
                  value={attrs.focal || "right"}
                  onChange={(e) =>
                    setAttrs({ ...attrs, focal: e.target.value })
                  }
                >
                  {["left", "center", "right", "top", "bottom"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label="Image fit">
                <select
                  value={attrs.fit || "contain"}
                  onChange={(e) => setAttrs({ ...attrs, fit: e.target.value })}
                >
                  <option value="contain">Show complete image</option>
                  <option value="cover">Photographic crop</option>
                </select>
              </Field>
            </div>
            {layout === "background" ? (
              <>
                <div className="studio-two">
                  <Field
                    label={`Photo opacity · ${Math.round((attrs.intensity ?? 0.24) * 100)}%`}
                  >
                    <input
                      aria-label="Photo opacity"
                      type="range"
                      min="12"
                      max="28"
                      value={Math.round((attrs.intensity ?? 0.24) * 100)}
                      onChange={(e) =>
                        setAttrs({
                          ...attrs,
                          intensity: Number(e.target.value) / 100,
                        })
                      }
                    />
                  </Field>
                  <Field
                    label={`Parchment overlay · ${Math.round((attrs.overlay ?? 0) * 100)}%`}
                    hint="Adds parchment over the photo; more overlay only increases text contrast."
                  >
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={Math.round((attrs.overlay ?? 0) * 100)}
                      onChange={(e) =>
                        setAttrs({
                          ...attrs,
                          overlay: Number(e.target.value) / 100,
                        })
                      }
                    />
                  </Field>
                </div>
                <Field label="Mobile background">
                  <select
                    value={attrs.mobileFallback || "image"}
                    onChange={(e) =>
                      setAttrs({ ...attrs, mobileFallback: e.target.value })
                    }
                  >
                    <option value="image">Use image</option>
                    <option value="plain">Plain parchment</option>
                  </select>
                </Field>
                <MediaPicker
                  label="Mobile background URL (optional)"
                  value={attrs.mobileSrc}
                  onChange={(mobileSrc) => setAttrs({ ...attrs, mobileSrc })}
                  choices={choices}
                />
              </>
            ) : (
              <>
                <Field label="Section image alt text">
                  <input
                    value={attrs.alt || ""}
                    onChange={(e) =>
                      setAttrs({ ...attrs, alt: e.target.value })
                    }
                  />
                </Field>
                <Field label="Section image caption">
                  <input
                    value={attrs.caption || ""}
                    onChange={(e) =>
                      setAttrs({ ...attrs, caption: e.target.value })
                    }
                  />
                </Field>
              </>
            )}
          </>
        )}
        <button
          type="button"
          className="studio-secondary"
          disabled={!section}
          onClick={() => {
            if (!section) return;
            change({
              content: {
                ...a.content,
                [lang]: configureSection(
                  a.content[lang],
                  section,
                  layout,
                  attrs,
                ),
              },
            });
            setSelection("");
            setMessage(
              "Layout applied to the Markdown. Open preview to review it.",
            );
          }}
        >
          Apply layout to section
        </button>
        <p role="status" className="studio-hint">
          {message}
        </p>
      </div>
    </Panel>
  );
}
