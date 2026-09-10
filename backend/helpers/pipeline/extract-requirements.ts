import { KitRole, KitRequirement } from '../../models/types';
import { llm } from './llm-client';


export function sanitizeRoleText(text?: string, fallback: string = ''): string {
  if (!text) return fallback;

  const cleaned = text
    .replace(/^#+\s*/gm, '')
    .replace(/(^|\s)#+(\s|$)/g, '$1$2')
    .replace(/#+/g, '')
    .replace(/\*+/g, '')
    .replace(/`+/g, '') // Strip backticks
    .replace(/^[-–—•*+\d.]+\s*/gm, '') // Strip bullet marks/list numbers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Strip markdown links
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // If no alphanumeric characters are present (e.g. was literally '###' or '---')
  if (!/[a-zA-Z0-9]/.test(cleaned)) {
    return fallback;
  }

  return cleaned;
}

export interface ExtractedRoleResult extends KitRole {
  location?: string;
  company?: string;
}

export async function extractRequirements(jd: string, companyName?: string): Promise<ExtractedRoleResult> {
  const isThinJd = jd.trim().length < 150;

  const systemPrompt = `You are an expert Technical Recruiter, Engineering Manager, and Job Description Parser.
Extract comprehensive role details, responsibilities, location, and requirements from the given job description.

RULES:
1. Extract 4 to 8 clear, granular, distinct requirements covering core technical competencies, system architecture, specific frameworks/languages, API/data integrations, engineering practices, and behavioural/leadership skills.
   If the job description is brief or lists multiple skills in a single sentence (e.g. SPFx, React, TypeScript, SharePoint Online, REST APIs, CSS), break each distinct competency into its own granular requirement (e.g. r1: SharePoint Framework & Architecture, r2: React & TypeScript UI Engineering, r3: REST & Microsoft Graph Integrations, r4: State Management & Performance, etc.). This ensures thorough coverage.
2. Every requirement MUST have:
   - "id": stable string, starting with "r1", "r2", "r3", etc.
   - "text": concise, high-signal requirement description.
   - "kind": "technical" | "behavioural" | "domain"
   - "priority": "must" | "nice".
     Mark primary core skills and required qualifications as "must". Mark secondary or preferred skills as "nice".
3. Extract "title", "seniority" (e.g. Junior, Mid, Senior, Lead, Staff, Principal, or "Not Specified"), "location" (e.g. Remote, Hybrid, City, or "Not Specified"), "company" (if mentioned), and "responsibilities" (array of 3-6 distinct responsibilities).
   CRITICAL: "title" MUST be a clean, plain-text job title (e.g. "SPFx Developer"). NEVER include markdown symbols (such as ###, ##, #), asterisks (**), bullets, or company suffixes (like "at Comm-it").

Respond ONLY with valid JSON matching this schema:
{
  "title": string,
  "seniority": string,
  "location": string,
  "company": string,
  "responsibilities": string[],
  "requirements": [
    { "id": "r1", "text": string, "kind": "technical"|"behavioural"|"domain", "priority": "must"|"nice" }
  ]
}`;

  const userPrompt = `Job Description:\n"""\n${jd}\n"""\n\nCompany Context: ${companyName || 'Not specified'}`;

  try {
    const extracted = await llm.completeJson<ExtractedRoleResult>(userPrompt, {
      systemPrompt,
      temperature: 0.1
    });

    // Sanitize title, seniority, location, company
    extracted.title = sanitizeRoleText(extracted.title, '')
      .replace(/\s+at\s+.*$/i, '')
      .replace(/[-–|].*$/, '')
      .trim();
    extracted.seniority = sanitizeRoleText(extracted.seniority, '');
    extracted.location = sanitizeRoleText(extracted.location, '');
    if (extracted.company) {
      extracted.company = sanitizeRoleText(extracted.company, companyName || '');
    }

    // Sanitize responsibilities without hardcoded placeholder strings
    if (Array.isArray(extracted.responsibilities)) {
      extracted.responsibilities = extracted.responsibilities
        .map((r) => sanitizeRoleText(r))
        .filter((r) => r.length > 0);
    } else {
      extracted.responsibilities = [];
    }

    // Ensure IDs are strictly formatted as r1, r2, ... and sanitize text
    if (extracted.requirements && Array.isArray(extracted.requirements)) {
      extracted.requirements = extracted.requirements
        .filter((req) => req && req.text && req.text.trim())
        .map((req, idx) => ({
          ...req,
          id: `r${idx + 1}`,
          text: sanitizeRoleText(req.text, req.text.trim())
        }));
    }

    return extracted;
  } catch (err: any) {
    if (err?.message === 'NO_API_KEY') {
      console.log('  ℹ Operating in high-precision rule-based extraction fallback (no API key configured).');
    } else {
      console.warn('[extractRequirements] Using rule-based extractor fallback:', err?.message || err);
    }
    return fallbackExtractRequirements(jd, companyName);
  }
}

function fallbackExtractRequirements(jd: string, defaultCompany?: string): ExtractedRoleResult {
  const lines = jd.split('\n').map((l) => l.trim()).filter(Boolean);

  // Find the first line that actually contains words (skipping lines that are only symbols like '###' or '---')
  const validTitleLine = lines.find((line) => {
    const cleaned = sanitizeRoleText(line);
    return cleaned.length >= 2;
  });

  const rawTitle = validTitleLine ? sanitizeRoleText(validTitleLine) : (defaultCompany ? `Role at ${defaultCompany}` : '');
  const cleanTitle = rawTitle.replace(/\s+at\s+.*$/i, '').replace(/[-–|].*$/, '').trim() || rawTitle;

  const requirements: KitRequirement[] = [];
  const responsibilities: string[] = [];

  let isReadingRequirements = false;
  let isReadingResponsibilities = false;
  let reqCount = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    if (lower.includes('requirement') || lower.includes('qualifications') || lower.includes('what you need') || lower.includes('looking for')) {
      isReadingRequirements = true;
      isReadingResponsibilities = false;
      continue;
    }
    if (lower.includes('responsibilit') || lower.includes('what you will do') || lower.includes('role')) {
      isReadingResponsibilities = true;
      isReadingRequirements = false;
      continue;
    }

    if (line.startsWith('-') || line.startsWith('*') || line.startsWith('•') || /^\d+\./.test(line)) {
      const cleanText = sanitizeRoleText(line.replace(/^[-*•\d.]+\s*/, ''));
      if (cleanText.length > 5) {
        if (isReadingResponsibilities) {
          responsibilities.push(cleanText);
        } else {
          // Check priority
          const isNice = lower.includes('nice to have') || lower.includes('bonus') || lower.includes('plus') || lower.includes('preferred');
          // Check kind
          let kind: 'technical' | 'behavioural' | 'domain' = 'technical';
          if (lower.includes('mentor') || lower.includes('lead') || lower.includes('collaborat') || lower.includes('communicate') || lower.includes('team')) {
            kind = 'behavioural';
          } else if (lower.includes('compliance') || lower.includes('fintech') || lower.includes('healthcare') || lower.includes('domain') || lower.includes('regulat')) {
            kind = 'domain';
          }

          requirements.push({
            id: `r${reqCount++}`,
            text: cleanText,
            kind,
            priority: isNice ? 'nice' : 'must'
          });
        }
      }
    }
  }

  // If thin JD with no bullet points, extract key text directly from JD
  if (requirements.length === 0) {
    const textSample = lines.slice(1).map((l) => sanitizeRoleText(l)).filter(Boolean).join(' ') || cleanTitle;
    if (textSample) {
      requirements.push({
        id: 'r1',
        text: sanitizeRoleText(textSample.slice(0, 150), cleanTitle),
        kind: 'technical',
        priority: 'must'
      });
    }
  }

  const lowerJd = jd.toLowerCase();

  // Derive seniority dynamically from JD text
  let seniority = '';
  if (lowerJd.includes('staff')) seniority = 'Staff';
  else if (lowerJd.includes('principal')) seniority = 'Principal';
  else if (lowerJd.includes('lead')) seniority = 'Lead';
  else if (lowerJd.includes('senior') || lowerJd.includes('sr.')) seniority = 'Senior';
  else if (lowerJd.includes('junior') || lowerJd.includes('entry') || lowerJd.includes('intern')) seniority = 'Junior';

  // Derive location dynamically from JD text
  let location = '';
  if (lowerJd.includes('remote')) location = 'Remote';
  else if (lowerJd.includes('hybrid')) location = 'Hybrid';
  else {
    const locMatch = jd.match(/(?:location|based in|office in|at)\s*[:\-]?\s*([A-Za-z\s,]+(?:CA|NY|TX|WA|UK|USA|London|San Francisco|New York|Berlin|Toronto))/i);
    if (locMatch && locMatch[1]) {
      location = sanitizeRoleText(locMatch[1].trim(), '');
    }
  }

  // Derive company name if explicitly present in JD
  let detectedCompany = defaultCompany || '';
  const compMatch = jd.match(/(?:at|join|about)\s+([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)?)\s+(?:team|is hiring|careers|we are)/);
  if (compMatch && compMatch[1]) {
    detectedCompany = sanitizeRoleText(compMatch[1], defaultCompany || '');
  }

  return {
    title: cleanTitle,
    seniority,
    location,
    company: detectedCompany,
    responsibilities,
    requirements
  };
}
