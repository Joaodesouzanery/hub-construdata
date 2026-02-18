import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Network, Building2, Users, ZoomIn, ZoomOut, Maximize2,
  AlertTriangle, Eye, EyeOff, Info, MapPin, Play, Pause,
  Lock, Shield, ArrowRight, User, Layers, Download, Route, X,
} from "lucide-react";
import { empresas } from "@/data/empresas";
import { projetos } from "@/data/projetos";
import { socios, vinculosPessoais } from "@/data/socios";

// ── Tipos ──
type NodeType = "empresa" | "pessoa" | "grupo";
type EdgeType = "projeto" | "societario" | "vinculo_pessoal";

interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
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
  qualificacao?: string;
}

interface GraphEdge {
  source: string;
  target: string;
  label: string;
  peso: number;
  tipo: EdgeType;
}

interface Anomalia {
  titulo: string;
  descricao: string;
  tipo: "vinculo" | "concentracao" | "padrao" | "societario" | "cruzado";
  severidade: "critica" | "alta" | "media" | "baixa";
  empresas: string[];
}

type CamadaView = "empresas" | "socios" | "todos";

// ── Edge colors by type ──
const edgeColors: Record<EdgeType, string> = {
  projeto: "#8b5cf6",
  societario: "#3b82f6",
  vinculo_pessoal: "#f59e0b",
};

const edgeColorDimmed: Record<EdgeType, string> = {
  projeto: "#cbd5e1",
  societario: "#bfdbfe",
  vinculo_pessoal: "#fde68a",
};

// ── Build full graph with all layers ──
function buildGraph(camada: CamadaView): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();
  const conexoesCount: Record<string, number> = {};
  const nodeSet = new Set<string>();

  // Always include empresa-empresa edges via projetos
  if (camada === "empresas" || camada === "todos") {
    projetos.forEach((proj) => {
      const ids = proj.participantes.map((p) => p.empresa_id);
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const key = [ids[i], ids[j]].sort().join("-") + ":proj";
          conexoesCount[ids[i]] = (conexoesCount[ids[i]] || 0) + 1;
          conexoesCount[ids[j]] = (conexoesCount[ids[j]] || 0) + 1;
          if (!edgeSet.has(key)) {
            edgeSet.add(key);
            edges.push({
              source: ids[i],
              target: ids[j],
              label: proj.titulo.slice(0, 40),
              peso: 1,
              tipo: "projeto",
            });
          } else {
            const existing = edges.find(
              (e) =>
                e.tipo === "projeto" &&
                ((e.source === ids[i] && e.target === ids[j]) ||
                  (e.source === ids[j] && e.target === ids[i]))
            );
            if (existing) existing.peso++;
          }
        }
      }
    });
  }

  // Add societário edges from socios data
  if (camada === "socios" || camada === "todos") {
    socios.forEach((s) => {
      const pessoaId = `p:${s.nome.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 40)}`;
      const key = [pessoaId, s.empresa_id].sort().join("-") + ":soc";
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        conexoesCount[pessoaId] = (conexoesCount[pessoaId] || 0) + 1;
        conexoesCount[s.empresa_id] = (conexoesCount[s.empresa_id] || 0) + 1;
        nodeSet.add(pessoaId);
        edges.push({
          source: pessoaId,
          target: s.empresa_id,
          label: s.qualificacao,
          peso: s.participacao_percentual ? Math.max(1, Math.round(s.participacao_percentual / 20)) : 1,
          tipo: "societario",
        });
      }
    });

    // Add vinculosPessoais edges (person linking multiple companies)
    vinculosPessoais.forEach((v) => {
      if (v.empresas.length >= 2) {
        for (let i = 0; i < v.empresas.length; i++) {
          for (let j = i + 1; j < v.empresas.length; j++) {
            const key = [v.empresas[i].empresa_id, v.empresas[j].empresa_id].sort().join("-") + ":vp";
            if (!edgeSet.has(key)) {
              edgeSet.add(key);
              conexoesCount[v.empresas[i].empresa_id] = (conexoesCount[v.empresas[i].empresa_id] || 0) + 1;
              conexoesCount[v.empresas[j].empresa_id] = (conexoesCount[v.empresas[j].empresa_id] || 0) + 1;
              edges.push({
                source: v.empresas[i].empresa_id,
                target: v.empresas[j].empresa_id,
                label: `Via ${v.pessoa}`,
                peso: v.risco === "alto" ? 3 : v.risco === "medio" ? 2 : 1,
                tipo: "vinculo_pessoal",
              });
            }
          }
        }
      }
    });
  }

  // Build nodes
  const cx = 400, cy = 350, radius = 250;
  const empresaNodes: GraphNode[] = empresas.map((emp, i) => {
    const angle = (i / empresas.length) * 2 * Math.PI - Math.PI / 2;
    return {
      id: emp.id,
      label: emp.nome_fantasia,
      type: "empresa" as const,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      vx: 0, vy: 0, fx: null, fy: null,
      score: emp.nota_score,
      estado: emp.estado_sede,
      porte: emp.porte,
      conexoes: conexoesCount[emp.id] || 0,
    };
  });

  // Build person nodes from socios (only in socios/todos view)
  const pessoaNodes: GraphNode[] = [];
  if (camada === "socios" || camada === "todos") {
    const pessoaMap = new Map<string, { nome: string; qual: string; empresaIds: string[] }>();
    socios.forEach((s) => {
      const pessoaId = `p:${s.nome.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 40)}`;
      if (!pessoaMap.has(pessoaId)) {
        pessoaMap.set(pessoaId, { nome: s.nome, qual: s.qualificacao, empresaIds: [s.empresa_id] });
      } else {
        pessoaMap.get(pessoaId)!.empresaIds.push(s.empresa_id);
      }
    });

    let pIdx = 0;
    pessoaMap.forEach((val, pessoaId) => {
      const angle = (pIdx / pessoaMap.size) * 2 * Math.PI;
      pIdx++;
      pessoaNodes.push({
        id: pessoaId,
        label: val.nome.length > 25 ? val.nome.slice(0, 25) + "…" : val.nome,
        type: val.nome.includes("S.A.") || val.nome.includes("S/A") || val.nome.includes("Ltd") || val.nome.includes("Estado") || val.nome.includes("Governo")
          ? "grupo"
          : "pessoa",
        x: cx + (radius * 0.6) * Math.cos(angle),
        y: cy + (radius * 0.6) * Math.sin(angle),
        vx: 0, vy: 0, fx: null, fy: null,
        score: 0,
        estado: "",
        porte: "",
        conexoes: conexoesCount[pessoaId] || 0,
        qualificacao: val.qual,
      });
    });
  }

  const nodes = [...empresaNodes, ...pessoaNodes];
  return { nodes, edges };
}

