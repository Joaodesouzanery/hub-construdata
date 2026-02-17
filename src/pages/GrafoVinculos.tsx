import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Network, Building2, Users, ZoomIn, ZoomOut, Maximize2,
  AlertTriangle, Eye, EyeOff, Info, MapPin, Play, Pause,
  Lock, Shield, ArrowRight,
} from "lucide-react";
import { empresas } from "@/data/empresas";
import { projetos } from "@/data/projetos";

// ── Tipos ──
interface GraphNode {
  id: string;
  label: string;
  type: "empresa";
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx: number | null;
  fy: number | null;
  score: number;
  estado: string;
  porte: string;
  conexoes: number;
}

interface GraphEdge {
  source: string;
  target: string;
  label: string;
  peso: number;
}

interface Anomalia {
  titulo: string;
  descricao: string;
  tipo: "vinculo" | "concentracao" | "padrao";
  severidade: "alta" | "media" | "baixa";
  empresas: string[];
}

// ── Construir grafo ──
function buildGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();
  const conexoesCount: Record<string, number> = {};

  // Edges via projetos compartilhados
  projetos.forEach((proj) => {
    const ids = proj.participantes.map((p) => p.empresa_id);
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const key = [ids[i], ids[j]].sort().join("-");
        conexoesCount[ids[i]] = (conexoesCount[ids[i]] || 0) + 1;
        conexoesCount[ids[j]] = (conexoesCount[ids[j]] || 0) + 1;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push({
            source: ids[i],
            target: ids[j],
            label: proj.titulo.slice(0, 40),
            peso: 1,
          });
        } else {
          const existing = edges.find(
            (e) =>
              (e.source === ids[i] && e.target === ids[j]) ||
              (e.source === ids[j] && e.target === ids[i])
          );
          if (existing) existing.peso++;
        }
      }
    }
  });

  // Nodes — posições iniciais circulares
  const cx = 400, cy = 350, radius = 250;
  const nodes: GraphNode[] = empresas.map((emp, i) => {
    const angle = (i / empresas.length) * 2 * Math.PI - Math.PI / 2;
    return {
      id: emp.id,
      label: emp.nome_fantasia,
      type: "empresa" as const,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      vx: 0,
      vy: 0,
      fx: null,
      fy: null,
      score: emp.nota_score,
      estado: emp.estado_sede,
      porte: emp.porte,
      conexoes: conexoesCount[emp.id] || 0,
    };
  });

  return { nodes, edges };
}

// ── Force-directed simulation ──
function simulateForces(
  nodes: GraphNode[],
  edges: GraphEdge[],
  alpha: number
) {
  const cx = 400, cy = 350;
  const repulsion = 8000;
  const attraction = 0.005;
  const centerForce = 0.01;
  const damping = 0.85;

  // Reset forces
  nodes.forEach((n) => { n.vx = 0; n.vy = 0; });

  // Repulsive forces between all nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = repulsion / (dist * dist);
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx -= fx;
      a.vy -= fy;
      b.vx += fx;
      b.vy += fy;
    }
  }

  // Attractive forces along edges
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  edges.forEach((e) => {
    const src = nodeMap.get(e.source);
    const tgt = nodeMap.get(e.target);
    if (!src || !tgt) return;
    const dx = tgt.x - src.x;
    const dy = tgt.y - src.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const force = attraction * dist * e.peso;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;
    src.vx += fx;
    src.vy += fy;
    tgt.vx -= fx;
    tgt.vy -= fy;
  });

  // Center gravity
  nodes.forEach((n) => {
    n.vx += (cx - n.x) * centerForce;
    n.vy += (cy - n.y) * centerForce;
  });

  // Update positions
  nodes.forEach((n) => {
    if (n.fx !== null && n.fy !== null) {
      n.x = n.fx;
      n.y = n.fy;
      n.vx = 0;
      n.vy = 0;
      return;
    }
    n.vx *= damping * alpha;
    n.vy *= damping * alpha;
    // Clamp velocity
    const maxV = 15;
    n.vx = Math.max(-maxV, Math.min(maxV, n.vx));
    n.vy = Math.max(-maxV, Math.min(maxV, n.vy));
    n.x += n.vx;
    n.y += n.vy;
    // Keep in bounds
    n.x = Math.max(60, Math.min(740, n.x));
    n.y = Math.max(60, Math.min(640, n.y));
  });
}

