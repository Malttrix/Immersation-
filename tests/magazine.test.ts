import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import remarkMagazine, { editorialImageSource, magazineSanitizeSchema } from '../src/lib/magazine-markdown';
import { EditorialImage, MagazineBlock } from '../src/components/ArticleMagazine';

function render(source: string, options = {}) {
  return renderToStaticMarkup(React.createElement(ReactMarkdown, {
    remarkPlugins: [remarkGfm, [remarkMagazine, options]],
    rehypePlugins: [[rehypeSanitize, magazineSanitizeSchema]],
    children: source,
  }));
}

test('ordinary GFM retains links, tables, inline formatting, and code', () => {
  const source = '## Heading\n\nA **word** and [source](https://example.com).\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n```ts\nconst a = 1;\n```';
  const baseline = renderToStaticMarkup(React.createElement(ReactMarkdown, {remarkPlugins:[remarkGfm],rehypePlugins:[rehypeSanitize],children:source}));
  assert.equal(render(source), baseline);
});

test('four allowlisted directives survive sanitization and preserve their Markdown body', () => {
  for (const layout of ['image','background','quote','split']) {
    const html = render(`:::magazine ${layout} {"src":"https://example.com/photo.jpg","alt":"描述","side":"right"}\n\n## A section\n\nOriginal **body**.\n\n:::`);
    assert.match(html,new RegExp(`data-magazine-layout="${layout}"`));
    assert.match(html,/<h2>A section<\/h2>/);
    assert.match(html,/<strong>body<\/strong>/);
    assert.doesNotMatch(html,/:::magazine/);
  }
});

test('directives inside fences, unknown attributes, malformed JSON and unclosed blocks stay literal', () => {
  for (const source of ['```md\n:::magazine quote\n```',':::magazine quote {"onclick":"bad"}\n\nBody\n\n:::', ':::magazine quote {bad}\n\nBody\n\n:::', ':::magazine quote\n\nBody']) {
    assert.match(render(source),/:::magazine/);
  }
});

test('nested directive containers preserve reading order', () => {
  const html=render(':::magazine background\n\nFirst\n\n:::magazine quote\n\nSecond\n\n:::\n\nThird\n\n:::');
  assert.equal((html.match(/data-magazine-layout=/g)||[]).length,2);
  assert.ok(html.indexOf('First')<html.indexOf('Second')&&html.indexOf('Second')<html.indexOf('Third'));
});

test('HTML and unsafe URLs remain inert; no styles or arbitrary attributes are admitted', () => {
  const html=render(':::magazine background {"src":"javascript:alert(1)","caption":"<script>alert(1)</script>"}\n\n[bad](javascript:alert(1))\n\n<script>alert(1)</script>\n\n:::');
  assert.doesNotMatch(html, /href="javascript:|src="javascript:|<script>|onclick=|style=/);
  for(const bad of ['javascript:alert(1)','data:image/svg+xml,bad','//evil.test/x','https://user:pass@evil.test/x','/api/private','https://safe.test/\nx']) assert.equal(editorialImageSource(bad),undefined);
  assert.equal(editorialImageSource('/images/book.jpg'),'/images/book.jpg');
});

test('demo decorates exact existing EN/ZH text without removing or duplicating it', () => {
  for(const [quote,heading] of [[ 'The chore stays the same. Your attention changes.', 'The strange luxury of having only one thing to do'],['家务没有改变，改变的是你参与生活的方式。','最难得的奢侈，或许是一次只做一件事']]) {
    const source=`Before\n\n**${quote}**\n\n## ${heading}\n\nOriginal paragraph.\n\n## End\n\nAfter`;
    const html=render(source,{slug:'mindfulness-through-manual-chores',cover:'https://example.com/cover.jpg'});
    assert.equal(html.split(quote).length-1,1);
    assert.match(html,/data-magazine-layout="quote"/);
    assert.match(html,/data-magazine-layout="background"/);
    assert.ok(html.indexOf('Before')<html.indexOf(quote)&&html.indexOf('Original paragraph.')<html.indexOf('After'));
    assert.doesNotMatch(render(source,{slug:'another-article'}),/data-magazine-layout/);
  }
});

test('media reserves geometry, lazy loads noncritical images and provides an accessible fallback', () => {
  const html=renderToStaticMarkup(React.createElement(EditorialImage,{src:'https://example.com/photo.jpg',alt:'A kitchen'}));
  assert.match(html,/loading="lazy"/);assert.match(html,/width="1672"/);assert.match(html,/alt="A kitchen"/);
  const fallback=renderToStaticMarkup(React.createElement(EditorialImage,{src:'javascript:bad',alt:'A kitchen'}));
  assert.match(fallback,/aria-label="A kitchen"/);assert.doesNotMatch(fallback,/<img/);
  const background=renderToStaticMarkup(React.createElement(MagazineBlock,{layout:'background',src:'https://example.com/photo.jpg'},React.createElement('p',null,'Indexable original text')));
  assert.match(background,/aria-hidden="true"/);assert.match(background,/<p>Indexable original text<\/p>/);
});
