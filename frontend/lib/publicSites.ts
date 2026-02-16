export interface PublicSite {
  hex: string;
  siteName: string;
  siteUrl: string;
  createdAt: string;
}

const STORAGE_KEY = 'pulse_public_sites';

function generateHex(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function getPublicSites(): PublicSite[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function createPublicSite(siteName: string, siteUrl: string): PublicSite {
  const site: PublicSite = {
    hex: generateHex(),
    siteName,
    siteUrl,
    createdAt: new Date().toISOString(),
  };
  const sites = getPublicSites();
  sites.unshift(site);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
  return site;
}
