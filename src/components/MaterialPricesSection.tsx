import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Package, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Material {
  nome: string;
  unidade: string;
  preco: number;
  variacao: number;
  categoria: string;
  referencia: string;
}

const materiais: Material[] = [
  { nome: "Cimento CP II-E-32 (50kg)", unidade: "sc", preco: 34.50, variacao: 2.3, categoria: "Básicos", referencia: "SINAPI" },
  { nome: "Aço CA-50 Ø 10mm", unidade: "kg", preco: 7.85, variacao: -1.2, categoria: "Metais", referencia: "SINAPI" },
  { nome: "Tubo PVC DN 100mm (6m)", unidade: "un", preco: 42.90, variacao: 0.0, categoria: "Hidráulica", referencia: "SINAPI" },
  { nome: "Areia Média Lavada", unidade: "m³", preco: 125.00, variacao: 3.5, categoria: "Básicos", referencia: "SINAPI" },
  { nome: "Brita nº 1", unidade: "m³", preco: 98.00, variacao: 1.8, categoria: "Básicos", referencia: "SINAPI" },
  { nome: "Tubo PEAD DN 200mm", unidade: "m", preco: 89.50, variacao: -0.5, categoria: "Hidráulica", referencia: "SICRO" },
  { nome: "Concreto Usinado fck 25 MPa", unidade: "m³", preco: 485.00, variacao: 2.1, categoria: "Básicos", referencia: "SINAPI" },
  { nome: "Tijolo Cerâmico 6 furos", unidade: "mil", preco: 680.00, variacao: 0.0, categoria: "Alvenaria", referencia: "SINAPI" },
  { nome: "Registro de Gaveta DN 50mm", unidade: "un", preco: 78.30, variacao: -2.0, categoria: "Hidráulica", referencia: "SINAPI" },
  { nome: "Impermeabilizante Asfáltico", unidade: "l", preco: 22.40, variacao: 4.2, categoria: "Químicos", referencia: "SINAPI" },
  { nome: "Telha Fibrocimento 6mm", unidade: "un", preco: 38.90, variacao: 1.0, categoria: "Cobertura", referencia: "SINAPI" },
  { nome: "Bomba Submersível 2CV", unidade: "un", preco: 3250.00, variacao: -0.8, categoria: "Equipamentos", referencia: "SICRO" },
];

const categorias = ["Todos", ...new Set(materiais.map(m => m.categoria))];

const MaterialPricesSection = () => {
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");

  const filtered = materiais.filter(m => {
    const matchBusca = m.nome.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = categoriaAtiva === "Todos" || m.categoria === categoriaAtiva;
    return matchBusca && matchCategoria;
  });

  return (
    <section className="py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <Package size={24} className="text-primary" />
              Preços de Materiais
            </h2>
            <p className="text-muted-foreground mt-1">
              Referência SINAPI/SICRO — Fev/2026 — São Paulo
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar material..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                categoriaAtiva === cat
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">
              {filtered.length} materiais encontrados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-3 font-semibold">Material</th>
                    <th className="text-center px-4 py-3 font-semibold hidden sm:table-cell">Unid.</th>
                    <th className="text-right px-4 py-3 font-semibold">Preço (R$)</th>
                    <th className="text-center px-4 py-3 font-semibold">Var. Mensal</th>
                    <th className="text-center px-4 py-3 font-semibold hidden md:table-cell">Ref.</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((mat, index) => (
                    <tr
                      key={index}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium">{mat.nome}</span>
                        <span className="block sm:hidden text-xs text-muted-foreground mt-0.5">
                          {mat.unidade} — {mat.referencia}
                        </span>
                      </td>
                      <td className="text-center px-4 py-3 text-muted-foreground hidden sm:table-cell">
                        {mat.unidade}
                      </td>
                      <td className="text-right px-4 py-3 font-bold tabular-nums">
                        {mat.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-center px-4 py-3">
                        <Badge
                          variant="outline"
                          className={`text-xs font-semibold ${
                            mat.variacao > 0
                              ? "text-red-600 border-red-200 bg-red-50"
                              : mat.variacao < 0
                              ? "text-green-600 border-green-200 bg-green-50"
                              : "text-muted-foreground"
                          }`}
                        >
                          {mat.variacao > 0 ? (
                            <TrendingUp size={12} className="mr-1" />
                          ) : mat.variacao < 0 ? (
                            <TrendingDown size={12} className="mr-1" />
                          ) : (
                            <Minus size={12} className="mr-1" />
                          )}
                          {mat.variacao > 0 ? "+" : ""}
                          {mat.variacao.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="text-center px-4 py-3 hidden md:table-cell">
                        <Badge variant="secondary" className="text-[0.65rem]">
                          {mat.referencia}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhum material encontrado para a busca.
              </p>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Valores de referência para estimativas. Preços podem variar por região e fornecedor.
          Fonte: SINAPI/CAIXA e SICRO/DNIT — Fevereiro 2026.
        </p>
      </div>
    </section>
  );
};

export default MaterialPricesSection;
