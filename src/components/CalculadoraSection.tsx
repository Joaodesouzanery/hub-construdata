import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Info, RotateCcw } from "lucide-react";

interface CamposBDI {
  ac: string;       // Administração Central
  df: string;       // Despesas Financeiras
  sg: string;       // Seguros e Garantias
  r: string;        // Riscos
  l: string;        // Lucro
  i: string;        // Impostos (ISS + PIS + COFINS + CPRB)
}

const valoresPadrao: CamposBDI = {
  ac: "4.00",
  df: "1.20",
  sg: "0.80",
  r: "1.27",
  l: "6.16",
  i: "7.65",
};

const labels: Record<keyof CamposBDI, string> = {
  ac: "Administração Central (%)",
  df: "Despesas Financeiras (%)",
  sg: "Seguros e Garantias (%)",
  r: "Riscos (%)",
  l: "Lucro (%)",
  i: "Impostos (ISS+PIS+COFINS+CPRB) (%)",
};

const CalculadoraSection = () => {
  const [campos, setCampos] = useState<CamposBDI>(valoresPadrao);

  const handleChange = (campo: keyof CamposBDI, valor: string) => {
    setCampos(prev => ({ ...prev, [campo]: valor }));
  };

  const resetar = () => setCampos(valoresPadrao);

  // Fórmula do TCU para cálculo do BDI
  // BDI = ((1 + AC + DF + SG + R + L) / (1 - I)) - 1
  const ac = parseFloat(campos.ac) / 100 || 0;
  const df = parseFloat(campos.df) / 100 || 0;
  const sg = parseFloat(campos.sg) / 100 || 0;
  const r = parseFloat(campos.r) / 100 || 0;
  const l = parseFloat(campos.l) / 100 || 0;
  const i = parseFloat(campos.i) / 100 || 0;

  const denominador = 1 - i;
  const bdi = denominador > 0 ? ((1 + ac + df + sg + r + l) / denominador - 1) * 100 : 0;

  const faixaBDI = () => {
    if (bdi < 20) return { texto: "Abaixo da referência", cor: "text-amber-600 bg-amber-50 border-amber-200" };
    if (bdi <= 25) return { texto: "Faixa TCU — Obras", cor: "text-green-600 bg-green-50 border-green-200" };
    if (bdi <= 30) return { texto: "Faixa TCU — Serviços", cor: "text-blue-600 bg-blue-50 border-blue-200" };
    return { texto: "Acima da referência", cor: "text-red-600 bg-red-50 border-red-200" };
  };

  const faixa = faixaBDI();

  return (
    <section className="py-12">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight flex items-center justify-center gap-2">
            <Calculator size={24} className="text-primary" />
            Calculadora de BDI
          </h2>
          <p className="text-muted-foreground mt-2">
            Calcule o BDI de acordo com a fórmula do TCU (Acórdão 2.622/2013)
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
          {/* Formulário */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Parâmetros do BDI</span>
                <Button variant="ghost" size="sm" onClick={resetar} className="text-xs">
                  <RotateCcw size={14} className="mr-1" />
                  Valores Padrão
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(Object.keys(campos) as (keyof CamposBDI)[]).map((campo) => (
                  <div key={campo}>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      {labels[campo]}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="99"
                      value={campos[campo]}
                      onChange={(e) => handleChange(campo, e.target.value)}
                      className="tabular-nums"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resultado */}
          <Card className="lg:w-72 flex flex-col items-center justify-center text-center">
            <CardContent className="p-8">
              <p className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                BDI Calculado
              </p>
              <p className="text-5xl font-extrabold text-primary mb-1">
                {bdi.toFixed(2)}%
              </p>
              <Badge variant="outline" className={`text-xs mt-2 ${faixa.cor}`}>
                {faixa.texto}
              </Badge>

              <div className="mt-6 space-y-2 text-left text-xs text-muted-foreground">
                <p className="flex items-start gap-1.5">
                  <Info size={12} className="mt-0.5 flex-shrink-0 text-primary" />
                  <span><strong>Obras:</strong> BDI entre 20,34% e 25,00% (referência TCU)</span>
                </p>
                <p className="flex items-start gap-1.5">
                  <Info size={12} className="mt-0.5 flex-shrink-0 text-primary" />
                  <span><strong>Serviços:</strong> BDI entre 26,00% e 30,00% (referência TCU)</span>
                </p>
              </div>

              <div className="mt-6 pt-4 border-t">
                <p className="text-[0.65rem] text-muted-foreground leading-relaxed">
                  Fórmula: BDI = ((1+AC+DF+SG+R+L)/(1-I)) − 1
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CalculadoraSection;
