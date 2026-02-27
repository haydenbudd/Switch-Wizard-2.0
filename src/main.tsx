import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./app/App.tsx";
import "./styles/index.css";

// WordPress plugin mounts into #lm-wizard-root; standalone uses #root
const mountEl =
  document.getElementById("lm-wizard-root") ||
  document.getElementById("root");

if (mountEl) {
  createRoot(mountEl).render(
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <App />
    </ThemeProvider>
  );
}
