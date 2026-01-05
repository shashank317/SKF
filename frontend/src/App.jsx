import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import NotFound from "./pages/NotFound";
import Configurator from "./pages/Configurator";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/configurator" element={<Configurator />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
