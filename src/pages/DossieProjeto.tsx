import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Users,
  Target,
  TrendingUp,
  ExternalLink,
  Milestone,
} from "lucide-react";
import { projetos } from "@/data/projetos";
import { empresas } from "@/data/empresas";
import licitacoes from "@/data/licitacoes";

function statusStyle(status: string): string {
  switch (status) {
    case "Em Andamento": return "bg-blue-100 text-blue-800 border-blue-200";
    case "Concluido": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Atrasado": return "bg-red-100 text-red-800 border-red-200";
    case "Planejado": return "bg-gray-100 text-gray-700 border-gray-200";
    case "Paralisado": return "bg-amber-100 text-amber-800 border-amber-200";
    default: return "bg-gray-100 text-gray-600";
  }
}

function statusIcon(status: string) {
  switch (status) {
    case "Em Andamento": return <Clock size={16} className="text-blue-500" />;
    case "Concluido": return <CheckCircle2 size={16} className="text-emerald-500" />;
    case "Atrasado": return <AlertTriangle size={16} className="text-red-500" />;
    case "Planejado": return <Calendar size={16} className="text-gray-400" />;
    case "Paralisado": return <AlertTriangle size={16} className="text-amber-500" />;
    default: return null;
  }
}

function marcoStatusStyle(status: string): string {
  switch (status) {
    case "concluido": return "bg-emerald-500";
    case "em_andamento": return "bg-blue-500 animate-pulse";
    case "pendente": return "bg-gray-300";
    default: return "bg-gray-300";
  }
}

function marcoLineStyle(status: string): string {
  switch (status) {
    case "concluido": return "bg-emerald-300";
    case "em_andamento": return "bg-blue-300";
    case "pendente": return "bg-gray-200";
    default: return "bg-gray-200";
  }
}

function formatarDataBR(dataStr: string): string {
  if (!dataStr) return "--";
  const [ano, mes, dia] = dataStr.split("-");
  return `${dia}/${mes}/${ano}`;
}

function progressColor(pct: number): string {
  if (pct >= 75) return "bg-emerald-500";
  if (pct >= 40) return "bg-blue-500";
  if (pct >= 10) return "bg-amber-500";
  return "bg-gray-300";
}

