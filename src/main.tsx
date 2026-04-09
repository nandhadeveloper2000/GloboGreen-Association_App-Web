// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import App from "./App";
import { store } from "./redux/store";
import { bootstrapAuth } from "./lib/authBootstrap";
import "./index.css";


async function startApp() {
  await bootstrapAuth();

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <Provider store={store}>
          <App />
        </Provider>
    </React.StrictMode>
  );
}

startApp();
