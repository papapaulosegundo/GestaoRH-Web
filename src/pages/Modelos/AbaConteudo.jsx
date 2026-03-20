import { Component } from 'react'
import { Card, Button, Form, Row, Col, Modal, Badge } from 'react-bootstrap'
import { BiPlus, BiTrash, BiChevronUp, BiChevronDown, BiText, BiListUl, BiPaperclip } from 'react-icons/bi'
import { FormField } from '../../common/_components'
import { SECAO_TIPOS, CAMPO_TIPOS, VARIAVEIS } from '../../common/modeloUtils'
import { FaPencilAlt } from 'react-icons/fa'

// Ícones por tipo de seção
const SECAO_ICON = {
  texto:       BiText,
  campos:      BiListUl,
  assinaturas: FaPencilAlt,
  anexos:      BiPaperclip,
}

// Gera id único local
let _nextId = 1
const nextId = () => `local_${_nextId++}`

class AbaConteudo extends Component {
  state = {
    showModalVariavel: false,
    secaoAtiva:        null,   // índice da seção para inserir variável
    buscaVariavel:     '',
  }

  // ── Seções ──────────────────────────────────────────────────
  adicionarSecao = () => {
    const { secoes, onChange } = this.props
    onChange([...secoes, {
      id:        nextId(),
      titulo:    `Seção ${secoes.length + 1}`,
      tipo:      'texto',
      conteudo:  '',
      campos:    [],
      ordem:     secoes.length,
    }])
  }

  removerSecao = (idx) => {
    const novas = this.props.secoes.filter((_, i) => i !== idx)
    this.props.onChange(novas)
  }

  moverSecao = (idx, direcao) => {
    const novas  = [...this.props.secoes]
    const alvo   = idx + direcao
    if (alvo < 0 || alvo >= novas.length) return
    ;[novas[idx], novas[alvo]] = [novas[alvo], novas[idx]]
    this.props.onChange(novas)
  }

  atualizarSecao = (idx, campo, valor) => {
    const novas = [...this.props.secoes]
    novas[idx]  = { ...novas[idx], [campo]: valor }
    this.props.onChange(novas)
  }

  // ── Campos (seção tipo "campos") ─────────────────────────────
  adicionarCampo = (idxSecao) => {
    const novas = [...this.props.secoes]
    const campos = novas[idxSecao].campos ?? []
    novas[idxSecao] = {
      ...novas[idxSecao],
      campos: [...campos, {
        id:          nextId(),
        label:       '',
        tipo:        'texto_curto',
        obrigatorio: true,
        ordem:       campos.length,
      }]
    }
    this.props.onChange(novas)
  }

  atualizarCampo = (idxSecao, idxCampo, campo, valor) => {
    const novas = [...this.props.secoes]
    const campos = [...(novas[idxSecao].campos ?? [])]
    campos[idxCampo] = { ...campos[idxCampo], [campo]: valor }
    novas[idxSecao]  = { ...novas[idxSecao], campos }
    this.props.onChange(novas)
  }

  removerCampo = (idxSecao, idxCampo) => {
    const novas = [...this.props.secoes]
    novas[idxSecao] = {
      ...novas[idxSecao],
      campos: novas[idxSecao].campos.filter((_, i) => i !== idxCampo)
    }
    this.props.onChange(novas)
  }

  // ── Inserir variável no texto ────────────────────────────────
  abrirModalVariavel = (idxSecao) => {
    this.setState({ showModalVariavel: true, secaoAtiva: idxSecao, buscaVariavel: '' })
  }

  inserirVariavel = (token) => {
    const { secaoAtiva } = this.state
    const novas    = [...this.props.secoes]
    const conteudo = (novas[secaoAtiva].conteudo ?? '') + token
    novas[secaoAtiva] = { ...novas[secaoAtiva], conteudo }
    this.props.onChange(novas)
    this.setState({ showModalVariavel: false })
  }

  getVariaveisFiltradas() {
    const busca = this.state.buscaVariavel.toLowerCase()
    if (!busca) return VARIAVEIS
    return VARIAVEIS.map(g => ({
      ...g,
      itens: g.itens.filter(v =>
        v.label.toLowerCase().includes(busca) || v.token.toLowerCase().includes(busca)
      )
    })).filter(g => g.itens.length > 0)
  }

