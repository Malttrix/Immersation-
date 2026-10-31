/** Local review entry only. Vite production builds index.html, not docs. No production writes. */
import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ContentStudio } from "../../src/components/content-studio/ContentStudio";
import AdminDashboard from "../../src/components/AdminDashboard";
import { defaultArticles } from "../../src/articlesData";
import {
  articlePayload,
  hydrateArticle,
  type ArticleRepository,
} from "../../src/lib/article-studio";
import "../../src/index.css";
const storageKey = "immersation:studio:local-review-catalog";
function seed() {
  try {
    const local = localStorage.getItem(storageKey);
    if (local) return JSON.parse(local);
  } catch {}
  return defaultArticles.map(hydrateArticle);
}
function Review() {
  const [articles, setArticles] = useState(seed),
    [fail, setFail] = useState(false);
  const repository = useMemo<ArticleRepository>(
    () => ({
      list: async () => seed(),
      save: async (a, revision) => {
        if (fail)
          throw Error(
            "Simulated Supabase failure. No remote save was confirmed.",
          );
        const rows = seed();
        const current = rows.find((r: any) => r.id === a.id);
        if ((current?.studio_revision || 0) !== revision)
          throw Error(
            "This article changed in another session. Reopen the latest version.",
          );
        const saved = hydrateArticle({
          ...articlePayload(a),
          studio_revision: revision + 1,
        });
        localStorage.setItem(
          storageKey,
          JSON.stringify([saved, ...rows.filter((r: any) => r.id !== a.id)]),
        );
        return saved;
      },
    }),
    [fail],
  );
  return (
    <>
      <div
        style={{
          padding: "10px 20px",
          font: "12px/1.6 Arial",
          background: "#1A2F24",
          color: "#F4F1EB",
        }}
      >
        LOCAL REVIEW — saves stay in this browser. Production articles are never
        changed.{" "}
        <label style={{ marginLeft: 16 }}>
          <input
            type="checkbox"
            checked={fail}
            onChange={(e) => setFail(e.target.checked)}
          />{" "}
          Simulate save failure
        </label>
      </div>
      {location.search.includes("dashboard") ? (
        <AdminDashboard
          articleRepository={repository}
          lang="en"
          userEmail="dreammyhomee@gmail.com"
          articles={articles}
          setArticles={setArticles}
          books={[]}
          setBooks={() => {}}
          newsletterIssues={[]}
          setNewsletterIssues={() => {}}
          systemMembers={[]}
          setSystemMembers={() => {}}
          systemTransactions={[]}
          setSystemTransactions={() => {}}
          onClose={() => {}}
        />
      ) : (
        <ContentStudio
          articles={articles}
          repository={repository}
          owner="local-review"
          onSaved={(saved) =>
            setArticles((old: any[]) => [
              saved,
              ...old.filter((a) => a.id !== saved.id),
            ])
          }
        />
      )}
    </>
  );
}
createRoot(document.getElementById("root")!).render(<Review />);
