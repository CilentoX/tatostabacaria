import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function Termos() {
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
          Termos de Uso
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Última atualização: novembro de 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-foreground/80">
          <div>
            <h2 className="text-lg font-bold text-foreground mb-3">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e utilizar o site da <strong>Tato's Tabacaria</strong>, você concorda integralmente
              com estes Termos de Uso. Caso não concorde com qualquer disposição aqui prevista,
              solicitamos que não utilize nossos serviços.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-3">2. Proibição para Menores</h2>
            <p>
              <strong className="text-primary">A venda de produtos de tabacaria é proibida para menores de 18 anos</strong>,
              conforme legislação vigente (Lei nº 9.294/1996 e regulamentações da ANVISA).
              Ao realizar um pedido, você declara ter 18 anos ou mais e se responsabiliza pela
              veracidade dessa informação.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-3">3. Sobre o Site</h2>
            <p>
              O site da Tato's Tabacaria funciona como vitrine digital de nossos produtos.
              Os pedidos são realizados exclusivamente via Instagram, onde ocorre a negociação
              direta entre cliente e estabelecimento, incluindo confirmação de disponibilidade,
              valores atualizados e formas de pagamento.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-3">4. Produtos e Preços</h2>
            <p>
              As imagens exibidas são meramente ilustrativas. A disponibilidade e os preços dos
              produtos podem ser alterados sem aviso prévio e serão confirmados no momento do
              atendimento via Instagram. Reservamo-nos o direito de corrigir eventuais erros
              ou omissões nas informações apresentadas.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-3">5. Uso Adequado</h2>
            <p>
              É vedado utilizar o site para fins ilegais, não autorizados ou que possam causar
              danos a terceiros, incluindo, mas não se limitando a: tentativas de acesso não
              autorizado, envio de conteúdo ofensivo, spam ou qualquer atividade que comprometa
              a segurança ou o funcionamento do site.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-3">6. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo do site — incluindo logotipos, marcas, imagens, textos, layout
              e identidade visual — é de propriedade exclusiva da Tato's Tabacaria ou de seus
              licenciados, sendo protegido pela legislação brasileira de direitos autorais
              (Lei nº 9.610/1998) e propriedade industrial (Lei nº 9.279/1996).
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-3">7. Limitação de Responsabilidade</h2>
            <p>
              A Tato's Tabacaria não se responsabiliza por danos indiretos, incidentais ou
              consequenciais decorrentes do uso do site ou dos produtos adquiridos, observados
              os limites previstos no Código de Defesa do Consumidor (Lei nº 8.078/1990).
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-3">8. Modificações</h2>
            <p>
              Reservamo-nos o direito de alterar estes Termos de Uso a qualquer momento,
              sendo as modificações publicadas nesta página com atualização da data de
              vigência. O uso continuado do site após alterações implica aceitação dos
              novos termos.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-3">9. Foro</h2>
            <p>
              Fica eleito o foro da comarca do domicílio do réu para dirimir quaisquer
              controvérsias oriundas destes Termos, com renúncia a qualquer outro, por mais
              privilegiado que seja, nos termos do Código de Processo Civil brasileiro.
            </p>
          </div>

          <div className="pt-6 border-t border-border">
            <p className="text-muted-foreground text-xs">
              Em caso de dúvidas, entre em contato pelo nosso Instagram disponível no site.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}