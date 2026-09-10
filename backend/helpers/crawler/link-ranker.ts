import * as cheerio from 'cheerio';
import { URL } from 'url';

export interface ScoredLink {
  url: string;
  text: string;
  score: number;
}

const HIGH_PRIORITY_TERMS = [
  'hiring', 'interview', 'how-we-hire', 'hiring-process', 'recruiting', 'apply', 'interviewing'
];

const MEDIUM_PRIORITY_TERMS = [
  'careers', 'jobs', 'work-with-us', 'openings', 'join-us', 'join', 'culture', 'handbook', 'engineering', 'principles', 'values', 'about'
];

const NEGATIVE_TERMS = [
  'privacy', 'terms', 'cookie', 'legal', 'login', 'signin', 'signup', 'cart', 'checkout', 'billing', 'pricing', 'status', 'help', 'support'
];

export function rankLinks(html: string, baseUrl: string, maxLinks: number = 3): ScoredLink[] {
  if (!html) return [];

  try {
    const $ = cheerio.load(html);
    const base = new URL(baseUrl);
    const seenUrls = new Set<string>();
    const scoredLinks: ScoredLink[] = [];

    $('a').each((_, el) => {
      const href = $(el).attr('href')?.trim();
      const text = $(el).text().trim().toLowerCase();

      if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) {
        return;
      }

      let resolvedUrl: string;
      try {
        resolvedUrl = new URL(href, base).href;
      } catch {
        return;
      }


      try {
        const parsedResolved = new URL(resolvedUrl);
        if (parsedResolved.hostname !== base.hostname && !parsedResolved.hostname.endsWith('.' + base.hostname)) {
          return;
        }
      } catch {
        return;
      }


      if (resolvedUrl === base.href || seenUrls.has(resolvedUrl)) {
        return;
      }

      seenUrls.add(resolvedUrl);

      const pathAndText = (resolvedUrl + ' ' + text).toLowerCase();
      let score = 0;


      for (const term of HIGH_PRIORITY_TERMS) {
        if (pathAndText.includes(term)) score += 50;
      }


      for (const term of MEDIUM_PRIORITY_TERMS) {
        if (pathAndText.includes(term)) score += 20;
      }


      for (const term of NEGATIVE_TERMS) {
        if (pathAndText.includes(term)) score -= 40;
      }

      if (score > 0) {
        scoredLinks.push({
          url: resolvedUrl,
          text,
          score
        });
      }
    });


    scoredLinks.sort((a, b) => b.score - a.score);

    return scoredLinks.slice(0, maxLinks);
  } catch (err) {
    return [];
  }
}
