import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { LearningModeProvider } from "./contexts/LearningModeContext";

createRoot(document.getElementById("root")!).render(
  <LearningModeProvider>
    <App />
  </LearningModeProvider>
);