// ── Force-directed simulation ──
function simulateForces(nodes: GraphNode[], edges: GraphEdge[], alpha: number) {
  const cx = 400, cy = 350;
  const repulsion = 8000;
  const attraction = 0.005;
  const centerForce = 0.01;
  const damping = 0.85;

  nodes.forEach((n) => { n.vx = 0; n.vy = 0; });

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = repulsion / (dist * dist);
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx -= fx; a.vy -= fy;
      b.vx += fx; b.vy += fy;
    }
  }

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
    src.vx += fx; src.vy += fy;
    tgt.vx -= fx; tgt.vy -= fy;
  });

  nodes.forEach((n) => {
    n.vx += (cx - n.x) * centerForce;
    n.vy += (cy - n.y) * centerForce;
  });

  nodes.forEach((n) => {
    if (n.fx !== null && n.fy !== null) {
      n.x = n.fx; n.y = n.fy; n.vx = 0; n.vy = 0;
      return;
    }
    n.vx *= damping * alpha;
    n.vy *= damping * alpha;
    const maxV = 15;
    n.vx = Math.max(-maxV, Math.min(maxV, n.vx));
    n.vy = Math.max(-maxV, Math.min(maxV, n.vy));
    n.x += n.vx;
    n.y += n.vy;
    n.x = Math.max(60, Math.min(740, n.x));
    n.y = Math.max(60, Math.min(640, n.y));
  });
}

