import { Toaster } from "@/components/ui/sonner";
import { HashRouter, Routes, Route } from "react-router-dom";
import Hub from "./pages/Hub";
import Contato from "./pages/Contato";
import NotFound from "./pages/NotFound";

const App = () => (
  <HashRouter>
    <Toaster />
    <Routes>
      <Route path="/" element={<Hub />} />
      <Route path="/hub" element={<Hub />} />
      <Route path="/contato" element={<Contato />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </HashRouter>
);

export default App;
