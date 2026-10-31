import { useCallback, useEffect, useRef, useState } from "react";
import {
  normalizeArticle,
  validateArticle,
  type StudioArticle,
  type ArticleRepository,
} from "../../lib/article-studio";
export function useArticleDraft(
  initial: StudioArticle,
  repository: ArticleRepository,
  owner: string,
  onSaved: (a: StudioArticle) => void,
) {
  const [article, setArticle] = useState(() => normalizeArticle(initial)),
    [baseline, setBaseline] = useState(() =>
      JSON.stringify(normalizeArticle(initial)),
    ),
    [revision, setRevision] = useState(initial.studio_revision || 0);
  const [state, setState] = useState<"Unsaved" | "Saving" | "Saved" | "Error">(
      initial.slug ? "Saved" : "Unsaved",
    ),
    [errors, setErrors] = useState<string[]>([]),
    [recoveryStatus, setRecoveryStatus] = useState(""),
    [recovery, setRecovery] = useState<any>(null);
  const original = useRef(initial);
  const busy = useRef(false),
    key = `immersation:studio:v2:${owner}:${initial.id}`;
  const dirty = JSON.stringify(article) !== baseline;
  const latest = useRef({ article, dirty, revision });
  latest.current = { article, dirty, revision };
  useEffect(
    () => () => {
      const last = latest.current;
      if (last.dirty)
        try {
          localStorage.setItem(
            key,
            JSON.stringify({
              article: last.article,
              revision: last.revision,
              savedAt: new Date().toISOString(),
            }),
          );
        } catch {}
    },
    [key],
  );
  const change = useCallback((patch: Partial<StudioArticle>) => {
    setArticle((a) => ({ ...a, ...patch }));
    setState("Unsaved");
    setErrors([]);
  }, []);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const r = JSON.parse(stored);
        if (
          r.article?.id === initial.id &&
          JSON.stringify(r.article) !== baseline
        )
          setRecovery(r);
      }
    } catch {
      setRecoveryStatus("Browser recovery could not be read.");
    }
  }, [key]);
  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          key,
          JSON.stringify({
            article,
            revision,
            savedAt: new Date().toISOString(),
          }),
        );
        setRecoveryStatus(
          "Recovery copy saved in this browser. Not published.",
        );
      } catch {
        setRecoveryStatus(
          "Browser recovery failed. Keep this tab open and export your draft.",
        );
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [article, dirty, key, revision]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const save = async (articles: StudioArticle[]) => {
    if (busy.current) return false;
    const issues = validateArticle(article, articles);
    if (issues.length) {
      setErrors(issues);
      setState("Error");
      return false;
    }
    if (
      original.current.slug &&
      article.slug !== original.current.slug &&
      (original.current.status === "Published" || !original.current.status) &&
      !window.confirm(
        "Change this published URL? Existing links will not be redirected automatically.",
      )
    )
      return false;
    busy.current = true;
    setState("Saving");
    setErrors([]);
    try {
      const saved = normalizeArticle(await repository.save(article, revision));
      original.current = saved;
      setArticle(saved);
      setBaseline(JSON.stringify(saved));
      setRevision(saved.studio_revision || 0);
      setState("Saved");
      setRecovery(null);
      try {
        localStorage.removeItem(key);
        setRecoveryStatus("Remote save confirmed.");
      } catch {
        setRecoveryStatus(
          "Remote save confirmed; browser recovery cleanup failed.",
        );
      }
      onSaved(saved);
      return true;
    } catch (error) {
      setErrors([
        error instanceof Error
          ? error.message
          : "Save failed. Keep the editor open and retry.",
      ]);
      setState("Error");
      return false;
    } finally {
      busy.current = false;
    }
  };
  return {
    original: original.current,
    article,
    change,
    dirty,
    state,
    errors,
    recoveryStatus,
    recovery,
    save,
    restore: () => {
      if (recovery?.revision !== revision) {
        setErrors([
          "The recovery copy is based on an older revision. Export it for comparison; reopen the current article before saving.",
        ]);
        return;
      }
      setArticle(normalizeArticle(recovery.article));
      setState("Unsaved");
      setRecovery(null);
    },
    dismissRecovery: () => {
      setRecovery(null);
      try {
        localStorage.removeItem(key);
      } catch {}
    },
    revision,
  };
}
