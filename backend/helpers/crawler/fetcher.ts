import axios from 'axios';
import { URL } from 'url';
import { config } from '../../Config/env';

export interface FetchResult {
  ok: boolean;
  url: string;
  html: string;
  status?: number;
  error?: string;
}

function isPrivateIp(hostname: string): boolean {
  if (config.allowLocalUrls) return false;

  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    return true;
  }

  const parts = hostname.split('.').map(Number);
  if (parts.length === 4 && parts.every((p) => !isNaN(p))) {
    if (parts[0] === 10) return true;
    if (parts[0] === 127) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
  }
  return false;
}

export async function fetchPage(targetUrl: string, timeoutMs: number = 8000): Promise<FetchResult> {
  try {
    let normalized = targetUrl.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized;
    }

    const parsed = new URL(normalized);


    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { ok: false, url: normalized, html: '', error: 'Unsupported protocol: ' + parsed.protocol };
    }


    if (isPrivateIp(parsed.hostname)) {
      return { ok: false, url: normalized, html: '', error: 'Access to private or loopback IP rejected' };
    }


    const response = await axios.get(normalized, {
      signal: AbortSignal.timeout(timeoutMs),
      timeout: timeoutMs,
      maxContentLength: 1024 * 1024,
      headers: {
        'User-Agent': 'Trao-Assessment-Bot/1.0 (Interview Research Pipeline)',
        'Accept': 'text/html,application/xhtml+xml,text/plain;q=0.9'
      },
      validateStatus: (status) => status >= 200 && status < 400
    });

    const contentType = String(response.headers['content-type'] || '');
    if (!contentType.includes('text/html') && !contentType.includes('text/plain') && !contentType.includes('application/xhtml+xml')) {
      return { ok: false, url: normalized, html: '', error: `Ignored unsupported content-type: ${contentType}` };
    }

    return {
      ok: true,
      url: normalized,
      html: typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
      status: response.status
    };
  } catch (err: any) {
    const errorMsg = err.response?.status
      ? `HTTP ${err.response.status} (${err.response.statusText || 'Error'})`
      : err.code === 'ECONNABORTED'
      ? 'Connection timed out'
      : err.message || 'Network request failed';

    return {
      ok: false,
      url: targetUrl,
      html: '',
      status: err.response?.status,
      error: errorMsg
    };
  }
}
