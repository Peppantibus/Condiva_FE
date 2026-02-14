import React from 'react';
import { useLocation } from 'react-router-dom';

type SeoConfig = {
  title: string;
  description: string;
  robots: string;
  canonicalPath: string;
  isIndexable: boolean;
};

const APP_NAME = 'Condiva';
const HOME_DESCRIPTION = 'Condiva e la piattaforma di sharing economy di quartiere: condividi oggetti con la tua community locale in modo semplice e sicuro.';
const FALLBACK_DESCRIPTION = 'Community, richieste, prestiti e oggetti condivisi in un unico spazio.';

const normalizePathname = (pathname: string): string => {
  if (!pathname) return '/';
  if (pathname === '/') return pathname;
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
};

const getSeoForPath = (pathname: string): SeoConfig => {
  const path = normalizePathname(pathname);

  if (path === '/') {
    return {
      title: `${APP_NAME} | Sharing economy di quartiere`,
      description: HOME_DESCRIPTION,
      robots: 'index,follow',
      canonicalPath: '/',
      isIndexable: true,
    };
  }

  if (path === '/join') {
    return {
      title: `Invito Community | ${APP_NAME}`,
      description: 'Unisciti alla tua community su Condiva e inizia a condividere oggetti con i vicini.',
      robots: 'index,follow',
      canonicalPath: '/join',
      isIndexable: true,
    };
  }

  if (path === '/login') {
    return {
      title: `Accedi | ${APP_NAME}`,
      description: 'Accedi al tuo account Condiva.',
      robots: 'noindex,follow',
      canonicalPath: '/login',
      isIndexable: false,
    };
  }

  if (path === '/register') {
    return {
      title: `Registrati | ${APP_NAME}`,
      description: 'Crea il tuo account Condiva.',
      robots: 'noindex,follow',
      canonicalPath: '/register',
      isIndexable: false,
    };
  }

  if (path === '/recovery') {
    return {
      title: `Recupero Password | ${APP_NAME}`,
      description: 'Recupera l accesso al tuo account Condiva.',
      robots: 'noindex,follow',
      canonicalPath: '/recovery',
      isIndexable: false,
    };
  }

  if (path === '/reset') {
    return {
      title: `Reset Password | ${APP_NAME}`,
      description: 'Imposta una nuova password per il tuo account Condiva.',
      robots: 'noindex,follow',
      canonicalPath: '/reset',
      isIndexable: false,
    };
  }

  if (path === '/verify') {
    return {
      title: `Verifica Account | ${APP_NAME}`,
      description: 'Verifica il tuo account Condiva.',
      robots: 'noindex,follow',
      canonicalPath: '/verify',
      isIndexable: false,
    };
  }

  if (
    path === '/dashboard'
    || path.startsWith('/community')
    || path.startsWith('/requests')
    || path.startsWith('/items')
    || path.startsWith('/loans')
    || path.startsWith('/me')
  ) {
    return {
      title: `${APP_NAME} | Area riservata`,
      description: FALLBACK_DESCRIPTION,
      robots: 'noindex,nofollow',
      canonicalPath: path,
      isIndexable: false,
    };
  }

  return {
    title: `${APP_NAME} | Pagina`,
    description: FALLBACK_DESCRIPTION,
    robots: 'noindex,follow',
    canonicalPath: path,
    isIndexable: false,
  };
};

const upsertMeta = (attribute: 'name' | 'property', key: string, content: string): void => {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const upsertCanonical = (href: string): void => {
  let element = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
};

const upsertStructuredData = (id: string, content: Record<string, unknown>): void => {
  let script = document.head.querySelector(`#${id}`) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(content);
};

const removeStructuredData = (id: string): void => {
  const script = document.head.querySelector(`#${id}`);
  if (script?.parentNode) {
    script.parentNode.removeChild(script);
  }
};

const getSiteOrigin = (): string => {
  const siteUrl = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim();
  const fallbackOrigin = window.location.origin;
  return (siteUrl && siteUrl.length > 0 ? siteUrl : fallbackOrigin).replace(/\/+$/, '');
};

const buildCanonicalUrl = (origin: string, canonicalPath: string): string => {
  const normalizedPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
  return `${origin}${normalizedPath}`;
};

export const SeoManager: React.FC = () => {
  const location = useLocation();

  React.useEffect(() => {
    const seo = getSeoForPath(location.pathname);
    const origin = getSiteOrigin();
    const canonicalUrl = buildCanonicalUrl(origin, seo.canonicalPath);
    const imageUrl = `${origin}/og-image.png`;

    document.title = seo.title;

    upsertMeta('name', 'description', seo.description);
    upsertMeta('name', 'robots', seo.robots);
    upsertMeta('property', 'og:title', seo.title);
    upsertMeta('property', 'og:description', seo.description);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', APP_NAME);
    upsertMeta('property', 'og:locale', 'it_IT');
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('property', 'og:image:alt', 'Condiva - Sharing economy di quartiere');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', seo.title);
    upsertMeta('name', 'twitter:description', seo.description);
    upsertMeta('name', 'twitter:image', imageUrl);
    upsertCanonical(canonicalUrl);

    if (seo.isIndexable && seo.canonicalPath === '/') {
      upsertStructuredData('condiva-seo-schema', {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: APP_NAME,
        url: `${origin}/`,
        inLanguage: 'it-IT',
        description: HOME_DESCRIPTION,
      });
    } else {
      removeStructuredData('condiva-seo-schema');
    }
  }, [location.pathname]);

  return null;
};
