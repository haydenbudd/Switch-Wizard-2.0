import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./app/App.tsx";
import { ON_SITE } from "./app/utils/embed";
import "./styles/index.css";

function mount() {
  // WordPress plugin mounts into #lm-wizard-root; standalone uses #root
  const mountEl =
    document.getElementById("lm-wizard-root") ||
    document.getElementById("root");

  if (!mountEl) {
    console.error(
      '[Linemaster Product Finder] Mount point not found: expected #lm-wizard-root ' +
      '(WordPress shortcode) or #root (standalone) in the DOM. The wizard did not render.'
    );
    return;
  }
  // Never mount a second app over the first (it would wipe all wizard state)
  if (mountEl.hasAttribute("data-lm-mounted")) return;
  mountEl.setAttribute("data-lm-mounted", "");

  // Embedded on linemaster.com: blend into the host page (see theme.css)
  if (ON_SITE) {
    document.getElementById("lm-product-finder")?.classList.add("lm-on-site");
  }
  createRoot(mountEl).render(
    // Embedded: always light (the site has no dark mode and the toggle is
    // hidden), so a stored "dark" from an earlier visit can't apply
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme={ON_SITE ? "light" : undefined}>
      <App />
    </ThemeProvider>
  );
}

// WordPress loads the entry as app.js?ver=…, but lazily loaded chunks
// (wizard companion, PDF, admin) import it back as plain "./app.js". A
// different URL is a different module to the browser, so the app ran a
// second time and remounted over itself: on linemaster.com the wizard hat
// dropped the moment the companion chunk loaded. Load the plain URL instead
// and let that single instance mount, so every chunk shares it.
const entryUrl = new URL(import.meta.url);
if (import.meta.env.PROD && (entryUrl.search || entryUrl.hash)) {
  entryUrl.search = "";
  entryUrl.hash = "";
  import(/* @vite-ignore */ entryUrl.href);
} else {
  mount();
}
