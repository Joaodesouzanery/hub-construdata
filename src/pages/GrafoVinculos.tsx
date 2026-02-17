import { useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Network, Building2, Users, ZoomIn, ZoomOut, Maximize2,
  AlertTriangle, Eye, Info, MapPin,
} from "lucide-react";
import { empresas } from "@/data/empresas";
import { projetos } from "@/data/projetos";

// ── Tipos ──
interface GraphNode {
  id: string;
  label: string;
  type: "empresa" | "projeto";
  x: number;
  y: number;
  score?: number;
  estado?: string;
  porte?: string;
}

interface GraphEdge {
  source: string;
  target: string;
  label: string;
  peso: number; // 1-5 strength
}

interface Anomalia {
  titulo: string;
  descricao: string;
  tipo: "vinculo" | "concentracao" | "padrao";
  severidade: "alta" | "media" | "baixa";
  empresas: string[];
}

// ── Construir grafo ──
function buildGraph() {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();

  // Nodes para empresas
  empresas.forEach((emp, i) => {
    const angle = (i / empresas.length) * 2 * Math.PI;
    const radius = 280;
    nodes.push({
      id: emp.id,
      label: emp.nome_fantasia,
      type: "empresa",
      x: 400 + radius * Math.cos(angle),
      y: 350 + radius * Math.sin(angle),
      score: emp.nota_score,
      estado: emp.estado_sede,
      porte: emp.porte,
    });
  });

  // Edges via projetos compartilhados
  projetos.forEach((proj) => {
    const participantesIds = proj.participantes.map((p) => p.empresa_id);
    // Conectar todos os participantes entre si
    for (let i = 0; i < participantesIds.length; i++) {
      for (let j = i + 1; j < participantesIds.length; j++) {
        const key = [participantesIds[i], participantesIds[j]].sort().join("-");
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push({
            source: participantesIds[i],
            target: participantesIds[j],
            label: proj.titulo.slice(0, 40),
            peso: 1,
          });
        } else {
          // Incrementar peso
          const existing = edges.find(
            (e) =>
              (e.source === participantesIds[i] && e.target === participantesIds[j]) ||
              (e.source === participantesIds[j] && e.target === participantesIds[i])
          );
          if (existing) existing.peso++;
        }
      }
    }
  });

  return { nodes, edges };
}

// ── Detectar anomalias de vínculos ──
function detectAnomalias(): Anomalia[] {
  const anomalias: Anomalia[] = [];

  // Contar conexões por empresa
  const conexoes: Record<string, Set<string>> = {};
  projetos.forEach((proj) => {
    const ids = proj.participantes.map((p) => p.empresa_id);
    ids.forEach((id) => {
      if (!conexoes[id]) conexoes[id] = new Set();
      ids.forEach((other) => {
        if (other !== id) conexoes[id].add(other);
      });
    });
  });

  // Empresas com muitas conexões (hub)
  Object.entries(conexoes).forEach(([empId, parceiros]) => {
    if (parceiros.size >= 3) {
      const emp = empresas.find((e) => e.id === empId);
      if (emp) {
        anomalias.push({
          titulo: `Hub de conexões: ${emp.nome_fantasia}`,
          descricao: `Participa em projetos com ${parceiros.size} empresas diferentes. Posição central na rede.`,
          tipo: "concentracao",
          severidade: "baixa",
          empresas: [empId],
        });
      }
    }
  });

  // Empresas que aparecem juntas repetidamente
  const pairCount: Record<string, number> = {};
  projetos.forEach((proj) => {
    const ids = proj.participantes.map((p) => p.empresa_id);
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const key = [ids[i], ids[j]].sort().join("|");
        pairCount[key] = (pairCount[key] || 0) + 1;
      }
    }
  });

  Object.entries(pairCount).forEach(([pair, count]) => {
    if (count >= 2) {
      const [id1, id2] = pair.split("|");
      const emp1 = empresas.find((e) => e.id === id1);
      const emp2 = empresas.find((e) => e.id === id2);
      if (emp1 && emp2) {
        anomalias.push({
          titulo: `Vínculo recorrente detectado`,
          descricao: `${emp1.nome_fantasia} e ${emp2.nome_fantasia} participam juntas em ${count} projetos. Investigar relação societária.`,
          tipo: "vinculo",
          severidade: count >= 3 ? "alta" : "media",
          empresas: [id1, id2],
        });
      }
    }
  });

  // Empresa nova ganhando contratos grandes
  const anoAtual = new Date().getFullYear();
  empresas.forEach((emp) => {
    const anos = anoAtual - emp.ano_fundacao;
    if (anos <= 5 && emp.volume_total_contratos > 500000000) {
      anomalias.push({
        titulo: `Empresa recente com alto volume`,
        descricao: `${emp.nome_fantasia} tem apenas ${anos} anos mas acumula ${emp.volume_total_fmt} em contratos. Padrão atípico.`,
        tipo: "padrao",
        severidade: "media",
        empresas: [emp.id],
      });
    }
  });

  return anomalias;
}