// ── Detect anomalies ──
function detectAnomalias(): Anomalia[] {
  const anomalias: Anomalia[] = [];

  // 1. Hubs de conexão via projetos
  const conexoes: Record<string, Set<string>> = {};
  projetos.forEach((proj) => {
    const ids = proj.participantes.map((p) => p.empresa_id);
    ids.forEach((id) => {
      if (!conexoes[id]) conexoes[id] = new Set();
      ids.forEach((other) => { if (other !== id) conexoes[id].add(other); });
    });
  });

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

  // 2. Vínculos recorrentes em projetos
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

  // 3. Empresa nova com alto volume
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

  // 4. Vínculos societários cruzados (pessoa em múltiplas empresas)
  vinculosPessoais.forEach((v) => {
    if (v.empresas.length >= 2 && v.risco !== "baixo") {
      anomalias.push({
        titulo: `Vínculo societário cruzado: ${v.pessoa}`,
        descricao: v.descricao.slice(0, 150) + (v.descricao.length > 150 ? "…" : ""),
        tipo: "societario",
        severidade: v.risco === "alto" ? "critica" : "alta",
        empresas: v.empresas.map((e) => e.empresa_id),
      });
    }
  });

  // 5. Mesmo endereço / mesma cidade (concentração geográfica suspeita)
  const cidadeEmpresas: Record<string, string[]> = {};
  empresas.forEach((emp) => {
    const key = `${emp.cidade_sede}-${emp.estado_sede}`;
    if (!cidadeEmpresas[key]) cidadeEmpresas[key] = [];
    cidadeEmpresas[key].push(emp.id);
  });

  Object.entries(cidadeEmpresas).forEach(([cidade, ids]) => {
    if (ids.length >= 4) {
      const nomes = ids.slice(0, 3).map((id) => empresas.find((e) => e.id === id)?.nome_fantasia).filter(Boolean);
      anomalias.push({
        titulo: `Concentração geográfica: ${cidade}`,
        descricao: `${ids.length} empresas sediadas em ${cidade}: ${nomes.join(", ")} e mais ${ids.length - 3}.`,
        tipo: "cruzado",
        severidade: "baixa",
        empresas: ids.slice(0, 4),
      });
    }
  });

  return anomalias;
}

// ── BFS shortest path ──
function findShortestPath(_graphNodes: GraphNode[], edges: GraphEdge[], startId: string, endId: string): string[] | null {
  const adj: Record<string, { node: string; edge: GraphEdge }[]> = {};
  edges.forEach((e) => {
    if (!adj[e.source]) adj[e.source] = [];
    if (!adj[e.target]) adj[e.target] = [];
    adj[e.source].push({ node: e.target, edge: e });
    adj[e.target].push({ node: e.source, edge: e });
  });
  const visited = new Set<string>();
  const queue: { node: string; path: string[] }[] = [{ node: startId, path: [startId] }];
  visited.add(startId);
  while (queue.length > 0) {
    const { node, path } = queue.shift()!;
    if (node === endId) return path;
    for (const neighbor of (adj[node] || [])) {
      if (!visited.has(neighbor.node)) {
        visited.add(neighbor.node);
        queue.push({ node: neighbor.node, path: [...path, neighbor.node] });
      }
    }
  }
  return null;
}

