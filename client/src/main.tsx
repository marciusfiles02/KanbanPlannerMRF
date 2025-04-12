import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { DndProvider } from "react-beautiful-dnd";

createRoot(document.getElementById("root")!).render(
  <App />
);
