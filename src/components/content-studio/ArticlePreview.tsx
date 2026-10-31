import React, { useEffect, useRef, useState } from "react";
import { type StudioArticle, type Language } from "../../lib/article-studio";
export function ArticlePreview({
  article,
  lang,
}: {
  article: StudioArticle;
  lang: Language;
}) {
  const frame = useRef<HTMLIFrameElement>(null),
    [width, setWidth] = useState("desktop"),
    [nonce] = useState(() => crypto.randomUUID());
  const send = () =>
    frame.current?.contentWindow?.postMessage(
      { type: "IMMERSATION_STUDIO_PREVIEW", nonce, article, lang },
      window.location.origin,
    );
  useEffect(() => {
    send();
    const ready = (e: MessageEvent) => {
      if (
        e.origin === location.origin &&
        e.source === frame.current?.contentWindow &&
        e.data?.type === "IMMERSATION_STUDIO_PREVIEW_READY" &&
        e.data.nonce === nonce
      )
        send();
    };
    window.addEventListener("message", ready);
    return () => window.removeEventListener("message", ready);
  }, [article, lang, nonce]);
  return (
    <section className="studio-preview" aria-label="Article preview">
      <header>
        <h2>Article preview</h2>
        <select
          aria-label="Preview viewport"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
        >
          <option value="desktop">Desktop · 1440px</option>
          <option value="mobile">Mobile · 390px</option>
        </select>
      </header>
      <p className="studio-hint">
        The published ArticlePage renderer. Reflections and subscriptions are
        disabled in preview.
      </p>
      <div className="studio-preview-scroll">
        <iframe
          ref={frame}
          title={`${lang === "en" ? "English" : "Chinese"} article preview`}
          onLoad={send}
          src={`/studio-preview.html#${nonce}`}
          style={{ width: width === "mobile" ? 390 : 1440, height: 860 }}
        />
      </div>
    </section>
  );
}
