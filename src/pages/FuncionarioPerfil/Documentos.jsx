import { Component, createRef } from 'react'
import { Card, Table, Button, Spinner, Row, Col, Alert } from 'react-bootstrap'
import SignatureCanvas from 'react-signature-canvas'
import { toast } from 'react-toastify'
import { withAuth }   from '../../contexts/AuthContext'
import { withRouter } from '../../common/withRouter'
import { PageHeader, EmptyState, TableFooter } from '../../common/_components'
import {
  BiFileBlank, BiCheckCircle, BiTime, BiXCircle,
  BiShow, BiDownload, BiRefresh, BiArrowBack
} from 'react-icons/bi'
import { FaPencilAlt } from 'react-icons/fa'
import api from '../../services/api'

const STATUS_BADGE = {
  aguardando_assinatura: 'badge-info',
  parcialmente_assinado: 'badge-warn',
  concluido:             'badge-active',
  cancelado:             'badge-inactive',
}
const STATUS_LABEL = {
  aguardando_assinatura: 'Aguardando assinatura',
  parcialmente_assinado: 'Parcialmente assinado',
  concluido:             'Concluído',
  cancelado:             'Cancelado',
}
const PAPEL_LABEL = {
  funcionario: 'Funcionário',
  rh:          'RH',
  chefe:       'Chefe de Setor',
}

class Documentos extends Component {
  constructor(props) {
    super(props)
    this.sigCanvas = createRef()
    this.state = {
      documentos:       [],
      loading:          true,
      docSelecionado:   null,   // instância completa em detalhes
      loadingDoc:       false,
      // Assinatura
      modoAssinatura:   false,
      assinaturaId:     null,
      assinaturaPerfil: null,   // base64 salva no perfil
      usarSalva:        false,
      salvarNoPerfil:   false,
      enviando:         false,
      leu:              false,
    }
  }

  componentDidMount() {
    this.carregarDocumentos()
    this.carregarAssinaturaPerfil()
  }

  carregarDocumentos = () => {
    const { perfil, funcionario } = this.props.auth
    const isChefe = perfil === 'chefe'

    this.setState({ loading: true })

    // Chefe vê documentos do seu setor, funcionário vê os seus
    const endpoint = isChefe
      ? `/documento/setor/${funcionario.setorId}`
      : '/documento/meus'

    api.get(endpoint)
      .then(res => this.setState({ documentos: res.data }))
      .catch(() => toast.error('Erro ao carregar documentos.'))
      .finally(() => this.setState({ loading: false }))
  }

  carregarAssinaturaPerfil = () => {
    api.get('/documento/assinatura-perfil')
      .then(res => {
        if (res.data.possui) {
          this.setState({ assinaturaPerfil: res.data.assinaturaBase64 })
        }
      })
      .catch(() => {})
  }

  abrirDocumento = (id) => {
    this.setState({ loadingDoc: true, docSelecionado: null, modoAssinatura: false, leu: false })
    api.get(`/documento/${id}`)
      .then(res => {
        const doc = res.data
        this.setState({
          docSelecionado: doc,
          assinaturaId:   doc.minhaAssinaturaPendenteId ?? null,
          loadingDoc:     false,
        })
      })
      .catch(() => {
        toast.error('Erro ao abrir documento.')
        this.setState({ loadingDoc: false })
      })
  }

  fecharDocumento = () => {
    this.setState({ docSelecionado: null, modoAssinatura: false, leu: false })
  }

  handleAssinar = () => {
    const { docSelecionado, assinaturaId, usarSalva, assinaturaPerfil, salvarNoPerfil, leu } = this.state
    if (!leu) return toast.error('Confirme que leu o documento antes de assinar.')

    let base64 = null
    if (usarSalva && assinaturaPerfil) {
      base64 = assinaturaPerfil
    } else {
      if (!this.sigCanvas.current || this.sigCanvas.current.isEmpty()) {
        return toast.error('Desenhe sua assinatura ou use a assinatura salva.')
      }
      base64 = this.sigCanvas.current.toDataURL('image/png')
    }

    this.setState({ enviando: true })
    api.post(`/documento/${docSelecionado.id}/assinar/${assinaturaId}`, {
      assinaturaBase64: base64,
      salvarNoPerfil,
      ipAddress: null,
    })
      .then(() => {
        toast.success('Documento assinado com sucesso!')
        this.setState({ modoAssinatura: false, enviando: false, leu: false })
        this.abrirDocumento(docSelecionado.id)
        this.carregarDocumentos()
        if (salvarNoPerfil) this.setState({ assinaturaPerfil: base64 })
      })
      .catch(err => {
        toast.error(err.response?.data ?? 'Erro ao assinar.')
        this.setState({ enviando: false })
      })
  }

