import React, { useRef, useState } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Link,
  List,
  Quote,
  Image,
  Columns2,
  ImagePlus,
} from "lucide-react";
import {
  articleStats,
  magazineDirective,
  type StudioArticle,
  type Language,
} from "../../lib/article-studio";
import { Panel, Field } from "./fields";
export function BilingualEditor({
  article: a,
  lang,
  change,
}: {
  article: StudioArticle;
  lang: Language;
  change: (p: Partial<StudioArticle>) => void;
}) {
  const [notice, setNotice] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const stats = articleStats(a.content[lang], lang);
  const insert = (before: string, after = "", fallback = "Text") => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const selected = a.content[lang].slice(start, end) || fallback;
    const value =
      a.content[lang].slice(0, start) +
      before +
      selected +
      after +
      a.content[lang].slice(end);
    change({ content: { ...a.content, [lang]: value } });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(
        start + before.length,
        start + before.length + selected.length,
      );
    });
  };
  const directive = (kind: "background" | "split") => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart,
      end = el.selectionEnd;
    const selected = a.content[lang].slice(start, end);
    if (!selected) {
      setNotice(
        "Select the text you want to place in an editorial block first.",
      );
      return;
    }
    setNotice("");
    const value = magazineDirective(
      kind,
      {
        src: a.editorial?.backgroundImage || a.cover || "",
        ...(kind === "split"
          ? { alt: "", caption: "" }
          : { intensity: 0.24, focal: "right" }),
      },
      selected,
    );
    change({
      content: {
        ...a.content,
        [lang]:
          a.content[lang].slice(0, start) + value + a.content[lang].slice(end),
      },
    });
  };
  return (
    <Panel
      title={lang === "en" ? "Write in English" : "撰写简体中文"}
      description="Markdown is the source. Select text before applying a magazine layout; wording stays unchanged."
    >
      <div
        className="studio-toolbar"
        role="toolbar"
        aria-label="Markdown tools"
      >
        {[
          [Heading2, "Heading", "\n## ", ""],
          [Bold, "Bold", "**", "**"],
          [Italic, "Italic", "*", "*"],
          [Link, "Link", "[", "](https://example.com)"],
          [List, "List", "\n- ", ""],
          [Quote, "Quote", "\n> ", ""],
          [
            Image,
            "Image",
            "\n![",
            '](https://example.com/image.jpg "Caption")',
          ],
        ].map(([Icon, label, before, after]: any) => (
          <button
            type="button"
            key={label}
            aria-label={label}
            title={label}
            onClick={() => insert(before, after)}
          >
            <Icon size={17} />
          </button>
        ))}
        <button
          type="button"
          onClick={() => directive("background")}
          title="Select text first"
          aria-label="Background section"
        >
          <ImagePlus size={17} /> Background
        </button>
        <button
          type="button"
          onClick={() => directive("split")}
          title="Select text first"
          aria-label="Split editorial block"
        >
          <Columns2 size={17} /> Split
        </button>
      </div>
      <Field
        label={lang === "en" ? "Markdown · English" : "Markdown · 简体中文"}
      >
        <textarea
          ref={ref}
          className="studio-markdown"
          spellCheck
          value={a.content[lang]}
          onChange={(e) =>
            change({ content: { ...a.content, [lang]: e.target.value } })
          }
        />
      </Field>
      <p className="studio-hint" role="status">
        {notice}
      </p>
      <p className="studio-stats">
        {stats.words} words · {stats.characters} Chinese characters ·{" "}
        {stats.minutes} min estimated reading
      </p>
    </Panel>
  );
}
