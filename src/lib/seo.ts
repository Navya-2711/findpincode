export interface MetadataOptions {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: string;
  robots?: string;
}

const DEFAULT_DESCRIPTION = 'India’s largest pincode directory. Search any pincode, post office, area, district or state.';
const DEFAULT_IMAGE = 'https://bolt.new/static/og_default.png';
const DEFAULT_SITE_NAME = 'Pincode Finder';

function createOrUpdateMeta(attrName: 'name' | 'property', attrValue: string, content: string) {
  if (typeof document === 'undefined') return;
  let element = document.head.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  if (typeof document === 'undefined') return;
  let element = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

function getBaseUrl() {
  if (import.meta.env.VITE_APP_BASE_URL) {
    return import.meta.env.VITE_APP_BASE_URL;
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://pincodefinder.example.com';
}

export function setMetadata({ title, description, url, image = DEFAULT_IMAGE, type = 'website', robots = 'index, follow' }: MetadataOptions) {
  if (typeof document === 'undefined') return;

  document.title = `${title} | ${DEFAULT_SITE_NAME}`;

  createOrUpdateMeta('name', 'description', description || DEFAULT_DESCRIPTION);
  createOrUpdateMeta('property', 'og:title', title);
  createOrUpdateMeta('property', 'og:description', description || DEFAULT_DESCRIPTION);
  createOrUpdateMeta('property', 'og:type', type);
  createOrUpdateMeta('property', 'og:site_name', DEFAULT_SITE_NAME);
  createOrUpdateMeta('property', 'og:image', image);

  const canonicalUrl = url
    ? url.startsWith('http') ? url : `${getBaseUrl()}${url}`
    : `${getBaseUrl()}${window.location.pathname}${window.location.search}`;

  setLink('canonical', canonicalUrl);
  createOrUpdateMeta('property', 'og:url', canonicalUrl);
  createOrUpdateMeta('name', 'twitter:title', title);
  createOrUpdateMeta('name', 'twitter:description', description || DEFAULT_DESCRIPTION);
  createOrUpdateMeta('name', 'twitter:image', image);
  createOrUpdateMeta('name', 'twitter:card', 'summary_large_image');
  createOrUpdateMeta('name', 'robots', robots);
}

export function setStructuredData(data: Record<string, any> | null) {
  if (typeof document === 'undefined') return;
  const id = 'structured-data-jsonld';
  let script = document.head.querySelector<HTMLScriptElement>(`script#${id}`);
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    document.head.appendChild(script);
  }

  if (data === null) {
    script.remove();
    return;
  }

  script.textContent = JSON.stringify(data, null, 2);
}
