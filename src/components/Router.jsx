import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import NotFound from "./NotFound";

export default function Router() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route exact path="/" element={<NotFound />} />
        <Route exact path="/:videoId" element={<App />} />
        <Route exact path="/embed/:videoId" element={<App />} />
        <Route element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
