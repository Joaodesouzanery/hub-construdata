import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Trophy,
  TrendingUp,
  ArrowLeft,
  Briefcase,
  Target,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Users,
  BarChart3,
  Calendar,
  DollarSign,
  ExternalLink,
} from "lucide-react";
import { empresas } from "@/data/empresas";
import { projetos } from "@/data/projetos";
import type { Projeto } from "@/types/database";

function scoreColor(score: number): string {
  if (score >= 85) return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (score >= 70) return "text-blue-600 bg-blue-50 border-blue-200";
  if (score >= 50) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-600 bg-red-50 border-red-200";
}

function scoreLabel(score: number): string {
  if (score >= 85) return "Excelente";
  if (score >= 70) return "Bom";
  if (score >= 50) return "Regular";
  return "Atencao";
}

function porteLabel(porte: string): string {
  const map: Record<string, string> = {
    MEI: "Microempreendedor Individual",
    ME: "Microempresa",
    EPP: "Empresa de Pequeno Porte",
    Media: "Empresa de Medio Porte",
    Grande: "Empresa de Grande Porte",
  };
  return map[porte] || porte;
}

function statusIcon(status: string) {
  switch (status) {
    case "Em Andamento": return <Clock size={14} className="text-blue-500" />;
    case "Concluido": return <CheckCircle2 size={14} className="text-emerald-500" />;
    case "Atrasado": return <AlertTriangle size={14} className="text-red-500" />;
    case "Planejado": return <Calendar size={14} className="text-gray-400" />;
    case "Paralisado": return <AlertTriangle size={14} className="text-amber-500" />;
    default: return null;
  }
}

function statusStyle(status: string): string {
  switch (status) {
    case "Em Andamento": return "bg-blue-50 text-blue-700";
    case "Concluido": return "bg-emerald-50 text-emerald-700";
    case "Atrasado": return "bg-red-50 text-red-700";
    case "Planejado": return "bg-muted text-muted-foreground";
    case "Paralisado": return "bg-amber-50 text-amber-700";
    default: return "bg-muted text-muted-foreground";
  }
}

function formatarDataBR(dataStr: string): string {
  if (!dataStr) return "--";
  const [ano, mes, dia] = dataStr.split("-");
  return `${dia}/${mes}/${ano}`;
}