  handleBaixarPdf = (id) => {
    api.get(`/documento/${id}/pdf`)
      .then(res => {
        const link = document.createElement('a')
        link.href = `data:application/pdf;base64,${res.data.pdfBase64}`
        link.download = res.data.nomeArquivo
        link.click()
      })
      .catch(() => toast.error('PDF ainda não disponível.'))
  }

  renderStatusAssinatura(a) {
    if (a.status === 'assinado')
      return <span style={{ color: 'var(--success)', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><BiCheckCircle />Assinado</span>
    if (a.status === 'recusado')
      return <span style={{ color: 'var(--danger)', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><BiXCircle />Recusado</span>
    return <span style={{ color: 'var(--warning)', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><BiTime />Pendente{!a.obrigatorio ? ' (opcional)' : ''}</span>
  }

  renderListagem() {
    const { documentos, loading } = this.state
    const { perfil } = this.props.auth
    const isChefe = perfil === 'chefe'

    return (
      <div>
        <PageHeader
          title="Documentos"
          sub={isChefe
            ? 'Documentos do seu setor para assinar e acompanhar.'
            : 'Seus documentos e pendências de assinatura.'}
        />

        <Card className="card-rh">
          <Card.Body className="p-0">
            {loading ? (
              <div style={{ padding: 48, textAlign: 'center' }}>
                <Spinner style={{ color: 'var(--primary)' }} />
              </div>
            ) : documentos.length === 0 ? (
              <EmptyState
                icon={BiFileBlank}
                title="Nenhum documento encontrado"
                description={isChefe
                  ? 'Nenhum documento foi gerado para o seu setor ainda.'
                  : 'Nenhum documento foi enviado para você ainda.'}
              />
            ) : (
              <Table responsive className="table-rh mb-0">
                <thead>
                  <tr>
                    <th>Modelo</th>
                    {isChefe && <th>Funcionário</th>}
                    <th>Status</th>
                    <th>Assinaturas</th>
                    <th>Gerado em</th>
                    <th style={{ width: 100 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {documentos.map(d => (
                    <tr key={d.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{d.modeloNome}</div>
                        {d.loteId && <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Lote #{d.loteId}</div>}
                      </td>
                      {isChefe && <td style={{ fontSize: 13 }}>{d.nomeFuncionario}</td>}
                      <td>
                        <span className={`badge-rh ${STATUS_BADGE[d.status] ?? 'badge-info'}`} style={{ fontSize: 11 }}>
                          {STATUS_LABEL[d.status] ?? d.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: 12 }}>
                          <span style={{ color: d.assinaturasPendentes > 0 ? 'var(--warning)' : 'var(--success)', fontWeight: 600 }}>
                            {d.assinaturasPendentes}
                          </span>
                          <span style={{ color: 'var(--gray-400)' }}> / {d.totalAssinaturas} pendentes</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                        {new Date(d.criadoEm).toLocaleDateString('pt-BR')}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button variant="light" size="sm" className="btn-edit-rh"
                            onClick={() => this.abrirDocumento(d.id)} title="Ver documento">
                            <BiShow size={13} />
                          </Button>
                          {d.status === 'concluido' && (
                            <Button variant="light" size="sm" className="btn-edit-rh"
                              onClick={() => this.handleBaixarPdf(d.id)} title="Baixar PDF">
                              <BiDownload size={13} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
            <TableFooter shown={documentos.length} total={documentos.length} itemLabel="documento" />
          </Card.Body>
        </Card>
      </div>
    )
  }

  renderDetalhes() {
    const { docSelecionado: doc, loadingDoc, modoAssinatura, assinaturaId,
            usarSalva, assinaturaPerfil, salvarNoPerfil, enviando, leu } = this.state

    if (loadingDoc) return <LoadingSpinner />
    if (!doc) return null

    const podeCassinar = !!assinaturaId && doc.status !== 'concluido' && doc.status !== 'cancelado'

    return (
      <div>
        <div style={{ marginBottom: 20 }}>
          <Button variant="light" className="btn-ghost-rh" onClick={this.fecharDocumento}>
            <BiArrowBack className="me-1" /> Voltar para lista
          </Button>
        </div>

        <Row className="g-4">
          {/* Conteúdo */}
          <Col lg={8}>
            <Card className="card-rh mb-4">
              <div className="card-rh-header">
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--gray-900)' }}>
                    {doc.modeloNome}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>
                    {doc.nomeFuncionario} · {doc.nomeSetor}
                  </div>
                </div>
                <span className={`badge-rh ${STATUS_BADGE[doc.status] ?? 'badge-info'}`} style={{ fontSize: 11 }}>
                  {STATUS_LABEL[doc.status] ?? doc.status}
                </span>
              </div>
              <Card.Body className="card-rh-body">
                <div
                  style={{
                    border: '1px solid var(--border)', borderRadius: 8,
                    padding: '24px 32px', background: '#fff',
                    fontSize: 14, lineHeight: 1.8,
                  }}
                  dangerouslySetInnerHTML={{ __html: doc.conteudoHtml }}
                />
              </Card.Body>
            </Card>

            {/* Banner assinatura pendente */}
            {podeCassinar && !modoAssinatura && (
              <Alert variant="warning" className="d-flex align-items-center gap-3 mb-4">
                <FaPencilAlt size={20} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <strong>Você precisa assinar este documento.</strong>
                  <div style={{ fontSize: 13, marginTop: 2, color: 'var(--gray-600)' }}>
                    Leia o conteúdo acima antes de assinar.
                  </div>
                </div>
                <Button className="btn-primary-rh"
                  onClick={() => this.setState({ modoAssinatura: true })}>
                  <FaPencilAlt className="me-1" /> Assinar agora
                </Button>
              </Alert>
            )}

            {/* Painel de assinatura */}
            {modoAssinatura && (
              <Card className="card-rh mb-4">
                <div className="card-rh-header">
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
                    Sua Assinatura
                  </div>
                </div>
                <Card.Body className="card-rh-body">
                  {/* Confirmação leitura */}
                  <div style={{ marginBottom: 20, padding: 16, background: 'var(--gray-50)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                      <input type="checkbox" checked={leu}
                        onChange={e => this.setState({ leu: e.target.checked })}
                        style={{ marginTop: 3, accentColor: 'var(--primary)' }} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>
                          Li e estou ciente do conteúdo deste documento.
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
                          Ao assinar, você confirma ter lido e concordado com todas as informações acima.
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Assinatura salva */}
                  {assinaturaPerfil && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 8 }}>
                        Assinatura salva no seu perfil:
                      </div>
                      <div style={{ padding: 12, background: 'var(--gray-50)', borderRadius: 10, border: '1px solid var(--border)', display: 'inline-block' }}>
                        <img src={assinaturaPerfil} alt="Assinatura salva"
                          style={{ maxHeight: 72, maxWidth: 240 }} />
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, marginTop: 10 }}>
                        <input type="checkbox" checked={usarSalva}
                          onChange={e => this.setState({ usarSalva: e.target.checked })}
                          style={{ accentColor: 'var(--primary)' }} />
                        Usar esta assinatura
                      </label>
                    </div>
                  )}

                  {/* Canvas */}
                  {!usarSalva && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 8 }}>
                        {assinaturaPerfil ? 'Ou desenhe uma nova:' : 'Desenhe sua assinatura:'}
                      </div>
                      <div style={{
                        border: '2px dashed var(--gray-300)', borderRadius: 10,
                        background: '#fafafa', position: 'relative', overflow: 'hidden',
                      }}>
                        <SignatureCanvas
                          ref={this.sigCanvas}
                          canvasProps={{
                            style: { width: '100%', height: 160, display: 'block', touchAction: 'none' }
                          }}
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

            {doc.status === 'concluido' && (
              <div className="d-flex justify-content-end mb-4">
                <Button className="btn-primary-rh"
                  style={{ background: 'var(--success)', borderColor: 'var(--success)' }}
                  onClick={() => this.handleBaixarPdf(doc.id)}>
                  <BiDownload className="me-1" /> Baixar PDF
                </Button>
              </div>
            )}
          </Col>

          {/* Sidebar: assinaturas */}
          <Col lg={4}>
            <Card className="card-rh">
              <div className="card-rh-header">
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>
                  Assinaturas
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
          </Col>
        </Row>
      </div>
    )
  }

  render() {
    const { docSelecionado, loadingDoc } = this.state

    if (loadingDoc) {
      return (
        <div>
          <Button variant="light" className="btn-ghost-rh mb-4" onClick={this.fecharDocumento}>
            <BiArrowBack className="me-1" /> Voltar
          </Button>
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Spinner style={{ color: 'var(--primary)' }} />
          </div>
        </div>
      )
    }

    return docSelecionado ? this.renderDetalhes() : this.renderListagem()
  }
}

// Re-export LoadingSpinner inline para evitar import extra
function LoadingSpinner() {
  return <div style={{ padding: 48, textAlign: 'center' }}><Spinner style={{ color: 'var(--primary)' }} /></div>
}

export default withAuth(withRouter(Documentos))
