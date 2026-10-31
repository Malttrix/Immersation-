import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { motionValue } from 'motion';
import { readingProgress } from '../src/lib/reading-progress';
import { ReadingProgressMarker, TableOfContents } from '../src/components/ArticleReadingTools';
import { backgroundIntensity, imageAspect, imageFocal, minimumEditorialContrast } from '../src/lib/editorial-settings';
import { EditorialImage } from '../src/components/ArticleMagazine';

const geometry = { contentTop: 1000, contentHeight: 3000, viewportHeight: 900, topInset: 100 };
test('reading progress measures body boundaries, clamps overscroll and excludes any afterword', () => {
  assert.equal(readingProgress({...geometry,scrollY:0}),0);
  assert.equal(readingProgress({...geometry,scrollY:900}),0);
  assert.equal(readingProgress({...geometry,scrollY:2000}),.5);
  assert.equal(readingProgress({...geometry,scrollY:3100}),1);
  assert.equal(readingProgress({...geometry,scrollY:99999}),1);
  assert.equal(readingProgress({...geometry,scrollY:-100}),0);
});
test('short content completes when its last line is visible, not after the comments', () => {
  const short={...geometry,contentHeight:200};
  assert.equal(readingProgress({...short,scrollY:299}),0);
  assert.equal(readingProgress({...short,scrollY:300}),1);
  assert.equal(readingProgress({...short,scrollY:1000}),1);
});
test('resizing, mobile obstruction and content reflow change the measured reading range', () => {
  const initial=readingProgress({...geometry,scrollY:2000});
  assert.ok(readingProgress({...geometry,scrollY:2000,viewportHeight:1200})>initial);
  assert.ok(readingProgress({...geometry,scrollY:2000,bottomInset:52})<initial);
  assert.ok(readingProgress({...geometry,scrollY:2000,contentHeight:6000})<initial);
});
test('unavailable geometry and empty bodies never show NaN or a false completed state', () => {
  for(const change of [{contentHeight:0},{viewportHeight:0},{scrollY:NaN},{contentTop:Infinity}]) assert.equal(readingProgress({...geometry,scrollY:2000,...change}),0);
});
test('responsive progress displays expose numerical semantics and contents stay expanded on desktop', () => {
  const value=motionValue(0);
  const desktop=renderToStaticMarkup(React.createElement(ReadingProgressMarker,{progress:value,lang:'en'}));
  const mobile=renderToStaticMarkup(React.createElement(ReadingProgressMarker,{progress:value,lang:'zh',compact:true}));
  assert.match(desktop,/role="progressbar"/);assert.match(desktop,/aria-valuemin="0"/);assert.match(desktop,/aria-valuemax="100"/);assert.match(desktop,/data-progress-value/);assert.match(mobile,/journal-progress-mobile/);assert.match(mobile,/阅读进度/);
  const props={headings:[{text:'Original heading',level:2,id:'original-heading'}],lang:'en' as const,activeHeadingId:'original-heading'};
  const toc=renderToStaticMarkup(React.createElement(TableOfContents,{...props,collapsible:false}));
  assert.match(toc,/href="#original-heading"/);assert.match(toc,/aria-current="location"/);
  const collapsed=renderToStaticMarkup(React.createElement(TableOfContents,props));
  assert.match(collapsed,/aria-expanded="false"/);assert.doesNotMatch(collapsed,/href="#original-heading"/);
});
test('background controls are bounded and darkest-pixel contrast meets AA for all section text colors', () => {
  assert.equal(backgroundIntensity(undefined),.24);assert.equal(backgroundIntensity(-2),.12);assert.equal(backgroundIntensity(2),.28);assert.equal(backgroundIntensity('bad'),.24);
  assert.equal(imageFocal('right'),'100% 50%');assert.equal(imageFocal('80% 25%'),'80% 25%');assert.equal(imageFocal('url(bad)'),'50% 50%');assert.equal(imageAspect('999/1'),'16/9');
  for(const color of ['#1C1C1C','#1A2F24']) assert.ok(minimumEditorialContrast(.28,color)>=4.5);
});
test('only explicitly photographic imagery crops; complete diagrams and covers remain complete', () => {
  const complete=renderToStaticMarkup(React.createElement(EditorialImage,{src:'/diagram.png',alt:'Existing diagram'}));
  const photo=renderToStaticMarkup(React.createElement(EditorialImage,{src:'/photo.jpg',alt:'Existing photograph',treatment:'photograph',aspect:'21/9',focal:'right'}));
  assert.match(complete,/data-image-treatment="complete"/);assert.match(photo,/data-image-treatment="photograph"/);assert.match(photo,/21\/9/);assert.match(photo,/100% 50%/);
});
