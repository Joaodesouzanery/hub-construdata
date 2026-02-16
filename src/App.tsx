import { Toaster } from "@/components/ui/sonner";
import { HashRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Noticias from "./pages/Noticias";
import LicitacoesPage from "./pages/LicitacoesPage";
import Mapa from "./pages/Mapa";
import Alertas from "./pages/AlertasInteligentes";
import IndicadoresPage from "./pages/IndicadoresPage";
import LegislacaoPage from "./pages/LegislacaoPage";
import Ferramentas from "./pages/Ferramentas";
import EventosPage from "./pages/EventosPage";
import Contato from "./pages/Contato";
import Perfil from "./pages/Perfil";
import Analitico from "./pages/Analitico";
import Relatorios from "./pages/Relatorios";
import NotFound from "./pages/NotFound";

const App = () => (
  <HashRouter>
    <Toaster />
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/noticias" element={<Noticias />} />
        <Route path="/licitacoes" element={<LicitacoesPage />} />
        <Route path="/mapa" element={<Mapa />} />
        <Route path="/alertas" element={<Alertas />} />
        <Route path="/indicadores" element={<IndicadoresPage />} />
        <Route path="/legislacao" element={<LegislacaoPage />} />
        <Route path="/ferramentas" element={<Ferramentas />} />
        <Route path="/eventos" element={<EventosPage />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/analitico" element={<Analitico />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </HashRouter>
);

export default App;
