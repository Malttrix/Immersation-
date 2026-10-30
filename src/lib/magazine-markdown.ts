import { defaultSchema } from 'rehype-sanitize';

export type MagazineLayout = 'image' | 'background' | 'quote' | 'split';
type Node = { type: string; value?: string; children?: Node[]; depth?: number; data?: Record<string, unknown>; position?: { start: { offset?: number }; end: { offset?: number } } };
type Options = { slug?: string; cover?: string };
const layouts = new Set<MagazineLayout>(['image', 'background', 'quote', 'split']);

/** Shared by decorative and informative media. Never accept script/data/blob URLs. */
export function editorialImageSource(value: unknown): string | undefined {
  if (typeof value !== 'string' || /[\u0000-\u0020\\]/.test(value)) return undefined;
  if (/^\/(?!\/)/.test(value) && !value.startsWith('/api/')) return value;
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : undefined; } catch { return undefined; }
}

function plain(node: Node): string {
  return node.value ?? node.children?.map(plain).join('') ?? '';
}
function marker(node: Node, source: string) {
  if (node.type !== 'paragraph') return null;
  const start = node.position?.start.offset, end = node.position?.end.offset;
  const raw = start !== undefined && end !== undefined ? source.slice(start, end) : plain(node);
  const match = /^:::magazine (image|background|quote|split)(?: (\{[^\n]*\}))?$/.exec(raw);
  if (!match) return null;
  try {
    const attrs = JSON.parse(match[2] || '{}');
    if (!attrs || Array.isArray(attrs) || typeof attrs !== 'object' || Object.keys(attrs).some(k => !['src', 'alt', 'caption', 'side'].includes(k)) || Object.values(attrs).some(v => typeof v !== 'string' || v.length > 2000)) return null;
    return { layout: match[1] as MagazineLayout, attrs };
  } catch { return null; }
}
function container(layout: MagazineLayout, children: Node[], attrs: Record<string,string> = {}): Node {
  return { type: 'blockquote', children, data: { hName: 'section', hProperties: {
    dataMagazineLayout: layout, dataMagazineImage: editorialImageSource(attrs.src) || '',
    dataMagazineAlt: attrs.alt || '', dataMagazineCaption: attrs.caption || '',
    dataMagazineSide: attrs.side === 'right' ? 'right' : 'left',
  } } };
}
function directives(nodes: Node[], source: string): Node[] {
  const result: Node[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const open = marker(nodes[i], source);
    if (!open) { result.push(nodes[i]); continue; }
    let depth = 1, end = i + 1;
    for (; end < nodes.length; end++) {
      if (marker(nodes[end], source)) depth++;
      if (nodes[end].type === 'paragraph' && plain(nodes[end]) === ':::') depth--;
      if (!depth) break;
    }
    // Unclosed/invalid directives remain ordinary Markdown; code nodes are never parsed.
    if (depth) { result.push(nodes[i]); continue; }
    result.push(container(open.layout, directives(nodes.slice(i + 1, end), source), open.attrs));
    i = end;
  }
  return result;
}

/** Presentation-only demonstration: no source mutation, invented quote or duplicated copy. */
export default function remarkMagazine(options: Options = {}) {
  return (tree: Node, file: { value: unknown }) => {
    const source = String(file.value);
    if (!tree.children) return;
    const hasDirectives = tree.children.some(n => marker(n, source));
    tree.children = directives(tree.children, source);
    if (options.slug !== 'mindfulness-through-manual-chores' || hasDirectives) return;
    const nodes = tree.children;
    const quote = nodes.findIndex(n => n.type === 'paragraph' && [
      'The chore stays the same. Your attention changes.', '家务没有改变，改变的是你参与生活的方式。',
    ].includes(plain(n)));
    if (quote !== -1) nodes[quote] = container('quote', [nodes[quote]]);
    const start = nodes.findIndex(n => n.type === 'heading' && n.depth === 2 && [
      'The strange luxury of having only one thing to do', '最难得的奢侈，或许是一次只做一件事',
    ].includes(plain(n)));
    if (start !== -1) {
      let end = start + 1;
      while (end < nodes.length && !(nodes[end].type === 'heading' && nodes[end].depth === 2)) end++;
      nodes.splice(start, end - start, container('background', nodes.slice(start, end), { src: options.cover || '' }));
    }
  };
}

// Only the plugin's four declarative data fields cross the existing sanitizer.
// No raw-HTML parsing, arbitrary classes/styles, events or URL protocols are enabled.
export const magazineSanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), 'section'],
  attributes: { ...defaultSchema.attributes, section: [
    ['dataMagazineLayout', ...layouts], 'dataMagazineImage', 'dataMagazineAlt',
    'dataMagazineCaption', ['dataMagazineSide', 'left', 'right'],
  ] },
};
