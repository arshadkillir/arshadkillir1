import { BrowserRouter } from "react-router-dom";

import React from "react";
import { createRoot } from "react-dom/client";
import ErrorBoundary from "./ErrorBoundary.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <ErrorBoundary><AuthProvider><BrowserRouter><App /></BrowserRouter></AuthProvider></ErrorBoundary>
);



