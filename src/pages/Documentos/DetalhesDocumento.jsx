import { Component, createRef } from 'react'
import { Card, Button, Spinner, Alert, Badge, Row, Col } from 'react-bootstrap'
import SignatureCanvas from 'react-signature-canvas'
import { toast } from 'react-toastify'
import { withRouter } from '../../common/withRouter'
import { withAuth } from '../../contexts/AuthContext'
import { PageHeader, LoadingSpinner } from '../../common/_components'
import {
  BiArrowBack, BiCheckCircle, BiXCircle, BiTime,
  BiDownload, BiRefresh, BiPencil
} from 'react-icons/bi'
import { FaPencilAlt } from 'react-icons/fa'
import api from '../../services/api'

const STATUS_LABEL = {
  aguardando_assinatura: 'Aguardando assinatura',
  parcialmente_assinado: 'Parcialmente assinado',
  concluido:             'Concluído',
  cancelado:             'Cancelado',
}

const STATUS_BADGE = {
  aguardando_assinatura: 'badge-info',
  parcialmente_assinado: 'badge-warn',
  concluido:             'badge-active',
  cancelado:             'badge-inactive',
}

const PAPEL_LABEL = {
  funcionario: 'Funcionário',
  rh:          'RH',
  chefe:       'Chefe de Setor',
}

class DetalhesDocumento extends Component {
  constructor(props) {
    super(props)
    this.sigCanvas = createRef()
    this.state = {
      doc:              null,
      loading:          true,
      assinando:        false,
      assinaturaId:     null,    // id da assinatura pendente para mim
      modoAssinatura:   false,   // painel de assinatura aberto
      assinaturaBase64: null,    // imagem salva no perfil
      usarSalva:        false,
      salvarNoPerfil:   false,
      enviando:         false,
      leu:              false,
    }
  }

  get id() { return this.props.router.params.id }

  componentDidMount() {
    this.carregarDocumento()
    // Tenta carregar assinatura do perfil (só para empresa/RH)
    const { perfil } = this.props.auth
    if (perfil === 'empresa') {
      // RH não tem assinatura de perfil nessa fase — deixa null
    }
  }

  carregarDocumento = () => {
    this.setState({ loading: true })
    api.get(`/documento/${this.id}`)
      .then(res => {
        const doc = res.data
        // MinhaAssinaturaPendenteId vem do backend — id da assinatura que eu preciso fazer
        this.setState({
          doc,
          assinaturaId: doc.minhaAssinaturaPendenteId ?? null,
          loading: false,
        })
      })
      .catch(err => {
        toast.error(err.response?.data ?? 'Erro ao carregar documento.')
        this.props.router.navigate(-1)
      })
  }

  // POST /api/documento/{id}/assinar/{assinaturaId}
  handleAssinar = () => {
    const { doc, assinaturaId, usarSalva, assinaturaBase64, salvarNoPerfil, leu } = this.state
    if (!leu) return toast.error('Confirme que leu o documento antes de assinar.')

    let base64 = null

    if (usarSalva && assinaturaBase64) {
      base64 = assinaturaBase64
    } else {
      if (!this.sigCanvas.current || this.sigCanvas.current.isEmpty()) {
        return toast.error('Desenhe sua assinatura ou use a assinatura salva.')
      }
      base64 = this.sigCanvas.current.toDataURL('image/png')
    }

    this.setState({ enviando: true })

    api.post(`/documento/${doc.id}/assinar/${assinaturaId}`, {
      assinaturaBase64: base64,
      salvarNoPerfil,
      ipAddress: null,
    })
      .then(() => {
        toast.success('Documento assinado com sucesso!')
        this.setState({ modoAssinatura: false, enviando: false })
        this.carregarDocumento()
      })
      .catch(err => {
        toast.error(err.response?.data ?? 'Erro ao assinar documento.')
        this.setState({ enviando: false })
      })
  }

  handleBaixarPdf = () => {
    api.get(`/documento/${this.id}/pdf`)
      .then(res => {
        const { pdfBase64, nomeArquivo } = res.data
        const link = document.createElement('a')
        link.href = `data:application/pdf;base64,${pdfBase64}`
        link.download = nomeArquivo
        link.click()
      })
      .catch(() => toast.error('PDF ainda não disponível.'))
  }