// ── Detectar anomalias ──
function detectAnomalias(): Anomalia[] {
  const anomalias: Anomalia[] = [];

  const conexoes: Record<string, Set<string>> = {};
  projetos.forEach((proj) => {
    const ids = proj.participantes.map((p) => p.empresa_id);
    ids.forEach((id) => {
      if (!conexoes[id]) conexoes[id] = new Set();
      ids.forEach((other) => { if (other !== id) conexoes[id].add(other); });
    });
  });

  // Hubs
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

  // Vínculos recorrentes
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
          descricao: `${emp1.nome_fantasia} e ${emp2.nome_fantasia} participam juntas em ${count} projetos.`,
          tipo: "vinculo",
          severidade: count >= 3 ? "alta" : "media",
          empresas: [id1, id2],
        });
      }
    }
  });

  // Empresa nova com alto volume
  const anoAtual = new Date().getFullYear();
  empresas.forEach((emp) => {
    const anos = anoAtual - emp.ano_fundacao;
    if (anos <= 5 && emp.volume_total_contratos > 500000000) {
      anomalias.push({
        titulo: `Empresa recente com alto volume`,
        descricao: `${emp.nome_fantasia} tem apenas ${anos} anos mas acumula ${emp.volume_total_fmt} em contratos.`,
        tipo: "padrao",
        severidade: "media",
        empresas: [emp.id],
      });
    }
  });

  return anomalias;
}

