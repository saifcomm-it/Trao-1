import { fetchPage } from './fetcher';
import { cleanHtml } from './cleaner';
import { rankLinks } from './link-ranker';
import { URL } from 'url';

export interface CompanyResearch {
  companyName: string;
  companyUrl: string;
  pagesUsed: string[];
  homepageContent: string;
  hiringContent: string;
  publicDiscussion: string;
  isUnreachable: boolean;
  notes: string[];
}

export async function researchCompany(companyUrl: string): Promise<CompanyResearch> {
  const notes: string[] = [];
  const pagesUsed: string[] = [];


  let companyName = '';
  try {
    const parsed = new URL(companyUrl.startsWith('http') ? companyUrl : `https://${companyUrl}`);
    const hostParts = parsed.hostname.replace(/^www\./, '').split('.');
    if (hostParts.length > 0 && hostParts[0]) {
      companyName = hostParts[0].charAt(0).toUpperCase() + hostParts[0].slice(1);
    }
  } catch {
    companyName = companyUrl.replace(/https?:\/\//, '').split('/')[0] || '';
  }

  // 1. Fetch Homepage
  const homeResult = await fetchPage(companyUrl, 3500);
  if (!homeResult.ok) {
    notes.push(`Company homepage could not be retrieved: ${homeResult.error || 'Connection failed'}`);
    return {
      companyName,
      companyUrl,
      pagesUsed: [],
      homepageContent: '',
      hiringContent: '',
      publicDiscussion: '',
      isUnreachable: true,
      notes
    };
  }

  pagesUsed.push(homeResult.url);
  const cleanHome = cleanHtml(homeResult.html, 2500);

  // 2. Discover & Crawl Hiring / Careers Pages (Parallel Fetch)
  const rankedLinks = rankLinks(homeResult.html, homeResult.url, 2);
  let hiringText = '';

  if (rankedLinks.length > 0) {
    const settled = await Promise.allSettled(
      rankedLinks.map((link) => fetchPage(link.url, 3000))
    );

    for (let i = 0; i < settled.length; i++) {
      const res = settled[i];
      const link = rankedLinks[i];
      if (res.status === 'fulfilled' && res.value.ok) {
        pagesUsed.push(res.value.url);
        const text = cleanHtml(res.value.html, 2000);
        hiringText += `\n--- Content from ${link.url} ---\n${text}\n`;
      } else {
        const errDesc = res.status === 'fulfilled' ? res.value.error : 'Network timeout';
        notes.push(`Discovered link ${link.url} returned: ${errDesc || 'Error'}`);
      }
    }
  } else {
    notes.push('No dedicated hiring or careers link was discoverable on the homepage.');
  }

  // 3. Public Discussion Mining (Fast query with 2s timeout)
  let publicDiscussion = '';
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(companyName + ' interview questions')}`;
    const searchRes = await fetchPage(searchUrl, 2000);
    if (searchRes.ok) {
      const searchClean = cleanHtml(searchRes.html, 1500);
      if (searchClean.length > 100) {
        publicDiscussion = searchClean;
        notes.push('Public interview discussion mined from community search results.');
      }
    }
  } catch {
  }

  if (!publicDiscussion) {
    publicDiscussion = '';
    notes.push('No public candidate interview reviews found.');
  }

  return {
    companyName,
    companyUrl: homeResult.url,
    pagesUsed,
    homepageContent: cleanHome,
    hiringContent: hiringText,
    publicDiscussion,
    isUnreachable: false,
    notes
  };
}
