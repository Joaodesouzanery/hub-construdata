import { useState, type FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Building2,
  Users,
  Target,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

const Contato = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Sanitização básica: trim nos campos
    const nomeClean = nome.trim();
    const emailClean = email.trim();
    if (!nomeClean || !emailClean) return;

    toast.success("Mensagem enviada com sucesso! Retornaremos em breve.");
    setNome("");
    setEmail("");
    setAssunto("");
    setMensagem("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Sobre */}
      <section className="bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] text-white py-16 text-center">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Sobre o ConstruData
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Plataforma completa para profissionais de engenharia, saneamento e
            infraestrutura. Dados, legislação e ferramentas técnicas em um só lugar.
          </p>
        </div>
      </section>

      <main className="flex-1 py-10">
        <div className="container mx-auto px-6">
          {/* Sobre - Missão */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center p-6">
              <Target size={32} className="mx-auto text-primary mb-3" />
              <CardTitle className="text-base mb-2">Nossa Missão</CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Democratizar o acesso a informações técnicas e dados do setor de
                saneamento e infraestrutura no Brasil.
              </p>
            </Card>
            <Card className="text-center p-6">
              <Users size={32} className="mx-auto text-primary mb-3" />
              <CardTitle className="text-base mb-2">Para Quem</CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Engenheiros, gestores públicos, empresas de saneamento, consultores
                e todos que atuam no setor.
              </p>
            </Card>
            <Card className="text-center p-6">
              <Shield size={32} className="mx-auto text-primary mb-3" />
              <CardTitle className="text-base mb-2">Compromisso</CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Informações verificadas, dados atualizados e ferramentas confiáveis
                para tomada de decisão.
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8">
            {/* Formulário de Contato */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Mail size={20} className="text-primary" />
                  Envie sua mensagem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                      Nome completo *
                    </label>
                    <Input
                      type="text"
                      placeholder="Seu nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                      E-mail *
                    </label>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                      Assunto
                    </label>
                    <select
                      value={assunto}
                      onChange={(e) => setAssunto(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Selecione...</option>
                      <option value="duvida">Dúvida sobre a plataforma</option>
                      <option value="parceria">Proposta de parceria</option>
                      <option value="bug">Reportar problema</option>
                      <option value="sugestao">Sugestão de melhoria</option>
                      <option value="comercial">Contato comercial</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                      Mensagem *
                    </label>
                    <textarea
                      placeholder="Descreva sua mensagem..."
                      value={mensagem}
                      onChange={(e) => setMensagem(e.target.value)}
                      required
                      maxLength={2000}
                      rows={5}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Send size={16} />
                    Enviar mensagem
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Informações de Contato */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 size={20} className="text-primary" />
                    Informações de contato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Mail size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">E-mail</p>
                      <p className="text-sm text-muted-foreground">contato@construdata.com.br</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Phone size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Telefone</p>
                      <p className="text-sm text-muted-foreground">(11) 4002-8922</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MapPin size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Endereço</p>
                      <p className="text-sm text-muted-foreground">São Paulo, SP - Brasil</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardContent className="p-6">
                  <h3 className="font-bold text-base mb-2">Horário de Atendimento</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Segunda a Sexta: 8h às 18h</p>
                    <p>Sábado: 9h às 13h</p>
                    <p>Domingo e Feriados: Fechado</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardContent className="p-6">
                  <h3 className="font-bold text-base mb-2">Perguntas Frequentes</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-semibold">A plataforma é gratuita?</p>
                      <p className="text-muted-foreground">Sim, o Hub de conteúdo é 100% gratuito. Módulos avançados possuem planos pagos.</p>
                    </div>
                    <div>
                      <p className="font-semibold">Como posso contribuir com conteúdo?</p>
                      <p className="text-muted-foreground">Entre em contato pelo formulário selecionando "Proposta de parceria".</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contato;
