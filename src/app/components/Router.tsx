import { createContext, useContext, useState, useEffect } from 'react';

// Use hash-based routing so the app works when embedded inside WordPress pages
// (where window.location.pathname belongs to WordPress, not this app).
function getHashPath() {
  const hash = window.location.hash;
  return hash ? hash.slice(1) : '/'; // '#/admin' → '/admin'
}

const RouterContext = createContext<{
  path: string;
  navigate: (path: string) => void;
}>({ path: '/', navigate: () => {} });

export function useRouter() {
  return useContext(RouterContext);
}

export function Router({ children }: { children: (path: string, navigate: (path: string) => void) => React.ReactNode }) {
  const [path, setPath] = useState(getHashPath);

  useEffect(() => {
    const onHashChange = () => setPath(getHashPath());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (to: string) => {
    window.location.hash = to; // triggers hashchange → updates state
  };

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children(path, navigate)}
    </RouterContext.Provider>
  );
}