const DossieProjeto = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const projeto = useMemo(() => projetos.find((p) => p.id === id), [id]);

  const empresaResp = useMemo(() => {
    if (!projeto) return null;
    return empresas.find((e) => e.id === projeto.empresa_responsavel_id) || null;
  }, [projeto]);

  const licitacaoOrigem = useMemo(() => {
    if (!projeto?.licitacao_origem_id) return null;
    return licitacoes.find((l) => l.id === projeto.licitacao_origem_id) || null;
  }, [projeto]);

  const marcosConcluidos = projeto?.marcos.filter((m) => m.status === "concluido").length || 0;
  const marcosTotal = projeto?.marcos.length || 0;

  // Dias restantes
  const diasRestantes = useMemo(() => {
    if (!projeto) return 0;
    const termino = new Date(projeto.data_previsao_termino);
    const hoje = new Date();
    const diff = termino.getTime() - hoje.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [projeto]);

  // Duracao total em meses
  const duracaoMeses = useMemo(() => {
    if (!projeto) return 0;
    const inicio = new Date(projeto.data_inicio);
    const termino = new Date(projeto.data_previsao_termino);
    return Math.round((termino.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24 * 30));
  }, [projeto]);

  if (!projeto) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center py-20">
        <FileText size={48} className="mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-semibold mb-2">Projeto nao encontrado</h2>
        <p className="text-sm text-muted-foreground mb-4">O ID informado nao corresponde a nenhum projeto cadastrado.</p>
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
        onClick={() => navigate(-1)}
        className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} className="mr-1" />
        Voltar
      </Button>

      {/* Project Header */}
      <div className="mb-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
            <FileText size={24} className="text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {statusIcon(projeto.status)}
              <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${statusStyle(projeto.status)}`}>
                {projeto.status}
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-violet-50 text-violet-700">
                {projeto.categoria}
              </span>
            </div>
            <h1 className="text-xl font-bold leading-snug mb-2">{projeto.titulo}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{projeto.descricao}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <Card className="p-4 border-0 shadow-sm text-center">
          <DollarSign size={20} className="mx-auto text-primary mb-1" />
          <p className="text-lg font-bold">{projeto.valor_contrato_fmt}</p>
          <p className="text-[0.65rem] text-muted-foreground uppercase">Valor do Contrato</p>
        </Card>
        <Card className="p-4 border-0 shadow-sm text-center">
          <TrendingUp size={20} className="mx-auto text-blue-500 mb-1" />
          <p className="text-2xl font-bold">{projeto.percentual_execucao}%</p>
          <p className="text-[0.65rem] text-muted-foreground uppercase">Execucao</p>
        </Card>
        <Card className="p-4 border-0 shadow-sm text-center">
          <Calendar size={20} className="mx-auto text-amber-500 mb-1" />
          <p className="text-2xl font-bold">{duracaoMeses}</p>
          <p className="text-[0.65rem] text-muted-foreground uppercase">Meses (duracao)</p>
        </Card>
        <Card className="p-4 border-0 shadow-sm text-center">
          <Clock size={20} className="mx-auto text-violet-500 mb-1" />
          <p className="text-2xl font-bold">{diasRestantes > 0 ? diasRestantes : 0}</p>
          <p className="text-[0.65rem] text-muted-foreground uppercase">Dias Restantes</p>
        </Card>
        <Card className="p-4 border-0 shadow-sm text-center">
          <Milestone size={20} className="mx-auto text-emerald-500 mb-1" />
          <p className="text-2xl font-bold">{marcosConcluidos}/{marcosTotal}</p>
          <p className="text-[0.65rem] text-muted-foreground uppercase">Marcos</p>
        </Card>
      </div>

      {/* Progress bar */}
      <Card className="p-5 mb-6 border-0 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold">Progresso Geral</h3>
          <span className="text-sm font-bold">{projeto.percentual_execucao}%</span>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${progressColor(projeto.percentual_execucao)}`}
            style={{ width: `${projeto.percentual_execucao}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{formatarDataBR(projeto.data_inicio)}</span>
          <span>Previsao: {formatarDataBR(projeto.data_previsao_termino)}</span>
        </div>
      </Card>

      {/* Info + Timeline row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left: Info */}
        <div className="space-y-4">
          {/* Dados do contrato */}
          <Card className="p-5 border-0 shadow-sm">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Target size={16} className="text-primary" />
              Dados do Contrato
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Orgao Contratante</span>
                <span className="font-semibold text-right max-w-[60%]">{projeto.orgao_contratante}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Local</span>
                <span className="font-semibold">{projeto.cidade}/{projeto.estado}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categoria</span>
                <span className="font-semibold">{projeto.categoria}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inicio</span>
                <span className="font-semibold">{formatarDataBR(projeto.data_inicio)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Previsao de Termino</span>
                <span className="font-semibold">{formatarDataBR(projeto.data_previsao_termino)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor</span>
                <span className="font-bold text-primary">{projeto.valor_contrato_fmt}</span>
              </div>
            </div>
          </Card>

          {/* Licitacao de origem */}
          {licitacaoOrigem && (
            <Card className="p-5 border-0 shadow-sm">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                Licitacao de Origem
              </h3>
              <p className="text-sm text-muted-foreground leading-snug mb-2">{licitacaoOrigem.titulo}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  {licitacaoOrigem.modalidade}
                </span>
                <span className="font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {licitacaoOrigem.numero_controle}
                </span>
              </div>
            </Card>
          )}

          {/* Participantes */}
          <Card className="p-5 border-0 shadow-sm">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Users size={16} className="text-primary" />
              Participantes ({projeto.participantes.length})
            </h3>
            <div className="space-y-3">
              {projeto.participantes.map((part, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/60 transition-colors"
                  onClick={() => navigate(`/empresas/${part.empresa_id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{part.nome}</p>
                      <p className="text-[0.65rem] text-muted-foreground">CNPJ: {part.cnpj}</p>
                    </div>
                  </div>
                  <span className="text-[0.6rem] font-bold uppercase px-2 py-1 rounded-full bg-violet-50 text-violet-700">
                    {part.papel}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Timeline */}
        <Card className="p-5 border-0 shadow-sm">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Milestone size={16} className="text-primary" />
            Timeline de Marcos ({marcosConcluidos}/{marcosTotal} concluidos)
          </h3>
          <div className="relative">
            {projeto.marcos.map((marco, idx) => {
              const isLast = idx === projeto.marcos.length - 1;
              return (
                <div key={idx} className="flex gap-4 pb-6 last:pb-0">
                  {/* Timeline line & dot */}
                  <div className="flex flex-col items-center">
                    <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${marcoStatusStyle(marco.status)}`} />
                    {!isLast && (
                      <div className={`w-0.5 flex-1 mt-1 ${marcoLineStyle(marco.status)}`} />
                    )}
                  </div>
                  {/* Content */}
                  <div className="flex-1 -mt-0.5">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-foreground">{formatarDataBR(marco.data)}</span>
                      {marco.status === "concluido" && (
                        <CheckCircle2 size={12} className="text-emerald-500" />
                      )}
                      {marco.status === "em_andamento" && (
                        <Clock size={12} className="text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-snug">{marco.descricao}</p>
                    <span className={`inline-block mt-1 text-[0.55rem] font-bold uppercase px-2 py-0.5 rounded-full ${
                      marco.status === "concluido"
                        ? "bg-emerald-50 text-emerald-700"
                        : marco.status === "em_andamento"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-gray-50 text-gray-500"
                    }`}>
                      {marco.status === "concluido" ? "Concluido" : marco.status === "em_andamento" ? "Em Andamento" : "Pendente"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Empresa Responsavel */}
      {empresaResp && (
        <Card className="p-5 border-0 shadow-sm">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Building2 size={16} className="text-primary" />
            Empresa Responsavel
          </h3>
          <div
            className="flex items-center justify-between p-4 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/60 transition-colors"
            onClick={() => navigate(`/empresas/${empresaResp.id}`)}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Building2 size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-base font-bold">{empresaResp.nome_fantasia}</p>
                <p className="text-xs text-muted-foreground">{empresaResp.razao_social}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {empresaResp.cidade_sede}/{empresaResp.estado_sede}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp size={11} />
                    Score: {empresaResp.nota_score}/100
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary">Ver Dossie</span>
              <ExternalLink size={14} className="text-primary" />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DossieProjeto;
