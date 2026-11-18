import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function Privacidade() {
 return (
 <section className="pt-24 pb-16 px-6">
 <div className="max-w-3xl mx-auto">
 {/* Breadcrumb */}
 <Link
 to="/"
 className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
 >
 <ArrowLeft className="h-4 w-4" />
 Voltar para o início
 </Link>

 <p className="text-xs font-bold text-primary uppercase tracking-[0.3em] mb-2">
 Legal
 </p>
 <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight mb-4">
 Política de Privacidade
 </h1>
 <p className="text-sm text-muted-foreground mb-10">
 Última atualização: novembro de 2026
 </p>

 <div className="space-y-8 text-sm leading-relaxed text-foreground/80">
 <div>
 <h2 className="text-lg font-bold text-foreground mb-3">1. Introdução</h2>
 <p>
 A <strong>Tato's Tabacaria</strong> ("nós", "nosso") valoriza a privacidade de seus
 clientes e visitantes. Esta Política de Privacidade descreve como coletamos,
 utilizamos e protegemos suas informações pessoais, em conformidade com a Lei
 Geral de Proteção de Dados — LGPD (Lei nº 13.709/2018).
 </p>
 </div>

 <div>
 <h2 className="text-lg font-bold text-foreground mb-3">2. Dados Coletados</h2>
 <p className="mb-3">Podemos coletar os seguintes dados pessoais:</p>
 <ul className="list-disc list-inside space-y-1 ml-2">
 <li><strong>Dados de contato:</strong> nome e número de telefone fornecidos via Instagram ao realizar pedidos.</li>
 <li><strong>Dados de navegação:</strong> endereço IP, tipo de navegador, páginas visitadas e tempo de permanência no site, coletados automaticamente.</li>
 <li><strong>Dados de pedido:</strong> produtos de interesse e informações necessárias para entrega, quando aplicável.</li>
 </ul>
 </div>

 <div>
 <h2 className="text-lg font-bold text-foreground mb-3">3. Finalidade do Tratamento</h2>
 <p className="mb-3">Seus dados são utilizados exclusivamente para:</p>
 <ul className="list-disc list-inside space-y-1 ml-2">
 <li>Atendimento e processamento de pedidos;</li>
 <li>Comunicação sobre disponibilidade, preços e status de entregas;</li>
 <li>Melhoria da experiência no site e análise de tráfego;</li>
 <li>Cumprimento de obrigações legais e regulatórias.</li>
 </ul>
 </div>

 <div>
 <h2 className="text-lg font-bold text-foreground mb-3">4. Base Legal</h2>
 <p>
 O tratamento de dados pessoais é fundamentado nas seguintes bases legais da LGPD:
 execução de contrato ou procedimentos preliminares (art. 7º, V), cumprimento de
 obrigação legal (art. 7º, II) e legítimo interesse do controlador (art. 7º, IX),
 sempre respeitados os direitos fundamentais do titular.
 </p>
 </div>

 <div>
 <h2 className="text-lg font-bold text-foreground mb-3">5. Compartilhamento de Dados</h2>
 <p>
 Seus dados pessoais não são vendidos, alugados ou compartilhados com terceiros
 para fins comerciais. Podem ser compartilhados apenas quando:
 </p>
 <ul className="list-disc list-inside space-y-1 ml-2 mt-3">
 <li>Necessário para processamento de pagamentos ou entregas;</li>
 <li>Exigido por determinação legal, judicial ou administrativa;</li>
 <li>Com prestadores de serviço que atuem em nosso nome, sob contrato de confidencialidade.</li>
 </ul>
 </div>

 <div>
 <h2 className="text-lg font-bold text-foreground mb-3">6. Segurança dos Dados</h2>
 <p>
 Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados
 contra acesso não autorizado, perda, alteração ou divulgação indevida. As
 conversas via Instagram são protegidas pela criptografia de ponta a ponta da
 própria plataforma.
 </p>
 </div>

 <div>
 <h2 className="text-lg font-bold text-foreground mb-3">7. Retenção de Dados</h2>
 <p>
 Seus dados são mantidos apenas pelo período necessário para cumprir as finalidades
 descritas nesta política ou conforme exigido por lei. Após esse período, serão
 eliminados ou anonimizados de forma segura.
 </p>
 </div>

 <div>
 <h2 className="text-lg font-bold text-foreground mb-3">8. Seus Direitos (LGPD)</h2>
 <p className="mb-3">Como titular de dados pessoais, você tem direito a:</p>
 <ul className="list-disc list-inside space-y-1 ml-2">
 <li>Confirmação da existência de tratamento de seus dados;</li>
 <li>Acesso aos dados pessoais tratados;</li>
 <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
 <li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
 <li>Portabilidade dos dados a outro fornecedor de serviço;</li>
 <li>Eliminação dos dados tratados com base no consentimento;</li>
 <li>Revogação do consentimento, quando aplicável;</li>
 <li>Informação sobre compartilhamento de dados com terceiros.</li>
 </ul>
 <p className="mt-3">
 Para exercer qualquer desses direitos, entre em contato pelo nosso Instagram
 disponível no site.
 </p>
 </div>

 <div>
 <h2 className="text-lg font-bold text-foreground mb-3">9. Cookies e Tecnologias</h2>
 <p>
 Nosso site pode utilizar cookies essenciais para o funcionamento adequado da
 página e cookies analíticos para compreender o comportamento dos visitantes.
 Você pode gerenciar as preferências de cookies diretamente nas configurações
 do seu navegador.
 </p>
 </div>

 <div>
 <h2 className="text-lg font-bold text-foreground mb-3">10. Alterações</h2>
 <p>
 Esta Política de Privacidade pode ser atualizada periodicamente. Recomendamos
 que você a consulte regularmente. Alterações significativas serão comunicadas
 por meio de aviso visível no site.
 </p>
 </div>

 <div className="pt-6 border-t border-border">
 <p className="text-muted-foreground text-xs">
 Em caso de dúvidas sobre esta política ou sobre o tratamento de seus dados
 pessoais, entre em contato pelo nosso Instagram disponível no site.
 </p>
 </div>
 </div>
 </div>
 </section>
 );
}