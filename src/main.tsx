import React from "react";
import ReactDOM from "react-dom/client";
import { App, Settings } from "./pages";
import "./index.css";
import { ChakraProvider } from "@chakra-ui/react";
import { SettingsProvider } from "./context/settingsContext";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import initialSettings from "./settings.json";
import useLocalStorage from "./hooks/useLocalStorage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider>
      <SettingsProvider>
        <RouterProvider router={router} />
      </SettingsProvider>
    </ChakraProvider>
  </React.StrictMode>
);
