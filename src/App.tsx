import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { HashRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";

// ── Lazy-loaded pages (code-splitting) ──
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Noticias = lazy(() => import("./pages/Noticias"));
const LicitacoesPage = lazy(() => import("./pages/LicitacoesPage"));
const Mapa = lazy(() => import("./pages/Mapa"));
const Alertas = lazy(() => import("./pages/AlertasInteligentes"));
const LegislacaoPage = lazy(() => import("./pages/LegislacaoPage"));
const Contato = lazy(() => import("./pages/Contato"));
const Perfil = lazy(() => import("./pages/Perfil"));
const Analitico = lazy(() => import("./pages/Analitico"));
const InsightsIA = lazy(() => import("./pages/InsightsIA"));
const Relatorios = lazy(() => import("./pages/Relatorios"));
const EmpresasPage = lazy(() => import("./pages/EmpresasPage"));
const DossieEmpresa = lazy(() => import("./pages/DossieEmpresa"));
const DossieProjeto = lazy(() => import("./pages/DossieProjeto"));
const GrafoVinculos = lazy(() => import("./pages/GrafoVinculos"));
const BuscaInteligente = lazy(() => import("./pages/BuscaInteligente"));
const DeteccaoAnomalias = lazy(() => import("./pages/DeteccaoAnomalias"));
const EnriquecimentoDados = lazy(() => import("./pages/EnriquecimentoDados"));
const ComparativoEstados = lazy(() => import("./pages/ComparativoEstados"));
const DashboardSetor = lazy(() => import("./pages/DashboardSetor"));
const PoliticaPrivacidade = lazy(() => import("./pages/PoliticaPrivacidade"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PageLoader = () => (
  <div className="flex items-center justify-center h-[60vh]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground font-medium">Carregando...</p>
    </div>
  </div>
);

const App = () => (
  <HashRouter>
    <Toaster />
    <Routes>
      {/* Landing Page — sem sidebar, layout próprio */}
      <Route path="/" element={<Suspense fallback={<PageLoader />}><LandingPage /></Suspense>} />

      {/* App principal — com sidebar e layout padrão */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
        <Route path="/noticias" element={<Suspense fallback={<PageLoader />}><Noticias /></Suspense>} />
        <Route path="/licitacoes" element={<Suspense fallback={<PageLoader />}><LicitacoesPage /></Suspense>} />
        <Route path="/mapa" element={<Suspense fallback={<PageLoader />}><Mapa /></Suspense>} />
        <Route path="/alertas" element={<Suspense fallback={<PageLoader />}><Alertas /></Suspense>} />
        <Route path="/legislacao" element={<Suspense fallback={<PageLoader />}><LegislacaoPage /></Suspense>} />
        <Route path="/contato" element={<Suspense fallback={<PageLoader />}><Contato /></Suspense>} />
        <Route path="/perfil" element={<Suspense fallback={<PageLoader />}><Perfil /></Suspense>} />
        <Route path="/analitico" element={<Suspense fallback={<PageLoader />}><Analitico /></Suspense>} />
        <Route path="/insights-ia" element={<Suspense fallback={<PageLoader />}><InsightsIA /></Suspense>} />
        <Route path="/relatorios" element={<Suspense fallback={<PageLoader />}><Relatorios /></Suspense>} />
        <Route path="/empresas" element={<Suspense fallback={<PageLoader />}><EmpresasPage /></Suspense>} />
        <Route path="/empresas/:id" element={<Suspense fallback={<PageLoader />}><DossieEmpresa /></Suspense>} />
        <Route path="/projetos/:id" element={<Suspense fallback={<PageLoader />}><DossieProjeto /></Suspense>} />
        <Route path="/vinculos" element={<Suspense fallback={<PageLoader />}><GrafoVinculos /></Suspense>} />
        <Route path="/busca" element={<Suspense fallback={<PageLoader />}><BuscaInteligente /></Suspense>} />
        <Route path="/anomalias" element={<Suspense fallback={<PageLoader />}><DeteccaoAnomalias /></Suspense>} />
        <Route path="/enriquecimento" element={<Suspense fallback={<PageLoader />}><EnriquecimentoDados /></Suspense>} />
        <Route path="/comparativo" element={<Suspense fallback={<PageLoader />}><ComparativoEstados /></Suspense>} />
        <Route path="/setor" element={<Suspense fallback={<PageLoader />}><DashboardSetor /></Suspense>} />
        <Route path="/privacidade" element={<Suspense fallback={<PageLoader />}><PoliticaPrivacidade /></Suspense>} />
        <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
      </Route>
    </Routes>
  </HashRouter>
);

export default App;