const ProjetoMiniCard = ({ projeto }: { projeto: Projeto }) => {
  const navigate = useNavigate();
  return (
    <Card
      className="p-4 hover:shadow-md transition-all cursor-pointer border-0 shadow-sm group"
      onClick={() => navigate(`/projetos/${projeto.id}`)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {statusIcon(projeto.status)}
            <span className={`text-[0.6rem] font-bold uppercase px-2 py-0.5 rounded-full ${statusStyle(projeto.status)}`}>
              {projeto.status}
            </span>
            <span className="text-[0.6rem] font-semibold text-muted-foreground">
              {projeto.percentual_execucao}% concluido
            </span>
          </div>
          <h4 className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {projeto.titulo}
          </h4>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {projeto.cidade}/{projeto.estado}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {formatarDataBR(projeto.data_inicio)} - {formatarDataBR(projeto.data_previsao_termino)}
            </span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-primary">{projeto.valor_contrato_fmt}</p>
          <span className="flex items-center gap-1 text-[0.65rem] text-muted-foreground mt-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink size={11} />
            Ver dossie
          </span>
        </div>
      </div>
      {/* Progress bar */}
      <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${projeto.percentual_execucao}%` }}
        />
      </div>
    </Card>
  );
};

const DossieEmpresa = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const empresa = useMemo(() => empresas.find((e) => e.id === id), [id]);

  const projetosEmpresa = useMemo(() => {
    if (!empresa) return [];
    return projetos.filter(
      (p) =>
        p.empresa_responsavel_id === empresa.id ||
        p.participantes.some((part) => part.empresa_id === empresa.id)
    );
  }, [empresa]);

  const projetosAtivos = projetosEmpresa.filter((p) => p.status === "Em Andamento");
  const projetosPlanejados = projetosEmpresa.filter((p) => p.status === "Planejado");
  const projetosConcluidos = projetosEmpresa.filter((p) => p.status === "Concluido");

  const volumeProjetos = useMemo(() => {
    const soma = projetosEmpresa.reduce((acc, p) => acc + p.valor_contrato, 0);
    if (soma >= 1e9) return `R$ ${(soma / 1e9).toFixed(2)}B`;
    if (soma >= 1e6) return `R$ ${(soma / 1e6).toFixed(1)}M`;
    return `R$ ${soma.toLocaleString("pt-BR")}`;
  }, [projetosEmpresa]);

  // Categorias mais frequentes
  const categoriasProjetos = useMemo(() => {
    const map: Record<string, number> = {};
    projetosEmpresa.forEach((p) => {
      map[p.categoria] = (map[p.categoria] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [projetosEmpresa]);

  // Estados de atuacao
  const estadosAtuacao = useMemo(() => {
    const set = new Set<string>();
    projetosEmpresa.forEach((p) => set.add(p.estado));
    return Array.from(set).sort();
  }, [projetosEmpresa]);

  // Parceiros frequentes
  const parceiros = useMemo(() => {
    const map: Record<string, { nome: string; count: number; papeis: Set<string> }> = {};
    projetosEmpresa.forEach((p) => {
      p.participantes.forEach((part) => {
        if (part.empresa_id !== empresa?.id) {
          if (!map[part.empresa_id]) {
            map[part.empresa_id] = { nome: part.nome, count: 0, papeis: new Set() };
          }
          map[part.empresa_id].count++;
          map[part.empresa_id].papeis.add(part.papel);
        }
      });
    });
    return Object.entries(map)
      .map(([empId, data]) => ({ id: empId, ...data, papeis: Array.from(data.papeis) }))
      .sort((a, b) => b.count - a.count);
  }, [projetosEmpresa, empresa]);

  if (!empresa) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center py-20">
        <Building2 size={48} className="mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-semibold mb-2">Empresa nao encontrada</h2>
        <p className="text-sm text-muted-foreground mb-4">O ID informado nao corresponde a nenhuma empresa cadastrada.</p>
        <Button variant="outline" onClick={() => navigate("/empresas")}>
          <ArrowLeft size={16} className="mr-2" />
          Voltar para Empresas
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/empresas")}
        className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} className="mr-1" />
        Voltar para Empresas
      </Button>

      {/* Company Header */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Building2 size={28} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{empresa.nome_fantasia}</h1>
              <p className="text-sm text-muted-foreground">{empresa.razao_social}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${scoreColor(empresa.nota_score)}`}>
              Score: {empresa.nota_score}/100 — {scoreLabel(empresa.nota_score)}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-muted text-muted-foreground">
              {porteLabel(empresa.porte)}
            </span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${empresa.status === "Ativa" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
              {empresa.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Briefcase size={14} className="text-primary" />
              CNPJ: {empresa.cnpj}
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={14} className="text-primary" />
              {empresa.cidade_sede}/{empresa.estado_sede}
            </span>
            <span className="flex items-center gap-2">
              <Calendar size={14} className="text-primary" />
              Fundada em {empresa.ano_fundacao} ({new Date().getFullYear() - empresa.ano_fundacao} anos)
            </span>
            {empresa.telefone && (
              <span className="flex items-center gap-2">
                <Phone size={14} className="text-primary" />
                {empresa.telefone}
              </span>
            )}
            {empresa.email && (
              <span className="flex items-center gap-2">
                <Mail size={14} className="text-primary" />
                {empresa.email}
              </span>
            )}
            {empresa.site && (
              <span className="flex items-center gap-2">
                <Globe size={14} className="text-primary" />
                {empresa.site}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <Card className="p-4 border-0 shadow-sm text-center">
          <Trophy size={20} className="mx-auto text-amber-500 mb-1" />
          <p className="text-2xl font-bold">{empresa.taxa_vitoria}%</p>
          <p className="text-[0.65rem] text-muted-foreground uppercase">Taxa de Vitoria</p>
        </Card>
        <Card className="p-4 border-0 shadow-sm text-center">
          <FileText size={20} className="mx-auto text-blue-500 mb-1" />
          <p className="text-2xl font-bold">{empresa.licitacoes_participadas}</p>
          <p className="text-[0.65rem] text-muted-foreground uppercase">Participacoes</p>
        </Card>
        <Card className="p-4 border-0 shadow-sm text-center">
          <CheckCircle2 size={20} className="mx-auto text-emerald-500 mb-1" />
          <p className="text-2xl font-bold">{empresa.licitacoes_vencidas}</p>
          <p className="text-[0.65rem] text-muted-foreground uppercase">Vitorias</p>
        </Card>
        <Card className="p-4 border-0 shadow-sm text-center">
          <DollarSign size={20} className="mx-auto text-primary mb-1" />
          <p className="text-lg font-bold">{empresa.volume_total_fmt}</p>
          <p className="text-[0.65rem] text-muted-foreground uppercase">Volume Total</p>
        </Card>
        <Card className="p-4 border-0 shadow-sm text-center">
          <TrendingUp size={20} className="mx-auto text-violet-500 mb-1" />
          <p className="text-2xl font-bold">{projetosEmpresa.length}</p>
          <p className="text-[0.65rem] text-muted-foreground uppercase">Projetos</p>
        </Card>
      </div>

      {/* Performance visual */}
      <Card className="p-5 mb-6 border-0 shadow-sm">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-primary" />
          Performance em Licitacoes
        </h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Taxa de Vitoria</span>
              <span className="font-bold">{empresa.taxa_vitoria}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${empresa.taxa_vitoria}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Score de Confiabilidade</span>
              <span className="font-bold">{empresa.nota_score}/100</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${empresa.nota_score}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Aproveitamento (vitorias/participacoes)</span>
              <span className="font-bold">{empresa.licitacoes_vencidas} de {empresa.licitacoes_participadas}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${(empresa.licitacoes_vencidas / empresa.licitacoes_participadas) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Especialidades + Segmentos + Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 border-0 shadow-sm">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Target size={16} className="text-primary" />
            Especialidades
          </h3>
          <ul className="space-y-2">
            {empresa.especialidades.map((esp) => (
              <li key={esp} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                {esp}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5 border-0 shadow-sm">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Briefcase size={16} className="text-primary" />
            Segmentos de Atuacao
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {empresa.segmentos.map((seg) => (
              <span key={seg} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-violet-50 text-violet-700">
                {seg}
              </span>
            ))}
          </div>
          {categoriasProjetos.length > 0 && (
            <>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Categorias em Projetos</h4>
              <div className="space-y-1">
                {categoriasProjetos.map(([cat, count]) => (
                  <div key={cat} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{cat}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card className="p-5 border-0 shadow-sm">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <MapPin size={16} className="text-primary" />
            Areas de Atuacao
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700">
              Sede: {empresa.estado_sede}
            </span>
            {estadosAtuacao
              .filter((uf) => uf !== empresa.estado_sede)
              .map((uf) => (
                <span key={uf} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
                  {uf}
                </span>
              ))}
          </div>
          {parceiros.length > 0 && (
            <>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                <Users size={12} />
                Parceiros Frequentes
              </h4>
              <div className="space-y-2">
                {parceiros.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-sm cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/empresas/${p.id}`)}
                  >
                    <span className="text-muted-foreground">{p.nome}</span>
                    <span className="text-[0.6rem] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                      {p.count}x · {p.papeis[0]}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Projetos */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold flex items-center gap-2">
            <FileText size={18} className="text-primary" />
            Projetos ({projetosEmpresa.length})
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <DollarSign size={12} />
              Volume: <span className="font-bold text-foreground">{volumeProjetos}</span>
            </span>
          </div>
        </div>

        {projetosAtivos.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
              <Clock size={12} className="text-blue-500" />
              Em Andamento ({projetosAtivos.length})
            </h4>
            <div className="space-y-2">
              {projetosAtivos.map((p) => (
                <ProjetoMiniCard key={p.id} projeto={p} />
              ))}
            </div>
          </div>
        )}

        {projetosPlanejados.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
              <Calendar size={12} className="text-gray-400" />
              Planejados ({projetosPlanejados.length})
            </h4>
            <div className="space-y-2">
              {projetosPlanejados.map((p) => (
                <ProjetoMiniCard key={p.id} projeto={p} />
              ))}
            </div>
          </div>
        )}

        {projetosConcluidos.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-500" />
              Concluidos ({projetosConcluidos.length})
            </h4>
            <div className="space-y-2">
              {projetosConcluidos.map((p) => (
                <ProjetoMiniCard key={p.id} projeto={p} />
              ))}
            </div>
          </div>
        )}

        {projetosEmpresa.length === 0 && (
          <Card className="p-8 border-0 shadow-sm text-center text-muted-foreground">
            <FileText size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum projeto vinculado a esta empresa.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DossieEmpresa;