// ── Cores ──
function nodeColor(score?: number) {
  if (!score) return "#94a3b8";
  if (score >= 85) return "#10b981";
  if (score >= 70) return "#3b82f6";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

function sevColor(sev: string) {
  if (sev === "alta") return "bg-red-100 text-red-700 border-red-200";
  if (sev === "media") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-blue-100 text-blue-700 border-blue-200";
}

const GrafoVinculos = () => {
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [mostrarLabels, setMostrarLabels] = useState(true);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });

  const { nodes, edges } = useMemo(() => buildGraph(), []);
  const anomalias = useMemo(() => detectAnomalias(), []);

  const estados = useMemo(() => {
    const set = new Set(empresas.map((e) => e.estado_sede));
    return ["Todos", ...Array.from(set).sort()];
  }, []);

  const filteredNodes = useMemo(() => {
    if (filtroEstado === "Todos") return nodes;
    const empIds = new Set(
      empresas.filter((e) => e.estado_sede === filtroEstado).map((e) => e.id)
    );
    return nodes.filter((n) => empIds.has(n.id));
  }, [nodes, filtroEstado]);

  const filteredEdges = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    return edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
  }, [edges, filteredNodes]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  const selectedEmpresa = useMemo(() => {
    if (!selectedNode) return null;
    return empresas.find((e) => e.id === selectedNode) || null;
  }, [selectedNode]);

  const connectedNodes = useMemo(() => {
    if (!selectedNode) return new Set<string>();
    const set = new Set<string>();
    edges.forEach((e) => {
      if (e.source === selectedNode) set.add(e.target);
      if (e.target === selectedNode) set.add(e.source);
    });
    return set;
  }, [selectedNode, edges]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as SVGElement).tagName === "svg" || (e.target as SVGElement).tagName === "rect") {
      setIsPanning(true);
      panStart.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    }
  }, [panOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y,
      });
    }
  }, [isPanning]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  // Stats
  const stats = useMemo(() => ({
    totalEmpresas: filteredNodes.length,
    totalConexoes: filteredEdges.length,
    mediaConexoes: filteredNodes.length > 0
      ? (filteredEdges.length * 2 / filteredNodes.length).toFixed(1)
      : "0",
    anomaliasAlta: anomalias.filter((a) => a.severidade === "alta").length,
  }), [filteredNodes, filteredEdges, anomalias]);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Network size={28} className="text-violet-500" />
            Grafo de Vínculos Empresariais
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Mapa de conexões entre empresas via projetos e licitações compartilhadas
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Empresas", valor: stats.totalEmpresas, icon: Building2, cor: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Conexões", valor: stats.totalConexoes, icon: Network, cor: "text-violet-500", bg: "bg-violet-500/10" },
          { label: "Média Conexões", valor: stats.mediaConexoes, icon: Users, cor: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Alertas de Vínculo", valor: anomalias.length, icon: AlertTriangle, cor: "text-red-500", bg: "bg-red-500/10" },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <s.icon size={16} className={s.cor} />
              </div>
              <div>
                <p className="text-[0.6rem] font-semibold text-muted-foreground uppercase">{s.label}</p>
                <p className="text-xl font-extrabold">{s.valor}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
        {/* Grafo SVG */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Network size={16} className="text-violet-500" />
                Mapa de Conexões
              </CardTitle>
              <div className="flex items-center gap-2">
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="text-xs border rounded-lg px-2 py-1"
                >
                  {estados.map((uf) => (
                    <option key={uf} value={uf}>{uf === "Todos" ? "Todos os estados" : uf}</option>
                  ))}
                </select>
                <Button variant="ghost" size="sm" onClick={() => setMostrarLabels(!mostrarLabels)} title="Toggle labels">
                  <Eye size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setZoom((z) => Math.min(2, z + 0.2))}>
                  <ZoomIn size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setZoom((z) => Math.max(0.3, z - 0.2))}>
                  <ZoomOut size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); setSelectedNode(null); }}>
                  <Maximize2 size={14} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div
              className="relative bg-[#fafbfc] overflow-hidden cursor-grab active:cursor-grabbing"
              style={{ height: 520 }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox="0 0 800 700"
                className="select-none"
              >
                <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoom})`}>
                  {/* Edges */}
                  {filteredEdges.map((edge, i) => {
                    const src = nodeMap.get(edge.source);
                    const tgt = nodeMap.get(edge.target);
                    if (!src || !tgt) return null;
                    const isHighlighted = selectedNode && (edge.source === selectedNode || edge.target === selectedNode);
                    const isDimmed = selectedNode && !isHighlighted;
                    return (
                      <g key={i}>
                        <line
                          x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                          stroke={isHighlighted ? "#8b5cf6" : "#cbd5e1"}
                          strokeWidth={Math.min(4, edge.peso * 1.5)}
                          opacity={isDimmed ? 0.1 : isHighlighted ? 0.8 : 0.3}
                          strokeDasharray={edge.peso > 1 ? "none" : "4 4"}
                        />
                        {mostrarLabels && edge.peso > 1 && !isDimmed && (
                          <text
                            x={(src.x + tgt.x) / 2}
                            y={(src.y + tgt.y) / 2 - 5}
                            fontSize={8}
                            fill="#94a3b8"
                            textAnchor="middle"
                          >
                            {edge.peso}x
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {filteredNodes.map((node) => {
                    const isSelected = node.id === selectedNode;
                    const isConnected = connectedNodes.has(node.id);
                    const isDimmed = selectedNode && !isSelected && !isConnected;
                    const r = isSelected ? 28 : 22;

                    return (
                      <g
                        key={node.id}
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNode(selectedNode === node.id ? null : node.id);
                        }}
                        opacity={isDimmed ? 0.2 : 1}
                      >
                        {/* Glow for selected */}
                        {isSelected && (
                          <circle cx={node.x} cy={node.y} r={r + 6} fill={nodeColor(node.score)} opacity={0.15} />
                        )}
                        <circle
                          cx={node.x} cy={node.y} r={r}
                          fill="white"
                          stroke={nodeColor(node.score)}
                          strokeWidth={isSelected ? 4 : isConnected ? 3 : 2}
                        />
                        <text
                          x={node.x} y={node.y + 1}
                          fontSize={9} fontWeight="bold"
                          fill={nodeColor(node.score)}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          {node.score}
                        </text>
                        {mostrarLabels && (
                          <text
                            x={node.x} y={node.y + r + 12}
                            fontSize={9} fontWeight="600"
                            fill="#334155"
                            textAnchor="middle"
                          >
                            {node.label.length > 18 ? node.label.slice(0, 18) + "…" : node.label}
                          </text>
                        )}
                        {mostrarLabels && node.estado && (
                          <text
                            x={node.x} y={node.y + r + 23}
                            fontSize={7}
                            fill="#94a3b8"
                            textAnchor="middle"
                          >
                            {node.estado}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* Legend */}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg p-2.5 shadow-sm text-[0.6rem] space-y-1">
                <p className="font-bold text-xs mb-1">Legenda</p>
                {[
                  { cor: "#10b981", label: "Score 85+" },
                  { cor: "#3b82f6", label: "Score 70-84" },
                  { cor: "#f59e0b", label: "Score 50-69" },
                  { cor: "#ef4444", label: "Score <50" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: l.cor }} />
                    <span>{l.label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5 pt-1 border-t">
                  <div className="w-6 h-0.5 bg-violet-400" />
                  <span>Vínculo em projeto</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Empresa selecionada */}
          {selectedEmpresa ? (
            <Card className="border-0 shadow-sm border-t-2 border-t-violet-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Building2 size={16} className="text-violet-500" />
                  {selectedEmpresa.nome_fantasia}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Score</span>
                    <p className="font-bold text-lg">{selectedEmpresa.nota_score}</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Conexões</span>
                    <p className="font-bold text-lg">{connectedNodes.size}</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Taxa Vitória</span>
                    <p className="font-bold">{selectedEmpresa.taxa_vitoria}%</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Volume</span>
                    <p className="font-bold text-xs">{selectedEmpresa.volume_total_fmt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin size={12} />
                  {selectedEmpresa.cidade_sede}/{selectedEmpresa.estado_sede}
                </div>
                {connectedNodes.size > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-2">Empresas Conectadas:</p>
                    <div className="space-y-1">
                      {Array.from(connectedNodes).map((id) => {
                        const emp = empresas.find((e) => e.id === id);
                        if (!emp) return null;
                        return (
                          <div
                            key={id}
                            className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-muted/50 cursor-pointer"
                            onClick={() => setSelectedNode(id)}
                          >
                            <span className="font-medium">{emp.nome_fantasia}</span>
                            <span className="text-muted-foreground">{emp.nota_score}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <Button
                  size="sm"
                  className="w-full gap-1.5"
                  onClick={() => navigate(`/empresas/${selectedEmpresa.id}`)}
                >
                  <Eye size={14} /> Ver Dossiê Completo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5 text-center text-muted-foreground">
                <Network size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">Selecione uma empresa</p>
                <p className="text-xs mt-1">Clique em um nó do grafo para ver detalhes e conexões</p>
              </CardContent>
            </Card>
          )}

          {/* Anomalias de Vínculo */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" />
                Alertas de Vínculo ({anomalias.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[340px] overflow-y-auto">
              {anomalias.map((a, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg border text-xs ${sevColor(a.severidade)}`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-bold uppercase text-[0.55rem]">{a.severidade}</span>
                    <span className="text-[0.55rem] opacity-70">{a.tipo}</span>
                  </div>
                  <p className="font-semibold text-xs">{a.titulo}</p>
                  <p className="opacity-80 mt-0.5 leading-relaxed">{a.descricao}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-50 to-blue-50">
            <CardContent className="p-4">
              <p className="text-xs font-bold flex items-center gap-1.5 mb-2">
                <Info size={13} className="text-violet-500" />
                Como funciona
              </p>
              <ul className="text-[0.65rem] text-muted-foreground space-y-1 leading-relaxed">
                <li>Cada nó representa uma empresa com seu score</li>
                <li>Linhas conectam empresas que participam dos mesmos projetos</li>
                <li>Linhas mais grossas = mais projetos em comum</li>
                <li>Alertas são gerados para padrões atípicos de vínculo</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GrafoVinculos;
