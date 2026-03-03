import { createContext, useContext, useState, useEffect } from 'react';

const IS_EMBEDDED = typeof __LM_EMBED_MODE__ !== 'undefined' && __LM_EMBED_MODE__;

// Strip the Vite base path so internal routing uses simple paths like '/' and '/admin'
const BASE = import.meta.env.BASE_URL.replace(/\/$/, ''); // e.g. '/Switch-Wizard-2.0'

function stripBase(pathname: string): string {
  if (BASE && pathname.startsWith(BASE)) {
    const stripped = pathname.slice(BASE.length);
    return stripped || '/';
  }
  return pathname || '/';
}

/** Read the current path from the URL hash (embed/WordPress mode). */
function getHashPath(): string {
  const hash = window.location.hash;
  return hash && hash.length > 1 ? hash.slice(1) : '/';
}

// GitHub Pages 404.html redirects sub-routes as ?route=/admin — restore them
function getInitialPath(): string {
  if (IS_EMBEDDED) return getHashPath();

  const params = new URLSearchParams(window.location.search);
  const route = params.get('route');
  if (route) {
    // Clean the query param from the URL bar
    window.history.replaceState(null, '', BASE + route);
    return route;
  }
  return stripBase(window.location.pathname);
}

const RouterContext = createContext<{
  path: string;
  navigate: (path: string) => void;
}>({ path: '/', navigate: () => {} });

export function useRouter() {
  return useContext(RouterContext);
}

export function Router({ children }: { children: (path: string, navigate: (path: string) => void) => React.ReactNode }) {
  const [path, setPath] = useState(() => getInitialPath());

  useEffect(() => {
    if (IS_EMBEDDED) {
      // Hash-based routing for WordPress / embedded contexts
      const onHashChange = () => setPath(getHashPath());
      window.addEventListener('hashchange', onHashChange);
      return () => window.removeEventListener('hashchange', onHashChange);
    }

    const onPopState = () => setPath(stripBase(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (to: string) => {
    if (IS_EMBEDDED) {
      window.location.hash = '#' + to;
      setPath(to);
      return;
    }

    const fullPath = BASE + to;
    window.history.pushState(null, '', fullPath);
    setPath(to);
  };

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children(path, navigate)}
    </RouterContext.Provider>
  );
}
