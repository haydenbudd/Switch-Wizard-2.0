import { createContext, useContext, useState, useEffect } from 'react';

// Strip the Vite base path so internal routing uses simple paths like '/' and '/admin'
const BASE = import.meta.env.BASE_URL.replace(/\/$/, ''); // e.g. '/Switch-Wizard-2.0'

function stripBase(pathname: string): string {
  if (BASE && pathname.startsWith(BASE)) {
    const stripped = pathname.slice(BASE.length);
    return stripped || '/';
  }
  return pathname || '/';
}

// GitHub Pages 404.html redirects sub-routes as ?route=/admin — restore them
function getInitialPath(): string {
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
    const onPopState = () => setPath(stripBase(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (to: string) => {
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
