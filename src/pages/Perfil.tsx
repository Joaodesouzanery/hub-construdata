import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Mail,
  Building2,
  Briefcase,
  LogIn,
  LogOut,
  UserPlus,
  Save,
  Bookmark,
  Trash2,
  Bell,
  Shield,
  Settings,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

type Tab = "login" | "register";

const LoginForm = () => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result =
      tab === "login"
        ? await login(email, senha)
        : await register(email, senha, nome);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(tab === "login" ? "Login realizado!" : "Conta criada com sucesso!");
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <User size={32} className="text-primary" />
          </div>
          <CardTitle className="text-xl font-extrabold">
            {tab === "login" ? "Entrar na Plataforma" : "Criar Conta"}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Acesse suas configurações personalizadas, filtros salvos e alertas
          </p>
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <div className="flex bg-muted rounded-lg p-1 mb-5">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 text-sm font-semibold py-2 rounded-md transition-colors ${
                tab === "login" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              <LogIn size={14} className="inline mr-1.5" />
              Entrar
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 text-sm font-semibold py-2 rounded-md transition-colors ${
                tab === "register" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              <UserPlus size={14} className="inline mr-1.5" />
              Registrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "register" && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                  Nome completo
                </label>
                <Input
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                Email
              </label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                Senha
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Carregando..." : tab === "login" ? "Entrar" : "Criar Conta"}
            </Button>
          </form>

          <p className="text-[0.65rem] text-muted-foreground text-center mt-4">
            Modo offline: seus dados ficam salvos localmente no navegador.
            <br />
            Com Supabase configurado, sincroniza automaticamente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const ProfilePanel = () => {
  const { user, logout, updateProfile, removeFilter, updateAlertConfig } = useAuth();
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(user?.nome ?? "");
  const [empresa, setEmpresa] = useState(user?.empresa ?? "");
  const [cargo, setCargo] = useState(user?.cargo ?? "");

  if (!user) return null;

  const salvarPerfil = () => {
    updateProfile({ nome, empresa, cargo });
    setEditando(false);
    toast.success("Perfil atualizado!");
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <User size={28} className="text-primary" />
            Meu Perfil
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie sua conta, filtros salvos e configurações de alertas
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={logout} className="w-fit">
          <LogOut size={14} className="mr-1.5" />
          Sair
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        {/* Coluna Principal */}
        <div className="space-y-6">
          {/* Dados do Perfil */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Settings size={18} className="text-primary" />
                  Dados Pessoais
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => (editando ? salvarPerfil() : setEditando(true))}
                >
                  {editando ? (
                    <>
                      <Save size={14} className="mr-1" /> Salvar
                    </>
                  ) : (
                    "Editar"
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <User size={12} /> Nome
                  </label>
                  {editando ? (
                    <Input value={nome} onChange={(e) => setNome(e.target.value)} />
                  ) : (
                    <p className="text-sm font-medium py-2">{user.nome}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <Mail size={12} /> Email
                  </label>
                  <p className="text-sm font-medium py-2">{user.email}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <Building2 size={12} /> Empresa
                  </label>
                  {editando ? (
                    <Input
                      value={empresa}
                      onChange={(e) => setEmpresa(e.target.value)}
                      placeholder="Sua empresa"
                    />
                  ) : (
                    <p className="text-sm font-medium py-2 text-muted-foreground">
                      {user.empresa || "Não informado"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <Briefcase size={12} /> Cargo
                  </label>
                  {editando ? (
                    <Input
                      value={cargo}
                      onChange={(e) => setCargo(e.target.value)}
                      placeholder="Seu cargo"
                    />
                  ) : (
                    <p className="text-sm font-medium py-2 text-muted-foreground">
                      {user.cargo || "Não informado"}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filtros Salvos */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Bookmark size={18} className="text-primary" />
                Filtros Salvos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.filtros_salvos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bookmark size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Nenhum filtro salvo ainda</p>
                  <p className="text-xs mt-1">
                    Salve filtros nas páginas de Licitações, Notícias ou Alertas para acessá-los
                    rapidamente aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {user.filtros_salvos.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">{f.nome}</p>
                        <p className="text-xs text-muted-foreground capitalize">{f.tipo}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFilter(f.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna Lateral — Configurações de Alertas */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Bell size={16} className="text-primary" />
                Configurações de Alertas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Alertas por Email</p>
                  <p className="text-xs text-muted-foreground">Receba notificações no email</p>
                </div>
                <button
                  onClick={() =>
                    updateAlertConfig({ email_ativo: !user.alertas_config.email_ativo })
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    user.alertas_config.email_ativo ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      user.alertas_config.email_ativo ? "translate-x-[22px]" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Frequência */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Frequência</p>
                <div className="grid grid-cols-3 gap-2">
                  {(["tempo_real", "diario", "semanal"] as const).map((freq) => {
                    const labels = { tempo_real: "Tempo Real", diario: "Diário", semanal: "Semanal" };
                    return (
                      <button
                        key={freq}
                        onClick={() => updateAlertConfig({ frequencia: freq })}
                        className={`text-xs font-semibold py-2 rounded-lg border transition-colors ${
                          user.alertas_config.frequencia === freq
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-muted-foreground border-border hover:border-primary/50"
                        }`}
                      >
                        {labels[freq]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Limiar SINAPI */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                  Limiar SINAPI (%)
                </p>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  step={0.5}
                  value={user.alertas_config.limiar_sinapi}
                  onChange={(e) =>
                    updateAlertConfig({ limiar_sinapi: Number(e.target.value) })
                  }
                  className="w-24"
                />
              </div>

              {/* Valor mínimo licitações */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                  Valor mínimo licitações
                </p>
                <select
                  value={user.alertas_config.valor_minimo}
                  onChange={(e) =>
                    updateAlertConfig({ valor_minimo: Number(e.target.value) })
                  }
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white"
                >
                  <option value={0}>Todas</option>
                  <option value={1_000_000}>Acima de R$ 1M</option>
                  <option value={5_000_000}>Acima de R$ 5M</option>
                  <option value={10_000_000}>Acima de R$ 10M</option>
                  <option value={50_000_000}>Acima de R$ 50M</option>
                  <option value={100_000_000}>Acima de R$ 100M</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Status da conta */}
          <Card className="bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] text-white">
            <CardContent className="p-5">
              <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-3">
                Status da Conta
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-green-400" />
                  <span className="text-sm text-white/80">Perfil completo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-blue-400" />
                  <span className="text-sm text-white/80">
                    {user.filtros_salvos.length} filtro(s) salvo(s)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Bell size={14} className={user.alertas_config.email_ativo ? "text-green-400" : "text-gray-500"} />
                  <span className="text-sm text-white/80">
                    Alertas email: {user.alertas_config.email_ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </div>
              <p className="text-[0.6rem] text-white/40 mt-4">
                Membro desde {new Date(user.created_at).toLocaleDateString("pt-BR")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Perfil = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return isAuthenticated ? <ProfilePanel /> : <LoginForm />;
};

export default Perfil;
