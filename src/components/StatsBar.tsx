import { Droplets, Home, TrendingUp, Users, ShieldCheck, BarChart3 } from "lucide-react";

const stats = [
  { icon: Droplets, value: "84,2%", label: "Cobertura de Água", color: "text-blue-400" },
  { icon: Home, value: "55,8%", label: "Coleta de Esgoto", color: "text-green-400" },
  { icon: TrendingUp, value: "R$ 23,1 bi", label: "Investimento 2025", color: "text-amber-400" },
  { icon: Users, value: "100 mi", label: "Sem Saneamento", color: "text-red-400" },
  { icon: ShieldCheck, value: "2033", label: "Meta Universalização", color: "text-violet-400" },
  { icon: BarChart3, value: "1.500+", label: "Licitações Ativas", color: "text-cyan-400" },
];

const StatsBar = () => {
  return (
    <section className="bg-gradient-to-r from-[#0f172a] to-[#1e3a5f] border-t border-white/10">
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <stat.icon size={22} className={`${stat.color} mb-2`} />
              <span className="text-xl font-extrabold text-white">{stat.value}</span>
              <span className="text-[0.7rem] text-white/60 uppercase tracking-wider mt-0.5">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
