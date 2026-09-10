import * as cheerio from 'cheerio';

export function cleanHtml(html: string, maxChars: number = 4000): string {
  if (!html || !html.trim()) return '';

  try {
    const $ = cheerio.load(html);


    $('script, style, nav, footer, header, svg, noscript, iframe, link, meta, select, button').remove();


    const mainContent = $('main, article, #content, .content, body').first();
    const rawText = (mainContent.length ? mainContent.text() : $('body').text()) || $.text();


    const cleaned = rawText
      .replace(/[\r\t]+/g, ' ')
      .replace(/\n\s*\n+/g, '\n\n')
      .replace(/[ ]{2,}/g, ' ')
      .trim();


    return cleaned.slice(0, maxChars);
  } catch {
    return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim().slice(0, maxChars);
  }
}