  // ── Renderização de cada tipo de seção ───────────────────────
  renderSecaoTexto(sec, idx) {
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Form.Label className="form-label-rh mb-0">Conteúdo da seção</Form.Label>
          <Button size="sm" variant="light" className="btn-ghost-rh"
            style={{ fontSize: 12 }}
            onClick={() => this.abrirModalVariavel(idx)}>
            <BiPlus size={12} className="me-1" /> Inserir variável
          </Button>
        </div>
        <Form.Control
          as="textarea"
          rows={6}
          className="form-control-rh"
          placeholder="Digite o texto do documento. Use 'Inserir variável' para adicionar placeholders como {funcionario_nome}..."
          value={sec.conteudo ?? ''}
          onChange={e => this.atualizarSecao(idx, 'conteudo', e.target.value)}
          style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }}
        />
        <Form.Text className="form-hint">
          Escreva o texto corrido. Clique em "Inserir variável" para adicionar dados dinâmicos como nome do funcionário, CPF, etc.
        </Form.Text>
      </div>
    )
  }

  renderSecaoCampos(sec, idx) {
    const campos = sec.campos ?? []
    return (
      <div>
        {campos.map((campo, idxC) => (
          <div key={campo.id}
            style={{ background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Label className="form-label-rh" style={{ fontSize: 12 }}>Label do campo *</Form.Label>
                <Form.Control className="form-control-rh" placeholder="Ex: Cargo"
                  value={campo.label}
                  onChange={e => this.atualizarCampo(idx, idxC, 'label', e.target.value)} />
              </Col>
              <Col md={3}>
                <Form.Label className="form-label-rh" style={{ fontSize: 12 }}>Tipo</Form.Label>
                <Form.Select className="form-control-rh"
                  value={campo.tipo}
                  onChange={e => this.atualizarCampo(idx, idxC, 'tipo', e.target.value)}>
                  {CAMPO_TIPOS.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label className="form-label-rh" style={{ fontSize: 12 }}>Obrigatório</Form.Label>
                <Form.Select className="form-control-rh"
                  value={campo.obrigatorio ? 'true' : 'false'}
                  onChange={e => this.atualizarCampo(idx, idxC, 'obrigatorio', e.target.value === 'true')}>
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </Form.Select>
              </Col>
              <Col md={2} className="d-flex justify-content-end">
                <Button variant="danger" size="sm" className="btn-danger-rh"
                  onClick={() => this.removerCampo(idx, idxC)}>
                  <BiTrash size={13} />
                </Button>
              </Col>
            </Row>
          </div>
        ))}
        <Button variant="light" size="sm" className="btn-ghost-rh"
          onClick={() => this.adicionarCampo(idx)}>
          <BiPlus size={13} className="me-1" /> Adicionar campo
        </Button>
      </div>
    )
  }

  renderSecaoAnexos(sec, idx) {
    return (
      <div style={{ padding: '12px 0', color: 'var(--gray-500)', fontSize: 13 }}>
        <BiPaperclip size={16} className="me-2" />
        Seção de anexos — os assinantes poderão fazer upload de arquivos obrigatórios definidos aqui.
        <div style={{ marginTop: 8 }}>
          <Form.Label className="form-label-rh">Descrição dos anexos esperados</Form.Label>
          <Form.Control as="textarea" rows={3} className="form-control-rh"
            placeholder="Ex: RG, CPF, Comprovante de residência..."
            value={sec.conteudo ?? ''}
            onChange={e => this.atualizarSecao(idx, 'conteudo', e.target.value)} />
        </div>
      </div>
    )
  }

  render() {
    const { secoes } = this.props
    const { showModalVariavel, buscaVariavel } = this.state
    const variaveisFiltradas = this.getVariaveisFiltradas()

    return (
      <div>
        {secoes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-400)' }}>
            <BiText size={40} style={{ display: 'block', margin: '0 auto 12px' }} />
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Nenhuma seção ainda</div>
            <div style={{ fontSize: 13, marginBottom: 16 }}>Adicione seções para montar a estrutura do documento.</div>
          </div>
        )}

        {secoes.map((sec, idx) => {
          const IconeTipo = SECAO_ICON[sec.tipo] ?? BiText
          return (
            <Card key={sec.id} className="card-rh mb-3">
              {/* Header da seção */}
              <div className="card-rh-header">
                <div className="d-flex align-items-center gap-2" style={{ flex: 1 }}>
                  <IconeTipo size={16} color="var(--primary)" />
                  <Form.Control
                    className="form-control-rh"
                    style={{ maxWidth: 320, fontWeight: 600 }}
                    value={sec.titulo}
                    onChange={e => this.atualizarSecao(idx, 'titulo', e.target.value)}
                    placeholder="Título da seção"
                  />
                  <Form.Select
                    className="form-control-rh"
                    style={{ maxWidth: 180, fontSize: 13 }}
                    value={sec.tipo}
                    onChange={e => this.atualizarSecao(idx, 'tipo', e.target.value)}>
                    {SECAO_TIPOS.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </Form.Select>
                </div>

                <div className="d-flex gap-1">
                  <Button variant="light" size="sm" className="btn-edit-rh"
                    onClick={() => this.moverSecao(idx, -1)} disabled={idx === 0}>
                    <BiChevronUp size={14} />
                  </Button>
                  <Button variant="light" size="sm" className="btn-edit-rh"
                    onClick={() => this.moverSecao(idx, 1)} disabled={idx === secoes.length - 1}>
                    <BiChevronDown size={14} />
                  </Button>
                  <Button variant="danger" size="sm" className="btn-danger-rh"
                    onClick={() => this.removerSecao(idx)}>
                    <BiTrash size={13} />
                  </Button>
                </div>
              </div>

              <Card.Body className="card-rh-body">
                {sec.tipo === 'texto'       && this.renderSecaoTexto(sec, idx)}
                {sec.tipo === 'campos'      && this.renderSecaoCampos(sec, idx)}
                {sec.tipo === 'assinaturas' && (
                  <div style={{ color: 'var(--gray-500)', fontSize: 13, padding: '8px 0' }}>
                    <FaPencilAlt size={16} className="me-2" />
                    As assinaturas são configuradas na aba <strong>Assinaturas</strong> e aparecem automaticamente nesta seção.
                  </div>
                )}
                {sec.tipo === 'anexos'      && this.renderSecaoAnexos(sec, idx)}
              </Card.Body>
            </Card>
          )
        })}

        <Button variant="light" className="btn-ghost-rh" onClick={this.adicionarSecao}>
          <BiPlus size={14} className="me-1" /> Adicionar seção
        </Button>

        {/* Modal de variáveis */}
        <Modal show={showModalVariavel} onHide={() => this.setState({ showModalVariavel: false })} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title style={{ fontSize: 16, fontWeight: 700 }}>Inserir variável</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Control
              className="form-control-rh mb-3"
              placeholder="Buscar variável..."
              value={buscaVariavel}
              onChange={e => this.setState({ buscaVariavel: e.target.value })}
            />
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {variaveisFiltradas.map(grupo => (
                <div key={grupo.grupo} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                    {grupo.grupo}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {grupo.itens.map(v => (
                      <button
                        key={v.token}
                        type="button"
                        onClick={() => this.inserirVariavel(v.token)}
                        style={{
                          background: 'var(--primary-bg)',
                          border: '1px solid #BFDBFE',
                          borderRadius: 8,
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontSize: 13,
                          color: 'var(--primary-dark)',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => e.target.style.background = '#BFDBFE'}
                        onMouseLeave={e => e.target.style.background = 'var(--primary-bg)'}
                        title={`Exemplo: ${v.exemplo || v.label}`}
                      >
                        <code style={{ fontSize: 12 }}>{v.token}</code>
                        <span style={{ marginLeft: 6, color: 'var(--gray-500)', fontSize: 11 }}>{v.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" className="btn-ghost-rh"
              onClick={() => this.setState({ showModalVariavel: false })}>
              Cancelar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

export default AbaConteudo
