import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Network, Building2, Users, ZoomIn, ZoomOut, Maximize2,
  AlertTriangle, Eye, EyeOff, Info, MapPin, ArrowRight,
  User, Download, Search, X, Plus, Shield, Lock,
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

// ── Edge colors ──
const edgeColors: Record<EdgeType, string> = {
  projeto: "#8b5cf6",
  societario: "#3b82f6",
  vinculo_pessoal: "#f59e0b",
};

// ── Build subgraph centered on a set of focus nodes ──
function buildFocusedGraph(focusIds: Set<string>): { nodes: GraphNode[]; edges: GraphEdge[] } {
  if (focusIds.size === 0) return { nodes: [], edges: [] };

  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();
  const connectedIds = new Set<string>(focusIds);

  // 1) Empresa-empresa via projetos (only if at least one focus node is in the project)
  projetos.forEach((proj) => {
    const ids = proj.participantes.map((p) => p.empresa_id);
    const hasFocus = ids.some((id) => focusIds.has(id));
    if (!hasFocus) return;
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        if (!focusIds.has(ids[i]) && !focusIds.has(ids[j])) continue;
        const key = [ids[i], ids[j]].sort().join("-") + ":proj";
        connectedIds.add(ids[i]);
        connectedIds.add(ids[j]);
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

  // 2) Societário from socios data
  socios.forEach((s) => {
    if (!focusIds.has(s.empresa_id)) return;
    const pessoaId = `p:${s.nome.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 40)}`;
    const key = [pessoaId, s.empresa_id].sort().join("-") + ":soc";
    connectedIds.add(pessoaId);
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push({
        source: pessoaId,
        target: s.empresa_id,
        label: s.qualificacao,
        peso: s.participacao_percentual ? Math.max(1, Math.round(s.participacao_percentual / 20)) : 1,
        tipo: "societario",
      });
    }
  });

  // 3) Vínculos pessoais cruzados
  vinculosPessoais.forEach((v) => {
    if (v.empresas.length < 2) return;
    const hasFocus = v.empresas.some((e) => focusIds.has(e.empresa_id));
    if (!hasFocus) return;
    for (let i = 0; i < v.empresas.length; i++) {
      for (let j = i + 1; j < v.empresas.length; j++) {
        if (!focusIds.has(v.empresas[i].empresa_id) && !focusIds.has(v.empresas[j].empresa_id)) continue;
        const key = [v.empresas[i].empresa_id, v.empresas[j].empresa_id].sort().join("-") + ":vp";
        connectedIds.add(v.empresas[i].empresa_id);
        connectedIds.add(v.empresas[j].empresa_id);
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
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
  });

  // Count connections
  const conexoesCount: Record<string, number> = {};
  edges.forEach((e) => {
    conexoesCount[e.source] = (conexoesCount[e.source] || 0) + 1;
    conexoesCount[e.target] = (conexoesCount[e.target] || 0) + 1;
  });

  // Build nodes
  const cx = 400, cy = 350;
  const nodes: GraphNode[] = [];
  let empIdx = 0;
  const totalEmps = Array.from(connectedIds).filter((id) => !id.startsWith("p:")).length;

  connectedIds.forEach((id) => {
    if (id.startsWith("p:")) {
      // Pessoa node
      const sociosMatch = socios.filter((s) => {
        const pid = `p:${s.nome.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 40)}`;
        return pid === id;
      });
      const nome = sociosMatch[0]?.nome || id;
      const isGrupo = nome.includes("S.A.") || nome.includes("S/A") || nome.includes("Ltd") || nome.includes("Estado");
      const angle = (nodes.filter((n) => n.type !== "empresa").length / Math.max(1, connectedIds.size - totalEmps)) * 2 * Math.PI;
      nodes.push({
        id,
        label: nome.length > 25 ? nome.slice(0, 25) + "…" : nome,
        type: isGrupo ? "grupo" : "pessoa",
        x: cx + 160 * Math.cos(angle),
        y: cy + 160 * Math.sin(angle),
        vx: 0, vy: 0, fx: null, fy: null,
        score: 0,
        estado: "",
        porte: "",
        conexoes: conexoesCount[id] || 0,
        qualificacao: sociosMatch[0]?.qualificacao,
      });
    } else {
      // Empresa node
      const emp = empresas.find((e) => e.id === id);
      if (!emp) return;
      const isFocus = focusIds.has(id);
      const angle = (empIdx / Math.max(1, totalEmps)) * 2 * Math.PI - Math.PI / 2;
      const r = isFocus ? 0 : 220;
      empIdx++;
      nodes.push({
        id: emp.id,
        label: emp.nome_fantasia,
        type: "empresa",
        x: cx + r * Math.cos(angle) + (isFocus ? (Math.random() - 0.5) * 40 : 0),
        y: cy + r * Math.sin(angle) + (isFocus ? (Math.random() - 0.5) * 40 : 0),
        vx: 0, vy: 0, fx: null, fy: null,
        score: emp.nota_score,
        estado: emp.estado_sede,
        porte: emp.porte,
        conexoes: conexoesCount[emp.id] || 0,
      });
    }
  });

  return { nodes, edges };
}

// ── Force simulation ──
function simulateForces(nodes: GraphNode[], edges: GraphEdge[], alpha: number) {
  const cx = 400, cy = 350;
  const repulsion = 12000;
  const attraction = 0.008;
  const centerForce = 0.012;
  const damping = 0.85;

  nodes.forEach((n) => { n.vx = 0; n.vy = 0; });

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
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

// ── Colors ──
function nodeColor(node: GraphNode) {
  if (node.type === "pessoa") return "#f59e0b";
  if (node.type === "grupo") return "#6366f1";
  if (node.score >= 85) return "#10b981";
  if (node.score >= 70) return "#3b82f6";
  if (node.score >= 50) return "#f59e0b";
  return "#ef4444";
}

function nodeRadius(node: GraphNode, isSelected: boolean) {
  if (node.type === "pessoa" || node.type === "grupo") {
    const base = 14 + Math.min(8, node.conexoes * 2);
    return isSelected ? base + 5 : base;
  }
  const base = 18 + Math.min(10, node.conexoes * 2);
  return isSelected ? base + 6 : base;
}

// ── Component ──
const GrafoVinculos = () => {
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number>(0);
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [mostrarLabels, setMostrarLabels] = useState(true);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const panStart = useRef({ x: 0, y: 0 });
  const dragNode = useRef<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // ── Search state ──
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [focusIds, setFocusIds] = useState<Set<string>>(new Set());
  const searchRef = useRef<HTMLInputElement>(null);

  // Search results: empresas + sócios
  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    const empResults = empresas
      .filter((e) => e.nome_fantasia.toLowerCase().includes(q) || e.razao_social.toLowerCase().includes(q) || e.cnpj.includes(q))
      .slice(0, 8)
      .map((e) => ({ id: e.id, label: e.nome_fantasia, sublabel: `${e.segmentos[0]} · ${e.estado_sede}`, type: "empresa" as const }));

    const socResults: { id: string; label: string; sublabel: string; type: "pessoa" }[] = [];
    const seen = new Set<string>();
    socios.forEach((s) => {
      if (!s.nome.toLowerCase().includes(q)) return;
      const pid = `p:${s.nome.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 40)}`;
      if (seen.has(pid)) return;
      seen.add(pid);
      const emps = socios.filter((s2) => {
        const pid2 = `p:${s2.nome.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 40)}`;
        return pid2 === pid;
      });
      socResults.push({
        id: s.empresa_id,
        label: s.nome,
        sublabel: `Sócio em ${emps.length} empresa(s)`,
        type: "pessoa",
      });
    });

    return [...empResults, ...socResults.slice(0, 5)];
  }, [searchQuery]);

  // Graph for focused nodes
  const graphRef = useRef<{ nodes: GraphNode[]; edges: GraphEdge[]; key: string } | null>(null);
  const focusKey = Array.from(focusIds).sort().join(",");
  if (!graphRef.current || graphRef.current.key !== focusKey) {
    const g = buildFocusedGraph(focusIds);
    graphRef.current = { ...g, key: focusKey };
    if (g.nodes.length > 0) setIsSimulating(true);
  }
  const { nodes, edges } = graphRef.current;

  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes, tick]);

  const connectedNodes = useMemo(() => {
    if (!selectedNode) return new Set<string>();
    const set = new Set<string>();
    edges.forEach((e) => {
      if (e.source === selectedNode) set.add(e.target);
      if (e.target === selectedNode) set.add(e.source);
    });
    return set;
  }, [selectedNode, edges]);

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

  // ── Force simulation ──
  useEffect(() => {
    if (!isSimulating || nodes.length === 0) return;
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
    graphRef.current = null;
    setIsSimulating(true);
    setTick((t) => t + 1);
  }, []);

  // Add a node to the focus set
  const addFocusNode = useCallback((id: string) => {
    setFocusIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setSearchQuery("");
    setSearchOpen(false);
    setPanOffset({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  const removeFocusNode = useCallback((id: string) => {
    setFocusIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setSelectedNode(null);
    graphRef.current = null;
  }, []);

  const clearAll = useCallback(() => {
    setFocusIds(new Set());
    setSelectedNode(null);
    graphRef.current = null;
    setSearchQuery("");
  }, []);

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

  // Export PNG
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
  const renderNodeShape = useCallback((node: GraphNode, r: number, color: string, strokeWidth: number, filter?: string) => {
    if (node.type === "pessoa") {
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

  // Stats
  const stats = useMemo(() => ({
    empresas: nodes.filter((n) => n.type === "empresa").length,
    pessoas: nodes.filter((n) => n.type === "pessoa" || n.type === "grupo").length,
    conexoes: edges.length,
  }), [nodes, edges]);

  // Focus node labels for chips
  const focusChips = useMemo(() => {
    return Array.from(focusIds).map((id) => {
      const emp = empresas.find((e) => e.id === id);
      return { id, label: emp?.nome_fantasia || id };
    });
  }, [focusIds]);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Network size={28} className="text-violet-500" />
            Grafo de Vínculos
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pesquise uma empresa ou sócio para visualizar conexões
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield size={14} className="text-emerald-500" />
          <span>Dados públicos — LGPD Art. 7°, II</span>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative max-w-xl">
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-violet-500/30 focus-within:border-violet-400 transition-all">
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Buscar empresa, CNPJ ou sócio..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(""); setSearchOpen(false); }} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Search dropdown */}
        {searchOpen && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
            {searchResults.map((r) => (
              <button
                key={r.id + r.label}
                onClick={() => addFocusNode(r.id)}
                className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div className={`p-2 rounded-lg ${r.type === "empresa" ? "bg-blue-50 dark:bg-blue-900/20" : "bg-amber-50 dark:bg-amber-900/20"}`}>
                  {r.type === "empresa" ? <Building2 size={16} className="text-blue-500" /> : <User size={16} className="text-amber-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.sublabel}</p>
                </div>
                <Plus size={16} className="text-violet-500 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active focus chips */}
      {focusChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Investigando:</span>
          {focusChips.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-3 py-1.5 rounded-full text-xs font-semibold"
            >
              <Building2 size={12} />
              {c.label}
              <button onClick={() => removeFocusNode(c.id)} className="hover:text-violet-900 dark:hover:text-violet-100">
                <X size={12} />
              </button>
            </span>
          ))}
          <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-500 transition-colors ml-1">
            Limpar tudo
          </button>
        </div>
      )}

      {/* Empty state */}
      {focusIds.size === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-violet-50 dark:bg-violet-900/20 rounded-2xl flex items-center justify-center mb-5">
            <Network size={36} className="text-violet-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-2">Pesquise para iniciar</h2>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            Digite o nome de uma empresa, CNPJ ou nome de sócio na barra acima.
            O grafo mostrará apenas as conexões relevantes.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["Sabesp", "Aegea", "BRK Ambiental", "Copasa"].map((nome) => {
              const emp = empresas.find((e) => e.nome_fantasia.includes(nome));
              if (!emp) return null;
              return (
                <button
                  key={emp.id}
                  onClick={() => addFocusNode(emp.id)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:border-violet-300 transition-all shadow-sm"
                >
                  <Building2 size={14} className="text-violet-500" />
                  {nome}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Graph area */}
      {focusIds.size > 0 && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Empresas", valor: stats.empresas, icon: Building2, cor: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Sócios", valor: stats.pessoas, icon: Users, cor: "text-amber-500", bg: "bg-amber-500/10" },
              { label: "Vínculos", valor: stats.conexoes, icon: Network, cor: "text-violet-500", bg: "bg-violet-500/10" },
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

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
            {/* SVG Graph */}
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
                    <Button variant="ghost" size="sm" onClick={exportPNG} className="h-8 w-8 p-0" title="Exportar PNG">
                      <Download size={14} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div
                  className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden"
                  style={{ height: "min(560px, 65vh)", cursor: dragNode.current ? "grabbing" : isPanning ? "grabbing" : "grab" }}
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
                      {edges.map((edge, i) => {
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
                              stroke={isHighlighted || isHovered ? edgeColors[edge.tipo] : "#94a3b8"}
                              strokeWidth={Math.min(5, edge.peso * 1.5 + 0.5)}
                              opacity={isDimmed ? 0.08 : isHighlighted ? 0.85 : isHovered ? 0.7 : 0.35}
                              strokeLinecap="round"
                              strokeDasharray={edge.tipo === "societario" ? "6,3" : edge.tipo === "vinculo_pessoal" ? "3,3" : "none"}
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
                      {nodes.map((node) => {
                        const isSelected = node.id === selectedNode;
                        const isHovered = node.id === hoveredNode;
                        const isConnected = connectedNodes.has(node.id);
                        const isFocus = focusIds.has(node.id);
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
                                setSelectedNode(selectedNode === node.id ? null : node.id);
                              }
                            }}
                            onMouseEnter={() => setHoveredNode(node.id)}
                            onMouseLeave={() => setHoveredNode(null)}
                            opacity={isDimmed ? 0.15 : 1}
                          >
                            {/* Focus ring */}
                            {isFocus && (
                              <circle cx={node.x} cy={node.y} r={r + 12} fill="none" stroke="#8b5cf6" strokeWidth={2} opacity={0.4} strokeDasharray="6,3" />
                            )}
                            {isSelected && (
                              <circle cx={node.x} cy={node.y} r={r + 10} fill={color} opacity={0.1} />
                            )}
                            {isHovered && !isSelected && (
                              <circle cx={node.x} cy={node.y} r={r + 5} fill={color} opacity={0.08} />
                            )}
                            {renderNodeShape(
                              node, r, color,
                              isSelected ? 4 : isConnected ? 3 : isHovered ? 3 : 2,
                              isSelected ? "url(#shadow)" : undefined,
                            )}
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
                                  {node.label.length > 18 ? node.label.slice(0, 18) + "…" : node.label}
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
                              </>
                            )}
                          </g>
                        );
                      })}
                    </g>
                  </svg>

                  {/* Legend */}
                  <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl p-3 shadow-sm text-[0.65rem] space-y-1.5 border">
                    <p className="font-bold text-xs mb-1.5">Legenda</p>
                    <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full border-2 bg-white" style={{ borderColor: "#10b981" }} /><span>Empresa Score 85+</span></div>
                    <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full border-2 bg-white" style={{ borderColor: "#3b82f6" }} /><span>Empresa Score 70-84</span></div>
                    <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rotate-45 border-2 bg-white" style={{ borderColor: "#f59e0b" }} /><span>Pessoa Física</span></div>
                    <div className="border-t pt-1.5 mt-1.5 space-y-1">
                      <div className="flex items-center gap-2"><div className="w-5 h-[2px] bg-violet-400 rounded" /><span>Via projeto</span></div>
                      <div className="flex items-center gap-2"><div className="w-5 h-[2px] bg-blue-400 rounded" style={{ borderBottom: "2px dashed #3b82f6" }} /><span>Societário</span></div>
                      <div className="flex items-center gap-2"><div className="w-5 h-[2px] bg-amber-400 rounded" style={{ borderBottom: "2px dotted #f59e0b" }} /><span>Vínculo pessoal</span></div>
                    </div>
                  </div>

                  <div className="absolute top-3 right-3 text-[0.6rem] text-muted-foreground bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border">
                    Arraste nós · Scroll = zoom · Clique = detalhes
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sidebar */}
            <div className="space-y-4">
              {selectedEmpresa ? (
                <Card className="border-0 shadow-sm border-l-4 border-l-violet-500">
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

                    {/* Sócios */}
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
                              <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20">
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

                    {/* Connected empresas */}
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
                                <span className="font-medium truncate">{emp.nome_fantasia}</span>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="font-bold" style={{ color: nodeColor({ score: emp.nota_score, type: "empresa" } as GraphNode) }}>{emp.nota_score}</span>
                                  {!focusIds.has(id) && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); addFocusNode(id); }}
                                      className="text-violet-400 hover:text-violet-600"
                                      title="Expandir conexões"
                                    >
                                      <Plus size={14} />
                                    </button>
                                  )}
                                </div>
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
                <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <User size={16} className="text-amber-500" />
                      {selectedPessoa.socios[0]?.nome || selectedPessoa.node.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      {selectedPessoa.socios.map((s, i) => (
                        <div key={i} className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-xs">
                          <p className="font-semibold">{s.empresa_nome}</p>
                          <p className="text-muted-foreground">{s.qualificacao}</p>
                          {s.participacao_percentual && (
                            <p className="text-amber-700 dark:text-amber-400 font-bold mt-0.5">Participação: {s.participacao_percentual}%</p>
                          )}
                          <p className="text-[0.6rem] text-muted-foreground mt-0.5">Desde: {new Date(s.data_entrada).toLocaleDateString("pt-BR")}</p>
                        </div>
                      ))}
                    </div>
                    {(() => {
                      const nome = selectedPessoa.socios[0]?.nome || "";
                      const vp = vinculosPessoais.find((v) => v.pessoa === nome);
                      if (!vp) return null;
                      return (
                        <div className={`p-2.5 rounded-lg border text-xs ${vp.risco === "alto" ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800" : "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"}`}>
                          <p className="font-bold flex items-center gap-1">
                            <AlertTriangle size={12} />
                            Vínculo Cruzado — Risco {vp.risco}
                          </p>
                          <p className="mt-1 leading-relaxed text-muted-foreground">{vp.descricao.slice(0, 200)}</p>
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
                      Clique em uma empresa ou pessoa no grafo para ver detalhes.
                      Use o botão <Plus size={10} className="inline" /> para expandir conexões.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* How it works */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-900/10 dark:to-blue-900/10">
                <CardContent className="p-4">
                  <p className="text-xs font-bold flex items-center gap-1.5 mb-2">
                    <Info size={13} className="text-violet-500" />
                    Como funciona
                  </p>
                  <ul className="text-[0.65rem] text-muted-foreground space-y-1 leading-relaxed">
                    <li>1. Busque uma empresa ou sócio na barra de pesquisa</li>
                    <li>2. Clique em nós para ver detalhes e sócios</li>
                    <li>3. Use <Plus size={10} className="inline" /> nas empresas conectadas para expandir o grafo</li>
                    <li>4. Arraste nós para reorganizar o layout</li>
                  </ul>
                </CardContent>
              </Card>

              {/* LGPD */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/10 dark:to-blue-900/10">
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
                      Base legal: Art. 7°, II e IX da LGPD
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GrafoVinculos;
