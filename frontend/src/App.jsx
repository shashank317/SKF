import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Configurator from "./pages/Configurator";
import ConnectionTest from "./components/ConnectionTest";

function App() {
  return (
    <BrowserRouter>
      <ConnectionTest />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/configurator" element={<Configurator />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
