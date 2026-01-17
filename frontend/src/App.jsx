import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./features/landing/pages/LandingPage";
import NotFound from "./pages/NotFound";
import ConfiguratorPage from "./features/configurator/pages/ConfiguratorPage";
import ConnectionTest from "./components/ConnectionTest";

function App() {
  return (
    <BrowserRouter>
      <ConnectionTest />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/configurator" element={<ConfiguratorPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