// ── Cores ──
function nodeColor(score: number) {
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

function nodeRadius(conexoes: number, isSelected: boolean) {
  const base = 18 + Math.min(10, conexoes * 2);
  return isSelected ? base + 6 : base;
}

const GrafoVinculos = () => {
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number>(0);
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [mostrarLabels, setMostrarLabels] = useState(true);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSimulating, setIsSimulating] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const panStart = useRef({ x: 0, y: 0 });
  const dragNode = useRef<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Build graph once
  const graphRef = useRef<{ nodes: GraphNode[]; edges: GraphEdge[] } | null>(null);
  if (!graphRef.current) {
    graphRef.current = buildGraph();
  }
  const { nodes, edges } = graphRef.current;

  const anomalias = useMemo(() => detectAnomalias(), []);

  const estados = useMemo(() => {
    const set = new Set(empresas.map((e) => e.estado_sede));
    return ["Todos", ...Array.from(set).sort()];
  }, []);

  const filteredNodeIds = useMemo(() => {
    if (filtroEstado === "Todos") return new Set(nodes.map((n) => n.id));
    const empIds = new Set(empresas.filter((e) => e.estado_sede === filtroEstado).map((e) => e.id));
    return empIds;
  }, [nodes, filtroEstado]);

  const filteredNodes = useMemo(() => nodes.filter((n) => filteredNodeIds.has(n.id)), [nodes, filteredNodeIds, tick]);
  const filteredEdges = useMemo(() => edges.filter((e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)), [edges, filteredNodeIds]);

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

  // ── Force-directed animation ──
  useEffect(() => {
    if (!isSimulating) return;
    let alpha = 1.0;
    let frameCount = 0;

    const step = () => {
      if (alpha < 0.01 || frameCount > 300) {
        setIsSimulating(false);
        return;
      }
      simulateForces(nodes, edges, alpha);
      alpha *= 0.995;
      frameCount++;
      setTick((t) => t + 1);
      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [isSimulating, nodes, edges]);

  // ── SVG coordinate helpers ──
  const svgPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: clientX, y: clientY };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: clientX, y: clientY };
    const svgPt = pt.matrixTransform(ctm.inverse());
    return { x: (svgPt.x - panOffset.x) / zoom, y: (svgPt.y - panOffset.y) / zoom };
  }, [zoom, panOffset]);

  // ── Mouse handlers ──
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as SVGElement;
    const nodeId = target.closest("[data-node-id]")?.getAttribute("data-node-id");
    if (nodeId) {
      dragNode.current = nodeId;
      const node = nodeMap.get(nodeId);
      if (node) {
        const pt = svgPoint(e.clientX, e.clientY);
        dragOffset.current = { x: pt.x - node.x, y: pt.y - node.y };
        node.fx = node.x;
        node.fy = node.y;
      }
      return;
    }
    setIsPanning(true);
    panStart.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  }, [panOffset, nodeMap, svgPoint]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragNode.current) {
      const node = nodeMap.get(dragNode.current);
      if (node) {
        const pt = svgPoint(e.clientX, e.clientY);
        node.x = pt.x - dragOffset.current.x;
        node.y = pt.y - dragOffset.current.y;
        node.fx = node.x;
        node.fy = node.y;
        setTick((t) => t + 1);
      }
      return;
    }
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y,
      });
    }
  }, [isPanning, nodeMap, svgPoint]);

  const handleMouseUp = useCallback(() => {
    if (dragNode.current) {
      const node = nodeMap.get(dragNode.current);
      if (node) {
        node.fx = null;
        node.fy = null;
      }
      dragNode.current = null;
    }
    setIsPanning(false);
  }, [nodeMap]);

  const resetView = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedNode(null);
    // Restart simulation
    nodes.forEach((n, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
      n.x = 400 + 250 * Math.cos(angle);
      n.y = 350 + 250 * Math.sin(angle);
      n.vx = 0;
      n.vy = 0;
      n.fx = null;
      n.fy = null;
    });
    setIsSimulating(true);
  }, [nodes]);

  // Stats
  const stats = useMemo(() => ({
    totalEmpresas: filteredNodes.length,
    totalConexoes: filteredEdges.length,
    mediaConexoes: filteredNodes.length > 0
      ? (filteredEdges.length * 2 / filteredNodes.length).toFixed(1)
      : "0",
    anomaliasAlta: anomalias.filter((a) => a.severidade === "alta").length,
  }), [filteredNodes, filteredEdges, anomalias]);

  // Edge path with curve
  const edgePath = useCallback((src: GraphNode, tgt: GraphNode) => {
    const dx = tgt.x - src.x;
    const dy = tgt.y - src.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return `M ${src.x} ${src.y} L ${tgt.x} ${tgt.y}`;
    // Slight curve
    const mx = (src.x + tgt.x) / 2 + dy * 0.08;
    const my = (src.y + tgt.y) / 2 - dx * 0.08;
    return `M ${src.x} ${src.y} Q ${mx} ${my} ${tgt.x} ${tgt.y}`;
  }, []);

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
            Mapeamento de conexões entre empresas via projetos e licitações — layout force-directed interativo
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield size={14} className="text-emerald-500" />
          <span>Dados públicos — LGPD Art. 7°, II</span>
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
          <Card key={s.label} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
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
                {isSimulating && (
                  <span className="text-[0.6rem] text-violet-500 font-normal animate-pulse ml-1">
                    calculando layout...
                  </span>
                )}
              </CardTitle>
              <div className="flex items-center gap-1.5">
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="text-xs border rounded-lg px-2 py-1.5 bg-background"
                >
                  {estados.map((uf) => (
                    <option key={uf} value={uf}>{uf === "Todos" ? "Todos estados" : uf}</option>
                  ))}
                </select>
                <Button
                  variant="ghost" size="sm"
                  onClick={() => setIsSimulating(!isSimulating)}
                  title={isSimulating ? "Pausar simulação" : "Retomar simulação"}
                  className="h-8 w-8 p-0"
                >
                  {isSimulating ? <Pause size={14} /> : <Play size={14} />}
                </Button>
                <Button
                  variant="ghost" size="sm"
                  onClick={() => setMostrarLabels(!mostrarLabels)}
                  title={mostrarLabels ? "Ocultar labels" : "Mostrar labels"}
                  className="h-8 w-8 p-0"
                >
                  {mostrarLabels ? <Eye size={14} /> : <EyeOff size={14} />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))} className="h-8 w-8 p-0">
                  <ZoomIn size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setZoom((z) => Math.max(0.3, z - 0.25))} className="h-8 w-8 p-0">
                  <ZoomOut size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={resetView} className="h-8 w-8 p-0" title="Reset view">
                  <Maximize2 size={14} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div
              className="relative bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden"
              style={{ height: 560, cursor: dragNode.current ? "grabbing" : isPanning ? "grabbing" : "grab" }}
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
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="shadow">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
                  </filter>
                </defs>
                <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoom})`}>
                  {/* Edges */}
                  {filteredEdges.map((edge, i) => {
                    const src = nodeMap.get(edge.source);
                    const tgt = nodeMap.get(edge.target);
                    if (!src || !tgt) return null;
                    const isHighlighted = selectedNode && (edge.source === selectedNode || edge.target === selectedNode);
                    const isHovered = hoveredNode && (edge.source === hoveredNode || edge.target === hoveredNode);
                    const isDimmed = (selectedNode || hoveredNode) && !isHighlighted && !isHovered;

                    return (
                      <g key={`e-${i}`}>
                        <path
                          d={edgePath(src, tgt)}
                          fill="none"
                          stroke={isHighlighted ? "#8b5cf6" : isHovered ? "#a78bfa" : "#cbd5e1"}
                          strokeWidth={Math.min(5, edge.peso * 1.5 + 0.5)}
                          opacity={isDimmed ? 0.08 : isHighlighted ? 0.85 : isHovered ? 0.7 : 0.25}
                          strokeLinecap="round"
                        />
                        {mostrarLabels && (isHighlighted || isHovered) && edge.peso > 1 && (
                          <text
                            x={(src.x + tgt.x) / 2}
                            y={(src.y + tgt.y) / 2 - 8}
                            fontSize={9}
                            fill="#7c3aed"
                            textAnchor="middle"
                            fontWeight="bold"
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
                    const isHovered = node.id === hoveredNode;
                    const isConnected = connectedNodes.has(node.id);
                    const isDimmed = (selectedNode && !isSelected && !isConnected) || (hoveredNode && !isHovered && hoveredNode !== selectedNode && !connectedNodes.has(node.id));
                    const r = nodeRadius(node.conexoes, isSelected);
                    const color = nodeColor(node.score);

                    return (
                      <g
                        key={node.id}
                        data-node-id={node.id}
                        className="cursor-pointer"
                        style={{ transition: isSimulating ? "none" : "opacity 0.2s ease" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!dragNode.current) {
                            setSelectedNode(selectedNode === node.id ? null : node.id);
                          }
                        }}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        opacity={isDimmed ? 0.15 : 1}
                      >
                        {/* Outer glow for selected */}
                        {isSelected && (
                          <>
                            <circle cx={node.x} cy={node.y} r={r + 12} fill={color} opacity={0.08} />
                            <circle cx={node.x} cy={node.y} r={r + 7} fill={color} opacity={0.12} />
                          </>
                        )}
                        {/* Hover ring */}
                        {isHovered && !isSelected && (
                          <circle cx={node.x} cy={node.y} r={r + 5} fill={color} opacity={0.1} />
                        )}
                        {/* Node circle */}
                        <circle
                          cx={node.x} cy={node.y} r={r}
                          fill="white"
                          stroke={color}
                          strokeWidth={isSelected ? 4 : isConnected ? 3 : isHovered ? 3 : 2}
                          filter={isSelected ? "url(#shadow)" : undefined}
                        />
                        {/* Score text */}
                        <text
                          x={node.x} y={node.y + 1}
                          fontSize={r > 24 ? 12 : 10}
                          fontWeight="bold"
                          fill={color}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          {node.score}
                        </text>
                        {/* Label */}
                        {mostrarLabels && (
                          <>
                            <text
                              x={node.x} y={node.y + r + 13}
                              fontSize={10}
                              fontWeight="600"
                              fill="#1e293b"
                              textAnchor="middle"
                              style={{ paintOrder: "stroke", stroke: "white", strokeWidth: 3 }}
                            >
                              {node.label.length > 16 ? node.label.slice(0, 16) + "…" : node.label}
                            </text>
                            <text
                              x={node.x} y={node.y + r + 25}
                              fontSize={8}
                              fill="#94a3b8"
                              textAnchor="middle"
                              style={{ paintOrder: "stroke", stroke: "white", strokeWidth: 2 }}
                            >
                              {node.estado} · {node.porte}
                            </text>
                          </>
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* Tooltip on hover */}
              {hoveredNode && !selectedNode && (() => {
                const n = nodeMap.get(hoveredNode);
                const emp = empresas.find((e) => e.id === hoveredNode);
                if (!n || !emp) return null;
                return (
                  <div
                    className="absolute pointer-events-none bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border text-xs z-10"
                    style={{
                      left: `${(n.x * zoom + panOffset.x) / 8 + 5}%`,
                      top: `${(n.y * zoom + panOffset.y) / 7}%`,
                      maxWidth: 220,
                    }}
                  >
                    <p className="font-bold text-sm">{emp.nome_fantasia}</p>
                    <p className="text-muted-foreground">{emp.segmentos.join(", ")}</p>
                    <div className="flex gap-3 mt-1.5">
                      <span>Score: <strong style={{ color: nodeColor(emp.nota_score) }}>{emp.nota_score}</strong></span>
                      <span>Vitória: <strong>{emp.taxa_vitoria}%</strong></span>
                    </div>
                  </div>
                );
              })()}

              {/* Legend */}
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-sm text-[0.65rem] space-y-1.5 border">
                <p className="font-bold text-xs mb-1.5">Legenda</p>
                {[
                  { cor: "#10b981", label: "Score 85+" },
                  { cor: "#3b82f6", label: "Score 70-84" },
                  { cor: "#f59e0b", label: "Score 50-69" },
                  { cor: "#ef4444", label: "Score <50" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full border-2 bg-white" style={{ borderColor: l.cor }} />
                    <span>{l.label}</span>
                  </div>
                ))}
                <div className="border-t pt-1.5 mt-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-[2px] bg-violet-400 rounded" />
                    <span>Vínculo via projeto</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-3.5 h-3.5 rounded-full border border-dashed border-slate-400" />
                    <span>Tamanho = n° conexões</span>
                  </div>
                </div>
              </div>

              {/* Controls hint */}
              <div className="absolute top-3 right-3 text-[0.6rem] text-muted-foreground bg-white/80 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border">
                Arraste nós · Scroll = zoom · Clique = detalhes
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Empresa selecionada */}
          {selectedEmpresa ? (
            <Card className="border-0 shadow-sm border-l-4 border-l-violet-500 animate-in slide-in-from-right-2 duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Building2 size={16} className="text-violet-500" />
                  {selectedEmpresa.nome_fantasia}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground block text-[0.6rem]">Score</span>
                    <p className="font-bold text-lg" style={{ color: nodeColor(selectedEmpresa.nota_score) }}>
                      {selectedEmpresa.nota_score}
                    </p>
                  </div>
                  <div className="p-2.5 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground block text-[0.6rem]">Conexões</span>
                    <p className="font-bold text-lg text-violet-600">{connectedNodes.size}</p>
                  </div>
                  <div className="p-2.5 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground block text-[0.6rem]">Taxa Vitória</span>
                    <p className="font-bold">{selectedEmpresa.taxa_vitoria}%</p>
                  </div>
                  <div className="p-2.5 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground block text-[0.6rem]">Volume</span>
                    <p className="font-bold text-xs">{selectedEmpresa.volume_total_fmt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin size={12} />
                  {selectedEmpresa.cidade_sede}/{selectedEmpresa.estado_sede}
                </div>
                <div className="text-[0.65rem] text-muted-foreground flex flex-wrap gap-1">
                  {selectedEmpresa.segmentos.map((s) => (
                    <span key={s} className="bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
                {connectedNodes.size > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                      <Network size={12} className="text-violet-500" />
                      Empresas Conectadas ({connectedNodes.size})
                    </p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {Array.from(connectedNodes).map((id) => {
                        const emp = empresas.find((e) => e.id === id);
                        if (!emp) return null;
                        return (
                          <div
                            key={id}
                            className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => setSelectedNode(id)}
                          >
                            <span className="font-medium">{emp.nome_fantasia}</span>
                            <span className="font-bold" style={{ color: nodeColor(emp.nota_score) }}>{emp.nota_score}</span>
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
                  <ArrowRight size={14} /> Ver Dossiê Completo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center text-muted-foreground">
                <Network size={36} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm font-semibold">Selecione uma empresa</p>
                <p className="text-xs mt-1.5 leading-relaxed">
                  Clique em um nó do grafo para ver detalhes e conexões.
                  Arraste para reposicionar.
                </p>
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
            <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
              {anomalias.map((a, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg border text-xs transition-all hover:shadow-sm cursor-pointer ${sevColor(a.severidade)}`}
                  onClick={() => {
                    if (a.empresas[0]) setSelectedNode(a.empresas[0]);
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-bold uppercase text-[0.55rem]">{a.severidade}</span>
                    <span className="text-[0.55rem] opacity-70">· {a.tipo}</span>
                  </div>
                  <p className="font-semibold">{a.titulo}</p>
                  <p className="opacity-80 mt-0.5 leading-relaxed">{a.descricao}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* LGPD Info */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-blue-50">
            <CardContent className="p-4">
              <p className="text-xs font-bold flex items-center gap-1.5 mb-2">
                <Lock size={13} className="text-emerald-600" />
                Conformidade LGPD
              </p>
              <ul className="text-[0.65rem] text-muted-foreground space-y-1 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <Shield size={10} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  Dados de fontes públicas (PNCP, editais, diários oficiais)
                </li>
                <li className="flex items-start gap-1.5">
                  <Shield size={10} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  Apenas dados de PJ — sem dados pessoais sensíveis
                </li>
                <li className="flex items-start gap-1.5">
                  <Shield size={10} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  Base legal: Art. 7°, II da LGPD (obrigação legal/regulatória)
                </li>
              </ul>
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
                <li>Nós representam empresas — tamanho proporcional às conexões</li>
                <li>Linhas conectam empresas em projetos compartilhados</li>
                <li>Layout calculado por simulação de forças (force-directed)</li>
                <li>Arraste nós para reorganizar · Clique para detalhes</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GrafoVinculos;
