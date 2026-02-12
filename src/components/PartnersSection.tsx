const parceiros = [
  { nome: "SABESP", sigla: "SABESP", cor: "bg-blue-600" },
  { nome: "CAIXA", sigla: "CAIXA", cor: "bg-blue-800" },
  { nome: "ANA", sigla: "ANA", cor: "bg-cyan-600" },
  { nome: "ABES", sigla: "ABES", cor: "bg-green-600" },
  { nome: "CBIC", sigla: "CBIC", cor: "bg-amber-600" },
  { nome: "CONFEA/CREA", sigla: "CONFEA", cor: "bg-red-700" },
  { nome: "BNDES", sigla: "BNDES", cor: "bg-emerald-700" },
  { nome: "DNIT", sigla: "DNIT", cor: "bg-violet-700" },
  { nome: "Trata Brasil", sigla: "TB", cor: "bg-sky-600" },
  { nome: "IBGE", sigla: "IBGE", cor: "bg-slate-700" },
];

const PartnersSection = () => {
  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight">
            Fontes & Parceiros
          </h2>
          <p className="text-muted-foreground mt-2">
            Dados e informações dos principais órgãos e entidades do setor
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {parceiros.map((p, index) => (
            <div
              key={index}
              className="flex items-center gap-3 px-5 py-3 bg-white rounded-xl border border-border hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
            >
              <div
                className={`w-10 h-10 ${p.cor} rounded-lg flex items-center justify-center text-white text-xs font-bold`}
              >
                {p.sigla.slice(0, 3)}
              </div>
              <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                {p.nome}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