// ── Colors ──
function nodeColor(node: GraphNode) {
  if (node.type === "pessoa") return "#f59e0b";
  if (node.type === "grupo") return "#6366f1";
  const score = node.score;
  if (score >= 85) return "#10b981";
  if (score >= 70) return "#3b82f6";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

function sevColor(sev: string) {
  if (sev === "critica") return "bg-red-200 text-red-800 border-red-300";
  if (sev === "alta") return "bg-red-100 text-red-700 border-red-200";
  if (sev === "media") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-blue-100 text-blue-700 border-blue-200";
}

function nodeRadius(node: GraphNode, isSelected: boolean) {
  if (node.type === "pessoa" || node.type === "grupo") {
    const base = 14 + Math.min(8, node.conexoes * 2);
    return isSelected ? base + 5 : base;
  }
  const base = 18 + Math.min(10, node.conexoes * 2);
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
  const [camada, setCamada] = useState<CamadaView>("empresas");
  const [investigationMode, setInvestigationMode] = useState(false);
  const [invTargets, setInvTargets] = useState<[string | null, string | null]>([null, null]);
  const [invPath, setInvPath] = useState<string[] | null>(null);
  const panStart = useRef({ x: 0, y: 0 });
  const dragNode = useRef<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Build graph when layer changes
  const graphRef = useRef<{ nodes: GraphNode[]; edges: GraphEdge[]; camada: CamadaView } | null>(null);
  if (!graphRef.current || graphRef.current.camada !== camada) {
    graphRef.current = { ...buildGraph(camada), camada };
    setIsSimulating(true);
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
    // Also include person nodes connected to filtered empresas
    const personIds = new Set<string>();
    edges.forEach((e) => {
      if (empIds.has(e.source) && e.target.startsWith("p:")) personIds.add(e.target);
      if (empIds.has(e.target) && e.source.startsWith("p:")) personIds.add(e.source);
    });
    return new Set([...empIds, ...personIds]);
  }, [nodes, edges, filtroEstado]);

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

  const selectedPessoa = useMemo(() => {
    if (!selectedNode || !selectedNode.startsWith("p:")) return null;
    const node = nodeMap.get(selectedNode);
    if (!node) return null;
    const sociosMatch = socios.filter((s) => {
      const pid = `p:${s.nome.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 40)}`;
      return pid === selectedNode;
    });
    return { node, socios: sociosMatch };
  }, [selectedNode, nodeMap]);

  const connectedNodes = useMemo(() => {
    if (!selectedNode) return new Set<string>();
    const set = new Set<string>();
    edges.forEach((e) => {
      if (e.source === selectedNode) set.add(e.target);
      if (e.target === selectedNode) set.add(e.source);
    });
    return set;
  }, [selectedNode, edges]);

  // Investigation path edge/node sets
  const invPathEdges = useMemo(() => {
    if (!invPath || invPath.length < 2) return new Set<string>();
    const set = new Set<string>();
    for (let i = 0; i < invPath.length - 1; i++) {
      set.add([invPath[i], invPath[i + 1]].sort().join("|"));
    }
    return set;
  }, [invPath]);

  const invPathNodes = useMemo(() => {
    if (!invPath) return new Set<string>();
    return new Set(invPath);
  }, [invPath]);

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
      if (node) { node.fx = null; node.fy = null; }
      dragNode.current = null;
    }
    setIsPanning(false);
  }, [nodeMap]);

  const resetView = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedNode(null);
    graphRef.current = null; // force rebuild
    setIsSimulating(true);
    setTick((t) => t + 1);
  }, []);

  // Stats
  const stats = useMemo(() => {
    const empNodes = filteredNodes.filter((n) => n.type === "empresa").length;
    const pesNodes = filteredNodes.filter((n) => n.type === "pessoa" || n.type === "grupo").length;
    return {
      totalEmpresas: empNodes,
      totalPessoas: pesNodes,
      totalConexoes: filteredEdges.length,
      anomaliasAlta: anomalias.filter((a) => a.severidade === "alta" || a.severidade === "critica").length,
    };
  }, [filteredNodes, filteredEdges, anomalias]);

  // Edge path with curve
  const edgePath = useCallback((src: GraphNode, tgt: GraphNode) => {
    const dx = tgt.x - src.x;
    const dy = tgt.y - src.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return `M ${src.x} ${src.y} L ${tgt.x} ${tgt.y}`;
    const mx = (src.x + tgt.x) / 2 + dy * 0.08;
    const my = (src.y + tgt.y) / 2 - dx * 0.08;
    return `M ${src.x} ${src.y} Q ${mx} ${my} ${tgt.x} ${tgt.y}`;
  }, []);

  // ── Export PNG ──
  const exportPNG = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1600;
      canvas.height = 1400;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const link = document.createElement("a");
      link.download = `grafo-vinculos-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  // Node shape renderer
  const renderNode = useCallback((node: GraphNode, r: number, color: string, strokeWidth: number, filter?: string) => {
    if (node.type === "pessoa") {
      // Diamond shape for persons
      const d = r;
      return (
        <polygon
          points={`${node.x},${node.y - d} ${node.x + d},${node.y} ${node.x},${node.y + d} ${node.x - d},${node.y}`}
          fill="white"
          stroke={color}
          strokeWidth={strokeWidth}
          filter={filter}
        />
      );
    }
    if (node.type === "grupo") {
      // Hexagon shape for groups/holdings
      const d = r;
      const pts = Array.from({ length: 6 }, (_, i) => {
        const angle = (i * 60 - 30) * Math.PI / 180;
        return `${node.x + d * Math.cos(angle)},${node.y + d * Math.sin(angle)}`;
      }).join(" ");
      return (
        <polygon
          points={pts}
          fill="white"
          stroke={color}
          strokeWidth={strokeWidth}
          filter={filter}
        />
      );
    }
    // Circle for empresas
    return (
      <circle
        cx={node.x} cy={node.y} r={r}
        fill="white"
        stroke={color}
        strokeWidth={strokeWidth}
        filter={filter}
      />
    );
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
            Rede de conexões societárias, projetos e vínculos pessoais — investigação corporativa
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
          { label: camada === "empresas" ? "Conexões" : "Sócios/Diretores", valor: camada === "empresas" ? stats.totalConexoes : stats.totalPessoas, icon: camada === "empresas" ? Network : Users, cor: "text-violet-500", bg: "bg-violet-500/10" },
          { label: "Vínculos Totais", valor: stats.totalConexoes, icon: Network, cor: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Alertas Críticos", valor: stats.anomaliasAlta, icon: AlertTriangle, cor: "text-red-500", bg: "bg-red-500/10" },
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
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Layer toggle */}
                <div className="flex bg-muted rounded-lg p-0.5 text-xs">
                  {([
                    { key: "empresas" as CamadaView, label: "Empresas", icon: Building2 },
                    { key: "socios" as CamadaView, label: "Sócios", icon: Users },
                    { key: "todos" as CamadaView, label: "Todos", icon: Layers },
                  ]).map((c) => (
                    <button
                      key={c.key}
                      onClick={() => { setCamada(c.key); graphRef.current = null; setSelectedNode(null); }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                        camada === c.key
                          ? "bg-white shadow-sm text-violet-700 font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <c.icon size={12} />
                      {c.label}
                    </button>
                  ))}
                </div>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="text-xs border rounded-lg px-2 py-1.5 bg-background"
                >
                  {estados.map((uf) => (
                    <option key={uf} value={uf}>{uf === "Todos" ? "Todos estados" : uf}</option>
                  ))}
                </select>
                <Button variant="ghost" size="sm" onClick={() => setIsSimulating(!isSimulating)} title={isSimulating ? "Pausar" : "Retomar"} className="h-8 w-8 p-0">
                  {isSimulating ? <Pause size={14} /> : <Play size={14} />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setMostrarLabels(!mostrarLabels)} title={mostrarLabels ? "Ocultar labels" : "Mostrar labels"} className="h-8 w-8 p-0">
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
                {/* Investigation mode */}
                <Button
                  variant={investigationMode ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setInvestigationMode(!investigationMode);
                    setInvTargets([null, null]);
                    setInvPath(null);
                    if (investigationMode) setSelectedNode(null);
                  }}
                  className={`h-8 px-2 gap-1 text-xs ${investigationMode ? "bg-red-500 hover:bg-red-600 text-white" : ""}`}
                  title="Modo Investigação"
                >
                  <Route size={14} />
                  {investigationMode ? "Investigação" : ""}
                </Button>
                {/* Export PNG */}
                <Button variant="ghost" size="sm" onClick={exportPNG} className="h-8 w-8 p-0" title="Exportar PNG">
                  <Download size={14} />
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
                    const isOnInvPath = invPathEdges.has([edge.source, edge.target].sort().join("|"));
                    const isHighlighted = selectedNode && (edge.source === selectedNode || edge.target === selectedNode);
                    const isHovered = hoveredNode && (edge.source === hoveredNode || edge.target === hoveredNode);
                    const isDimmed = (selectedNode || hoveredNode) && !isHighlighted && !isHovered;
                    const eColor = isOnInvPath ? "#ef4444" : isHighlighted || isHovered ? edgeColors[edge.tipo] : edgeColorDimmed[edge.tipo];

                    return (
                      <g key={`e-${i}`}>
                        <path
                          d={edgePath(src, tgt)}
                          fill="none"
                          stroke={eColor}
                          strokeWidth={isOnInvPath ? 4 : Math.min(5, edge.peso * 1.5 + 0.5)}
                          opacity={isOnInvPath ? 0.9 : isDimmed ? 0.06 : isHighlighted ? 0.85 : isHovered ? 0.7 : 0.25}
                          strokeLinecap="round"
                          strokeDasharray={isOnInvPath ? "none" : edge.tipo === "societario" ? "6,3" : edge.tipo === "vinculo_pessoal" ? "3,3" : "none"}
                        />
                        {mostrarLabels && (isHighlighted || isHovered) && (
                          <text
                            x={(src.x + tgt.x) / 2}
                            y={(src.y + tgt.y) / 2 - 8}
                            fontSize={8}
                            fill={edgeColors[edge.tipo]}
                            textAnchor="middle"
                            fontWeight="bold"
                            style={{ paintOrder: "stroke", stroke: "white", strokeWidth: 2 }}
                          >
                            {edge.tipo === "projeto" && edge.peso > 1 ? `${edge.peso}x proj.` : edge.label.slice(0, 30)}
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
                    const r = nodeRadius(node, isSelected);
                    const color = nodeColor(node);

                    return (
                      <g
                        key={node.id}
                        data-node-id={node.id}
                        className="cursor-pointer"
                        style={{ transition: isSimulating ? "none" : "opacity 0.2s ease" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!dragNode.current) {
                            if (investigationMode) {
                              if (!invTargets[0]) {
                                setInvTargets([node.id, null]);
                                setInvPath(null);
                              } else if (!invTargets[1] && node.id !== invTargets[0]) {
                                const newTargets: [string, string] = [invTargets[0], node.id];
                                setInvTargets(newTargets as [string | null, string | null]);
                                const path = findShortestPath(nodes, edges, newTargets[0], newTargets[1]);
                                setInvPath(path);
                              }
                            } else {
                              setSelectedNode(selectedNode === node.id ? null : node.id);
                            }
                          }
                        }}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        opacity={isDimmed ? 0.12 : 1}
                      >
                        {/* Outer glow for selected */}
                        {isSelected && (
                          <circle cx={node.x} cy={node.y} r={r + 10} fill={color} opacity={0.1} />
                        )}
                        {/* Hover ring */}
                        {isHovered && !isSelected && (
                          <circle cx={node.x} cy={node.y} r={r + 5} fill={color} opacity={0.08} />
                        )}
                        {/* Investigation path ring */}
                        {invPathNodes.has(node.id) && (
                          <>
                            <circle cx={node.x} cy={node.y} r={r + 8} fill="none" stroke="#ef4444" strokeWidth={3} opacity={0.6} strokeDasharray="4,2" />
                            <circle cx={node.x} cy={node.y} r={r + 12} fill="#ef4444" opacity={0.08} />
                          </>
                        )}
                        {/* Node shape */}
                        {renderNode(
                          node, r, color,
                          isSelected ? 4 : isConnected ? 3 : isHovered ? 3 : 2,
                          isSelected ? "url(#shadow)" : undefined,
                        )}
                        {/* Inner icon/text */}
                        <text
                          x={node.x} y={node.y + 1}
                          fontSize={node.type === "empresa" ? (r > 24 ? 12 : 10) : 9}
                          fontWeight="bold"
                          fill={color}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          {node.type === "empresa" ? node.score : (node.type === "pessoa" ? "P" : "G")}
                        </text>
                        {/* Label */}
                        {mostrarLabels && (
                          <>
                            <text
                              x={node.x} y={node.y + r + 13}
                              fontSize={node.type === "empresa" ? 10 : 9}
                              fontWeight="600"
                              fill={node.type === "empresa" ? "#1e293b" : "#78350f"}
                              textAnchor="middle"
                              style={{ paintOrder: "stroke", stroke: "white", strokeWidth: 3 }}
                            >
                              {node.label.length > 16 ? node.label.slice(0, 16) + "…" : node.label}
                            </text>
                            {node.type === "empresa" && (
                              <text
                                x={node.x} y={node.y + r + 25}
                                fontSize={8}
                                fill="#94a3b8"
                                textAnchor="middle"
                                style={{ paintOrder: "stroke", stroke: "white", strokeWidth: 2 }}
                              >
                                {node.estado} · {node.porte}
                              </text>
                            )}
                            {node.type !== "empresa" && node.qualificacao && (
                              <text
                                x={node.x} y={node.y + r + 24}
                                fontSize={7}
                                fill="#92400e"
                                textAnchor="middle"
                                style={{ paintOrder: "stroke", stroke: "white", strokeWidth: 2 }}
                              >
                                {node.qualificacao.length > 22 ? node.qualificacao.slice(0, 22) + "…" : node.qualificacao}
                              </text>
                            )}
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
                if (!n) return null;
                if (n.type === "empresa") {
                  const emp = empresas.find((e) => e.id === hoveredNode);
                  if (!emp) return null;
                  return (
                    <div
                      className="absolute pointer-events-none bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border text-xs z-10"
                      style={{ left: `${(n.x * zoom + panOffset.x) / 8 + 5}%`, top: `${(n.y * zoom + panOffset.y) / 7}%`, maxWidth: 220 }}
                    >
                      <p className="font-bold text-sm flex items-center gap-1.5"><Building2 size={12} />{emp.nome_fantasia}</p>
                      <p className="text-muted-foreground">{emp.segmentos.join(", ")}</p>
                      <div className="flex gap-3 mt-1.5">
                        <span>Score: <strong style={{ color: nodeColor(n) }}>{emp.nota_score}</strong></span>
                        <span>Vitória: <strong>{emp.taxa_vitoria}%</strong></span>
                      </div>
                    </div>
                  );
                }
                // Person/group tooltip
                const sociosMatch = socios.filter((s) => {
                  const pid = `p:${s.nome.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 40)}`;
                  return pid === hoveredNode;
                });
                return (
                  <div
                    className="absolute pointer-events-none bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border text-xs z-10"
                    style={{ left: `${(n.x * zoom + panOffset.x) / 8 + 5}%`, top: `${(n.y * zoom + panOffset.y) / 7}%`, maxWidth: 240 }}
                  >
                    <p className="font-bold text-sm flex items-center gap-1.5">
                      {n.type === "pessoa" ? <User size={12} /> : <Building2 size={12} />}
                      {sociosMatch[0]?.nome || n.label}
                    </p>
                    {sociosMatch.map((s, i) => (
                      <p key={i} className="text-muted-foreground mt-0.5">{s.qualificacao} — {s.empresa_nome}</p>
                    ))}
                  </div>
                );
              })()}

              {/* Legend */}
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-sm text-[0.65rem] space-y-1.5 border">
                <p className="font-bold text-xs mb-1.5">Legenda</p>
                {camada !== "socios" && (
                  <>
                    {[
                      { cor: "#10b981", label: "Empresa Score 85+" },
                      { cor: "#3b82f6", label: "Empresa Score 70-84" },
                      { cor: "#f59e0b", label: "Empresa Score 50-69" },
                      { cor: "#ef4444", label: "Empresa Score <50" },
                    ].map((l) => (
                      <div key={l.label} className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-full border-2 bg-white" style={{ borderColor: l.cor }} />
                        <span>{l.label}</span>
                      </div>
                    ))}
                  </>
                )}
                {camada !== "empresas" && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rotate-45 border-2 bg-white" style={{ borderColor: "#f59e0b" }} />
                      <span>Pessoa Física</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 bg-white" style={{ borderColor: "#6366f1", clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
                      <span>Grupo / PJ Acionista</span>
                    </div>
                  </>
                )}
                <div className="border-t pt-1.5 mt-1.5 space-y-1">
                  {camada !== "socios" && (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-[2px] bg-violet-400 rounded" />
                      <span>Vínculo via projeto</span>
                    </div>
                  )}
                  {camada !== "empresas" && (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-[2px] bg-blue-400 rounded" style={{ borderBottom: "2px dashed #3b82f6" }} />
                        <span>Vínculo societário</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-[2px] bg-amber-400 rounded" style={{ borderBottom: "2px dotted #f59e0b" }} />
                        <span>Vínculo pessoal cruzado</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Controls hint */}
              <div className="absolute top-3 right-3 text-[0.6rem] text-muted-foreground bg-white/80 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border">
                Arraste nós · Scroll = zoom · Clique = detalhes
              </div>

              {/* Investigation mode panel */}
              {investigationMode && (
                <div className="absolute bg-red-50 border border-red-200 rounded-xl p-3 shadow-lg z-20" style={{ right: 12, maxWidth: 320, top: 12 }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                      <Route size={14} />
                      Modo Investigação
                    </p>
                    <button
                      onClick={() => { setInvTargets([null, null]); setInvPath(null); }}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {!invTargets[0] && (
                    <p className="text-xs text-red-600">Clique na primeira empresa/nó</p>
                  )}
                  {invTargets[0] && !invTargets[1] && (
                    <div>
                      <p className="text-xs text-red-600 mb-1">
                        Origem: <strong>{nodeMap.get(invTargets[0])?.label}</strong>
                      </p>
                      <p className="text-xs text-red-600">Clique no nó destino</p>
                    </div>
                  )}
                  {invPath && (
                    <div className="space-y-1">
                      <p className="text-[0.65rem] font-semibold text-red-700 mb-1.5">
                        Caminho encontrado ({invPath.length - 1} saltos):
                      </p>
                      {invPath.map((nodeId, idx) => {
                        const n = nodeMap.get(nodeId);
                        return (
                          <div key={nodeId} className="flex items-center gap-1.5 text-xs">
                            {idx > 0 && <ArrowRight size={10} className="text-red-400 flex-shrink-0" />}
                            <span className={`font-medium ${idx === 0 || idx === invPath.length - 1 ? "text-red-700 font-bold" : "text-red-600"}`}>
                              {n?.label || nodeId}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {invTargets[0] && invTargets[1] && !invPath && (
                    <p className="text-xs text-red-600 font-semibold">Nenhum caminho encontrado entre os nós selecionados.</p>
                  )}
                </div>
              )}
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
                    <p className="font-bold text-lg" style={{ color: nodeColor({ score: selectedEmpresa.nota_score, type: "empresa" } as GraphNode) }}>
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

                {/* Sócios da empresa selecionada */}
                {(() => {
                  const empSocios = socios.filter((s) => s.empresa_id === selectedEmpresa.id);
                  if (empSocios.length === 0) return null;
                  return (
                    <div>
                      <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                        <Users size={12} className="text-blue-500" />
                        Sócios/Acionistas ({empSocios.length})
                      </p>
                      <div className="space-y-1 max-h-28 overflow-y-auto">
                        {empSocios.map((s, i) => (
                          <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-blue-50">
                            <div className="min-w-0">
                              <span className="font-medium block truncate">{s.nome}</span>
                              <span className="text-[0.6rem] text-muted-foreground">{s.qualificacao}</span>
                            </div>
                            {s.participacao_percentual && (
                              <span className="text-[0.65rem] font-bold text-blue-600 flex-shrink-0 ml-1">
                                {s.participacao_percentual}%
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

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
                      Empresas Conectadas ({Array.from(connectedNodes).filter((id) => !id.startsWith("p:")).length})
                    </p>
                    <div className="space-y-1 max-h-28 overflow-y-auto">
                      {Array.from(connectedNodes).filter((id) => !id.startsWith("p:")).map((id) => {
                        const emp = empresas.find((e) => e.id === id);
                        if (!emp) return null;
                        return (
                          <div
                            key={id}
                            className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => setSelectedNode(id)}
                          >
                            <span className="font-medium">{emp.nome_fantasia}</span>
                            <span className="font-bold" style={{ color: nodeColor({ score: emp.nota_score, type: "empresa" } as GraphNode) }}>{emp.nota_score}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <Button size="sm" className="w-full gap-1.5" onClick={() => navigate(`/empresas/${selectedEmpresa.id}`)}>
                  <ArrowRight size={14} /> Ver Dossiê Completo
                </Button>
              </CardContent>
            </Card>
          ) : selectedPessoa ? (
            <Card className="border-0 shadow-sm border-l-4 border-l-amber-500 animate-in slide-in-from-right-2 duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <User size={16} className="text-amber-500" />
                  {selectedPessoa.socios[0]?.nome || selectedPessoa.node.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {selectedPessoa.socios.map((s, i) => (
                    <div key={i} className="p-2.5 bg-amber-50 rounded-lg text-xs">
                      <p className="font-semibold">{s.empresa_nome}</p>
                      <p className="text-muted-foreground">{s.qualificacao}</p>
                      {s.participacao_percentual && (
                        <p className="text-amber-700 font-bold mt-0.5">Participação: {s.participacao_percentual}%</p>
                      )}
                      <p className="text-[0.6rem] text-muted-foreground mt-0.5">Desde: {new Date(s.data_entrada).toLocaleDateString("pt-BR")}</p>
                    </div>
                  ))}
                </div>
                {/* Check if this person appears in vinculosPessoais */}
                {(() => {
                  const nome = selectedPessoa.socios[0]?.nome || "";
                  const vp = vinculosPessoais.find((v) => v.pessoa === nome);
                  if (!vp) return null;
                  return (
                    <div className={`p-2.5 rounded-lg border text-xs ${vp.risco === "alto" ? "bg-red-50 border-red-200" : vp.risco === "medio" ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"}`}>
                      <p className="font-bold flex items-center gap-1">
                        <AlertTriangle size={12} />
                        Vínculo Cruzado — Risco {vp.risco}
                      </p>
                      <p className="mt-1 leading-relaxed text-muted-foreground">{vp.descricao.slice(0, 200)}{vp.descricao.length > 200 ? "…" : ""}</p>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center text-muted-foreground">
                <Network size={36} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm font-semibold">Selecione um nó</p>
                <p className="text-xs mt-1.5 leading-relaxed">
                  Clique em uma empresa ou pessoa para ver detalhes e conexões.
                  Use as abas acima para alternar entre camadas.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Anomalias */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" />
                Alertas de Vínculo ({anomalias.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
              {anomalias.slice(0, 15).map((a, i) => (
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
              {anomalias.length > 15 && (
                <p className="text-center text-[0.65rem] text-muted-foreground py-1">
                  + {anomalias.length - 15} alertas adicionais
                </p>
              )}
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
                  Dados de fontes públicas (PNCP, CVM, Receita Federal QSA)
                </li>
                <li className="flex items-start gap-1.5">
                  <Shield size={10} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  Nomes de dirigentes apenas de companhias abertas (Lei 6.404/76)
                </li>
                <li className="flex items-start gap-1.5">
                  <Shield size={10} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  Base legal: Art. 7°, II e IX da LGPD
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
                <li><strong>Empresas:</strong> Círculos — tamanho proporcional às conexões, cor = score</li>
                <li><strong>Sócios:</strong> Losangos (PF) e Hexágonos (PJ/Grupo)</li>
                <li><strong>Linhas:</strong> Violeta = projeto · Azul tracejada = societário · Amarela = vínculo pessoal</li>
                <li>Arraste nós · Use camadas para alternar visualizações</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GrafoVinculos;
