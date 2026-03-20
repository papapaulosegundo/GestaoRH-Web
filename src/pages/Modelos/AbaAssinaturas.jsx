import { Component } from 'react'
import { Card, Button, Form, Row, Col, Alert } from 'react-bootstrap'
import { BiPlus, BiTrash, BiChevronUp, BiChevronDown } from 'react-icons/bi'
import { FormField } from '../../common/_components'
import { PAPEL_OPTIONS, PAPEL_LABEL } from '../../common/modeloUtils'
import { FaPencilAlt } from 'react-icons/fa'

let _nextId = 100
const nextId = () => `assin_${_nextId++}`

class AbaAssinaturas extends Component {
  adicionar = () => {
    const { assinantes, onChange } = this.props
    onChange([...assinantes, {
      id:          nextId(),
      papel:       'funcionario',
      rotulo:      '',
      obrigatorio: true,
      ordem:       assinantes.length + 1,
      exibirPdf:   true,
    }])
  }

  remover = (idx) => {
    this.props.onChange(this.props.assinantes.filter((_, i) => i !== idx))
  }

  mover = (idx, dir) => {
    const lista = [...this.props.assinantes]
    const alvo  = idx + dir
    if (alvo < 0 || alvo >= lista.length) return
    ;[lista[idx], lista[alvo]] = [lista[alvo], lista[idx]]
    this.props.onChange(lista)
  }

  atualizar = (idx, campo, valor) => {
    const lista   = [...this.props.assinantes]
    lista[idx]    = { ...lista[idx], [campo]: valor }
    this.props.onChange(lista)
  }

  render() {
    const { assinantes } = this.props

    return (
      <div>
        <Alert variant="info" style={{ fontSize: 13, marginBottom: 20 }}>
          <FaPencilAlt className="me-2" />
          Configure quem precisa assinar este documento. A assinatura é coletada por papel — o sistema resolve quem é a pessoa real no momento da geração.
          <br />
          <strong>Pelo menos 1 assinatura obrigatória é necessária para publicar o modelo.</strong>
        </Alert>

        {assinantes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--gray-400)' }}>
            <FaPencilAlt size={36} style={{ display: 'block', margin: '0 auto 12px' }} />
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Nenhuma assinatura configurada</div>
            <div style={{ fontSize: 13 }}>Adicione pelo menos um assinante para publicar o modelo.</div>
          </div>
        )}

        {assinantes.map((assin, idx) => (
          <Card key={assin.id} className="card-rh mb-3">
            <Card.Body className="card-rh-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-700)' }}>
                  Assinatura #{idx + 1} — {PAPEL_LABEL[assin.papel] ?? assin.papel}
                </div>
                <div className="d-flex gap-1">
                  <Button variant="light" size="sm" className="btn-edit-rh"
                    onClick={() => this.mover(idx, -1)} disabled={idx === 0}>
                    <BiChevronUp size={14} />
                  </Button>
                  <Button variant="light" size="sm" className="btn-edit-rh"
                    onClick={() => this.mover(idx, 1)} disabled={idx === assinantes.length - 1}>
                    <BiChevronDown size={14} />
                  </Button>
                  <Button variant="danger" size="sm" className="btn-danger-rh"
                    onClick={() => this.remover(idx)}>
                    <BiTrash size={13} />
                  </Button>
                </div>
              </div>

              <Row className="g-3">
                <Col md={3}>
                  <FormField label="Papel do assinante *">
                    <Form.Select className="form-control-rh"
                      value={assin.papel}
                      onChange={e => this.atualizar(idx, 'papel', e.target.value)}>
                      {PAPEL_OPTIONS.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </Form.Select>
                  </FormField>
                </Col>

                <Col md={4}>
                  <FormField label="Rótulo no PDF"
                    hint="Como vai aparecer no documento gerado.">
                    <Form.Control className="form-control-rh"
                      placeholder={`Ex: Assinatura do ${PAPEL_LABEL[assin.papel] ?? ''}`}
                      value={assin.rotulo}
                      onChange={e => this.atualizar(idx, 'rotulo', e.target.value)} />
                  </FormField>
                </Col>

                <Col md={2}>
                  <FormField label="Obrigatório">
                    <Form.Select className="form-control-rh"
                      value={assin.obrigatorio ? 'true' : 'false'}
                      onChange={e => this.atualizar(idx, 'obrigatorio', e.target.value === 'true')}>
                      <option value="true">Sim</option>
                      <option value="false">Não</option>
                    </Form.Select>
                  </FormField>
                </Col>

                <Col md={3}>
                  <FormField label="Exibir no PDF">
                    <Form.Select className="form-control-rh"
                      value={assin.exibirPdf ? 'true' : 'false'}
                      onChange={e => this.atualizar(idx, 'exibirPdf', e.target.value === 'true')}>
                      <option value="true">Sim</option>
                      <option value="false">Não (apenas registro)</option>
                    </Form.Select>
                  </FormField>
                </Col>
              </Row>

              {/* Info sobre como o papel é resolvido */}
              <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--gray-50)', borderRadius: 8, fontSize: 12, color: 'var(--gray-500)' }}>
                {assin.papel === 'funcionario' && '👤 Resolvido automaticamente para o funcionário do documento.'}
                {assin.papel === 'rh'          && '🏢 Resolvido para o usuário RH que gerou o documento (ou selecionado manualmente).'}
                {assin.papel === 'chefe'       && '👔 Resolvido para o chefe do setor do funcionário (is_chefe = true no mesmo setor).'}
              </div>
            </Card.Body>
          </Card>
        ))}

        <Button variant="light" className="btn-ghost-rh" onClick={this.adicionar}>
          <BiPlus size={14} className="me-1" /> Adicionar assinante
        </Button>
      </div>
    )
  }
}

export default AbaAssinaturas
