export type ReadingGeometry = { scrollY: number; contentTop: number; contentHeight: number; viewportHeight: number; topInset?: number; bottomInset?: number };

/** 0 at the first readable line; 1 when the final line reaches the unobscured viewport. */
export function readingProgress({ scrollY, contentTop, contentHeight, viewportHeight, topInset = 104, bottomInset = 0 }: ReadingGeometry): number {
  if (![scrollY, contentTop, contentHeight, viewportHeight, topInset, bottomInset].every(Number.isFinite) || contentHeight <= 0 || viewportHeight <= 0) return 0;
  const visibleHeight = Math.max(1, viewportHeight - topInset - bottomInset);
  if (contentHeight <= visibleHeight) return scrollY + viewportHeight - bottomInset >= contentTop + contentHeight ? 1 : 0;
  const start = contentTop - topInset;
  const end = contentTop + contentHeight - viewportHeight + bottomInset;
  return Math.min(1, Math.max(0, (scrollY - start) / Math.max(1, end - start)));
}
