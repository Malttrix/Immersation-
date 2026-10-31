/** Isolated browsing context: anchors, media queries and progress use the iframe's viewport. */
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { useArticleHeadingSpy } from "./components/ArticleReadingTools";
import { ArticlePage } from "./components/ArticlesView";
import {
  hydrateArticle,
  readingTime,
  type Language,
  type StudioArticle,
} from "./lib/article-studio";
import "./index.css";
function Preview() {
  const [value, setValue] = useState<{
    article: StudioArticle;
    lang: Language;
  } | null>(null);
  const activeHeadingId = useArticleHeadingSpy(
    `${value?.article.id}:${value?.lang}:${value?.article.content?.[value?.lang || "en"] || ""}`,
  );
  useEffect(() => {
    const receive = (e: MessageEvent) => {
      if (
        e.origin !== location.origin ||
        e.source !== window.parent ||
        window.parent === window ||
        e.data?.type !== "IMMERSATION_STUDIO_PREVIEW" ||
        e.data.nonce !== location.hash.slice(1)
      )
        return;
      const { article, lang } = e.data;
      if (!article?.content || !["en", "zh"].includes(lang)) return;
      const a = hydrateArticle(article);
      a.readTimeAutomatic = true;
      a.readTime = { en: readingTime(a, "en"), zh: readingTime(a, "zh") };
      document.documentElement.lang = lang === "en" ? "en" : "zh-Hans";
      setValue({ article: a, lang });
    };
    window.addEventListener("message", receive);
    window.parent.postMessage(
      {
        type: "IMMERSATION_STUDIO_PREVIEW_READY",
        nonce: location.hash.slice(1),
      },
      location.origin,
    );
    return () => window.removeEventListener("message", receive);
  }, []);
  return value ? (
    <ArticlePage
      article={value.article as any}
      lang={value.lang}
      preview
      activeHeadingId={activeHeadingId}
      onBack={() => window.scrollTo({ top: 0, behavior: "auto" })}
    />
  ) : (
    <p style={{ padding: 40, fontFamily: "sans-serif" }}>
      Open this preview from Content Studio.
    </p>
  );
}
createRoot(document.getElementById("root")!).render(<Preview />);
