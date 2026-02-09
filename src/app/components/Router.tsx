import { createContext, useContext, useState, useEffect } from 'react';

const RouterContext = createContext<{
  path: string;
  navigate: (path: string) => void;
}>({ path: '/', navigate: () => {} });

export function useRouter() {
  return useContext(RouterContext);
}

export function Router({ children }: { children: (path: string, navigate: (path: string) => void) => React.ReactNode }) {
  const [path, setPath] = useState('/');

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    setPath(window.location.pathname);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (to: string) => {
    window.history.pushState(null, '', to);
    setPath(to);
  };

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children(path, navigate)}
    </RouterContext.Provider>
  );
}
