import React from 'react';
import { Link } from 'wouter';
import { Seo } from "@/components/seo";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Política de Privacidade | AG LABS Intelligence"
        description="Saiba como a AG LABS Intelligence coleta, usa e protege os seus dados pessoais."
        path="/politica-de-privacidade"
      />
      <header className="border-b border-border/30 px-6 py-5">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <Link href="/">
            <span className="text-lg font-bold tracking-widest text-white cursor-pointer hover:opacity-80 transition-opacity">
              AG LABS
            </span>
          </Link>
          <Link href="/">
            <span className="text-sm text-muted-foreground hover:text-white transition-colors cursor-pointer">
              ← Voltar ao início
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Política de Privacidade</h1>
        <p className="text-muted-foreground mb-12">Última atualização: 17 de novembro de 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-10 text-muted-foreground leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Quem Somos</h2>
            <p>
              A <strong className="text-white">AG LABS</strong> é uma empresa especializada em inteligência artificial,
              desenvolvimento de agentes autônomos, sistemas inteligentes e interfaces de alto desempenho, com sede no Brasil.
              Esta política descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Dados que Coletamos</h2>
            <p>Podemos coletar os seguintes tipos de informações:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li><strong className="text-white/80">Dados de identificação:</strong> nome, e-mail, telefone — fornecidos voluntariamente ao nos contatar.</li>
              <li><strong className="text-white/80">Dados de navegação:</strong> endereço IP, tipo de navegador, páginas visitadas, tempo de permanência.</li>
              <li><strong className="text-white/80">Dados de uso de serviços:</strong> interações com nossas plataformas e agentes de IA.</li>
              <li><strong className="text-white/80">Cookies e tecnologias similares:</strong> utilizados para melhorar a experiência no site.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Como Usamos Seus Dados</h2>
            <p>Utilizamos suas informações para:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>Prestar e melhorar nossos serviços e produtos;</li>
              <li>Responder às suas solicitações e dúvidas;</li>
              <li>Enviar comunicações relevantes sobre nossos serviços, quando houver consentimento;</li>
              <li>Analisar o desempenho do site e identificar melhorias;</li>
              <li>Cumprir obrigações legais e regulatórias.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Compartilhamento de Dados</h2>
            <p>
              A AG LABS <strong className="text-white">não vende seus dados pessoais</strong> a terceiros.
              Podemos compartilhar informações com fornecedores de tecnologia que nos auxiliam na operação dos serviços
              (como servidores em nuvem e ferramentas de análise), sempre sob acordos de confidencialidade compatíveis
              com a LGPD. Também podemos divulgar informações quando exigido por lei ou autoridade competente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Cookies</h2>
            <p>
              Utilizamos cookies para personalizar sua experiência, analisar o tráfego e melhorar o desempenho do site.
              Você pode configurar seu navegador para recusar cookies, mas isso poderá afetar algumas funcionalidades.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Métricas e comentários do blog</h2>
            <p>O blog registra leituras após dez segundos com a página visível. Um identificador aleatório em sessionStorage evita contar novamente o mesmo artigo na mesma sessão e dia. Essa contagem não usa cookies, IP, impressão digital do dispositivo ou conta pessoal. Os resultados públicos são agregados e representam sessões, não pessoas únicas. As capas de vídeos são fornecidas pelo YouTube; o player só abre no serviço quando você clica no link.</p>
            <p>Ao comentar, o nome informado, o texto e a data do comentário ficam públicos. Não inclua informações pessoais sensíveis. Para solicitar a retirada de um comentário, entre em contato com a AG Labs pelos canais desta política.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Seus Direitos (LGPD)</h2>
            <p>Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>Confirmar a existência de tratamento dos seus dados;</li>
              <li>Acessar, corrigir ou atualizar seus dados;</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação dos dados desnecessários;</li>
              <li>Revogar o consentimento a qualquer momento;</li>
              <li>Solicitar a portabilidade dos seus dados.</li>
            </ul>
            <p className="mt-3">Para exercer seus direitos, entre em contato conosco através das redes sociais ou pelo e-mail disponibilizado em nossas plataformas.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Segurança</h2>
            <p>
              Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado,
              perda, alteração ou divulgação indevida. Utilizamos criptografia, controle de acesso e boas
              práticas de segurança em todos os nossos sistemas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Retenção de Dados</h2>
            <p>
              Mantemos seus dados pelo tempo necessário para as finalidades descritas nesta política ou pelo
              período exigido pela legislação aplicável. Após esse prazo, os dados são excluídos ou anonimizados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Alterações nesta Política</h2>
            <p>
              Esta política pode ser atualizada periodicamente. Recomendamos que você a revise regularmente.
              Alterações significativas serão comunicadas através do nosso site ou redes sociais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Contato</h2>
            <p>
              Para dúvidas sobre esta política ou sobre o tratamento dos seus dados, entre em contato conosco
              pelas nossas redes sociais ou plataformas de atendimento.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border/30 px-6 py-8 mt-8">
        <div className="mx-auto max-w-4xl text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} AG LABS. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
