import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { P } from "./screens/P";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <P />
      </LanguageProvider>
    </AuthProvider>
  </StrictMode>,
);