  renderStatusAssinatura(a) {
    if (a.status === 'assinado') {
      return (
        <div className="d-flex align-items-center gap-2">
          <BiCheckCircle color="var(--success)" size={16} />
          <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
            Assinado {a.assinadoEm ? new Date(a.assinadoEm).toLocaleDateString('pt-BR') : ''}
          </span>
        </div>
      )
    }
    if (a.status === 'recusado') {
      return (
        <div className="d-flex align-items-center gap-2">
          <BiXCircle color="var(--danger)" size={16} />
          <span style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600 }}>Recusado</span>
        </div>
      )
    }
    return (
      <div className="d-flex align-items-center gap-2">
        <BiTime color="var(--warning)" size={16} />
        <span style={{ fontSize: 12, color: 'var(--warning)', fontWeight: 600 }}>
          Pendente{a.obrigatorio ? '' : ' (opcional)'}
        </span>
      </div>
    )
  }

  render() {
    const { doc, loading, modoAssinatura, assinaturaId,
            usarSalva, assinaturaBase64, salvarNoPerfil,
            enviando, leu } = this.state

    if (loading) return <LoadingSpinner />
    if (!doc) return null

    const podeCassinar = !!assinaturaId && doc.status !== 'concluido' && doc.status !== 'cancelado'

    return (
      <div>
        <PageHeader
          title={doc.modeloNome}
          sub={`Funcionário: ${doc.nomeFuncionario} — Setor: ${doc.nomeSetor}`}
          action={
            <div className="d-flex gap-2">
              {doc.status === 'concluido' && (
                <Button variant="success" className="btn-primary-rh"
                  style={{ background: 'var(--success)', borderColor: 'var(--success)' }}
                  onClick={this.handleBaixarPdf}>
                  <BiDownload className="me-1" /> Baixar PDF
                </Button>
              )}
              <Button variant="light" className="btn-ghost-rh"
                onClick={() => this.props.router.navigate('/documentos')}>
                <BiArrowBack className="me-1" /> Voltar
              </Button>
            </div>
          }
        />

        <Row className="g-4">
          {/* Coluna esquerda: conteúdo */}
          <Col lg={8}>
            <Card className="card-rh mb-4">
              <div className="card-rh-header">
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--gray-900)' }}>
                  Conteúdo do documento
                </div>
                <span className={`badge-rh ${STATUS_BADGE[doc.status] ?? 'badge-info'}`} style={{ fontSize: 11 }}>
                  {STATUS_LABEL[doc.status] ?? doc.status}
                </span>
              </div>
              <Card.Body className="card-rh-body">
                {/* Renderiza o HTML do documento congelado */}
                <div
                  style={{
                    border: '1px solid var(--border)', borderRadius: 8,
                    padding: 32, background: '#fff',
                    fontSize: 14, lineHeight: 1.7,
                  }}
                  dangerouslySetInnerHTML={{ __html: doc.conteudoHtml }}
                />
              </Card.Body>
            </Card>

            {/* Painel de assinatura — só aparece se tenho assinatura pendente */}
            {podeCassinar && !modoAssinatura && (
              <Alert variant="warning" className="d-flex align-items-center gap-3 mb-4">
                <FaPencilAlt size={20} />
                <div style={{ flex: 1 }}>
                  <strong>Você tem uma assinatura pendente neste documento.</strong>
                  <div style={{ fontSize: 13, marginTop: 2 }}>Leia o conteúdo acima e clique em "Assinar" para prosseguir.</div>
                </div>
                <Button className="btn-primary-rh" onClick={() => this.setState({ modoAssinatura: true })}>
                  <FaPencilAlt className="me-1" /> Assinar
                </Button>
              </Alert>
            )}

            {modoAssinatura && (
              <Card className="card-rh mb-4">
                <div className="card-rh-header">
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
                    Sua Assinatura
                  </div>
                </div>
                <Card.Body className="card-rh-body">
                  {/* Confirmação de leitura */}
                  <div style={{ marginBottom: 20, padding: 16, background: 'var(--gray-50)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                      <input type="checkbox" checked={leu}
                        onChange={e => this.setState({ leu: e.target.checked })}
                        style={{ marginTop: 2, accentColor: 'var(--primary)' }} />
                      <span>
                        <strong>Li e estou ciente do conteúdo deste documento.</strong>
                        <span style={{ color: 'var(--gray-400)', display: 'block', fontSize: 12, marginTop: 2 }}>
                          Ao assinar, você confirma ter lido e concordado com todas as informações acima.
                        </span>
                      </span>
                    </label>
                  </div>

                  {/* Opção de usar assinatura salva */}
                  {assinaturaBase64 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 8 }}>
                        Assinatura salva no seu perfil:
                      </div>
                      <img src={assinaturaBase64} alt="Assinatura salva"
                        style={{ border: '1px solid var(--border)', borderRadius: 8, maxHeight: 80, background: '#fff', padding: 8 }} />
                      <div className="mt-2">
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                          <input type="checkbox" checked={usarSalva}
                            onChange={e => this.setState({ usarSalva: e.target.checked })}
                            style={{ accentColor: 'var(--primary)' }} />
                          Usar esta assinatura
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Canvas de assinatura */}
                  {!usarSalva && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 8 }}>
                        {assinaturaBase64 ? 'Ou desenhe uma nova:' : 'Desenhe sua assinatura:'}
                      </div>
                      <div style={{ border: '2px dashed var(--gray-300)', borderRadius: 10, background: '#fafafa', position: 'relative' }}>
                        <SignatureCanvas
                          ref={this.sigCanvas}
                          canvasProps={{ width: '100%', height: 160, style: { display: 'block', borderRadius: 10 } }}
                          backgroundColor="rgba(255,255,255,0)"
                          penColor="#1E293B"
                        />
                        <Button variant="light" size="sm" className="btn-ghost-rh"
                          style={{ position: 'absolute', top: 8, right: 8, fontSize: 12 }}
                          onClick={() => this.sigCanvas.current?.clear()}>
                          <BiRefresh size={13} className="me-1" /> Limpar
                        </Button>
                      </div>

                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, marginTop: 10 }}>
                        <input type="checkbox" checked={salvarNoPerfil}
                          onChange={e => this.setState({ salvarNoPerfil: e.target.checked })}
                          style={{ accentColor: 'var(--primary)' }} />
                        Salvar como minha assinatura padrão
                      </label>
                    </div>
                  )}

                  <div className="d-flex gap-3 mt-4 justify-content-end">
                    <Button variant="light" className="btn-ghost-rh"
                      onClick={() => this.setState({ modoAssinatura: false, leu: false })}>
                      Cancelar
                    </Button>
                    <Button className="btn-primary-rh" disabled={enviando || !leu}
                      onClick={this.handleAssinar}>
                      {enviando
                        ? <><Spinner size="sm" className="me-2" />Assinando...</>
                        : <><FaPencilAlt className="me-1" />Confirmar assinatura</>
                      }
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* Coluna direita: assinaturas + metadados */}
          <Col lg={4}>
            <Card className="card-rh mb-4">
              <div className="card-rh-header">
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>
                  Assinaturas ({doc.assinaturas?.length ?? 0})
                </div>
              </div>
              <Card.Body className="card-rh-body">
                {(doc.assinaturas ?? []).map((a, idx) => (
                  <div key={a.id} style={{
                    padding: '12px 0',
                    borderBottom: idx < doc.assinaturas.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>
                          {a.signerNomeSnapshot}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>
                          {PAPEL_LABEL[a.papel] ?? a.papel}
                          {!a.obrigatorio && ' · opcional'}
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>#{a.ordem}</div>
                    </div>
                    <div style={{ marginTop: 6 }}>
                      {this.renderStatusAssinatura(a)}
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>

            <Card className="card-rh">
              <div className="card-rh-header">
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>
                  Informações
                </div>
              </div>
              <Card.Body className="card-rh-body">
                {[
                  { label: 'Modelo', value: doc.modeloNome },
                  { label: 'Funcionário', value: doc.nomeFuncionario },
                  { label: 'Setor', value: doc.nomeSetor },
                  { label: 'Gerado em', value: new Date(doc.criadoEm).toLocaleDateString('pt-BR') },
                  { label: 'Concluído em', value: doc.concluidoEm ? new Date(doc.concluidoEm).toLocaleDateString('pt-BR') : '—' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span style={{ color: 'var(--gray-400)', fontWeight: 600 }}>{item.label}</span>
                    <span style={{ color: 'var(--gray-800)' }}>{item.value}</span>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default withAuth(withRouter(DetalhesDocumento))
