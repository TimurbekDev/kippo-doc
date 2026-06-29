/**
 * Lightweight per-page SEO. Sets <title>, meta description, and canonical link.
 * Restores nothing on unmount by design — the next page sets its own values.
 */

import { useEffect } from 'react';

function setMeta(name: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setOg(property: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function useDocMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    setMeta('description', description);
    setOg('og:title', title);
    setOg('og:description', description);
    if (typeof window !== 'undefined') {
      setOg('og:url', window.location.href);
      setCanonical(window.location.href);
    }
  }, [title, description]);
}
