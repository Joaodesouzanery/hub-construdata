import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Mail } from "lucide-react";

const PoliticaPrivacidade = () => (
  <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
    {/* Header */}
    <div>
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft size={14} /> Voltar ao painel
      </Link>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <Shield size={22} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Politica de Privacidade
          </h1>
          <p className="text-sm text-muted-foreground">
            Ultima atualizacao: 17 de fevereiro de 2026
          </p>
        </div>
      </div>
    </div>

    {/* Conteudo */}
    <div className="prose prose-sm max-w-none space-y-6 text-foreground">
      <section>
        <h2 className="text-lg font-bold text-foreground">
          1. Introducao
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          O <strong className="text-foreground">ConstruData Hub</strong> e uma plataforma de
          inteligencia para o setor de engenharia, saneamento e infraestrutura no Brasil.
          Esta Politica de Privacidade descreve como coletamos, usamos, armazenamos e
          protegemos seus dados pessoais, em conformidade com a{" "}
          <strong className="text-foreground">
            Lei Geral de Protecao de Dados (LGPD — Lei 13.709/2018)
          </strong>.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-foreground">
          2. Dados que Coletamos
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground mb-3">
          Coletamos apenas os dados estritamente necessarios para o funcionamento da plataforma:
        </p>
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              2.1 Dados de Cadastro (fornecidos por voce)
            </h3>
            <ul className="text-sm text-muted-foreground mt-1 space-y-1 list-disc list-inside">
              <li>Nome completo</li>
              <li>Endereco de email</li>
              <li>Empresa e cargo (opcionais)</li>
              <li>Senha (armazenada de forma criptografada)</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              2.2 Dados de Uso (gerados automaticamente)
            </h3>
            <ul className="text-sm text-muted-foreground mt-1 space-y-1 list-disc list-inside">
              <li>Filtros salvos e configuracoes de alertas</li>
              <li>Preferencia de tema (claro/escuro)</li>
              <li>Noticias favoritadas</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              2.3 Dados que NAO coletamos
            </h3>
            <ul className="text-sm text-muted-foreground mt-1 space-y-1 list-disc list-inside">
              <li>CPF, RG ou documentos pessoais</li>
              <li>Dados de localizacao (GPS)</li>
              <li>Cookies de rastreamento ou analytics de terceiros</li>
              <li>Dados de navegacao em outros sites</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-foreground">
          3. Finalidade do Tratamento
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground mb-2">
          Utilizamos seus dados pessoais exclusivamente para:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Autenticacao e gerenciamento da sua conta</li>
          <li>Personalizacao da experiencia (filtros, alertas, favoritos)</li>
          <li>Envio de alertas configurados por voce (quando ativados)</li>
          <li>Comunicacao sobre atualizacoes relevantes da plataforma</li>
        </ul>
        <p className="text-sm leading-relaxed text-muted-foreground mt-2">
          <strong className="text-foreground">Base legal (Art. 7o LGPD):</strong> consentimento do
          titular e execucao de contrato/servico.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-foreground">
          4. Armazenamento e Seguranca
        </h2>
        <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
          <li>
            Dados de autenticacao sao armazenados no{" "}
            <strong className="text-foreground">Supabase</strong> (servidores com criptografia em
            repouso e em transito — AES-256 e TLS 1.3)
          </li>
          <li>
            Senhas sao criptografadas com <strong className="text-foreground">bcrypt</strong> e nunca
            armazenadas em texto puro
          </li>
          <li>
            Preferencias locais (tema, favoritos) ficam no{" "}
            <strong className="text-foreground">localStorage</strong> do seu navegador — nunca saem do
            seu dispositivo
          </li>
          <li>
            Todas as tabelas possuem <strong className="text-foreground">Row Level Security (RLS)</strong>{" "}
            — cada usuario so acessa seus proprios dados
          </li>
          <li>
            Registro de auditoria (<strong className="text-foreground">audit log</strong>) para
            rastreabilidade de alteracoes
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold text-foreground">
          5. Dados Publicos Exibidos na Plataforma
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A plataforma exibe informacoes de fontes publicas oficiais do governo brasileiro e
          portais de noticias. Esses dados <strong className="text-foreground">nao constituem
          dados pessoais</strong> e incluem:
        </p>
        <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
          <li>
            <strong className="text-foreground">Licitacoes:</strong> dados publicos do PNCP
            (Portal Nacional de Contratacoes Publicas), diarios oficiais e portais de transparencia
          </li>
          <li>
            <strong className="text-foreground">Noticias e artigos:</strong> links para publicacoes de
            terceiros (CBIC, ABES, Trata Brasil, Agencia Brasil, etc.), com credito a fonte original
          </li>
          <li>
            <strong className="text-foreground">Indicadores:</strong> dados agregados de fontes como
            SNIS, ANA, IBGE e SINAPI
          </li>
          <li>
            <strong className="text-foreground">Empresas:</strong> dados ficticios para demonstracao,
            baseados em informacoes publicas de registro empresarial
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold text-foreground">
          6. Seus Direitos (Art. 18 da LGPD)
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground mb-2">
          Voce tem os seguintes direitos sobre seus dados pessoais:
        </p>
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-primary font-bold text-sm">I.</span>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Confirmacao e acesso</strong> — saber se tratamos
              seus dados e acessar uma copia deles
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary font-bold text-sm">II.</span>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Correcao</strong> — corrigir dados incompletos ou
              desatualizados (na pagina de Perfil)
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary font-bold text-sm">III.</span>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Eliminacao</strong> — solicitar a exclusao dos seus
              dados pessoais (botao "Excluir minha conta" no Perfil)
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary font-bold text-sm">IV.</span>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Revogacao do consentimento</strong> — retirar seu
              consentimento a qualquer momento
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary font-bold text-sm">V.</span>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Portabilidade</strong> — solicitar seus dados em
              formato estruturado
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-foreground">
          7. Retencao e Exclusao de Dados
        </h2>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Seus dados de cadastro sao mantidos enquanto sua conta estiver ativa</li>
          <li>
            Ao excluir sua conta, todos os dados pessoais sao removidos em ate{" "}
            <strong className="text-foreground">30 dias</strong>
          </li>
          <li>Registros de auditoria anonimizados podem ser retidos por 12 meses para seguranca</li>
          <li>Dados armazenados no localStorage sao apagados automaticamente ao excluir a conta</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold text-foreground">
          8. Compartilhamento de Dados
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Nao vendemos, alugamos ou compartilhamos</strong> seus
          dados pessoais com terceiros para fins comerciais. Seus dados podem ser compartilhados
          apenas com:
        </p>
        <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
          <li>
            <strong className="text-foreground">Supabase Inc.</strong> — provedor de infraestrutura
            de banco de dados e autenticacao (sub-processador)
          </li>
          <li>
            <strong className="text-foreground">Autoridades competentes</strong> — quando exigido
            por lei ou ordem judicial
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold text-foreground">
          9. Cookies e Rastreamento
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          O ConstruData Hub <strong className="text-foreground">nao utiliza cookies de rastreamento,
          analytics de terceiros ou pixels de monitoramento</strong>. Utilizamos apenas o
          localStorage do navegador para preferencias locais (tema e favoritos), que nao sao
          enviados para nenhum servidor.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-foreground">
          10. Contato do Encarregado (DPO)
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Para exercer seus direitos ou esclarecer duvidas sobre esta politica, entre em contato:
        </p>
        <div className="bg-muted/50 rounded-lg p-4 mt-2 flex items-center gap-3">
          <Mail size={18} className="text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Encarregado de Protecao de Dados
            </p>
            <p className="text-sm text-muted-foreground">
              privacidade@construdata.com.br
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-foreground">
          11. Alteracoes nesta Politica
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Esta politica pode ser atualizada periodicamente. Notificaremos voce por email ou pela
          plataforma sobre alteracoes significativas. A versao mais recente estara sempre
          disponivel nesta pagina.
        </p>
      </section>
    </div>
  </div>
);

export default PoliticaPrivacidade;
