import { Component } from 'react'
import { Card, Alert } from 'react-bootstrap'
import { BiInfoCircle } from 'react-icons/bi'
import { resolverPreview, PAPEL_LABEL, SECAO_TIPOS } from '../../common/modeloUtils'
import { FaEye } from 'react-icons/fa'

class AbaPreview extends Component {
  renderSecao(sec, idx) {
    return (
      <div key={sec.id ?? idx} style={{ marginBottom: 24 }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
          color: 'var(--gray-800)', borderBottom: '1px solid var(--border)',
          paddingBottom: 6, marginBottom: 12
        }}>
          {sec.titulo || `Seção ${idx + 1}`}
        </div>

        {/* Texto livre */}
        {sec.tipo === 'texto' && (
          <div
            style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--gray-700)', whiteSpace: 'pre-wrap' }}
            dangerouslySetInnerHTML={{ __html: resolverPreview(sec.conteudo) || '<em style="color: var(--gray-300)">Seção sem conteúdo...</em>' }}
          />
        )}

        {/* Campos de formulário */}
        {sec.tipo === 'campos' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {(sec.campos ?? []).map((campo, iC) => (
              <div key={campo.id ?? iC}
                style={{ padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 8, background: 'var(--gray-50)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', marginBottom: 4 }}>
                  {campo.label || 'Campo sem nome'}
                  {campo.obrigatorio && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray-400)', fontStyle: 'italic' }}>
                  {campo.tipo === 'texto_curto' && '______________________________'}
                  {campo.tipo === 'texto_longo' && '________________________________\n________________________________'}
                  {campo.tipo === 'data'        && 'dd/mm/aaaa'}
                  {campo.tipo === 'checkbox'    && '☐ Confirmar'}
                  {campo.tipo === 'selecao'     && '▼ Selecione...'}
                  {campo.tipo === 'upload'      && '📎 Anexar arquivo'}
                  {!['texto_curto','texto_longo','data','checkbox','selecao','upload'].includes(campo.tipo) && '______'}
                </div>
              </div>
            ))}
            {(!sec.campos || sec.campos.length === 0) && (
              <div style={{ gridColumn: '1 / -1', color: 'var(--gray-400)', fontSize: 13, fontStyle: 'italic' }}>
                Nenhum campo adicionado.
              </div>
            )}
          </div>
        )}

        {/* Assinaturas */}
        {sec.tipo === 'assinaturas' && (
          <div style={{ color: 'var(--gray-500)', fontSize: 13, fontStyle: 'italic' }}>
            [Bloco de assinaturas — veja a aba Assinaturas]
          </div>
        )}

        {/* Anexos */}
        {sec.tipo === 'anexos' && (
          <div style={{ fontSize: 13, color: 'var(--gray-600)' }}>
            📎 {sec.conteudo || 'Anexos obrigatórios a serem definidos.'}
          </div>
        )}
      </div>
    )
  }

  renderBlocoAssinaturas() {
    const { assinantes } = this.props
    if (!assinantes || assinantes.length === 0) return null

    return (
      <div style={{ marginTop: 32, borderTop: '2px solid var(--border)', paddingTop: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 20 }}>
          ASSINATURAS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(assinantes.length, 3)}, 1fr)`, gap: 24 }}>
          {assinantes.map((assin, idx) => (
            <div key={assin.id ?? idx} style={{ textAlign: 'center' }}>
              <div style={{
                height: 60, borderBottom: '1px solid var(--gray-700)',
                marginBottom: 8, background: 'var(--gray-50)',
                borderRadius: '4px 4px 0 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--gray-300)', fontSize: 12, fontStyle: 'italic'
              }}>
                [assinatura]
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)' }}>
                {assin.rotulo || PAPEL_LABEL[assin.papel] || `Assinante ${idx + 1}`}
              </div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>
                {PAPEL_LABEL[assin.papel]}
                {assin.obrigatorio ? '' : ' (opcional)'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Data: ___/___/______</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  render() {
    const { secoes, nomeModelo } = this.props
    const temConteudo = secoes && secoes.length > 0

    return (
      <div>
        <Alert variant="info" style={{ fontSize: 13, marginBottom: 16 }}>
          <BiInfoCircle className="me-2" />
          Este é um preview com <strong>dados fictícios</strong>. As variáveis como{' '}
          <code>{'{funcionario_nome}'}</code> serão substituídas pelos dados reais na geração do documento.
        </Alert>

        <Card className="card-rh">
          <Card.Body style={{ padding: 40, maxWidth: 800, margin: '0 auto' }}>
            {/* Cabeçalho do documento */}
            <div style={{ textAlign: 'center', marginBottom: 32, paddingBottom: 20, borderBottom: '2px solid var(--gray-800)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 4 }}>
                {nomeModelo || 'Nome do Modelo'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>Empresa Ltda. · CNPJ 00.000.000/0001-00</div>
            </div>

            {!temConteudo && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-300)' }}>
                <FaEye size={40} style={{ display: 'block', margin: '0 auto 12px' }} />
                <div>Adicione seções na aba Conteúdo para ver o preview.</div>
              </div>
            )}

            {secoes.map((sec, idx) => this.renderSecao(sec, idx))}

            {this.renderBlocoAssinaturas()}
          </Card.Body>
        </Card>
      </div>
    )
  }
}

export default AbaPreview
