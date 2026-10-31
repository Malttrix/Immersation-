export function backgroundIntensity(value: unknown): number {
  const parsed = typeof value === 'number' || typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(parsed) ? Math.min(.28, Math.max(.12, parsed)) : .24;
}
export function imageFocal(value: unknown): string {
  const names: Record<string, string> = { left: '0% 50%', center: '50% 50%', right: '100% 50%', top: '50% 0%', bottom: '50% 100%' };
  if (typeof value !== 'string') return names.center;
  if (names[value]) return names[value];
  const match = /^(\d{1,3})% (\d{1,3})%$/.exec(value);
  return match && Number(match[1]) <= 100 && Number(match[2]) <= 100 ? value : names.center;
}
export function imageAspect(value: unknown): string {
  return typeof value === 'string' && ['16/9','21/9','3/2','4/3','4/5','1/1'].includes(value) ? value : '16/9';
}

/** Conservative WCAG sRGB contrast: black photo pixels under the maximum photo alpha.
 * The parchment overlay can only brighten this background. A further 5% black safety
 * allowance accounts for the existing global paper-grain layer on the background,
 * with the opposite (white) grain extreme on foreground pixels. */
export function minimumEditorialContrast(intensity: number, foreground = '#1C1C1C'): number {
  const rgb = (hex: string) => [1,3,5].map(i => parseInt(hex.slice(i,i+2),16));
  const luminance = (channels: number[]) => channels.map(c => { const v=c/255; return v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4; }).reduce((sum,c,i)=>sum+c*[.2126,.7152,.0722][i],0);
  const background = rgb('#F4F1EB').map(c => Math.floor(c * (1-backgroundIntensity(intensity)) * .95));
  const a=luminance(background), b=luminance(rgb(foreground).map(c => Math.ceil(c * .95 + 255 * .05)));
  return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
}

/** Additional parchment can only improve the established contrast floor. */
export function overlayIntensity(value:unknown):number { const n=Number(value); return Number.isFinite(n)?Math.max(0,Math.min(.6,n)):0; }
